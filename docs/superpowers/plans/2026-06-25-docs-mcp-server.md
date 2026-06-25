# Docs MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public, no-auth MCP server co-located with the BitRouter docs site that exposes `search_docs`, `get_doc`, and `lookup_model` tools plus an `llms-index` resource, reusing the repo's existing Orama search, fumadocs source loader, and model catalog.

**Architecture:** A Next.js App Router route at `app/api/[transport]/route.ts` built with `mcp-handler` (Streamable HTTP, no Redis). All tool *transform* logic lives in a pure module `lib/mcp/format.ts` (type-only imports, vitest-tested); thin I/O wrappers in `lib/mcp/tools.ts` call the existing server modules. A `next.config.ts` rewrite exposes the clean public URL `bitrouter.ai/mcp`.

**Tech Stack:** TypeScript, Next.js (App Router), `mcp-handler`, `@modelcontextprotocol/sdk`, `zod` (already a dep), fumadocs (Orama search + source loader), vitest.

---

## Context the engineer needs

**Reused, existing APIs (do not reimplement):**
- `searchServer.search(query, { locale })` → `SortedResult[]` — from `@/lib/search-server` (shared Orama server; same one behind `app/api/search` and `app/api/chat`). A `SortedResult` has `{ id: string; url: string; type: "page" | "heading" | "text"; content: string }`. `url` is like `/docs/guides/routing/model-fallback` (and `/docs/...#hash` for headings).
- `source.getPage(slug?: string[], locale?: string)` and `getLLMText(page)` — from `@/lib/source`. `getLLMText` returns `` `# ${title} (${url})\n\n${processed}` ``. This is exactly what `app/api/docs/llms-mdx/[locale]/[[...slug]]/route.ts` uses.
- `fetchModels(): Promise<Model[]>` and `fetchModelById(id): Promise<Model | null>` — from `@/lib/models-server` (imports `server-only`). `Model` is `{ id, name, maxInputTokens, maxOutputTokens, modalities, pricing: { input, output, cacheRead?, cacheWrite? }, benchmarks? }` from `@/lib/models-types`. Pricing is USD per 1M tokens.
- `LLMS_TXT` — currently an inline const inside `app/llms.txt/route.ts`; Task 4 extracts it to `lib/llms-txt.ts`.

**Two hard constraints that shaped this plan:**
1. **vitest only runs `lib/**/*.test.ts`, in a `node` env, with NO `@/` path-alias resolution** (see `vitest.config.ts`). Modules that value-import `@/lib/*` (which pull in `server-only` and the generated `.source/server`) cannot be loaded by vitest. → Pure transforms go in `lib/mcp/format.ts` with **type-only** imports and are the only vitest-tested code. I/O wrappers and the route are covered by `pnpm build` (typecheck) + a manual MCP handshake.
2. **`mcp-handler` mounts at `app/api/[transport]/route.ts`** (serving `/api/mcp`). A top-level `app/[transport]` would collide with `(home)` routes like `/pricing`. → keep `/api/[transport]` and add a rewrite for the public `/mcp` URL.

**i18n:** locales are `["en", "zh"]`, default `en`, `hideLocale: "default-locale"` (so `en` URLs have no locale prefix; `zh` URLs are `/zh/...`).

---

## File structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `lib/mcp/format.ts` | Create | Pure transforms: `pathToSlug`, `formatSearchResults`, `truncateMarkdown`, `matchModels`, `buildConfigSnippet`, `formatModelAnswer` + types. Type-only imports. |
| `lib/mcp/format.test.ts` | Create | vitest unit tests for every function in `format.ts`. |
| `lib/mcp/tools.ts` | Create | Thin async I/O: `searchDocs`, `getDoc`, `lookupModel`. Value-imports server modules + `format.ts`. |
| `lib/llms-txt.ts` | Create | Exports the `LLMS_TXT` string (moved out of the route). |
| `lib/llms-txt.test.ts` | Create | Trivial vitest check that `LLMS_TXT` is non-empty and headed `# BitRouter`. |
| `app/llms.txt/route.ts` | Modify | Import `LLMS_TXT` from `@/lib/llms-txt` instead of declaring it inline. |
| `app/api/[transport]/route.ts` | Create | `mcp-handler` wiring: 3 tools + 1 resource + server metadata. |
| `next.config.ts` | Modify | Add rewrite `/mcp` → `/api/mcp`. |
| `content/docs/integrations/tools/mcp-docs-server.mdx` | Create | "Add BitRouter docs to your agent" doc page. |
| `package.json` / `pnpm-lock.yaml` | Modify | Add `mcp-handler`, `@modelcontextprotocol/sdk`. |

