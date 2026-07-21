# Blog → X Article Auto-Draft — Implementation Plan

**Goal:** When a new blog post is merged to `main`, automatically create an **unpublished X Article _draft_** on the post author's personal X account (Kelsen or Archer). The author reviews the draft in X and publishes it by hand. No auto-publish. Text-only for v1 (no media).

**Approach: fully deterministic, no LLM.** The post is converted MDX → `content_state` by pure, unit-tested code. There is no adaptation or rewriting — it's a faithful mechanical reformat: keep everything X Articles can render (headings, bold/italic, lists, quotes, links), and deterministically flatten/strip what it can't (custom components, code blocks, tables, images). Offsets come from a proven library (`markdown-draft-js`), not hand-rolled arithmetic.

**Why deterministic beat the AI options (evidence gathered 2026-07-20):**
- The `POST /2/articles/draft` body is **`content_state` only** — confirmed against X's OpenAPI schema. No `markdown`/`html`/`text` field. So *something* must emit DraftJS `content_state`.
- A corpus scan of 30 founder-written MDX files (integration guides + changelog + compare; `content/blog/` has no posts yet) shows the content is **link-dense**: 119 inline links, 68 bold, 68 italic, 73 headings, 137 inline-code, 12 fenced code blocks, 0 tables, 0 images, and only **7 distinct custom components** (`Callout` ×15, `Tab`, `Card`, `CompareTable`, `Tabs`, `Cards`, `CompareCTA`).
- 119 links each need an **exact** UTF-16 offset + entity key. That is the one thing LLMs are worst at — an LLM emitting `content_state` directly would misplace spans on most articles (silent) or emit invalid ranges (→ 400, no draft). So the API-facing encoding **must** be deterministic.
- The "must flatten" load is tiny and *known* (7 components, 12 fences, no tables/images), so it's cheap to handle in code. And `markdown-draft-js` already does Markdown→DraftJS raw ContentState, so we don't hand-write offsets — just a thin shim to X's schema variant. Net: drop pi entirely.

**Why a "draft" is even possible:** X's Articles API has a native draft state — `POST /2/articles/draft` returns an unpublished draft; a separate `POST /2/articles/{id}/publish` (which we deliberately do **not** call) makes it live. Docs: <https://docs.x.com/x-api/articles/create-draft-article>.

**Architecture:** A GitHub Action fires on push to `main` under `content/blog/**`, diffs the merge for _newly added_ posts, and runs a fully deterministic pipeline per post:

```
new content/blog/<slug>.mdx  (merged to main)
      │
  ① mdx → clean markdown   lib/x-articles/mdx-to-markdown.mjs  (pure, tested)
      │     parse MDX (remark-parse + remark-mdx + remark-gfm) → transform mdast:
      │       · strip esm import/export nodes
      │       · Callout → blockquote; other JSX components → unwrap children; prop-only comps → drop
      │       · fenced code + inline code → plain text (X has no code type)
      │       · drop images
      │     → serialize to constrained Markdown (+ list of what was flattened/dropped)
      │
  ② markdown → content_state   lib/x-articles/markdown-to-content-state.mjs  (pure, tested)
      │     markdown-draft-js (markdownToDraft) → DraftJS raw → X-variant shim
      │     (camelCase→snake_case, entityMap→entities[], clamp header-4..6→3, style/type casing)
      │
  ③ draft   seed ~/.xurl with author's OAuth 1.0a creds →
      │     xurl -X POST /2/articles/draft -d @body.json  →  { data: { id } }
      │
  ④ record  write .x-drafts/<slug>.json (idempotency) + commit back to main
      │
  ⑤ notify  gh commit comment: "X draft ready → <review link>" (lists what was flattened) → author publishes manually
```

No LLM, no BitRouter key, no pi/models.json anywhere. ③ uses X's **official** `xurl` CLI so we never hand-roll OAuth signing.

**Consequence recorded:** since this is a mechanical reformat (not a rewrite), the X Article is a **near-duplicate** of the blog, with code/components/images stripped. The blog stays canonical; an optional deterministic link-back footer points readers there. If duplication ever matters for SEO, that footer is the knob.

