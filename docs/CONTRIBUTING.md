# Contributing to the docs

The published documentation site ([bitrouter.ai/docs](https://bitrouter.ai/docs))
is rendered from this repo — docs are committed directly here under
`content/docs/` and ship with the site.

## What publishes

Documentation uses one unified Fumadocs page tree with no layout tabs. Its
top-level order is the `pages` list in `content/docs/meta.json`:

1. **Overview** — quickstart, product explanation, models, comparison, and
   the Enterprise deployment-decision entry.
2. **Usage** — `bitrouter/auto`, CLI/TUI, coding agents, MCP, ACP, Agent Skills,
   and model sources.
3. **Configuration** — router policy, model selection and protocol compatibility,
   guardrails, evaluations, and telemetry.
4. **Customization** — model/provider customization and router-owned tool
   capabilities.
5. **Reference** — the generated Cloud API reference.
6. **Development** — source contribution and developer-assistance guides.

Each group name in `content/docs/meta.json` is a native Fumadocs separator, not
a page or collapsible folder. Five meta-only folders —
`content/docs/(overview-nav)/`, `(usage-nav)/`, `(configuration-nav)/`,
`(customization-nav)/`, and `(development-nav)/` — are extracted into the root
with Fumadocs' `...folder` syntax. They contain links to canonical pages rather
than copies of those pages, so every public non-Reference page appears directly
below its section label.

Reference is the deliberate exception. `content/docs/reference/` is extracted
below the **Reference** separator, with every generated API family listed
directly under it as a native folder with endpoint children. Do not add another
separator for API categories. Make Reference navigation changes in
`scripts/generate-openapi.mjs`; generated `meta.json` files are replaced during
`prebuild`.

**Changelog is not part of the documentation tree.** It is a top-level `/changelog`
section with a separate `content/changelog/` source. It still uses the native
Fumadocs notebook layout, and its sidebar is built from release metadata,
newest first, so each item is labeled with its version tag. Do not move its
release files into `content/docs/`.

Three rules keep the unified navigation intact:

1. Do not add `"root": true`; Fumadocs root folders isolate content into layout
   tabs and would split the page tree again.
2. Keep source paths aligned with the information architecture. When a page
   changes jobs, move it and update its internal links and URL-history target.
3. A page should appear in one user-facing group. Cross-link it from content
   when another journey needs it instead of duplicating the navigation entry.

### Keep non-Reference sections flat

Source pages can remain nested where that keeps related files together, but the
public sidebar is a flat list beneath each section separator. Every public page
must be listed exactly once in the matching `*-nav/meta.json`; cards and inline
links provide additional discovery, not a substitute for sidebar visibility.
Rare intentional exceptions must be added to `HIDDEN_SIDEBAR_ROUTES` in
`scripts/check-docs.mjs`. BitRouter Agent and Local inference are currently
hidden while retaining their direct URLs.

Use this boundary when classifying new pages:

- **Usage** explains how to operate BitRouter from an interface, agent,
  protocol, skill, or model source.
- **Customization** adds or replaces a capability in the router's execution path.
- **Configuration** explains the router's desired-state policy, model selection,
  constraints, and evidence.
- **Development** explains how to contribute source and how to use BitRouter's
  supplied Docs MCP server and Agent Skills as development assistance.
  Operational setup for MCP upstreams and local skills remains under Usage.

### Documentation vs Self-hosting

These two sidebar areas slice the same product differently, so the content
boundary has to be held deliberately or they rot into two half-answers per topic:

- **Documentation** answers *what the router does* — feature semantics, router
  policy, and model-selection behavior.
- **Self-hosting** answers *how the process runs, who can reach it, and what
  happens on day 2* — supervision, bind address and TLS, authentication,
  upgrades, state.

Enterprise is the Overview decision page and links into Self-hosting for the
open-source operational path. Self-hosting **links** to feature pages rather
than restating them. The Router policy page defines what the complete
`bitrouter.yaml` desired state means without becoming an exhaustive field
reference; Self-hosting covers the operational contract around that policy
(resolution, secrets, CI validation, and rollout).

Folders under `content/docs/(guide)/` own their routes and local source
ordering. Public sidebar order comes from the `*-nav/meta.json` files, which
must expose the non-Reference source tree except for the explicit hidden-page
allowlist. `pnpm lint:docs` fails when a public page is missing, duplicated, or
points to a route that does not exist.

## Authoring contract (import-free MDX)

Pages are `.mdx`, but you write plain Markdown in them — no imports, no JSX
beyond the whitelisted components. The build enforces this:

1. **Frontmatter** — every page needs `title:` (and ideally `description:`).
2. **No `import` / `export` lines.** A whitelisted set of components is available
   globally without imports: `Callout`, `Tabs`/`Tab`, `Cards`/`Card`, and (on the
   relevant pages) `ModelsTable`, `ProvidersTable`, `CompareTable`, `CalInline`.
   Any other `<Capitalized>` tag fails the check.

> [!IMPORTANT]
> **The `.mdx` extension is load-bearing — never author a docs page as `.md`.**
> `fumadocs-mdx` chooses its processor from the file extension alone
> (`filePath.endsWith(".mdx") ? "mdx" : "md"`), and no config option overrides
> it. In `.md`, a block like `<Callout>…</Callout>` parses as raw HTML and is
> dropped whole — tag *and body* — so the page renders with the content
> silently missing. `pnpm lint:docs` still passes, because the components are
> whitelisted either way. Docs were `.md` until 2026-08; the migration to
> `.mdx` restored the dropped blocks across 41 pages.
3. **Callouts are `<Callout>`, never GitHub alerts.** Use
   `<Callout type="info">` (also `warning`, `warn`, `success`, or no `type` for
   the default). **GitHub-style `> [!NOTE]` / `> [!WARNING]` blockquotes do not
   work on the site** — `source.config.ts` registers only `remarkGfm` and
   `rehypeSlug`, with no alerts plugin, so the block renders as a plain
   blockquote with a literal `[!NOTE]` in the body. `pnpm lint:docs` now fails
   on that syntax. (Alerts *do* render in repo Markdown like this file, which
   GitHub renders itself — that's the trap. `content/` is not GitHub.)
4. **Internal links** are site paths without extensions: `/docs/features/byok`,
   not `./byok.md`.
5. **English only** — the site no longer ships localized docs; don't add
   `<name>.zh.md` translation files.

## Adding a page

1. Create `content/docs/(guide)/<section>/<name>.mdx`.
2. Add it to the source section's `meta.json` when that local ordering is used.
3. Add its canonical URL link to the appropriate `*-nav/meta.json`; every public
   non-Reference page must appear in the sidebar exactly once. If the product
   decision is to hide it, add the route to `HIDDEN_SIDEBAR_ROUTES` instead.
4. Run `pnpm lint:docs` to check the authoring contract.

## Adding a section

A new source section is a folder under `content/docs/(guide)/` with its own
`meta.json` (`title`, a [lucide](https://lucide.dev) `icon`, and `pages`). Add
its pages to the appropriate user-facing `*-nav/meta.json`; do not add another
top-level group without an information-architecture decision. Never give it
`"root": true`.

One extra step is easy to miss: **add the folder to `SECTIONS` in
`scripts/check-docs.mjs`.** That list is hardcoded, so a section left out of it
is skipped by `pnpm lint:docs` **silently** — the check still prints OK, just
over fewer files. The printed count ("N doc(s) across M sections") is the way to
notice; M should match the number of hand-authored sections.

Also resync `lib/llms-txt.ts`, which carries its own hand-maintained copy of
the section list and page descriptions.

## Generated reference pages

Two parts of the docs are **generated at build time** — don't hand-edit their
output:

- **API reference** (`content/docs/reference/<tag>/`) — `pnpm generate:openapi`
  regenerates from `openapi.yaml`. The hand-authored `index.mdx` survives; every
  other subdirectory is wiped, and the section `meta.json` is rewritten from
  `REFERENCE_META` in the script. The index is included in `pnpm lint:docs` as
  a standalone hand-authored page. Reference remains a regular collapsible
  folder in the unified sidebar, so edit the script, not the generated files.
- **CLI reference** (`content/docs/(guide)/usage/cli.mdx`) — `pnpm generate:cli`
  builds the whole page from `.cli-snapshot.json` plus the hand-authored
  overlays in `cli-overlays/`. It is **one page**: `cli-overlays/index.md`
  supplies the frontmatter and the intro, and each `cli-overlays/<group>.md`
  supplies a `##` section (its `title:` is the heading, the prose before the
  first `## @` is the section intro, and each `## @<command>` block is appended
  to that command's subsection). Section headings are anchor targets that
  `next.config.ts` redirects at, so renaming one means updating those
  redirects. When the documented binary changes, re-capture the snapshot
  locally with `pnpm snapshot:cli` (needs `bro` on PATH, or
  `BITROUTER_BIN=...`), review the diff, and commit both files.
