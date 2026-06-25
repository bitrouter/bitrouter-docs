# BitRouter Docs MCP Server — Design

**Date:** 2026-06-25
**Repo:** `bitrouter-docs`
**Status:** Approved (brainstorm) → ready for implementation plan

## Summary

Ship a **public, account-free MCP server** co-located with the BitRouter docs
site, exposing BitRouter's documentation and model catalog to AI agents as MCP
**tools** (plus one bonus resource). It is a Next.js route handler at
`bitrouter.ai/mcp`, deployed on the same Railway service as the docs, reading
the same fumadocs MDX source-of-truth — so it is always fresh and never drifts.

This is the first of two independent MCP servers in the BitRouter system:

| Server | This spec? | Repo / lang | Auth | Hosting |
|---|---|---|---|---|
| **Docs MCP** | ✅ yes | `bitrouter-docs` (TS, fumadocs route) | **public, none** | Railway, with the docs → `bitrouter.ai/mcp` |
| **Control MCP** | ❌ follow-on spec | `bitrouter` `mcp/` crate (Rust) | bearer (scoped, spend-capped key) | local + `api.bitrouter.ai` |

The two share nothing operationally. The Control MCP (`complete` / `list_models`
/ `status`) already exists in the Rust repo and is out of scope here; its own
spec will carry the auth upgrade described under *Future work*.

## Motivation & industry context

- **Documentation-as-MCP is now table stakes.** Cloudflare, Microsoft Learn,
  AWS, Stripe, Vercel, Sentry, Supabase, GitBook, Mintlify, and Context7 all
  ship docs over MCP. Mintlify/GitBook auto-generate one per customer site, so a
  hand-built server must be clearly better (fresh, lean, frictionless).
- **The field ships tools, not resources.** Of the servers surveyed, only one
  (Next.js DevTools) exposes docs as an MCP *resource*, and even it pairs that
  with tools. Reasons: (1) the MCP spec says use a *model-controlled* primitive
  (Tools) when you want the model to pull data autonomously — Resources are
  *application-controlled*; (2) client resource support is weak (Claude Desktop
  lists resources but won't `resources/read` to answer a question; Cursor is
  partial). **Decision: tools-first; one resource as a thin bonus.**
- **The closest competitor, OpenRouter,** ships a *single unified* server at
  `https://mcp.openrouter.ai/mcp` mixing docs + catalog + inference behind one
  minted key (7-day expiry, $10 spend cap). That key is required *even to read
  docs*. **Our split keeps docs public and account-free — a direct
  differentiator** — while we adopt OpenRouter's scoped-key idea for the
  Control MCP later. OpenRouter's three catalog tools also validate our
  `lookup_model` tool.

## Goals

1. Public, zero-auth, always-fresh docs access for agents at `bitrouter.ai/mcp`.
2. Reuse what already exists in `bitrouter-docs` (Orama search, fumadocs source
   loader, model snapshot, `llms.txt`) — thin wrappers, not new infrastructure.
3. Lean footprint: 3 tools + 1 resource, every response token-bounded, to avoid
   the dominant docs-MCP failure mode (context bloat).
4. Testable tool logic via the repo's existing vitest.

## Non-goals (YAGNI)

- Semantic/vector search beyond what fumadocs/Orama already provides.
- Resource templates, subscriptions, or a full per-page resource tree.
- Exposing BitRouter Skills over MCP (`view-skill`-style).
- Any authentication on the Docs MCP.
- The Control MCP implementation (separate spec).

## Architecture

```
agent (Claude Code / Cursor / …)
   │  Streamable HTTP, no auth
   ▼
bitrouter.ai/mcp            ← app/mcp/route.ts  (mcp-handler + @modelcontextprotocol/sdk)
   │
   ├─ tool  search_docs  ──▶ lib/mcp/search.ts   ──▶ searchServer.search()   (Orama, lib/search-server.ts)
   ├─ tool  get_doc      ──▶ lib/mcp/get-doc.ts  ──▶ source.getPage() + getLLMText()  (lib/source.ts)
   ├─ tool  lookup_model ──▶ lib/mcp/lookup-model.ts ─▶ fetchModels()/fetchModelById()  (lib/models-server.ts)
   └─ resource bitrouter-docs://llms-index ──▶ app/llms.txt content
```

**Design principle:** the route handler is a thin wiring layer. All tool logic
lives in plain `lib/mcp/*.ts` functions with typed inputs/outputs, so vitest can
exercise them directly without standing up the MCP transport.

### Transport & host

- **Route:** `app/mcp/route.ts`, a single locale-agnostic endpoint →
  `https://bitrouter.ai/mcp`. (`/sse` is industry-legacy; we do not ship it.)