**Tech Stack:** Node ESM (`.mjs`, JSDoc-typed, matching `lib/docs-sync/`), vitest, `unified`/`remark-parse`/`remark-mdx`/`remark-gfm`/`remark-stringify`, `markdown-draft-js`, `@xdevplatform/xurl`, GitHub Actions (`push` + `workflow_dispatch`), GitHub REST via `gh`.

**Key facts pinned during research:**
- Authors (from `app/(home)/about/page.tsx`): Kelsen Liu, Archer Yang.
- `content/blog/` doesn't exist yet — the `blog` source is already wired in `source.config.ts`; posts land there. The pipeline is dormant until the first post arrives, which is convenient for testing.
- Articles require the posting account to have **X Premium**; API is **pay-per-use** (no free tier). Cost per Article write is not documented — confirm in the dev console; at blog cadence it is negligible.

**Decisions locked (this plan implements exactly these):** X Articles (native draft) · **fully deterministic MDX→content_state (no pi/LLM)** · **text-only** v1 · **draft-only** (manual publish) · **xurl** for the API call · **GitHub commit comment** ping · route by `author` frontmatter.

---

## File Structure

- `source.config.ts` (modify) — add `author` to the `blog` frontmatter schema.
- `package.json` (modify) — add deps: `markdown-draft-js`, `remark-mdx`, `remark-stringify` (`remark-parse`/`remark-gfm` already present via fumadocs).
- `lib/x-articles/constants.mjs` (create) — `AUTHORS` map (`author` → X username + secret env prefix), `BLOG_BASE_URL`, `APPEND_LINK_BACK`, block/style/entity mapping tables for the shim.
- `lib/x-articles/mdx-to-markdown.mjs` (create) — **pure** stage ①: MDX → constrained Markdown + a `dropped[]` report. No I/O.
- `lib/x-articles/mdx-to-markdown.test.mjs` (create).
- `lib/x-articles/markdown-to-content-state.mjs` (create) — **pure** stage ②: Markdown → X `content_state` via `markdown-draft-js` + shim. No I/O.
- `lib/x-articles/markdown-to-content-state.test.mjs` (create).
- `lib/x-articles/detect-new-posts.mjs` (create) — **pure** helper: git name-status diff → added English blog slugs. Tested.
- `lib/x-articles/detect-new-posts.test.mjs` (create).
- `scripts/blog-to-x.mjs` (create) — thin I/O orchestrator: detect → convert → xurl → record → comment.
- `.github/workflows/blog-to-x-draft.yml` (create) — `push` (paths `content/blog/**`) + `workflow_dispatch` (`slug` + `dry_run`).
- `.x-drafts/.gitkeep` (create) — idempotency sidecar dir (committed).
- `docs/x-article-automation.md` (create) — the human one-time setup runbook (Premium, X app, OAuth1 tokens, secrets).
- `vitest.config.ts` (verify) — `include` already covers `lib/**/*.test.mjs`; widen if not.

---

## Task 1: Frontmatter `author` + config + deps

- [ ] Extend the `blog` schema in `source.config.ts`:

```ts
export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string().optional(),
      author: z.enum(["kelsen", "archer"]), // routes the X draft to the right account
    }),
  },
  meta: { schema: metaSchema },
});
```

- [ ] `lib/x-articles/constants.mjs`:

```js
export const AUTHORS = {
  kelsen: { xUsername: "…", secretPrefix: "X_KELSEN" }, // fill real handle
  archer: { xUsername: "…", secretPrefix: "X_ARCHER" },
};
export const BLOG_BASE_URL = "https://bitrouter.ai/blog";
export const APPEND_LINK_BACK = true; // deterministic canonical footer (Task 2)

// DraftJS (markdown-draft-js) → X content_state mapping. Casing values are the
// current best guess from docs ("bold/italic/strikethrough", "link"); confirm on
// first 400 during the Task 3 dry-run and flip here if rejected.
export const BLOCK_TYPE_MAP = {
  unstyled: "unstyled", blockquote: "blockquote",
  "header-one": "header-one", "header-two": "header-two", "header-three": "header-three",
  "header-four": "header-three", "header-five": "header-three", "header-six": "header-three",
  "unordered-list-item": "unordered-list-item", "ordered-list-item": "ordered-list-item",
  "code-block": "unstyled", // should not occur (pre-flattened in stage ①); safety net
};
export const STYLE_MAP = { BOLD: "bold", ITALIC: "italic", STRIKETHROUGH: "strikethrough" };
export const ENTITY_TYPE_MAP = { LINK: "link" };
```

