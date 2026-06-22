# Ask AI Retrieval Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the chat route's "stuff every doc page into the system prompt" with retrieval-as-a-tool over the existing Orama index, and render the retrieved pages as citations.

**Architecture:** Extract the fumadocs Orama search server into a shared `lib/search-server.ts` so both the search route and the chat route can use it. The chat route gains a `search` tool (Vercel AI SDK `tool()`) that calls `searchServer.search()` and returns `{url, title, content}[]`; the model retrieves-then-answers via `stopWhen: stepCountIs(4)`. The existing `components/ai/search.tsx` already parses `tool-search` parts — we extend it from showing a count to rendering clickable source links.

**Tech Stack:** Next.js 16 App Router, Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`), fumadocs-core 16.8.8 Orama search, Zod 4, PostHog.

**Testing note:** This change is I/O-bound (live model + built search index) with no pure unit logic worth isolating, and the repo has no test harness. Verification is therefore integration-style: `pnpm build` for typecheck/compile, a `curl` against `/api/chat` to observe tool calls in the stream, and a manual browser check of citations. We deliberately do not add a unit-test framework for this initiative.

---

## File Structure

- **Create:** `lib/search-server.ts` — single source of the configured Orama `SearchServer`. Responsibility: build the search index once; export `searchServer`.
- **Modify:** `app/api/search/route.ts` — import `searchServer` from `lib`, re-export its `GET`. Responsibility shrinks to "HTTP entrypoint for site search".
- **Modify:** `app/api/chat/route.ts` — remove whole-corpus context; add the `search` tool + retrieve-then-answer loop. Responsibility: orchestrate the AI chat.
- **Modify:** `components/ai/search.tsx` — render the tool's returned sources as citations. Responsibility unchanged (chat UI), feature extended.

---

## Task 1: Extract the Orama search server into `lib/search-server.ts`

**Files:**
- Create: `lib/search-server.ts`
- Modify: `app/api/search/route.ts`

- [ ] **Step 1: Create the shared search server module**

Create `lib/search-server.ts` with exactly the config currently inline in the search route:

```ts
import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { stopwords as mandarinStopwords } from "@orama/stopwords/mandarin";

// Single configured Orama search server, shared by the site-search route
// (`app/api/search/route.ts`) and the AI chat tool (`app/api/chat/route.ts`).
// `searchServer.search(query, { locale })` returns SortedResult[].
export const searchServer = createFromSource(source, {
  localeMap: {
    zh: {
      components: {
        tokenizer: createTokenizer({
          stopWords: mandarinStopwords,
        }),
      },
      search: {
        threshold: 0,
      },
    },
  },
});
```

- [ ] **Step 2: Point the search route at the shared server**

Replace the entire contents of `app/api/search/route.ts` with:

```ts
import { searchServer } from "@/lib/search-server";

export const { GET } = searchServer;
```

- [ ] **Step 3: Verify it compiles and site search is unchanged**

Run: `pnpm build`
Expected: build succeeds (no type errors). The `GET` export of `app/api/search/route.ts` still satisfies Next.js route requirements.

- [ ] **Step 4: Commit**

```bash
git add lib/search-server.ts app/api/search/route.ts
git commit -m "refactor: extract shared Orama search server to lib"
```

---

## Task 2: Add the `search` tool to the chat route

**Files:**
- Modify: `app/api/chat/route.ts`

- [ ] **Step 1: Rewrite the chat route to use retrieval-as-a-tool**

Replace the entire contents of `app/api/chat/route.ts` with:

```ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { searchServer } from "@/lib/search-server";
import { getPostHogClient } from "@/lib/posthog-server";

export const maxDuration = 30;