---

## Task 1: Add dependencies and pin the SDK API shapes

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install the packages**

Run (from the worktree root):
```bash
pnpm add mcp-handler @modelcontextprotocol/sdk
```
Expected: both added to `dependencies`; `zod` is already present (`^4.3.6`).

- [ ] **Step 2: Pin the three uncertain signatures against the installed types**

These three APIs vary across versions. Read the installed `.d.ts` and note the exact shapes you'll use in Tasks 3 and 5:
```bash
sed -n '1,80p' node_modules/mcp-handler/dist/index.d.ts
grep -RnE "registerTool|registerResource" node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts | head
```
Confirm:
- `createMcpHandler(initializeServer, serverOptions?, config?)` — param types (esp. whether server `name`/`version`/`instructions` go in `serverOptions`).
- `registerTool(name, { title?, description, inputSchema }, handler)` — whether `inputSchema` is a **ZodRawShape** (`{ query: z.string() }`) or a `z.object({...})`. This plan uses the **raw shape**; if the types demand `z.object`, wrap accordingly.
- `registerResource(name, uri, metadata, readCallback)` — confirm arg order and that the read callback returns `{ contents: [{ uri, mimeType, text }] }`.

The `pnpm build` step in Task 6 is the hard gate that catches any mismatch.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build(docs-mcp): add mcp-handler and @modelcontextprotocol/sdk"
```

---

## Task 2: Pure transform module (`lib/mcp/format.ts`) — TDD

**Files:**
- Create: `lib/mcp/format.ts`
- Test: `lib/mcp/format.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/mcp/format.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  pathToSlug,
  formatSearchResults,
  truncateMarkdown,
  matchModels,
  buildConfigSnippet,
  formatModelAnswer,
  type RawSearchResult,
} from "./format";
import type { Model } from "../models-types";

const model = (over: Partial<Model>): Model => ({
  id: "anthropic/claude-sonnet-4",
  name: "Claude Sonnet 4",
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  modalities: ["text"],
  pricing: { input: 3, output: 15 },
  ...over,
});

describe("pathToSlug", () => {
  it("strips the /docs base", () => {
    expect(pathToSlug("/docs/guides/routing/model-fallback")).toEqual([
      "guides", "routing", "model-fallback",
    ]);
  });
  it("strips a leading locale and a #hash and a full origin", () => {
    expect(pathToSlug("https://bitrouter.ai/zh/docs/features/advisor#usage")).toEqual([
      "features", "advisor",
    ]);
  });
  it("accepts a bare slug path", () => {
    expect(pathToSlug("features/subagent")).toEqual(["features", "subagent"]);
  });
});

describe("formatSearchResults", () => {
  const raw: RawSearchResult[] = [
    { id: "1", url: "/docs/guides/routing/model-fallback", type: "page", content: "Model Fallback" },
    { id: "2", url: "/docs/guides/routing/model-fallback#auto", type: "heading", content: "Automatic fallback" },
    { id: "3", url: "/docs/features/byok", type: "page", content: "BYOK" },
  ];
  it("dedups by page and caps to the limit", () => {
    const hits = formatSearchResults(raw, 1);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      title: "Model Fallback",
      path: "guides/routing/model-fallback",
      url: "https://bitrouter.ai/docs/guides/routing/model-fallback",
    });
  });
  it("returns one hit per distinct page", () => {
    expect(formatSearchResults(raw, 10)).toHaveLength(2);
  });
});

describe("truncateMarkdown", () => {
  it("returns text unchanged under the cap", () => {
    expect(truncateMarkdown("short", "https://x", 100)).toBe("short");
  });
  it("truncates and appends a deep link over the cap", () => {
    const out = truncateMarkdown("a".repeat(50), "https://bitrouter.ai/docs/x", 10);
    expect(out.startsWith("aaaaaaaaaa")).toBe(true);
    expect(out).toContain("full page: https://bitrouter.ai/docs/x");
  });
});

