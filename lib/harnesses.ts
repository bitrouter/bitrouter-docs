/**
 * The harness axis of the playground.
 *
 * BitRouter's pitch is a cross product — any model, any harness — so the
 * playground picks one of each rather than shipping a surface per harness. A
 * "harness" here is whatever drives the agent loop: the AI SDK's own
 * `streamText` loop is one entry, alongside the packaged runtimes
 * (`@ai-sdk/harness-*`) that own their own history, tools, and sandbox.
 *
 * This module is imported by both the client and the route handler, so it holds
 * no secrets and reads no environment. Whether a harness can actually run on a
 * given deployment lives in `harnesses.server.ts`.
 */

export type HarnessId =
  | "ai-sdk"
  | "pi"
  | "claude-code"
  | "codex"
  | "opencode"
  // BitRouter's own catalog, over ACP. Flat rather than a nested agent picker:
  // the pair (runtime, routed-through-BitRouter) is the thing being chosen, and
  // one list keeps the existing single picker and model axis unchanged.
  | "bitrouter-claude-acp"
  | "bitrouter-codex-acp"
  | "bitrouter-gemini-cli"
  | "bitrouter-pi-acp";

/**
 * How a turn is sent to the backend.
 *
 * - `stateless` — the route replays the whole transcript every turn.
 * - `session` — the runtime owns the conversation, so the route sends only the
 *   newest user turn and addresses the session by id.
 *
 * The client needs this to know when switching a control would desync the
 * visible transcript from what the runtime actually remembers.
 */
export type HarnessTransport = "stateless" | "session";

export type Harness = {
  id: HarnessId;
  label: string;
  /** One line for the picker. */
  blurb: string;
  transport: HarnessTransport;
  /**
   * `in-process` runs inside the web server. `sandbox-vm` needs a sandbox
   * provider that can expose a port, because the adapter installs a bridge in
   * the sandbox and dials back into it.
   */
  runtime: "in-process" | "sandbox-vm";
};

export const HARNESSES: Harness[] = [
  {
    id: "ai-sdk",
    label: "AI SDK",
    blurb: "streamText loop, docs tools",
    transport: "stateless",
    runtime: "in-process",
  },
  {
    id: "pi",
    label: "Pi",
    blurb: "agent runtime, shell + filesystem",
    transport: "session",
    runtime: "in-process",
  },
  {
    id: "claude-code",
    label: "Claude Code",
    blurb: "agent runtime, needs a sandbox VM",
    transport: "session",
    runtime: "sandbox-vm",
  },
  {
    id: "codex",
    label: "Codex",
    blurb: "agent runtime, needs a sandbox VM",
    transport: "session",
    runtime: "sandbox-vm",
  },
  {
    id: "opencode",
    label: "OpenCode",
    blurb: "agent runtime, needs a sandbox VM",
    transport: "session",
    runtime: "sandbox-vm",
  },
  {
    id: "bitrouter-claude-acp",
    label: "BitRouter · Claude Code",
    blurb: "Claude Code, routed through BitRouter",
    transport: "session",
    runtime: "sandbox-vm",
  },
  {
    id: "bitrouter-codex-acp",
    label: "BitRouter · Codex",
    blurb: "Codex, routed through BitRouter",
    transport: "session",
    runtime: "sandbox-vm",
  },
  {
    id: "bitrouter-gemini-cli",
    label: "BitRouter · Gemini CLI",
    blurb: "Gemini CLI, routed through BitRouter",
    transport: "session",
    runtime: "sandbox-vm",
  },
  {
    id: "bitrouter-pi-acp",
    label: "BitRouter · Pi",
    blurb: "Pi, routed through BitRouter",
    transport: "session",
    runtime: "sandbox-vm",
  },
];

/**
 * A harness plus whether the current deployment can run it.
 *
 * Computed on the server (see `harnesses.server.ts`) and passed to the client,
 * which renders unavailable entries greyed out with their reason rather than
 * hiding them — the picker is the clearest statement of the product's shape, so
 * an option that is merely unconfigured should still be visible.
 */
export type HarnessOption = Harness & {
  available: boolean;
  reason?: string;
};

/**
 * The stateless loop is the default: it is the only entry with no server-side
 * session, no sandbox, and no deployment flag, so it works everywhere.
 */
export const DEFAULT_HARNESS: HarnessId = "ai-sdk";

export function getHarness(id: string): Harness | undefined {
  return HARNESSES.find((h) => h.id === id);
}

export function isHarnessId(value: unknown): value is HarnessId {
  return typeof value === "string" && HARNESSES.some((h) => h.id === value);
}

/**
 * Whether swapping `from` → `to` mid-conversation would leave the runtime
 * remembering something different from what the user can see.
 *
 * Session-backed runtimes key their history off the session id and bind their
 * model at construction, so changing either the harness or the model rebuilds
 * them with an empty history — while the transcript on screen still shows the
 * earlier turns. The client starts a fresh chat instead of showing a
 * conversation the agent has no memory of.
 */
export function resetsHistory({
  fromHarness,
  toHarness,
  modelChanged,
}: {
  fromHarness: HarnessId;
  toHarness: HarnessId;
  modelChanged: boolean;
}): boolean {
  if (fromHarness !== toHarness) return true;
  return modelChanged && getHarness(toHarness)?.transport === "session";
}