- [ ] Only English posts draft to X in v1; `.zh.mdx` translations are ignored (Task 4 detector).

---

## Task 2: Deterministic MDX → `content_state` (the core — do first)

### 2a — `mdx-to-markdown.mjs` (MDX → constrained Markdown)

Parse the `.mdx` body with `unified().use(remarkParse).use(remarkMdx).use(remarkGfm)` → transform the mdast → serialize with `remark-stringify` (+`remark-gfm`). Return `{ markdown, dropped }`.

Transforms (visit the tree; keep wording verbatim, change only structure):

| mdast node | action |
|---|---|
| `mdxjsEsm` (import/export) | remove |
| `mdxJsxFlowElement` / `mdxJsxTextElement` `Callout` | replace with a `blockquote` wrapping its children |
| other JSX element **with children** (`Tab`, `Tabs`, `Cards`, `Card` w/ body) | unwrap: splice children in place, drop the tag; record name in `dropped` |
| JSX element with **no renderable children** (`CompareTable`, `CompareCTA`, prop-only) | remove; record name + "content dropped" in `dropped` |
| `code` (fenced) | replace with `paragraph`(s) of plain `text` (verbatim code, no fence) |
| `inlineCode` | replace with `text` (its value) |
| `image` / `imageReference` | remove; record in `dropped` |
| `table` (gfm) | flatten each row to a `listItem` (defensive — corpus has none) |
| everything else (heading, paragraph, list, blockquote, strong, emphasis, delete, link, text) | keep |

- [ ] Unknown/other JSX components use the **generic unwrap-children** rule (never throw) and are always recorded in `dropped[]`, so the CI comment tells the author exactly what was flattened. This is the "robust + observable" choice over "fail loudly".
- [ ] Tests: Callout→blockquote; nested JSX unwrap; fenced+inline code→plain text; image removed; `dropped[]` contents; a realistic mixed doc round-trips to clean Markdown containing only supported constructs.

### 2b — `markdown-to-content-state.mjs` (Markdown → X `content_state`)

- [ ] Use `markdownToDraft` from `markdown-draft-js` → standard DraftJS raw `{ blocks, entityMap }`. Then shim to X's variant:

```js
import { markdownToDraft } from "markdown-draft-js";
import { BLOCK_TYPE_MAP, STYLE_MAP, ENTITY_TYPE_MAP } from "./constants.mjs";

/** @returns {{title:string, content_state:{blocks:object[], entities:object[]}}} */
export function markdownToContentState(markdown, title) {
  const raw = markdownToDraft(markdown); // { blocks, entityMap }
  const entities = Object.entries(raw.entityMap).map(([key, e]) => ({
    key,
    value: { type: ENTITY_TYPE_MAP[e.type] ?? e.type.toLowerCase(),
             mutability: e.mutability ?? "MUTABLE",
             data: { url: e.data.url ?? e.data.href } },
  }));
  const blocks = raw.blocks.map((b) => ({
    text: b.text,
    type: BLOCK_TYPE_MAP[b.type] ?? "unstyled",
    depth: b.depth ?? 0,
    inline_style_ranges: (b.inlineStyleRanges ?? []).map((r) => ({
      offset: r.offset, length: r.length, style: STYLE_MAP[r.style] ?? r.style.toLowerCase(),
    })),
    entity_ranges: (b.entityRanges ?? []).map((r) => ({
      offset: r.offset, length: r.length, key: String(r.key),
    })),
    data: {},
  }));
  return { title, content_state: { blocks, entities } };
}
```

- [ ] **Offsets are UTF-16** and come straight from `markdown-draft-js` — do not recompute. Keep one test with an emoji-in-bold line to catch any regression if the library or shim is swapped.
- [ ] **markdown-draft-js gaps to check** (implementation-time): strikethrough (`~~`) support may need a plugin/option; confirm links land in `entityMap` as `LINK` with `data.url` (vs `href`); confirm headings map to `header-one..six`. If any gap can't be closed cleanly, fall back to the **hand-rolled mdast→content_state walker** (kept as a documented alternative in git history of this plan) — still fully deterministic, just more code.
- [ ] Confirm against a live 400 in Task 3: style casing (`bold` vs `BOLD`), entity type casing (`link` vs `LINK`), `mutability` (`MUTABLE`). Flip the maps in `constants.mjs` if needed.
- [ ] Link-back footer (deterministic): if `APPEND_LINK_BACK`, the orchestrator appends one Markdown line before stage ② — `Originally published at [bitrouter.ai/blog/<slug>](<url>)` — so it becomes a normal link entity.
- [ ] Tests: paragraph; each heading; bold/italic/strike; a link (entity + range + string key); ordered/unordered lists + depth; blockquote; emoji-in-bold offset; header-4 clamped to header-three.

