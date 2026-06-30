# Source Authored Docs from the `bitrouter` Repo — Design

**Date:** 2026-06-29
**Repos:** `bitrouter-docs` (renderer) + `bitrouter` (authored source) + BitRouter Cloud (API spec)
**Status:** Draft — for review (brainstorm complete → not yet an implementation plan)

**Resolved (2026-06-29):** (1) product docs live in `bitrouter/docs/` — the
conventional name; (2) **all** authored docs are sourced from `bitrouter`,
including Cloud prose — only the generated **API reference** comes from BitRouter
Cloud; (3) the `cloud/` section dissolves into a new `features/namespaces` (OSS)
page + a new `get-started/self-hosted-vs-cloud` page (see Reorg). Remaining open
item: OpenAPI delivery mechanism (#4).

## Summary

Move the **authored** documentation content out of `bitrouter-docs` and into the
open-source **`bitrouter`** repo, so docs live next to the code they describe and
are edited in the same PR as a behavior change. `bitrouter-docs` stops being the
home of the content and becomes a **renderer/aggregator**: at build time it pulls
authored docs from `bitrouter`, generates the API reference from BitRouter Cloud's
OpenAPI spec, and renders everything with its existing fumadocs UI, search, Ask-AI,
i18n, blog, and landing pages.

Nothing about how readers experience the site changes. What changes is **where the
Markdown is authored** and **how it reaches the build**.

Three authoritative sources, aggregated by one renderer:

| Content | Source of truth | How it arrives |
|---|---|---|
| All authored docs (concepts, features, guides, get-started, integrations, ai-resources, the Cloud anchor `managed-models`, `reference/index`) — **both locales** | **`bitrouter`** repo `docs/` | `scripts/sync-docs.mjs` at `prebuild` |
| API reference (the generated `reference/*` operation pages) | **BitRouter Cloud** (server emits the OpenAPI spec) | fetch spec → `scripts/generate-openapi.mjs` |
| App shell, landing, blog, search, Ask-AI, i18n routing, `models` data | **`bitrouter-docs`** itself | unchanged |

> **Folder reconciliation.** `bitrouter/docs/` already holds dev-internal
> material (`superpowers/` plans+specs, `awesome-submissions/`). The sync does
> **not** publish those: the **published tree is defined by `bitrouter/docs/meta.json`**
> (`root: true`, `pages: [...]`), and `sync-docs.mjs` follows that manifest —
> anything not referenced (i.e. `superpowers/`, `awesome-submissions/`) stays
> internal and is never synced to the site.

## Motivation

- **Docs that track code should live with code.** concepts/features/guides
  document behavior (routing, hooks, presets, provider selection). Today they
  drift independently in a separate repo; co-locating them makes a behavior change
  and its doc one atomic PR, reviewed by the engineer who made the change. This is
  the same discipline `CLAUDE.md` already mandates for `skills/bitrouter/`.
- **OSS visibility.** The community can read and PR the docs from the same repo
  they read the code — a real contribution surface for an open-source project.
- **Single source of truth per concern.** The OpenAPI spec already wants one home
  (today a 427 KB `openapi.yaml` of unclear provenance sits committed in the docs
  repo); this design pushes it back to where the API is *implemented and served*.

## Goals

1. All **authored** docs (both `en` and `zh`) are authored in `bitrouter`, synced
   into `bitrouter-docs` at build, and rendered with zero loss of current features
   (search, `processed` markdown for `llms.txt`/Ask-AI, last-modified, i18n).
2. **No change to `source.config.ts`** — content still arrives at
   `content/docs`; it is just synced there instead of committed. This is the whole
   reason to prefer sync-to-disk (below) over a custom headless Source.
3. A clean, low-friction **authoring contract** for docs in `bitrouter`: plain
   Markdown + frontmatter, no imports, a small whitelist of global components.
4. The API reference is generated from **BitRouter Cloud's** spec, fetched at build.
5. Translation drift is **visible** (a staleness signal), not silent.

## Non-goals (YAGNI)

- A custom/headless fumadocs Source that fetches content at runtime (see Rejected).
- A git submodule of `bitrouter` into `bitrouter-docs` (see Rejected).
- Moving **marketing/app** surfaces (landing, blog, pricing, compare, enterprise,
  the API playground, search/Ask-AI infra) — these are app, not content, and stay.
- Sourcing the **README** into docs — it is a marketing artifact (badges, install
  matrix, screenshots) and is intentionally allowed to diverge from get-started.
- Generating the OpenAPI spec from the `bitrouter-cloud-sdk` **client** crate —
  rejected during brainstorm (a client covers only `management` and is downstream
  of the server contract).

## Architecture

### Chosen approach: sync-to-disk at build (Approach A)

```
bitrouter repo                          bitrouter-docs (Railway build)
  doc/**            ── sync-docs.mjs ──▶  content/docs/**   (gitignored)
  (authored .md,                              │
   en + zh, meta.json)                        │  source.config.ts unchanged
                                              ▼
BitRouter Cloud                          fumadocs-mdx → .source/
  openapi.yaml      ── generate-openapi ─▶ content/docs/reference/* (generated)
                                              │
                                              ▼
                                          next build  →  bitrouter.ai
```

`loader()` and `defineDocs({ dir: "content/docs" })` are untouched. fumadocs-mdx
keeps owning MDX compilation, frontmatter, TOC, `includeProcessedMarkdown`
(load-bearing for `llms.txt` + Ask-AI), last-modified, and the Orama search index.
The only new thing is **how files land in `content/docs`**.

### Why not the alternatives

- **Custom headless Source (Source API).** Elegant (no committed/generated files),
  but `loader()` is server-side and files must still exist at build time — there is
  no live cross-repo reference. A custom remote source means **re-implementing**
  everything fumadocs-mdx gives for free (`processed` markdown, search, last-mod,
  the OpenAPI generator's `.source` integration). Not worth it.
- **Git submodule.** Pins a SHA, which fights the "track `main` always" decision;
  forces Railway to init submodules and checkout the *entire* Rust repo for `doc/`;
  and still needs the same transform pass. Strictly heavier than a scoped sync.

### The authoring contract (how plain Markdown suits fumadocs)

Files in `bitrouter`'s docs folder are **plain Markdown**, because:

- fumadocs-mdx already processes `.md`, not just `.mdx`.
- The five components the docs actually use — `Callout`, `Tabs`, `Tab`, `Cards`,
  `Card` — are **already globally registered** in `mdx-components.tsx`
  (`defaultMdxComponents` + the `TabsComponents` spread). So an **import-free** file
  that uses `<Callout>`/`<Tabs>`/`<Cards>` renders identically; the `import` lines
  in today's pages are redundant.

Contract for every doc file in `bitrouter`:

- Markdown + YAML frontmatter; `title` required (matches `frontmatterSchema`).
- **No `import` / `export` lines.**
- May use only the global whitelist: `Callout`, `Tabs`, `Tab`, `Cards`, `Card`
  (+ `ModelsTable`, `CalInline` if the `managed-models` page is authored upstream).
- Optional `> [!NOTE]` / `> [!WARNING]` callouts (GitHub-alert remark plugin), so
  authors who want zero JSX can avoid `<Callout>` entirely.
- Internal links as site paths (`/docs/...`); links to source as repo-relative,
  rewritten by the sync to `github.com/bitrouter/bitrouter/...`.

### `sync-docs.mjs` responsibilities

A sibling of the existing `scripts/sync-changelog.mjs`, wired into `prebuild`
**before** `generate-openapi`:

1. **Acquire** the docs tree: read a local sibling checkout (`../bitrouter/doc`)
   when present (fast local inner loop, live editing), else fetch the tree from
   `bitrouter@main` via the GitHub API (CI/Railway, `GITHUB_TOKEN` raises the rate
   limit). "Track `main` always."
2. **Transform** each file: strip `import`/`export` lines; reject any
   non-whitelisted `<Capitalized>` JSX (fail the build with a clear message);
   rewrite links; copy referenced assets into `public/` (today there are none).
3. **Stamp** a source-content hash into each English file's frontmatter and, for
   each `*.zh.md`, record the English hash it was translated against — the input
   to the staleness check.
4. **Write** into `content/docs/**` (gitignored), preserving section dirs,
   `meta.json`, and the `.zh` locale suffix.

### Pipeline order (prebuild)

```
1. sync-docs        ← authored docs from bitrouter@main → content/docs/**
2. generate-openapi ← spec from BitRouter Cloud → content/docs/reference/* (on top)
3. generate-models, generate-changelog
4. next build
```

Order matters: `sync-docs` lays down authored content (including
`reference/index`), then `generate-openapi` writes the generated operation pages
into `reference/*` on top.

### Freshness

`bitrouter` CI fires a `repository_dispatch` to `bitrouter-docs` on any change
under the docs folder, triggering a docs rebuild/redeploy — the exact mechanism
the changelog sync already uses. Between dispatches the deployed site reflects the
last build (acceptable; same model as changelog/openapi today).

### i18n & translation staleness

- Sync **English and Chinese** from `bitrouter` (both locales authored upstream).
- fumadocs i18n keys off the `.zh` suffix; a synced `concepts/models.md` (en) and
  `concepts/models.zh.md` (zh) render as one page's two locales.
- **Staleness signal:** because engineers authoring behavior docs upstream often
  won't update `zh`, the sync compares each `*.zh.md`'s recorded source-hash to the
  current English hash and emits a **CI warning** (non-blocking) listing stale
  translations. This makes the drift *visible* instead of silent — the load-bearing
  mitigation for moving translations into the code repo.

## Content reorganization (dissolve "Infrastructure")

Folded into this change because it determines what gets authored upstream. The
top-level **Infrastructure** section (`cloud/`) dissolves. `workspaces` is split
along the **OSS/cloud seam**: its OSS isolation primitive becomes a `features`
page, and its teams/positioning layer goes into a single `get-started` comparison
page. `managed-models` survives as the Cloud anchor (the cross-link hub for ~9
feature pages and the commercial hook). Nothing is deleted outright except the
stub.

| Current `cloud/` page | Disposition |
|---|---|
| `workspaces` (OSS part) | **New `features/namespaces`** — the single-node "agent namespace" isolation primitive (keys/policies/usage scoped to a namespace) |
| `workspaces` (cloud part) + `overview` | **New `get-started/self-hosted-vs-cloud`** — the positioning/comparison + teams/seats/multi-tenant story; the one place Cloud is framed for new users |
| `managed-models` | **Keep** as the Cloud anchor page (authored in `bitrouter/docs`); absorb `get-started` (cloud) onboarding steps |
| `byok` | **Move** → `features/byok` (universal concept + a "Cloud: sealed-box" subsection) |
| `tracing` | **Merge** → `features/opentelemetry` as a "Cloud Activity (hosted)" section |
| `get-started` (cloud), `payment` (stub) | **Absorb / drop** |

Notes:
- `get-started` already has a `comparison` page (BitRouter vs LiteLLM/OpenRouter).
  The new `self-hosted-vs-cloud` page is a **distinct** axis (deployment, not
  competitors); confirm whether it sits beside `comparison` or extends it.
- Every inbound cross-link must continue to resolve (most point at
  `managed-models`); the migration updates link targets for the moved pages.
- This is the **one** place Cloud is framed inside `get-started` — a single
  focused comparison page, not cloud content scattered across the OSS funnel.

## Migration (one-time)

1. For each authored section (concepts, features, guides, get-started,
   integrations, ai-resources, `reference/index`): strip imports, rename
   `.mdx`→`.md`, move to `bitrouter`'s docs folder with `.zh` siblings and
   `meta.json`; apply the Infrastructure reorg above.
2. Delete the moved files from `bitrouter-docs`; **gitignore** `content/docs`
   (keep `content/docs/reference/index.md` handling consistent with the generator,
   which already preserves a hand-authored index).
3. Land `sync-docs.mjs`, wire `prebuild`, add the `repository_dispatch` trigger in
   `bitrouter` CI, add a "edit upstream" banner to synced pages, and point the
   docs-repo CONTRIBUTING at `bitrouter`'s docs folder.
4. Repoint OpenAPI generation at BitRouter Cloud's spec (see Open #4).

## Risks

- **Build now depends on a cross-repo fetch.** Mitigate: local-sibling fast path;
  pinned-on-`main` fetch with `GITHUB_TOKEN`; the synced tree is reproducible.
- **Translation drift moves to where it's hardest to fix** (engineers in a Rust
  repo). Mitigate: the staleness CI warning (Goal 5); `zh` is never auto-generated.
- **Authoring-contract violations upstream** (someone adds `<SomeComponent>` or an
  import). Mitigate: the transform **fails the build** with a precise message and
  the offending file/line; documented in `bitrouter`'s docs CONTRIBUTING.
- **`docs/` shared with dev-internal material.** The repo's `docs/` also holds
  `superpowers/` + `awesome-submissions/`. Mitigate: the sync publishes only what
  `docs/meta.json` lists, so internal dirs are never exposed on the site; a stray
  unlisted section simply won't publish (and can be surfaced as a warning).

## Open decisions

Resolved 2026-06-29:

1. ✅ **Folder name** — `bitrouter/docs/` (convention). Published tree defined by
   `docs/meta.json`; `superpowers/` + `awesome-submissions/` excluded from sync.
2. ✅ **Sourcing** — all authored docs (incl. Cloud prose) from `bitrouter`; only
   the API reference from BitRouter Cloud.
3. ✅ **`workspaces`** — split: OSS part → `features/namespaces`; cloud/teams part
   → `get-started/self-hosted-vs-cloud` (see Reorg).
5. ✅ **Whitelist** — `managed-models` is authored upstream, so `ModelsTable` and
   `CalInline` are added to the import-free component whitelist.

Still open (does not block most of the plan — the spec fetch is parameterized):

4. **OpenAPI delivery from Cloud.** Does the server emit the spec to a stable URL
   (e.g. `api.bitrouter.ai/openapi.yaml`) or commit it in the cloud repo? Decides
   whether `generate-openapi` fetches a URL or an artifact. The plan will make the
   source a config value (`OPENAPI_SPEC_URL`, falling back to a committed file) so
   implementation isn't blocked — but the real endpoint is needed before launch.

## Future work

- CI check in `bitrouter` that **validates** `bitrouter-cloud-sdk`'s management
  types against the Cloud OpenAPI spec (spec → SDK direction).
- A docs-lint in `bitrouter` enforcing the authoring contract pre-merge (so
  violations fail in the source repo, not only at docs build).
- Optional: extend the same sync pattern to other authored collections if desired.
