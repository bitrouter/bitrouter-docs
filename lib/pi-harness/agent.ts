import "server-only";

import { HarnessAgent } from "@ai-sdk/harness/agent";
import { createPi } from "@ai-sdk/harness-pi";
import { createJustBashSandbox } from "@ai-sdk/sandbox-just-bash";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { agentTools } from "@/lib/chat-agent";
import { buildPiModelsJson, piAlias } from "@/lib/pi-harness/models-json";

/**
 * Pi agent runtime for the harness playground.
 *
 * Pi is the only adapter that runs in-process: every other harness installs a
 * bridge inside the sandbox and waits for it to advertise a port, which forces
 * a real sandbox VM per session. Pi needs neither, so this runs against
 * `@ai-sdk/sandbox-just-bash` — an in-process JS bash over a virtual
 * filesystem — with no VM, no port, and no cold start.
 *
 * The tradeoff: sessions are process-local (see `sessions` below).
 */

export const HARNESS_INSTRUCTIONS = `You are BitRouter's research agent, running on the Pi harness.

Answer questions about BitRouter's docs, models, and pricing. When a question needs facts, call the documentation tools and then answer. Do not ask permission to search.

Rules:
- Ground every factual claim about BitRouter in a tool result. Never guess at pricing, model ids, or config syntax.
- Cite the pages you used, as Markdown links.
- Prefer lookup_model for anything about model cost, context window, or modalities.
- Be concise. Use Markdown, and fenced code blocks for config or commands.

Your shell is a sandboxed, in-process bash with a scratch filesystem. It is not the user's machine and nothing you do there is visible to them unless you say so. Know its shape before you reach for it:
- Available: POSIX shell (pipes, redirects, loops, conditionals, heredocs, arithmetic), ~83 commands including grep, sed, awk, cut, sort, find, xargs, tr, diff, tar, jq, yq, rg, sqlite3, and column.
- Not available: any interpreter (no node, no python), any network access (no curl, wget, or DNS), and no git.
- Some GNU flags are missing (for example \`sort -g\`, \`xargs -I\`) and process substitution \`<(...)\` does not parse. Failures are loud — a non-zero exit and a message on stderr — so read the error and try a different formulation rather than repeating the command.

Use the shell when it genuinely helps: arithmetic, reshaping data, or checking your own work. Use the documentation tools for anything about BitRouter itself.`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/**
 * Write Pi's catalog once per process.
 *
 * `agentDir` also holds Pi's `auth.json`, which stays empty: the API key is
 * passed through `customEnv` and never touches disk.
 */
let agentDirPromise: Promise<string> | undefined;

function ensureAgentDir(): Promise<string> {
  agentDirPromise ??= (async () => {
    const dir = path.join(tmpdir(), "bitrouter-pi-agent");
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const models = buildPiModelsJson({
      baseUrl: requireEnv("BITROUTER_API_BASE"),
    });
    await writeFile(
      path.join(dir, "models.json"),
      JSON.stringify(models, null, 2),
      { mode: 0o600 },
    );
    return dir;
  })();
  return agentDirPromise;
}

export async function createPiAgent(modelId: string) {
  const agentDir = await ensureAgentDir();

  return new HarnessAgent({
    harness: createPi({
      // Address by alias, not by the bare id — see PI_ALIAS_PREFIX.
      model: piAlias(modelId),
      agentDir,
      auth: {
        customEnv: {
          BITROUTER_API_KEY: requireEnv("BITROUTER_API_KEY"),
          BITROUTER_BASE_URL: requireEnv("BITROUTER_API_BASE"),
        },
      },
    }),
    id: "bitrouter-pi",
    sandbox: createJustBashSandbox({ cwd: "/work" }),
    sandboxConfig: {
      // Workaround for @ai-sdk/sandbox-just-bash@1.0.64: it drops the `env`
      // option on run(), so the framework's own `mkdir -p "$WORK_DIR"` (with
      // WORK_DIR passed via env) expands to `mkdir -p ""` — exit code 0, but
      // nothing created. Pi then fails to start with `cd: ... No such file or
      // directory`. onSession runs after that mkdir and before Pi starts.
      onSession: async ({ session, sessionWorkDir }) => {
        await session.run({ command: `mkdir -p '${sessionWorkDir}'` });
      },
    },
    instructions: HARNESS_INSTRUCTIONS,
    // The site's docs tools, executed here on the host. Pi's own builtins
    // (read/write/edit/bash/grep/glob/ls) stay enabled and run inside the
    // just-bash VFS, which interprets bash in JS rather than spawning host
    // processes.
    tools: agentTools,
  });
}
