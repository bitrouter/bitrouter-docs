# Design: Docs Site Improvements — Ask AI Retrieval + Changelog

**Date:** 2026-06-22
**Status:** Approved (design); pending implementation plan
**Surfaces:** `bitrouter-docs` (Next.js 16 + fumadocs 16.8.8, App Router, `next-intl` i18n, `.br-mono` theme)

This spec covers two independently-implementable initiatives, bundled because they
were scoped together as one "improve the docs site" effort.

1. **Ask AI** — replace the naive whole-corpus prompt with retrieval-as-a-tool.
2. **Changelog** — a new `/changelog` marketing surface backed by an MDX collection.

---

## Initiative 1 — Ask AI: retrieval-as-a-tool

### Problem

`app/api/chat/route.ts` builds context with `getDocsContext()`, which joins the
processed markdown of **every** docs page into a single system prompt on **every**
request:

```ts
async function getDocsContext(): Promise<string> {
  const pages = source.getPages();
  const texts = await Promise.all(pages.map(async (page) => { ... }));
  return texts.join("\n\n---\n\n");
}
```

Consequences: no ranking or relevance, no citations, and prompt size + latency +
token cost grow linearly with the docs corpus. This is the only real defect in an
otherwise solid setup (already on AI SDK v6, already dogfooding the team's own
`bitrouter-balanced` model via `@ai-sdk/openai-compatible`).

### Decision

Keep the team's own model, own infra, and the existing AI SDK v6 streaming route.
Fix retrieval only. **No vendor, no new platform** — surveyed (Inkeep hosted, Kapa,
Mintlify AI, Onyx, RAGFlow, Orama Answer Engine) and all either break dogfooding
(run their own model / proxy through their cloud) or add a standalone service. The
homegrown upgrade is the lowest-effort path that preserves both hard constraints
(dogfood the model, self-hostable).

### Changes

In `app/api/chat/route.ts`:

- **Remove** `getDocsContext()` and the corpus-in-system-prompt.
- **Add a `searchDocs` tool** to `streamText`. The tool takes a query string and
  returns the top-K matching docs sections as `{ title, url, content }`. It queries
  the **existing Orama index** — the same index `createFromSource(source)` builds in
  `app/api/search/route.ts` — so there is **one** index, not a second FlexSearch
  index (which is what fumadocs' stock `ai/openrouter` recipe would add).
  - *Open implementation detail for the plan:* the exact retrieval call. Preferred
    order: (a) a server-side `search()` method on the object returned by
    `createFromSource` if exposed in fumadocs 16.8.8; (b) otherwise a thin internal
    query against the same Orama index; (c) last resort, an internal fetch to the
    local `/api/search` handler. The plan must pin which, after checking the
    installed fumadocs version's API.
- **New system prompt:** instruct the model to call `searchDocs` to find relevant
  documentation and to cite the sources it used. Keep the existing tone ("concise
  and accurate; if you don't know, say so").
- **Retrieve-then-answer loop:** `stopWhen: stepCountIs(3)` (tunable 3–5) so the
  model can search, optionally re-search, then answer.
- **Locale:** pass the request locale into the tool query so `zh` queries use the
  Mandarin tokenizer already configured in `app/api/search/route.ts`.

In `components/ai/search.tsx`:

- **Citations:** render the `searchDocs` tool's returned `url`/`title` as clickable
  source chips beneath the answer. The component already renders tool-invocation
  parts, so this extends existing handling rather than adding a new mechanism.

Analytics:

- Keep the `ai_chat_completion` PostHog event. Add the number of `searchDocs` calls
  (and optionally the retrieved page URLs) to its properties for docs-gap insight.

### Retrieval quality ladder (scope boundary)

- **v1 ships BM25-only** (Orama's default full-text). Strong for API/symbol-heavy
  technical docs, and it requires no embeddings endpoint.
- **Non-goals for v1:** reranker; hybrid (BM25 + vector) search; embeddings.
  Revisit only on observed paraphrase/synonym misses. Hybrid additionally requires
  confirming the BitRouter API serves a `/v1/embeddings` endpoint (many routers
  proxy only `/v1/chat/completions`) — that check is a prerequisite, not part of v1.

### Units & boundaries

- `searchDocs` tool — input: `{ query, locale }`; output: `Array<{title,url,content}>`;
  depends only on the Orama index. Testable in isolation (query in, ranked chunks out).
- Chat route — orchestrates `streamText` + tool; depends on the model provider and
  the tool. Unchanged streaming contract (`toUIMessageStreamResponse()`).
- Source chips (UI) — input: tool result parts; output: rendered citations.

---

## Initiative 2 — Changelog at `/changelog`

A reverse-chronological changelog on the **marketing surface** (sibling to `/blog`),
authored as **in-repo MDX, one file per entry**, English-only for v1.

### Rationale (from competitor research)

- Reverse-chron feed grouped by date/version is the only layout dev-tools actually
  use (Vercel, Supabase, Linear, Stripe, Cursor). No literal "timeline."
- Categorize **by product area + a `breaking` flag**, *not* Added/Fixed/Changed.
  The breaking-change badge is the one Keep-a-Changelog-adjacent idea worth importing
  for an LLM router (route/model/pricing changes matter to integrators — mirrors
  Stripe's Breaking column and Supabase's `breaking-change` tag).
- Per-entry permalink pages are near-universal.
- A real **RSS+Atom feed** is a cheap differentiator most competitors skip, and it
  doubles as the plumbing for auto-posting to Discord/X later.

### Content collection (mirror the existing `blog` wiring)

`source.config.ts` — add alongside `blog`:

```ts
export const changelog = defineDocs({
  dir: "content/changelog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(),                 // ISO YYYY-MM-DD (required)
      version: z.string().optional(),   // e.g. "v0.4.0"
      tags: z.array(z.string()).optional(),
      breaking: z.boolean().optional(),
    }),
  },
  meta: { schema: metaSchema },
});
```

`lib/source.ts` — add alongside `blogSource`:

```ts
import { ..., changelog } from "@/.source/server";

export const changelogSource = loader({
  baseUrl: "/changelog",
  source: changelog.toFumadocsSource(),
  i18n,
});

export type ChangelogPage = InferPageType<typeof changelogSource>;
```

(i18n plumbing identical to `blogSource`; entries are English-only for v1, so no
`.zh.mdx` files, but the page shell stays locale-aware so it doesn't break `zh` routes.)

### Pages (clone the existing `app/blog` pattern, `.br-mono` aesthetic)

The blog lives at top-level `app/blog/` (not under `[locale]`) with route groups
`(index)` and `(posts)` plus a shared `app/blog/layout.tsx`. Mirror that exact shape:

- **Index / feed:** `app/changelog/(index)/page.tsx` (+ `(index)/layout.tsx`)
  - Reverse-chronological, **sorted by frontmatter `date`** (`getPages()` is not
    date-sorted — must sort explicitly).
  - **Grouped by month or version** with section headings.
  - Each entry shows `tags` and a `BREAKING` badge when `breaking: true`.
  - **Client-side tag-chip filter** — plain array filtering over the serialized entry
    list (there is no fumadocs filter API). Chips suit the TUI look.
- **Per-entry page:** `app/changelog/(posts)/[slug]/page.tsx` (+ `(posts)/layout.tsx`)
  - Permalink page; clone the existing blog post page (`DocsPage`/`DocsBody`/
    `getMDXComponents`).
- **Shared layout:** `app/changelog/layout.tsx`, mirroring `app/blog/layout.tsx`.

### Distribution (v1)

- **RSS + Atom feeds** via the `feed` package (new dependency, `pnpm add feed`):
  - `app/changelog/rss.xml/route.ts` → `feed.rss2()`
  - `app/changelog/atom.xml/route.ts` → `feed.atom1()`
  - `export const revalidate = false` (static at build); sort entries by `date` desc;
    use absolute URLs (`https://bitrouter.ai/changelog/...`).
  - Add feed autodiscovery `<link rel="alternate" type="application/rss+xml">` in the
    root layout metadata so readers/Slack/Discord find it.
- **"New" badge in nav** (`components/site-header-wired.tsx`):
  - Server-computes the newest entry's `date`; client stores `lastSeenChangelog` in
    `localStorage`. Show a dot on the Changelog nav link when newest > stored; on
    visiting `/changelog`, write `Date.now()` back. No backend.

### Wiring & cleanup

- Add a **"Changelog"** link to the nav, `components/site-footer.tsx`, and the
  resources menu (`components/landing/resources-menu.tsx`).
- **Remove** the redundant empty docs stub `content/docs/reference/changelog/`
  (`meta.json` with empty `pages`), since the changelog now lives on the marketing
  surface.
- **Seed** `content/changelog/` with 1–2 example entries (one with `breaking: true`)
  so the feed, grouping, badge, and filter are all exercised.

### Non-goals for v1 (YAGNI)

- Email subscribe (e.g. Resend Broadcasts) — defer to v2.
- GitHub release / PR / contributor auto-linking via the existing Octokit setup —
  defer to v2. The `version` frontmatter field leaves room to add release links later.
- `@changesets` automation — adopt only when contributor volume/cadence justifies it.
- `[Unreleased]` / preview ("Upcoming") section.
- Rich-media-heavy entries (images/video are supported by MDX but not a v1 focus).

### Units & boundaries

- `changelog` collection + `changelogSource` — content source; depends on
  fumadocs-mdx + i18n. Same contract as `blogSource`.
- Feed routes — input: `changelogSource.getPages()`; output: RSS/Atom XML. Pure,
  testable.
- "New" badge — input: newest entry date + localStorage; output: a dot. No backend.

---

## Cross-cutting notes

- **Error handling — Ask AI:** if `searchDocs` returns no results, the model should
  say it couldn't find relevant docs rather than hallucinate (covered by the system
  prompt). Tool errors must not break the stream; surface a graceful message.
- **Error handling — Changelog:** an entry missing a valid `date` is a build-time
  schema error (Zod `z.string()` required) — fail fast, don't render unsorted.
- **Testing:**
  - `searchDocs` — unit test: representative queries return expected top pages;
    `zh` query uses the Mandarin tokenizer path.
  - Feeds — assert valid RSS/Atom XML and correct reverse-chron order from seeded
    entries.
  - Changelog index — assert date sorting, month/version grouping, and that
    `breaking: true` renders the badge.
- **Independence:** the two initiatives share no code. They can be implemented and
  shipped in either order.

## Files touched (summary)

**Ask AI:** `app/api/chat/route.ts`, `components/ai/search.tsx` (citations),
possibly a small `lib/` helper for the Orama query.

**Changelog:** `source.config.ts`, `lib/source.ts`, `app/changelog/layout.tsx`,
`app/changelog/(index)/page.tsx`,
`app/changelog/(posts)/[slug]/page.tsx`,
`app/changelog/rss.xml/route.ts`, `app/changelog/atom.xml/route.ts`,
root layout metadata (feed autodiscovery), `components/site-header-wired.tsx`
("new" badge), `components/site-footer.tsx`,
`components/landing/resources-menu.tsx`, `content/changelog/*.mdx` (seed),
remove `content/docs/reference/changelog/`, `package.json` (`feed` dep).
