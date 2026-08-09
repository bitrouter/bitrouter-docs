import "server-only";

import { getBitrouterAcpAgent } from "@/lib/bitrouter-acp/catalog";
import { hasSandboxCredentials } from "@/lib/harness-sandbox.server";
import {
  type Harness,
  type HarnessId,
  HARNESSES,
  type HarnessOption,
} from "@/lib/harnesses";
import { credentialMode } from "@/lib/playground-credential";

/**
 * Which harnesses this deployment can actually run.
 *
 * Kept separate from the registry so the client can render the picker without
 * pulling in the runtimes: this module reads environment, and the packaged
 * harnesses drag ~165MB of dependencies behind them.
 */

/** What a deployment needs configured before it can spend on the router. */
const ROUTER_CREDENTIAL_REQUIREMENT =
  credentialMode() === "session"
    ? "Needs BITROUTER_API_BASE and NEXT_PUBLIC_CONSOLE_URL."
    : "Needs BITROUTER_API_KEY and BITROUTER_API_BASE.";

/**
 * Whether this deployment can obtain a router credential at all.
 *
 * Mode-dependent: `byo-key` needs the key in the environment, while `session`
 * needs a console to mint against and gets no key of its own. Note this is a
 * question about the *deployment*, not the visitor — in session mode a signed-out
 * visitor still sees an available harness and is turned away by the 401 from
 * `resolveCredential`, because the picker is rendered before we know who they are.
 */
function hasRouterCredentials(): boolean {
  if (!process.env.BITROUTER_API_BASE) return false;
  return credentialMode() === "session"
    ? Boolean(process.env.NEXT_PUBLIC_CONSOLE_URL)
    : Boolean(process.env.BITROUTER_API_KEY);
}

/**
 * Whether the Pi harness is switched on.
 *
 * It holds a live agent session per visitor, so it stays dark unless a
 * deployment opts in explicitly — in `byo-key` mode that session spends the
 * site's shared key with nothing to cap it.
 */
export function isPiHarnessEnabled(): boolean {
  return process.env.ENABLE_PI_HARNESS === "1" && hasRouterCredentials();
}

function availabilityFor(harness: Harness): HarnessOption {
  switch (harness.id) {
    case "ai-sdk":
      return { ...harness, available: true };

    case "pi":
      if (isPiHarnessEnabled()) return { ...harness, available: true };
      return {
        ...harness,
        available: false,
        reason: hasRouterCredentials()
          ? "Set ENABLE_PI_HARNESS=1 to switch it on."
          : ROUTER_CREDENTIAL_REQUIREMENT,
      };

    // BitRouter's own catalog over ACP. Needs a port-capable sandbox (the ACP
    // bridge runs inside it and is dialled over `getPortUrl`) and router
    // credentials for the `--base-url` route the spawned CLI takes.
    case "bitrouter-claude-acp":
    case "bitrouter-codex-acp":
    case "bitrouter-gemini-cli":
    case "bitrouter-pi-acp": {
      // An agent we know cannot work in this routed configuration stays listed
      // but is never offered — a harness that reliably 401s is worse than one
      // that is honestly greyed out.
      const knownIssue = getBitrouterAcpAgent(harness.id)?.knownIssue;
      if (knownIssue) {
        return { ...harness, available: false, reason: knownIssue };
      }
      if (!hasSandboxCredentials()) {
        return {
          ...harness,
          available: false,
          reason: "Needs sandbox credentials (VERCEL_TOKEN and friends).",
        };
      }
      if (!hasRouterCredentials()) {
        return {
          ...harness,
          available: false,
          reason: ROUTER_CREDENTIAL_REQUIREMENT,
        };
      }
      return { ...harness, available: true };
    }

    // Claude Code, Codex and OpenCode each install a bridge inside the sandbox
    // and open a WebSocket back to it via the sandbox's `getPortUrl`. Unlike the
    // BitRouter entries above, these run against their vendor's own API rather
    // than through the router, so they also need that vendor's credentials —
    // which this deployment deliberately does not hold.
    default:
      return {
        ...harness,
        available: false,
        reason: "Runs against the vendor's own API; no credentials configured.",
      };
  }
}

export function getHarnessAvailability(): HarnessOption[] {
  return HARNESSES.map(availabilityFor);
}

export function isHarnessAvailable(id: HarnessId): boolean {
  const harness = HARNESSES.find((h) => h.id === id);
  return harness ? availabilityFor(harness).available : false;
}
