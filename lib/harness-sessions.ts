import "server-only";

import type { HarnessId } from "@/lib/harnesses";
import {
  type PlaygroundCredential,
  revokePlaygroundCredential,
} from "@/lib/playground-credential";

/**
 * Live harness sessions, shared by every session-backed harness.
 *
 * Session-backed runtimes own their conversation history, so a chat maps to a
 * long-lived server object rather than a replayed transcript. This pool is the
 * one place that lifecycle is managed.
 *
 * It is process-local on purpose. Pi parks sessions in a module-level Map and
 * keeps working state under the host `tmpdir()`; a sandbox-backed harness holds
 * a live VM. Neither can outlive the process that created it. That is workable
 * because the site runs as one long-lived `next start` on Railway — but it does
 * mean sessions are **evictable, not durable**: a redeploy or a second replica
 * drops them and the next turn transparently starts a fresh one.
 */

/** The shape both Pi and the ACP harnesses satisfy. */
type HarnessLike = {
  createSession: (options?: { sessionId?: string }) => Promise<{
    destroy: () => Promise<void>;
  }>;
};

type Entry<TAgent extends HarnessLike> = {
  agent: TAgent;
  session: Awaited<ReturnType<TAgent["createSession"]>>;
  modelId: string;
  harnessId: HarnessId;
  /**
   * The credential this session spends on. Held so it can be handed back when
   * the session ends — a harness credential is minted per session precisely so
   * that teardown can revoke it.
   */
  credential: PlaygroundCredential;
  lastUsedAt: number;
  busy: boolean;
};

// The pool is keyed across harnesses whose agent types differ, so the stored
// entry is deliberately unnarrowed; `acquireSession` re-applies the caller's
// type on read, where the agent and its session are known to be a matched pair.
const sessions = new Map<string, Entry<HarnessLike>>();

const SESSION_TTL_MS = 30 * 60 * 1000;

/**
 * Ceiling on concurrent live sessions.
 *
 * Deliberately low: a sandbox-backed session is a VM, so this bounds real spend
 * as well as memory. Sessions evicted here are recreated on the owner's next
 * turn, minus their history.
 */
const MAX_SESSIONS = 25;

export class HarnessSessionBusyError extends Error {
  constructor() {
    super("This chat already has a turn in flight.");
    this.name = "HarnessSessionBusyError";
  }
}

async function disposeEntry(key: string, entry: Entry<HarnessLike>) {
  sessions.delete(key);
  try {
    await entry.session.destroy();
  } catch {
    // Best-effort: a session that fails to tear down must not fail the request
    // that triggered the sweep.
  }
  // Hand the credential back even if the teardown above threw — the sandbox
  // may be gone while the token it held is still live.
  await revokePlaygroundCredential(entry.credential);
}

async function sweep() {
  const now = Date.now();
  for (const [key, entry] of [...sessions]) {
    if (!entry.busy && now - entry.lastUsedAt > SESSION_TTL_MS) {
      await disposeEntry(key, entry);
    }
  }

  // Bound total sandboxes regardless of age, oldest idle first.
  const idle = [...sessions]
    .filter(([, e]) => !e.busy)
    .sort((a, b) => a[1].lastUsedAt - b[1].lastUsedAt);
  while (sessions.size > MAX_SESSIONS && idle.length > 0) {
    const [key, entry] = idle.shift()!;
    await disposeEntry(key, entry);
  }
}

/**
 * Get the live session for `sessionId`, building one via `createAgent` if there
 * is no usable existing one.
 *
 * Changing either axis rebuilds the session. These runtimes bind their model
 * when the agent is constructed and own the conversation history, so there is
 * no way to swap model or harness underneath an existing transcript — the
 * client mirrors this by starting a new chat (see `resetsHistory`).
 */
export async function acquireSession<TAgent extends HarnessLike>({
  sessionId,
  modelId,
  harnessId,
  credential,
  createAgent,
}: {
  sessionId: string;
  modelId: string;
  harnessId: HarnessId;
  credential: PlaygroundCredential;
  createAgent: () => Promise<TAgent>;
}): Promise<Entry<TAgent>> {
  await sweep();

  const existing = sessions.get(sessionId) as Entry<TAgent> | undefined;

  if (existing?.busy) throw new HarnessSessionBusyError();

  if (
    existing &&
    (existing.modelId !== modelId ||
      existing.harnessId !== harnessId ||
      // The runtime holds its token in a process environment with no way to
      // refresh it, so an expired credential makes the session useless. Rebuild
      // rather than hand back a session whose next turn would 401. Credentials
      // are minted to outlive the session TTL, so this is the rare case.
      existing.credential.expiresAt.getTime() <= Date.now())
  ) {
    await disposeEntry(sessionId, existing);
  } else if (existing) {
    existing.busy = true;
    existing.lastUsedAt = Date.now();
    return existing;
  }

  const agent = await createAgent();
  const session = (await agent.createSession({ sessionId })) as Awaited<
    ReturnType<TAgent["createSession"]>
  >;
  const entry: Entry<TAgent> = {
    agent,
    session,
    modelId,
    harnessId,
    credential,
    lastUsedAt: Date.now(),
    busy: true,
  };
  sessions.set(sessionId, entry);
  return entry;
}

export function releaseSession(sessionId: string) {
  const entry = sessions.get(sessionId);
  if (!entry) return;
  entry.busy = false;
  entry.lastUsedAt = Date.now();
}