- **Library:** `mcp-handler` (Vercel's Next.js MCP adapter) over
  `@modelcontextprotocol/sdk`. Handles Streamable HTTP framing and sessions.
- **Deployment:** same Railway Next.js service as the docs site. No new service,
  no new domain, no credentials, fully cacheable.
- **Server metadata:** name `bitrouter-docs`; instructions tell the model to
  `search_docs` → `get_doc` for guides and `lookup_model` for catalog/config.

### Tools

#### 1. `search_docs(query: string, limit?: number)`

Wraps the existing shared Orama server (`searchServer.search(query, { locale })`
→ `SortedResult[]`). Returns a token-bounded list of hits:

```jsonc
[
  { "title": "Provider Selection", "slug": "guides/routing/provider-selection",
    "url": "https://bitrouter.ai/docs/guides/routing/provider-selection",
    "excerpt": "How models resolve to upstream providers…" }
]
```

- `limit` defaults to a small N (e.g. 8), hard-capped.
- Empty result set → empty array, **not** an error.
- `locale` defaults to `en`; optional `locale` param honored since the source is
  locale-aware (mirrors `app/api/search`).

#### 2. `get_doc(path: string)`

Resolves one doc page via the fumadocs loader and renders it to LLM text:
`source.getPage(slugFromPath)` → `getLLMText(page)` (the same function behind
`/api/docs/llms-mdx`). Returns bounded markdown + the canonical URL.

- Accepts the `slug` returned by `search_docs` (and tolerates a full
  `bitrouter.ai/docs/...` URL by stripping to slug).
- Unknown path → clean not-found error (clear message, no stack).
- Output token-bounded; if truncated, append a `… full page: <url>` footer so
  the agent can deep-link the user.

#### 3. `lookup_model(query: string)`

Public model **catalog** lookup (distinct from the Control MCP's live, authed
`list_models`). Wraps `fetchModels()` / `fetchModelById()` (`lib/models-server`,
backed by `.models-snapshot.json` / `api/bitrouter/models`).

- Accepts a `provider/model` id (exact, via `fetchModelById`) or a fuzzy name
  (filter over `fetchModels`).
- Returns: routable?, provider(s), pricing, and a **copy-paste config snippet**
  using the `provider/model` id (e.g. the base-URL + model-id an agent needs to
  route through BitRouter).
- No match → a short "not routable / did you mean…" answer, not an error.

### Resource (bonus)

A single resource `bitrouter-docs://llms-index` returning the contents of
`app/llms.txt` verbatim (`text/markdown`). Declared via
`enable_resources()`-equivalent capability. **No** templates, **no**
subscriptions, **no** per-page tree — it exists only for the minority of clients
that read resources; the tools are the real path.

## Data flow

1. Agent calls `search_docs("how do I set provider fallback")`.
2. Orama returns ranked hits with `{title, slug, url, excerpt}`.
3. Agent calls `get_doc("guides/routing/model-fallback")`.
4. `source.getPage` + `getLLMText` return the page markdown + URL.
5. For "is `anthropic/claude-x` supported and how do I wire it", agent calls
   `lookup_model("anthropic/claude-x")` → catalog answer + config snippet.

## Error handling

| Case | Behavior |
|---|---|
| Empty search results | Return `[]` (success), not an error |
| Unknown `get_doc` path | Not-found tool error with a clear message |
| `lookup_model` no match | Short "not routable / suggestions" success payload |
| Oversized `get_doc` page | Truncate to the token cap + `… full page: <url>` footer |
| Protocol/transport errors | Owned by `mcp-handler` |

No tool ever panics or leaks internals; all upstream/data errors are mapped to
concise tool-level messages.

## Testing

Existing **vitest** (`vitest.config.ts`) covers it:

- **Unit (per tool):** `search_docs` returns the documented shape and honors
  `limit`; `get_doc` resolves a known slug and errors cleanly on an unknown one,
  and respects the token cap; `lookup_model` matches by exact id and by fuzzy
  name and emits a valid config snippet.
- **Integration (1):** an MCP initialize/`tools/list` handshake against the route
  handler asserting the 3 tools + 1 resource are advertised with correct schemas.

Because logic is in `lib/mcp/*.ts`, unit tests import functions directly; only
the one handshake test exercises the transport.

## Rollout

1. Add deps: `mcp-handler`, `@modelcontextprotocol/sdk`.
2. Implement `lib/mcp/{search,get-doc,lookup-model}.ts` + tests.
3. Wire `app/mcp/route.ts` (tools + `llms-index` resource + server metadata).
4. Handshake/integration test.
5. Docs page: an "Add BitRouter to your agent" snippet with the `bitrouter.ai/mcp`
   URL for Claude Code / Cursor (and an `@`-mention note for the resource).
6. Ship behind the existing Railway docs deploy.

## Differentiators (baked in)

- **Frictionless / no account** — unlike OpenRouter, reading docs needs no key.
- **Always fresh** — reads live MDX; no stale snapshot, the #2 docs-MCP failure.
- **Citations** — every result links back to the canonical doc URL.
- **`lookup_model` config snippets** — the high-value, example-heavy thing an
  agent setting up a gateway actually needs.
- **Lean** — 3 tools, bounded responses; avoids the #1 failure (token bloat).

## Future work (Control MCP — separate spec)

The Rust `mcp/` origin server (`complete` / `list_models` / `status`) becomes a
focused control plane and gets cloud-hosted at `api.bitrouter.ai`. Headline
decision carried from this brainstorm: **adopt OpenRouter's auth UX** — a
minted, short-expiry, spend-capped "BitRouter MCP" key — instead of pasting a
raw `brk_` key, which also sidesteps the deferred native-OAuth/DCR work.
