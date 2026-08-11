import "server-only";

import { createVercelSandbox } from "@ai-sdk/sandbox-vercel";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The sandbox the bridge-backed harnesses run in.
 *
 * Every sandbox reference in the app goes through this module. The choice is
 * expected to change — Railway Sandboxes are the intended destination once an
 * `HarnessV1SandboxProvider` adapter exists for them — and keeping it behind one
 * export makes that swap a single edit instead of a sweep.
 *
 * Why a VM at all: Claude Code, Codex, OpenCode and ACP each install a bridge
 * *inside* the sandbox and dial back into it over a WebSocket resolved through
 * `getPortUrl`. `@ai-sdk/sandbox-just-bash` — which Pi uses — exposes no ports,
 * so it cannot host any of them.
 */

/** The port the harness bridge binds inside the sandbox. */
const BRIDGE_PORT = 4000;

/**
 * Explicit credentials, when the deployment supplies them.
 *
 * `@vercel/sandbox` does **not** read these from the environment itself — its
 * own resolution is the Vercel CLI's `auth.json` plus a `.vercel/project.json`
 * link, neither of which exists on Railway. The env vars are our convention and
 * have to be threaded through explicitly, which is what `createHarnessSandbox`
 * does below. (The SDK's README shows the same pattern.)
 */
function explicitCredentials() {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !teamId || !projectId) return undefined;
  return { token, teamId, projectId };
}

/**
 * Whether a sandbox can be provisioned here.
 *
 * Two paths. A deployment sets the explicit trio above. Locally the SDK
 * authenticates over OIDC instead: `vercel link` writes `.vercel/project.json`
 * and `vercel env pull` puts a `VERCEL_OIDC_TOKEN` in `.env.local`, which Next
 * loads into the environment. Both parts are needed — a link without a token
 * fails at provision time with `LocalOidcContextError`.
 */
export function hasSandboxCredentials(): boolean {
  if (explicitCredentials()) return true;
  return (
    Boolean(process.env.VERCEL_OIDC_TOKEN) &&
    existsSync(join(process.cwd(), ".vercel", "project.json"))
  );
}

/**
 * Build the sandbox provider.
 *
 * Created per agent rather than shared at module scope: the provider mints a
 * sandbox per session, and constructing it eagerly would run before we know
 * whether credentials exist.
 */
export function createHarnessSandbox() {
  return createVercelSandbox({
    runtime: "node24",
    ports: [BRIDGE_PORT],
    // Omitted entirely when unset so the SDK falls back to its own ambient
    // resolution rather than receiving explicit `undefined`s.
    ...explicitCredentials(),
  });
}
