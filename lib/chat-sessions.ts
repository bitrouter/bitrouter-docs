import type { ChatUIMessage } from "@/lib/chat-models";
// Relative, not aliased: this module is covered by a pure-logic vitest suite
// that resolves no path aliases (see vitest.config.ts).
import { DEFAULT_HARNESS, type HarnessId, isHarnessId } from "./harnesses";

/**
 * Client-side session store for `/chat`.
 *
 * Sessions live in `localStorage` only. That is a deliberate scope choice: the
 * playground is unauthenticated, so there is no user to hang server-side
 * history off. The trade is that history is per-device and clearing site data
 * loses it. Moving to server-side storage is a later step that depends on the
 * auth decision, and `ChatSession` is shaped to survive that move.
 */

export type ChatSession = {
  id: string;
  title: string;
  model: string;
  /**
   * The harness this conversation belongs to.
   *
   * Stored per session rather than globally because a session-backed harness
   * keys its server-side history off `id` — reopening a transcript has to
   * address the same runtime that produced it.
   */
  harness: HarnessId;
  messages: ChatUIMessage[];
  createdAt: number;
  updatedAt: number;
};

export type SessionStore = {
  version: 1;
  sessions: ChatSession[];
};

export const STORAGE_KEY = "__bitrouter_chat_sessions";

/** Cap on stored sessions — localStorage is ~5MB and transcripts are chunky. */
export const MAX_SESSIONS = 50;

const UNTITLED = "New chat";

export function createSession({
  id,
  model,
  harness = DEFAULT_HARNESS,
  now,
}: {
  id: string;
  model: string;
  harness?: HarnessId;
  now: number;
}): ChatSession {
  return {
    id,
    title: UNTITLED,
    model,
    harness,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Derives a session title from its first user message.
 *
 * Sessions are titled lazily rather than by asking a model: a title round-trip
 * would spend tokens on the shared key for every new conversation.
 */
export function deriveTitle(messages: ChatUIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return UNTITLED;

  const text = firstUser.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return UNTITLED;
  return text.length > 48 ? `${text.slice(0, 48).trimEnd()}…` : text;
}

/** Newest first, so the sidebar reads top-down as most-recent-first. */
export function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertSession(
  sessions: ChatSession[],
  session: ChatSession,
): ChatSession[] {
  const index = sessions.findIndex((s) => s.id === session.id);
  const next =
    index === -1
      ? [session, ...sessions]
      : sessions.map((s) => (s.id === session.id ? session : s));

  return sortSessions(next).slice(0, MAX_SESSIONS);
}

export function removeSession(
  sessions: ChatSession[],
  id: string,
): ChatSession[] {
  return sessions.filter((s) => s.id !== id);
}

/**
 * Drops sessions that never received a message.
 *
 * "New chat" opens a session eagerly so the composer has something to write
 * into, but an unused one should not linger in the sidebar — otherwise
 * clicking the button twice leaves a trail of empty "New chat" rows.
 */
export function pruneEmptySessions(
  sessions: ChatSession[],
  keepId?: string,
): ChatSession[] {
  return sessions.filter((s) => s.messages.length > 0 || s.id === keepId);
}

/**
 * Reads the store, tolerating anything malformed.
 *
 * Never throws: a corrupt or foreign `localStorage` value must not take down
 * the whole page, so unparseable input degrades to an empty history.
 */
export function parseStore(raw: string | null): SessionStore {
  const empty: SessionStore = { version: 1, sessions: [] };
  if (!raw) return empty;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as SessionStore).sessions)
    ) {
      return empty;
    }

    const sessions = (parsed as SessionStore).sessions
      .filter(
        (s): s is ChatSession =>
          typeof s?.id === "string" &&
          typeof s?.title === "string" &&
          Array.isArray(s?.messages),
      )
      // Sessions written before the harness picker existed have no `harness`,
      // as do any whose stored value no longer names a known harness. Both
      // read as the default rather than being dropped — losing a transcript
      // over a missing field would be a worse trade than reopening it on the
      // stateless loop.
      .map((s) => ({
        ...s,
        harness: isHarnessId(s.harness) ? s.harness : DEFAULT_HARNESS,
      }));

    return { version: 1, sessions: sortSessions(sessions) };
  } catch {
    return empty;
  }
}

export function serializeStore(sessions: ChatSession[]): string {
  return JSON.stringify({ version: 1, sessions } satisfies SessionStore);
}
