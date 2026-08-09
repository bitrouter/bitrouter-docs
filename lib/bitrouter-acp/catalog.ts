import type { HarnessId } from "@/lib/harnesses";

/**
 * Which BitRouter catalog agents the playground fronts.
 *
 * Kept separate from `agents.ts` because that module is `server-only` and pulls
 * in the harness runtime; this is plain data that the registry, the tests, and
 * any client-side copy can read freely.
 *
 * `npmPackage` is what BitRouter's own catalog spawns for the id (via
 * `npx -y <pkg>@latest`). It is pre-warmed into the sandbox snapshot so a
 * visitor's first turn is not also a package install.
 */
export type BitrouterAcpAgent = {
  harnessId: HarnessId;
  agentId: string;
  /**
   * What BitRouter's catalog spawns for this id (via `npx -y <pkg>@latest`).
   * Pre-warmed into the sandbox snapshot so a visitor's first turn is not also
   * a package install.
   */
  npmPackage: string;
  /** Set when this agent cannot currently work in our routed configuration. */
  knownIssue?: string;
};

export const BITROUTER_ACP_AGENTS = [
  {
    harnessId: "bitrouter-claude-acp",
    agentId: "claude-acp",
    npmPackage: "@zed-industries/claude-code-acp",
  },
  {
    harnessId: "bitrouter-codex-acp",
    agentId: "codex-acp",
    npmPackage: "@agentclientprotocol/codex-acp",
  },
  {
    harnessId: "bitrouter-gemini-cli",
    agentId: "gemini-cli",
    npmPackage: "@google/gemini-cli",
    // BitRouter's own catalog notes that gemini-cli sends its key as
    // `x-goog-api-key` rather than a Bearer token, and `apply_routing` warns
    // that such a harness "will likely 401" whenever a key is required — which
    // it always is against a remote base URL like ours. Upstream has also
    // deprecated it in favour of Antigravity. Listed so the axis stays honest,
    // but not offered as working.
    knownIssue:
      "Sends a non-Bearer API key the router rejects; deprecated upstream.",
  },
  {
    harnessId: "bitrouter-pi-acp",
    agentId: "pi-acp",
    npmPackage: "pi-acp",
  },
] as const satisfies ReadonlyArray<BitrouterAcpAgent>;

export function getBitrouterAcpAgent(
  harnessId: string,
): BitrouterAcpAgent | undefined {
  return BITROUTER_ACP_AGENTS.find((a) => a.harnessId === harnessId);
}

export function isBitrouterAcpHarness(harnessId: string): boolean {
  return getBitrouterAcpAgent(harnessId) !== undefined;
}