---

## Task 3: xurl draft creation

- [ ] `createDraft({ author, payload })`:
  1. Look up `AUTHORS[author]`; read that author's four OAuth1 secrets by `secretPrefix`.
  2. Seed xurl (non-interactive, no browser):
     ```bash
     xurl auth oauth1 --consumer-key "$CK" --consumer-secret "$CS" \
       --access-token "$AT" --token-secret "$TS"
     ```
  3. Write `payload` to `/tmp/body.json`, then:
     ```bash
     xurl -X POST /2/articles/draft --auth oauth1 \
       -H "Content-Type: application/json" -d @/tmp/body.json
     ```
  4. Parse `.data.id`. On non-2xx, print the body and fail the job.
- [ ] Build the review URL from the id. **Confirm the exact draft-edit URL format** on the first real run (candidates: `https://x.com/i/article/<id>`, or the compose/edit route). Fall back to including the raw `id` if uncertain.
- [ ] OAuth 1.0a is chosen because it needs **no browser flow** — static consumer/access key+secret seed cleanly in CI. Each run seeds exactly one author, so xurl's "one OAuth1 set per app" limitation never bites.

---

## Task 4: Idempotency + new-post detection

- [ ] `detect-new-posts.mjs` — pure `addedBlogSlugs(nameStatus)`:
  - Input: `git diff --name-status <before>..<after>` text.
  - Keep `A` (added) lines matching `content/blog/<slug>.mdx` and **not** `*.zh.mdx`. Return `[slug]`.
  - Unit-tested (added/modified/deleted/translation/nested).
- [ ] Idempotency guard: before drafting `<slug>`, if `.x-drafts/<slug>.json` exists, **skip**. After success, write `.x-drafts/<slug>.json` = `{ articleId, author, url, createdAt }` and commit it back:
  ```bash
  git add .x-drafts/<slug>.json && git commit -m "chore(x): record draft for <slug> [skip ci]"
  git push
  ```
  The sidecar path is outside `content/blog/**`, so this commit does **not** re-trigger the workflow.

---

## Task 5: `scripts/blog-to-x.mjs` orchestrator (I/O glue)

- [ ] CLI: `node scripts/blog-to-x.mjs [--slug <slug>] [--dry-run]`.
  - No `--slug`: read `BEFORE_SHA`/`AFTER_SHA` env, run `git diff --name-status`, feed `addedBlogSlugs`.
  - `--slug`: operate on exactly that post (for `workflow_dispatch`).
  - `--dry-run`: run ①→② and print the `content_state` JSON + the `dropped[]` report; **skip** ③④⑤.