const bitrouter = createOpenAICompatible({
  name: "bitrouter",
  baseURL: process.env.BITROUTER_API_BASE!,
  apiKey: process.env.BITROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant for BitRouter documentation.
Always use the \`search\` tool to find relevant documentation before answering.
Base your answer only on the search results and cite the pages you used.
Be concise and accurate. If the search returns nothing relevant, say you don't know.`;

export async function POST(req: Request) {
  const distinctId = req.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";
  const { messages }: { messages: UIMessage[] } = await req.json();

  let searchCalls = 0;

  const result = streamText({
    model: bitrouter("bitrouter-balanced"),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(4),
    tools: {
      search: tool({
        description:
          "Search the BitRouter documentation. Returns relevant sections, each with its page title and URL.",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
          locale: z
            .enum(["en", "zh"])
            .optional()
            .describe("Docs locale to search; defaults to en"),
        }),
        async execute({ query, locale }) {
          searchCalls++;
          const results = await searchServer.search(query, {
            locale: locale ?? "en",
          });
          return results.slice(0, 8).map((r) => ({
            url: r.url,
            title: r.breadcrumbs?.length ? r.breadcrumbs.join(" › ") : r.content,
            content: r.content,
          }));
        },
      }),
    },
    onFinish() {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId,
        event: "ai_chat_completion",
        properties: { model: "bitrouter-balanced", search_calls: searchCalls },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds. No references to the removed `getDocsContext`/`source` remain.

- [ ] **Step 3: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: chat retrieves docs via search tool instead of whole corpus"
```

---

## Task 3: Render retrieved pages as citations in the chat UI

**Files:**
- Modify: `components/ai/search.tsx`

- [ ] **Step 1: Widen the `SearchTool` type to include the tool output shape**

In `components/ai/search.tsx`, replace this line (currently line 31):

```ts
export type SearchTool = Tool<{ query: string; limit: number }>;
```

with:

```ts
export type SearchSource = { url: string; title: string; content: string };
export type SearchTool = Tool<{ query: string; locale?: string }, SearchSource[]>;
```

- [ ] **Step 2: Add a source-dedupe helper**

In `components/ai/search.tsx`, add this helper just above the `Message` function (currently around line 267, before `function Message(...)`):

```ts
// Collapse heading/text hits down to unique pages (strip the #anchor) so the
// citation list shows each source page once.
function dedupeSources(sources: SearchSource[]): { url: string; title: string }[] {
  const byPage = new Map<string, { url: string; title: string }>();
  for (const s of sources) {
    const pageUrl = s.url.split("#")[0];
    if (!byPage.has(pageUrl)) {
      byPage.set(pageUrl, { url: pageUrl, title: s.title });
    }
  }
  return [...byPage.values()];
}
```

- [ ] **Step 3: Replace the search-results box with a citations list**

In `components/ai/search.tsx`, replace the entire `searchCalls.map(...)` block (currently lines 300-314) with:

```tsx
      {searchCalls.map((call) => {
        if (call.state === "output-error" || call.state === "output-denied") {
          return (
            <div
              key={call.toolCallId}
              className="flex flex-row gap-2 items-center mt-3 rounded-lg border bg-fd-secondary text-fd-muted-foreground text-xs p-2"
            >
              <SearchIcon className="size-4" />
              <p className="text-fd-error">{call.errorText ?? "Failed to search"}</p>
            </div>
          );
        }

        if (!call.output) {
          return (
            <div
              key={call.toolCallId}
              className="flex flex-row gap-2 items-center mt-3 rounded-lg border bg-fd-secondary text-fd-muted-foreground text-xs p-2"
            >
              <SearchIcon className="size-4" />
              <p>Searching…</p>
            </div>
          );
        }

        const sources = dedupeSources(call.output);
        if (sources.length === 0) return null;

        return (
          <div key={call.toolCallId} className="mt-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-fd-muted-foreground">
              <SearchIcon className="size-3.5" />
              Sources
            </p>
            <div className="flex flex-col gap-1">
              {sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  className="truncate text-xs text-fd-muted-foreground transition-colors hover:text-fd-primary"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        );
      })}
```

- [ ] **Step 4: Verify it compiles**

Run: `pnpm build`
Expected: build succeeds; `call.output` is typed as `SearchSource[]`.

- [ ] **Step 5: Commit**

```bash
git add components/ai/search.tsx
git commit -m "feat: show retrieved doc pages as citations in AI chat"
```

---

## Task 4: Integration verification

**Files:** none (verification only)

- [ ] **Step 1: Ensure AI env vars are set for local run**

Confirm `BITROUTER_API_BASE` (and `BITROUTER_API_KEY` if required) are set in your `.env.local`. Without them the model call fails (this is unchanged from before).

- [ ] **Step 2: Start the dev server**

Run: `pnpm dev`
Expected: server starts on `http://localhost:3000`.

- [ ] **Step 3: Hit the chat endpoint and observe a tool call**

Run:
```bash
curl -N -s http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"How do I get started with BitRouter?"}]}]}' \
  | head -c 4000
```
Expected: the streamed response contains a `tool-search` part (e.g. a chunk referencing `"search"` with an `output` array of `{url,title,content}`) followed by streamed assistant text. The text should reference real docs pages, not be a generic answer.

- [ ] **Step 4: Manual browser check of citations**

Open `http://localhost:3000`, press `Cmd/Ctrl + /` to open AI Chat, ask "How do I configure routing?". Confirm: a "SOURCES" list of clickable doc links appears under the answer, and each link navigates to a real docs page.

- [ ] **Step 5: Confirm the corpus is no longer dumped**

Run: `grep -n "getDocsContext\|join(\"\\\\n\\\\n---" app/api/chat/route.ts || echo "clean"`
Expected: prints `clean` (the whole-corpus context is gone).

---

## Self-Review checklist (done while writing)

- Spec coverage: remove corpus prompt ✓ (Task 2); `search` tool over existing Orama index ✓ (Tasks 1-2, one index reused, not a 2nd FlexSearch); locale passthrough incl. `zh` tokenizer ✓ (Task 2 `locale` arg); citations in `components/ai/search.tsx` ✓ (Task 3); PostHog event kept + `search_calls` added ✓ (Task 2); BM25-only / no embeddings ✓ (uses `searchServer.search` default).
- Type consistency: `SearchSource = {url,title,content}` defined in Task 3 Step 1; produced by the tool in Task 2 Step 1; consumed by `dedupeSources` (Task 3 Step 2) and the citations list (Task 3 Step 3). `searchServer` named identically across Tasks 1-2.
- No placeholders: all steps contain full code or exact commands.
