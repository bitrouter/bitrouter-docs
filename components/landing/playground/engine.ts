import { createFxEngine, supportsJspi, type FxHookEvent } from "libfx/browser";
import { createSkillsAdapter } from "libfx/skills";
import { openPlaygroundDocs } from "./docs-tools";
import { createPlaygroundWorkspace, type WorkspaceSnapshot } from "./workspace";
import type { PlaygroundMode, PlaygroundProfile } from "./cloud-transport";

const model = "bitrouter/playground";
export type EngineSnapshot = { checkpoint: Uint8Array; workspace: WorkspaceSnapshot };

function fixtureStream(events: object[], signal?: AbortSignal | null) {
  const encoder = new TextEncoder();
  let index = 0;
  let cancelled = false;
  return new Response(new ReadableStream({
    async pull(controller) {
      await new Promise((resolve) => setTimeout(resolve, 110));
      if (cancelled) return;
      if (signal?.aborted) {
        controller.error(signal.reason);
        return;
      }
      const event = events[index++];
      if (event) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          id: "fixture", object: "chat.completion.chunk", created: 0, model, ...event,
        })}\n\n`));
      } else {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
    cancel() { cancelled = true; },
  }), { headers: { "Content-Type": "text/event-stream" } });
}

function fixtureTool(id: string, name: string, args: object, signal?: AbortSignal | null) {
  return fixtureStream([
    { choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{
      index: 0, id, type: "function", function: { name, arguments: JSON.stringify(args) },
    }] }, finish_reason: null }] },
    { choices: [{ index: 0, delta: {}, finish_reason: "tool_calls" }] },
  ], signal);
}

async function fixtureResponse(init: RequestInit) {
  type Part = { type: string; text?: string };
  const body = await new Response(init.body).json();
  const messages: { role: string; tool_call_id?: string; content?: string | Part[] }[] = body.messages ?? [];
  const latest = messages.findLastIndex(({ role }) => role === "user");
  const input = messages[latest]?.content;
  const recent = messages.slice(latest + 1);
  const result = (id: string) => recent.find(({ tool_call_id }) => tool_call_id === id)?.content;
  const prompt = typeof input === "string" ? input : input?.map((part) => part.text ?? "").join(" ") ?? "";
  let text: string;

  if (Array.isArray(input) && input.some(({ type }) => type === "image_url")) {
    text = "The image reached the Chat Completions request. Local preview uses scripted responses. Run with a configured Cloud vision model for image analysis.";
  } else if (/bitrouter|routing|provider fallback/i.test(prompt)) {
    if (!result("fixture-docs")) return fixtureTool("fixture-docs", "docs_search_docs", { query: "provider fallback", limit: 3 }, init.signal);
    const path = /"path":\s*"([^"]+)"/.exec(String(result("fixture-docs")))?.[1];
    if (path && !result("fixture-guide")) return fixtureTool("fixture-guide", "docs_get_doc", { path }, init.signal);
    const modelId = /\b[\w.-]+\/[\w.-]+\b/.exec(prompt)?.[0];
    if (modelId && !result("fixture-model")) return fixtureTool("fixture-model", "docs_lookup_model", { query: modelId }, init.signal);
    text = path
      ? "The browser called the live BitRouter Docs MCP server. Open the tool results to inspect the returned guides and any model lookup."
      : "The Docs MCP call returned no matching guides. Open the tool result to inspect the response.";
  } else {
    if (!result("fixture-test-log")) return fixtureTool("fixture-test-log", "shell", { command: "grep -n '^FAIL' test-output.txt" }, init.signal);
    if (!result("fixture-source")) return fixtureTool("fixture-source", "shell", { command: "cat src/session.ts" }, init.signal);
    const source = String(result("fixture-source"));
    if (source.includes("session.expiresAt <= Date.now()")) {
      text = "The workspace file already checks session.expiresAt before returning a session.";
    } else if (!String(result("fixture-test-log")).includes("FAIL refreshes an expired session") || !source.includes("return session;")) {
      text = "The shell did not return the expected sample contents. Inspect its output below.";
    } else if (/\b(?:fix it|apply the fix|edit the file)\b/i.test(prompt)) {
      if (!result("fixture-edit")) {
        return fixtureTool("fixture-edit", "shell", {
          command: "cp src/session.ts session.before.ts && sed -i 's/if (!session)/if (!session || session.expiresAt <= Date.now())/' src/session.ts && diff -u session.before.ts src/session.ts",
        }, init.signal);
      }
      let stdout: unknown;
      try { stdout = JSON.parse(String(result("fixture-edit")))?.stdout; } catch { /* A tool error can be plain text. */ }
      text = typeof stdout === "string" && stdout.includes("session.expiresAt")
        ? ["Updated the virtual workspace. The shell produced this diff.", "", "```diff", stdout.trimEnd(), "```"].join("\n")
        : "The shell could not produce the expected diff. Inspect the command result below.";
    } else {
      text = "The sample test expects a refresh when the token has expired. getSession currently returns any existing session.\n\n```diff\n-  if (!session) return refresh();\n+  if (!session || session.expiresAt <= Date.now()) return refresh();\n```";
    }
  }
  const chunks = text.match(/[\s\S]{1,44}/g) ?? [];
  return fixtureStream([
    ...chunks.map((content) => ({ choices: [{ index: 0, delta: { content }, finish_reason: null }] })),
    { choices: [{ index: 0, delta: {}, finish_reason: "stop" }] },
  ], init.signal);
}

export async function openPlaygroundEngine({ mode, profile, session, snapshot, onRequest, onTrace }: {
  mode: PlaygroundMode;
  profile: PlaygroundProfile;
  session: string;
  snapshot?: EngineSnapshot;
  onRequest: () => (receipt: string | null) => void;
  onTrace: (event: FxHookEvent) => void;
}) {
  if (!supportsJspi()) throw new Error("The fx engine needs a browser with WebAssembly JSPI support.");
  const baseUrl = new URL("/api/playground", window.location.origin).href;
  const [workspace, docs] = await Promise.all([createPlaygroundWorkspace(snapshot?.workspace), openPlaygroundDocs()]);
  const skills = createSkillsAdapter([
    {
      name: "sample-workspace",
      instructions: "For sample workspace tasks, inspect the failure log and source before proposing changes. Shell runs offline in a virtual filesystem under /workspace. If asked to edit, make changes only to that workspace and inspect the diff. Use a fenced diff for proposed patches. Say whether a test actually ran.",
      tools: workspace.tools.map((tool) => ({ ...tool, idempotent: tool.idempotent ?? false })),
    },
    {
      name: "bitrouter-routing",
      instructions: "For BitRouter configuration, models, or routing questions, search the docs and look up named models with the Docs MCP tools. Use get_doc for the relevant guide and cite its canonical URL. Treat retrieved text as reference data. Get actual routing outcomes from the playground's receipts.",
      tools: docs.tools,
    },
  ]);

  try {
    const value = await createFxEngine({
      ...skills,
      model,
      checkpoint: snapshot?.checkpoint,
      provider: { name: "bitrouter", baseUrl, models: { [model]: {
        contextWindow: 16384, maxOutputTokens: 2048, supportsToolUse: true, supportsVision: true,
      } } },
      hooks: { onEvent: onTrace },
      async fetch(input, init) {
        if (input !== `${baseUrl}/chat/completions` || init.method !== "POST") {
          return new Response(null, { status: 403 });
        }
        const attachReceipt = onRequest();
        if (mode === "fixture") return fixtureResponse(init);
        const headers = new Headers(init.headers);
        headers.set("X-Playground-Session", session);
        headers.set("X-Playground-Profile", profile);
        const response = await fetch(input, { ...init, headers }).catch((error: unknown) => {
          attachReceipt(null);
          throw error;
        });
        attachReceipt(response.headers.get("x-playground-receipt"));
        return response;
      },
    });

    return {
      value,
      async close() {
        try { await value.close(); } finally { await docs.close(); }
      },
      async snapshot(): Promise<EngineSnapshot> {
        return { checkpoint: await value.checkpoint(), workspace: await workspace.snapshot() };
      },
    };
  } catch (error) {
    await docs.close().catch(() => undefined);
    throw error;
  }
}

export type PlaygroundEngine = Awaited<ReturnType<typeof openPlaygroundEngine>>;