- [ ] Per slug: read MDX + frontmatter (reuse the repo's split; `js-yaml` is a dep) → resolve `author` → idempotency check → `mdxToMarkdown` → append link-back → `markdownToContentState` → `createDraft` → record sidecar → comment.
- [ ] Fail-soft across posts; exit non-zero if any failed.
- [ ] Comment via `gh`:
  ```bash
  gh api repos/${GITHUB_REPOSITORY}/commits/${AFTER_SHA}/comments \
    -f body="📝 X Article draft created for **${title}** on @${xUsername} → ${reviewUrl}
    Flattened/dropped in conversion: ${dropped}
    Review and publish it from X. (auto-generated, unpublished)"
  ```

---

## Task 6: `.github/workflows/blog-to-x-draft.yml`

- [ ] Triggers: `push` to `main` filtered to `content/blog/**`, plus `workflow_dispatch` with inputs `slug` and `dry_run`.

```yaml
name: Blog → X Article draft
on:
  push:
    branches: [main]
    paths: ["content/blog/**"]
  workflow_dispatch:
    inputs:
      slug: { description: "Blog slug to draft (blank = diff-detect)", required: false, default: "" }
      dry_run: { description: "Encode only, do not call X", type: boolean, default: false }
permissions:
  contents: write        # commit the .x-drafts sidecar
jobs:
  draft:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with: { fetch-depth: 2 }          # need before..after for the diff
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - name: Install xurl
        run: npm i -g @xdevplatform/xurl
      - name: Draft
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BEFORE_SHA: ${{ github.event.before }}
          AFTER_SHA: ${{ github.sha }}
          X_KELSEN_CONSUMER_KEY: ${{ secrets.X_KELSEN_CONSUMER_KEY }}
          X_KELSEN_CONSUMER_SECRET: ${{ secrets.X_KELSEN_CONSUMER_SECRET }}
          X_KELSEN_ACCESS_TOKEN: ${{ secrets.X_KELSEN_ACCESS_TOKEN }}
          X_KELSEN_TOKEN_SECRET: ${{ secrets.X_KELSEN_TOKEN_SECRET }}
          X_ARCHER_CONSUMER_KEY: ${{ secrets.X_ARCHER_CONSUMER_KEY }}
          X_ARCHER_CONSUMER_SECRET: ${{ secrets.X_ARCHER_CONSUMER_SECRET }}
          X_ARCHER_ACCESS_TOKEN: ${{ secrets.X_ARCHER_ACCESS_TOKEN }}
          X_ARCHER_TOKEN_SECRET: ${{ secrets.X_ARCHER_TOKEN_SECRET }}
        run: |
          git config user.name "bitrouter-bot"; git config user.email "bot@bitrouter.ai"
          node scripts/blog-to-x.mjs \
            ${{ github.event.inputs.slug && format('--slug {0}', github.event.inputs.slug) || '' }} \
            ${{ github.event.inputs.dry_run == 'true' && '--dry-run' || '' }}
```

- [ ] First run: `workflow_dispatch` with `dry_run: true` on an existing post to eyeball the `content_state` + `dropped[]`, then `dry_run: false` for one real draft before trusting the merge trigger.

---

## Task 7: Human one-time setup runbook (`docs/x-article-automation.md`)

- [ ] **X Premium** on both Kelsen's and Archer's accounts (~$8/mo each).
- [ ] Register **one X app** under the company developer account; enable **read + write**; fund pay-per-use.
- [ ] For each author, generate **OAuth 1.0a** consumer key/secret + access token/secret (write-scoped for that user). Add the 8 repo secrets named in Task 6.
- [ ] Fill real X handles into `AUTHORS`.
- [ ] Confirm in the dev console: Article-write pricing + that the app can create Articles for the authorized users.
- [ ] After the first live draft: confirm the draft-edit URL format (Task 3).

---

## Notes / Self-Review

- **No LLM anywhere.** The whole pipeline is deterministic and unit-testable end-to-end; same input → same `content_state`, every run. This is the reliability the "just use pi" instinct was actually chasing — and it removes pi, BitRouter, and models.json from CI.
- **Offsets are library-backed** (`markdown-draft-js`), not hand-rolled — the original "encoder is error-prone" worry is defused. The hand-rolled mdast walker remains a documented deterministic fallback if the library has gaps.
- **Component handling is robust + observable:** unknown components unwrap their children (never throw) and everything flattened/dropped is reported in the CI comment, so the author always knows what changed.
- **Near-duplicate by design** (mechanical reformat). Blog stays canonical; optional link-back footer is the SEO knob.
- **Draft-only is enforced by omission** — `POST …/publish` is never called. Worst case is an unpublished draft the author ignores.
- **Idempotent** via the committed `.x-drafts/<slug>.json` sidecar; safe under re-runs; can't loop the workflow (path filter).
- **Open items to close during implementation:** style/entity casing + mutability (Task 2b/3), `markdown-draft-js` strikethrough/link-data specifics (Task 2b), draft-edit URL format + Article-write pricing (Task 3/7).
- **Security note:** the `X_*` secrets are personal-account write credentials in this repo's Actions secrets — anyone with repo admin can post as either author. Acceptable, but a conscious choice.
- **Not in scope (deferred):** inline images/cover media (needs the media-upload endpoint), auto-publish/one-click publish, scheduling, updating an existing post's draft on re-merge, and any tone/voice adaptation (explicitly out — this is a faithful reformat).