describe("matchModels", () => {
  const models = [
    model({ id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" }),
    model({ id: "openai/gpt-4o", name: "GPT-4o" }),
  ];
  it("returns the exact id match alone", () => {
    expect(matchModels(models, "openai/gpt-4o").map((m) => m.id)).toEqual(["openai/gpt-4o"]);
  });
  it("fuzzy-matches on id or name fragments", () => {
    expect(matchModels(models, "sonnet").map((m) => m.id)).toEqual(["anthropic/claude-sonnet-4"]);
  });
  it("returns [] when nothing matches", () => {
    expect(matchModels(models, "llama")).toEqual([]);
  });
});

describe("buildConfigSnippet", () => {
  it("embeds the model id", () => {
    expect(buildConfigSnippet("openai/gpt-4o")).toContain('"model":"openai/gpt-4o"');
  });
});

describe("formatModelAnswer", () => {
  it("reports matched models with pricing and a snippet", () => {
    const ans = formatModelAnswer("sonnet", [model({})]);
    expect(ans.matched).toBe(true);
    expect(ans.models[0]).toMatchObject({
      id: "anthropic/claude-sonnet-4",
      routable: true,
      pricingPer1M: { input: 3, output: 15 },
    });
    expect(ans.models[0].configSnippet).toContain("anthropic/claude-sonnet-4");
  });
  it("reports no match with a helpful note", () => {
    const ans = formatModelAnswer("llama", []);
    expect(ans.matched).toBe(false);
    expect(ans.note).toContain("llama");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run lib/mcp/format.test.ts`
Expected: FAIL — `Cannot find module './format'`.

- [ ] **Step 3: Implement `lib/mcp/format.ts`**

Create `lib/mcp/format.ts`:
```ts
// Pure transforms for the docs MCP tools. NO value imports of `@/lib/*` or
// `server-only` — only erased `import type` — so vitest (node env, no path
// aliases) can exercise these directly. See vitest.config.ts.
import type { Model } from "../models-types";

const SITE_ORIGIN = "https://bitrouter.ai";
const LOCALES = ["en", "zh"];

/** The fields we use from fumadocs-core's `SortedResult`. */
export interface RawSearchResult {
  id: string;
  url: string;
  type: "page" | "heading" | "text";
  content: string;
}

/** One hit returned by `search_docs`. */
export interface DocHit {
  title: string;
  url: string;
  /** Slug path to hand back to `get_doc`, e.g. "guides/routing/model-fallback". */
  path: string;
  snippet?: string;
}

/** A compact, agent-friendly answer for `lookup_model`. */
export interface ModelAnswer {
  query: string;
  matched: boolean;
  models: Array<{
    id: string;
    name: string;
    routable: true;
    pricingPer1M: { input: number; output: number };
    contextTokens: number;
    configSnippet: string;
  }>;
  note?: string;
}

/** Reduce a doc URL or path to fumadocs slug segments (no locale, no "docs"). */
export function pathToSlug(input: string): string[] {
  let p = input.trim();
  p = p.replace(/^https?:\/\/[^/]+/i, ""); // drop scheme://host
  p = p.split(/[?#]/)[0]; // drop query/hash
  const segs = p.split("/").filter(Boolean);
  if (segs.length && LOCALES.includes(segs[0])) segs.shift(); // drop leading locale
  if (segs.length && segs[0] === "docs") segs.shift(); // drop the /docs base
  return segs;
}

/** Map fumadocs search results to compact, page-deduplicated hits. */
export function formatSearchResults(results: RawSearchResult[], limit: number): DocHit[] {
  const hits: DocHit[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    const baseUrl = r.url.split("#")[0];
    if (seen.has(baseUrl)) continue;
    seen.add(baseUrl);
    const path = pathToSlug(baseUrl).join("/");
    hits.push({
      title: r.content || path,
      url: baseUrl.startsWith("http") ? baseUrl : `${SITE_ORIGIN}${baseUrl}`,
      path,
      ...(r.type !== "page" && r.content ? { snippet: r.content } : {}),
    });
    if (hits.length >= limit) break;
  }
  return hits;
}

/** Truncate markdown to a char cap, appending a deep-link footer when cut. */
export function truncateMarkdown(text: string, url: string, cap: number): string {
  if (text.length <= cap) return text;
  return `${text.slice(0, cap).trimEnd()}\n\n… (truncated) full page: ${url}`;
}

/** Copy-paste snippet showing how to route a model through BitRouter. */
export function buildConfigSnippet(id: string): string {
  return [
    "# Route through BitRouter (OpenAI-compatible).",
    "#   hosted base URL: https://api.bitrouter.ai/v1",
    "#   local proxy:     http://localhost:8787/v1",
    "curl https://api.bitrouter.ai/v1/chat/completions \\",
    '  -H "Authorization: Bearer $BITROUTER_API_KEY" \\',
    '  -H "Content-Type: application/json" \\',
    `  -d '{"model":"${id}","messages":[{"role":"user","content":"Hello!"}]}'`,
  ].join("\n");
}

/** Match a query against the catalog: exact id wins, else id/name substring. */
export function matchModels(models: Model[], query: string, limit = 5): Model[] {
  const q = query.trim().toLowerCase();
  const exact = models.find((m) => m.id.toLowerCase() === q);
  if (exact) return [exact];
  return models
    .filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
    .slice(0, limit);
}

/** Build the `lookup_model` answer from matched catalog entries. */
export function formatModelAnswer(query: string, matches: Model[]): ModelAnswer {
  if (matches.length === 0) {
    return {
      query,
      matched: false,
      models: [],
      note: `No routable model matches "${query}". Try a provider/model id like "anthropic/claude-sonnet-4" or a shorter name fragment.`,
    };
  }
  return {
    query,
    matched: true,
    models: matches.map((m) => ({
      id: m.id,
      name: m.name,
      routable: true,
      pricingPer1M: { input: m.pricing.input, output: m.pricing.output },
      contextTokens: m.maxInputTokens,
      configSnippet: buildConfigSnippet(m.id),
    })),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run lib/mcp/format.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add lib/mcp/format.ts lib/mcp/format.test.ts
git commit -m "feat(docs-mcp): pure transforms for docs MCP tools"
```

---

## Task 3: Thin I/O wrappers (`lib/mcp/tools.ts`)

**Files:** Create `lib/mcp/tools.ts`

> Not vitest-tested (value-imports server modules). Covered by Task 6 build + Task 7 handshake.

- [ ] **Step 1: Implement `lib/mcp/tools.ts`**

Create `lib/mcp/tools.ts`:
```ts
import "server-only";
import { searchServer } from "@/lib/search-server";
import { getLLMText, source } from "@/lib/source";
import { fetchModels } from "@/lib/models-server";
import {
  formatSearchResults,
  pathToSlug,
  truncateMarkdown,
  matchModels,
  formatModelAnswer,
  type DocHit,
  type ModelAnswer,
  type RawSearchResult,
} from "@/lib/mcp/format";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;
const DOC_CHAR_CAP = 16_000; // ~4k tokens
const SITE_ORIGIN = "https://bitrouter.ai";

export async function searchDocs(
  query: string,
  opts: { locale?: string; limit?: number } = {},
): Promise<DocHit[]> {
  const limit = Math.min(Math.max(1, opts.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const results = await searchServer.search(query, { locale: opts.locale ?? "en" });
  if (!Array.isArray(results)) return [];
  return formatSearchResults(results as unknown as RawSearchResult[], limit);
}

export type GetDocResult =
  | { ok: true; markdown: string; url: string }
  | { ok: false; error: string };

export async function getDoc(path: string, locale = "en"): Promise<GetDocResult> {
  const slug = pathToSlug(path);
  const page = source.getPage(slug, locale);
  if (!page) {
    return {
      ok: false,
      error: `No doc found for "${path}". Use search_docs to find a valid path.`,
    };
  }
  const url = page.url.startsWith("http") ? page.url : `${SITE_ORIGIN}${page.url}`;
  const text = await getLLMText(page);
  return { ok: true, markdown: truncateMarkdown(text, url, DOC_CHAR_CAP), url };
}

export async function lookupModel(query: string): Promise<ModelAnswer> {
  const models = await fetchModels();
  return formatModelAnswer(query, matchModels(models, query));
}
```

- [ ] **Step 2: Typecheck this file compiles against the real APIs**

Run: `pnpm exec tsc --noEmit`
Expected: no errors referencing `lib/mcp/tools.ts`. If `searchServer.search` / `source.getPage` signatures differ, fix the call here (these are the real integration points).

- [ ] **Step 3: Commit**

```bash
git add lib/mcp/tools.ts
git commit -m "feat(docs-mcp): I/O wrappers over search, source, and model catalog"
```

---

## Task 4: Extract `LLMS_TXT` for reuse by the resource

**Files:**
- Create: `lib/llms-txt.ts`, `lib/llms-txt.test.ts`
- Modify: `app/llms.txt/route.ts`

- [ ] **Step 1: Read the current route to copy the const verbatim**

Run: `sed -n '1,75p' app/llms.txt/route.ts`
Note the `import { LLMS_PRODUCT_SUMMARY } from "@/lib/llms-shared";`, the `const BASE_URL = "https://bitrouter.ai";`, and the full `` const LLMS_TXT = `...` `` template literal.

- [ ] **Step 2: Create `lib/llms-txt.ts`**

Move the imports + `BASE_URL` + the entire `LLMS_TXT` template literal into a new file, exported. Structure:
```ts
import { LLMS_PRODUCT_SUMMARY } from "@/lib/llms-shared";

const BASE_URL = "https://bitrouter.ai";

// NOTE: paste the existing template literal body from app/llms.txt/route.ts
// here, unchanged. Exported so both the /llms.txt route and the MCP
// `llms-index` resource render identical content.
export const LLMS_TXT = `# BitRouter

${LLMS_PRODUCT_SUMMARY}

/* …the rest of the existing template body, verbatim… */
`;
```

- [ ] **Step 3: Rewrite `app/llms.txt/route.ts` to consume it**

Replace the whole file with:
```ts
import { LLMS_TXT } from "@/lib/llms-txt";

export function GET() {
  return new Response(LLMS_TXT.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
```

- [ ] **Step 4: Add a trivial guard test**

Create `lib/llms-txt.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { LLMS_TXT } from "./llms-txt";

describe("LLMS_TXT", () => {
  it("is the BitRouter index", () => {
    expect(LLMS_TXT.trim().startsWith("# BitRouter")).toBe(true);
    expect(LLMS_TXT.length).toBeGreaterThan(200);
  });
});
```

> `lib/llms-txt.ts` value-imports `@/lib/llms-shared`. Confirm `llms-shared.ts` has no `server-only`/`@/` server imports (it is a plain product-summary string module). If vitest fails to resolve `@/lib/llms-shared`, change the import in `lib/llms-txt.ts` to the relative form `./llms-shared`.

- [ ] **Step 5: Run the test + confirm the route still renders**

Run: `pnpm vitest run lib/llms-txt.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/llms-txt.ts lib/llms-txt.test.ts app/llms.txt/route.ts
git commit -m "refactor(docs): extract LLMS_TXT into lib for MCP reuse"
```

---

## Task 5: MCP route handler (`app/api/[transport]/route.ts`)

**Files:** Create `app/api/[transport]/route.ts`

- [ ] **Step 1: Implement the handler**

Create `app/api/[transport]/route.ts`:
```ts
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchDocs, getDoc, lookupModel } from "@/lib/mcp/tools";
import { LLMS_TXT } from "@/lib/llms-txt";

export const runtime = "nodejs";
export const maxDuration = 60;

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "search_docs",
      {
        title: "Search BitRouter docs",
        description:
          "Full-text search over BitRouter's documentation. Returns titled hits, each with a canonical URL and a `path` to pass to get_doc. Use this first to find relevant guides.",
        inputSchema: {
          query: z.string().describe("Search query, e.g. 'provider fallback'"),
          limit: z.number().int().min(1).max(20).optional().describe("Max hits (default 8)"),
          locale: z.enum(["en", "zh"]).optional().describe("Docs locale; defaults to en"),
        },
      },
      async ({ query, limit, locale }) => {
        const hits = await searchDocs(query, { limit, locale });
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      },
    );

    server.registerTool(
      "get_doc",
      {
        title: "Read a BitRouter doc page",
        description:
          "Fetch one documentation page as Markdown. Pass the `path` (or full URL) returned by search_docs, e.g. 'guides/routing/model-fallback'.",
        inputSchema: {
          path: z.string().describe("Doc slug path or full URL"),
          locale: z.enum(["en", "zh"]).optional().describe("Docs locale; defaults to en"),
        },
      },
      async ({ path, locale }) => {
        const res = await getDoc(path, locale ?? "en");
        if (!res.ok) return { content: [{ type: "text", text: res.error }], isError: true };
        return { content: [{ type: "text", text: res.markdown }] };
      },
    );

    server.registerTool(
      "lookup_model",
      {
        title: "Look up a routable model",
        description:
          "Check whether a model is routable through BitRouter and get its pricing, context window, and a copy-paste config snippet. Accepts a provider/model id (e.g. 'anthropic/claude-sonnet-4') or a name fragment.",
        inputSchema: {
          query: z.string().describe("provider/model id or name fragment"),
        },
      },
      async ({ query }) => {
        const answer = await lookupModel(query);
        return { content: [{ type: "text", text: JSON.stringify(answer, null, 2) }] };
      },
    );

    server.registerResource(
      "llms-index",
      "bitrouter-docs://llms-index",
      {
        title: "BitRouter llms.txt index",
        description: "Curated index of BitRouter documentation (llms.txt).",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: LLMS_TXT.trim() }],
      }),
    );
  },
  {
    // Server metadata. If the installed types put name/version elsewhere
    // (see Task 1, Step 2), move them accordingly — the build will tell you.
    instructions:
      "BitRouter documentation server (public, no auth). Use search_docs to find guides, get_doc to read a page, and lookup_model to check model availability and config.",
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: false,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
```

- [ ] **Step 2: Commit**

```bash
git add "app/api/[transport]/route.ts"
git commit -m "feat(docs-mcp): MCP route with search_docs, get_doc, lookup_model + llms-index"
```

---

## Task 6: Public `/mcp` URL rewrite + full build gate

**Files:** Modify `next.config.ts`

- [ ] **Step 1: Add the rewrite**

In `next.config.ts`, inside the existing `async rewrites()` return array, add this entry **before** the `/ingest/*` rules (order is fine either way, but keep it first for readability):
```ts
      {
        source: "/mcp",
        destination: "/api/mcp",
      },
```
So the array begins:
```ts
  async rewrites() {
    return [
      { source: "/mcp", destination: "/api/mcp" },
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      // …existing entries unchanged…
    ];
  },
```

- [ ] **Step 2: Typecheck + build**

Run: `pnpm build`
Expected: SUCCESS. This is the gate for Tasks 3 and 5 — it typechecks the route handler against the real `mcp-handler` / SDK signatures. If `registerTool`/`registerResource`/`createMcpHandler` argument shapes differ from this plan (see Task 1, Step 2), the error points at the exact line; adjust the option object / `inputSchema` form and rebuild.

- [ ] **Step 3: Run the whole unit suite**

Run: `pnpm vitest run`
Expected: PASS (format + llms-txt + all pre-existing `lib/*.test.ts`).

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(docs-mcp): rewrite /mcp -> /api/mcp for the public endpoint"
```

---

## Task 7: Manual MCP handshake verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev` (leave running in a second shell). Wait for "Ready".

- [ ] **Step 2: `initialize` over Streamable HTTP**

Run:
```bash
curl -i -s http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```
Expected: HTTP 200, a JSON-RPC result advertising `tools` (and `resources`) capabilities, and an `mcp-session-id` response header. Note that header value for the next call.

- [ ] **Step 3: `tools/list`**

Run (substitute the captured `<SESSION_ID>`):
```bash
curl -s http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <SESSION_ID>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```
Expected: a result listing exactly `search_docs`, `get_doc`, `lookup_model` with their input schemas.

- [ ] **Step 4: Exercise one tool end-to-end**

Run (same session header):
```bash
curl -s http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <SESSION_ID>" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_docs","arguments":{"query":"provider fallback"}}}'
```
Expected: a `content[0].text` JSON array of hits, each with `title`, `url`, `path`. Then optionally call `get_doc` with one returned `path` and `lookup_model` with `"anthropic/claude-sonnet-4"`, and `resources/list` to see `bitrouter-docs://llms-index`.

> If `initialize` returns 406/400, re-check the `Accept` header includes both `application/json` and `text/event-stream` (Streamable HTTP requires it). Stop `pnpm dev` when done.

---

## Task 8: "Add BitRouter docs to your agent" doc page

**Files:** Create `content/docs/integrations/tools/mcp-docs-server.mdx`

> Confirm the directory: `ls content/docs/integrations/tools/` (the integrations tree was reorganized into Models/Tools/Harnesses). If `tools/` differs, place the page in the closest existing integrations subfolder and match a sibling's frontmatter exactly.

- [ ] **Step 1: Create the page**

```mdx
---
title: Docs MCP Server
description: Give your AI agent live access to BitRouter's documentation and model catalog over MCP.
---

BitRouter publishes a public [Model Context Protocol](https://modelcontextprotocol.io) server so your
agent can search the docs, read pages, and check model availability without leaving the editor.

- **Endpoint:** `https://bitrouter.ai/mcp` (Streamable HTTP)
- **Auth:** none — it's public.

## Tools

- `search_docs(query, limit?, locale?)` — full-text search; returns titled hits with a `path`.
- `get_doc(path, locale?)` — fetch one page as Markdown (pass a `path` from `search_docs`).
- `lookup_model(query)` — is a `provider/model` routable? pricing, context window, and a config snippet.

It also exposes the `bitrouter-docs://llms-index` resource for clients that read MCP resources.

## Claude Code

```bash
claude mcp add --transport http bitrouter-docs https://bitrouter.ai/mcp
```

## Cursor / other clients

Add a remote MCP server entry:

```json
{
  "mcpServers": {
    "bitrouter-docs": { "url": "https://bitrouter.ai/mcp" }
  }
}
```
```

- [ ] **Step 2: Verify it builds into the docs**

Run: `pnpm build`
Expected: SUCCESS; the new page is picked up by fumadocs (no MDX errors).

- [ ] **Step 3: Commit**

```bash
git add content/docs/integrations/tools/mcp-docs-server.mdx
git commit -m "docs(integrations): document the public docs MCP server"
```

---

## Task 9: Final review and PR

- [ ] **Step 1: Full gate**

Run: `pnpm vitest run && pnpm build`
Expected: both PASS.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin feat/docs-mcp-server
gh pr create --title "feat(docs-mcp): public documentation MCP server" \
  --body "Adds a public, no-auth MCP server at bitrouter.ai/mcp exposing search_docs, get_doc, lookup_model + an llms-index resource, reusing the existing Orama search, fumadocs source loader, and model catalog. Spec: docs/superpowers/specs/2026-06-25-docs-mcp-server-design.md."
```

---

## Self-review notes (verification of this plan against the spec)

- **Tools `search_docs` / `get_doc` / `lookup_model`** → Tasks 2/3/5. **Resource `llms-index`** → Tasks 4/5. **Public `/mcp` URL** → Task 6. **mcp-handler/Streamable HTTP, no auth** → Task 5. **Reuse Orama/source/catalog** → Task 3. **vitest on pure logic** → Task 2. **Build + manual handshake** (the integration test that vitest can't host) → Tasks 6/7. **Docs page (rollout item)** → Task 8.
- **Token bounding:** `search_docs` caps at `MAX_LIMIT`; `get_doc` caps at `DOC_CHAR_CAP` with a deep-link footer. **Citations:** every hit and doc carries the canonical `bitrouter.ai/docs/...` URL.
- **Out of scope (unchanged):** semantic search, resource templates/subscriptions, skills exposure, docs-MCP auth, the Rust Control MCP.
- **Type consistency:** `RawSearchResult`, `DocHit`, `ModelAnswer`, `GetDocResult` are defined once and imported where used; `searchDocs`/`getDoc`/`lookupModel` names match between `tools.ts` and the route.
```
