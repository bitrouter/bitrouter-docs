import "server-only";

import { HarnessAgent } from "@ai-sdk/harness/agent";
import { createACP } from "@ai-sdk/harness-acp";

import {
  BITROUTER_ACP_AGENTS,
  getBitrouterAcpAgent,
} from "@/lib/bitrouter-acp/catalog";
import { agentTools } from "@/lib/chat-agent";
import {
  createHarnessSandbox,
  hasSandboxCredentials,
} from "@/lib/harness-sandbox.server";
import type { PlaygroundCredential } from "@/lib/playground-credential";

/**
 * BitRouter's own agent catalog, exposed to the AI SDK over ACP.
 *
 * `@ai-sdk/harness-acp` is the AI SDK's generic harness adapter: declare an
 * npm-installable ACP v1 agent and it returns a `HarnessV1`. BitRouter's CLI is
 * on npm and `bitrouter acp serve` speaks vanilla ACP over stdio, so one
 * `createACP()` per catalog id turns the whole catalog into AI SDK harnesses —
 * each still routing its model traffic through BitRouter.
 *
 * The distinction worth keeping in view: `@ai-sdk/harness-claude-code` runs
 * Claude Code against Anthropic. These entries run the *same* runtimes with
 * their traffic routed, which is the product.
 */

const INSTRUCTIONS = `You are BitRouter's research agent.

Answer questions about BitRouter's docs, models, and pricing. When a question needs facts, call the documentation tools and then answer. Do not ask permission to search.

Rules:
- Ground every factual claim about BitRouter in a tool result. Never guess at pricing, model ids, or config syntax.
- Cite the pages you used, as Markdown links.
- Prefer lookup_model for anything about model cost, context window, or modalities.
- Be concise. Use Markdown, and fenced code blocks for config or commands.

You are running in a disposable sandbox, not on the user's machine. Its filesystem starts empty and nothing you do there is visible to the user unless you say so. Use the shell for work that genuinely benefits from it and the documentation tools for anything about BitRouter itself.`;

/**
 * Bump when the bootstrap's side effects change.
 *
 * The provider keys a reusable sandbox snapshot off this, so a stale value
 * silently serves the old image — including an old set of pre-warmed agents.
 */
const BOOTSTRAP_HASH = "bitrouter-acp-v2-xz";

/**
 * Build a `HarnessAgent` for one catalog agent on one model, spending on
 * `credential`.
 *
 * All three axes are fixed at construction: `--model` only takes effect when
 * the routed path applies its overlay, so it is an argument to the spawned
 * process rather than something switchable mid-session, and the credential is
 * baked into the sandbox's environment with no way to refresh it.
 */
export async function createBitrouterAcpAgent({
  harnessId,
  modelId,
  credential,
}: {
  harnessId: string;
  modelId: string;
  credential: PlaygroundCredential;
}) {
  const agent = getBitrouterAcpAgent(harnessId);
  if (!agent) throw new Error(`Unknown BitRouter ACP harness: ${harnessId}`);
  if (!hasSandboxCredentials()) {
    throw new Error("Sandbox credentials are not configured");
  }

  return new HarnessAgent({
    harness: createACP({
      harnessId: agent.harnessId,
      // No `packageVersion`: this tracks the `latest` dist-tag and keeps the
      // version out of the implementation identity, so an alpha release does
      // not invalidate existing lifecycle state.
      source: { type: "npm-simple", packageName: "bitrouter" },
      executable: "bitrouter",
      // `--base-url` alone is what suppresses the local daemon: autostart is
      // gated on `base_url.is_none() && target_is_local`, so a remote URL skips
      // it entirely. `--no-start` would be inert here and `--direct` would
      // disable routing altogether (and discard `--model`).
      args: [
        "acp",
        "serve",
        "--agent",
        agent.agentId,
        "--base-url",
        credential.baseUrl,
        "--model",
        modelId,
      ],
      // `env`, not `forwardEnv`: the token is now per-visitor, and `forwardEnv`
      // can only name variables on *this* process — it would forward the house
      // key to everyone. The adapter rejects a key present in both.
      //
      // Safe despite the "values persist in identity" warning on this option.
      // The value lands in `implementationIdentity`, a hash that gates only
      // resume-compatibility *within* one session, where the credential is
      // fixed (the pool rebuilds on expiry rather than swapping). It does not
      // reach the sandbox's `implementation.json`, which records env *keys*
      // only, nor the bootstrap file set — so the snapshot `BOOTSTRAP_HASH`
      // gates stays shared across visitors instead of paying a cold `dnf
      // install xz` per session.
      env: { BITROUTER_API_KEY: credential.token },
      // Deliberately no `authentication`: the bridge only performs the ACP
      // `authenticate` round trip when this is set, and BitRouter's down-facing
      // endpoint does not relay upstream auth methods — it answers
      // `authenticate` with method-not-found. Credentials travel by
      // environment instead.
    }),
    id: agent.harnessId,
    sandbox: createHarnessSandbox(),
    sandboxConfig: {
      bootstrapHash: BOOTSTRAP_HASH,
      onBootstrap: async ({ session }) => {
        // `xz` is required and absent from the image, and this is the only
        // place it can be installed in time. Verified on Vercel Sandbox
        // `node24` (Amazon Linux 2023, glibc 2.34):
        //
        //   - glibc 2.34 < the 2.35 the gnu build needs, so bitrouter's
        //     installer falls back to its musl-static artifact, a `.tar.xz`
        //   - the image ships no `xz`, so tar cannot unpack it
        //   - but pnpm 10 ignores bitrouter's build script during the adapter's
        //     own bootstrap, so nothing is downloaded then — the fetch is
        //     deferred to the first spawn of the bin shim
        //
        // That deferral is what makes this hook early enough: the adapter's
        // bootstrap runs before us, but it only writes the shim. Confirmed
        // end-to-end — `bitrouter --version` returns 1.0.0-alpha.27 afterwards.
        await session.run({ command: "sudo dnf install -y xz" });

        // BitRouter's catalog spawns each agent as `npx -y <pkg>@latest`.
        // Warming the npm cache into the snapshot keeps that from being a cold
        // download on a visitor's first turn. `npx` still resolves `@latest`
        // at spawn time, so this is a latency optimisation, not a pin.
        for (const { npmPackage } of BITROUTER_ACP_AGENTS) {
          await session.run({ command: `npm cache add ${npmPackage}@latest` });
        }
      },
    },
    instructions: INSTRUCTIONS,
    // Reach the agent as an MCP server the bridge injects into `session/new`.
    // BitRouter relays `mcpServers` verbatim to the upstream agent, so the docs
    // tools survive the extra hop.
    tools: agentTools,
  });
}
