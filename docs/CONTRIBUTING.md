# Contributing to the docs

The published documentation site ([bitrouter.ai/docs](https://bitrouter.ai/docs))
is rendered from this repo — docs are committed directly here under
`content/docs/` and ship with the site.

## What publishes

The docs site has four **tabs**, and each is a folder marked `"root": true` in
its `meta.json`. Tab order is the `pages` list in `content/docs/meta.json`:

- **Documentation** — `content/docs/(guide)/`. The parentheses make it a
  *folder group*: fumadocs strips it from the URL, so `(guide)/overview/quickstart.mdx`
  still publishes at `/docs/overview/quickstart`. It exists only to give the tab
  something to hang off.
- **Integrations** — `content/docs/integrations/`, the per-runtime and
  per-model-source recipes. Lands on its `index.mdx`.
- **Guides** — `content/docs/guides/`, the end-to-end walkthroughs (Cloud API,
  self-host, plugins, migrations). It has no `index.mdx`, so its landing URL
  comes from `pagesIndex`.
- **API Reference** — `content/docs/reference/`, generated from the BitRouter
  Cloud OpenAPI spec.

Two rules follow from that, and breaking either one silently deletes a tab:

1. A root folder needs a landing URL. Fumadocs takes it from `pagesIndex` in
   `meta.json`, or from the folder's first direct *page* child — a root folder
   whose children are all folders resolves to nothing and is dropped from the
   tab bar without an error.
2. Only these four folders carry `"root": true`. Adding it to a section would
   turn that section into a fifth tab.

Each folder under `content/docs/(guide)/` (`overview`, `usage`,
`gateway-and-routing`, `observability`) is a section within the Documentation
tab. Page order within a section is the `pages` list in that section's
`meta.json`; the section order is the `pages` list in
`content/docs/(guide)/meta.json`.

`usage/` is how you drive BitRouter: `cli.mdx` (generated — don't hand-author
it), `configuration.mdx` (the `bitrouter.yaml` reference), `mcp.mdx`, and
`skills.mdx`.

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
3. **Callouts** — prefer GitHub-style `> [!NOTE]` / `> [!WARNING]` blockquotes, or
   the `<Callout>` component.
4. **Internal links** are site paths without extensions: `/docs/features/byok`,
   not `./byok.md`.
5. **English only** — the site no longer ships localized docs; don't add
   `<name>.zh.md` translation files.

## Adding a page

1. Create `content/docs/(guide)/<section>/<name>.mdx`.
2. Add `<name>` to that section's `meta.json` `pages` list in the position you
   want it to appear in the nav.
3. Run `pnpm lint:docs` to check the authoring contract.

## Generated reference pages

Two parts of the docs are **generated at build time** — don't hand-edit their
output:

- **API reference** (`content/docs/reference/<tag>/`) — `pnpm generate:openapi`
  regenerates from `openapi.yaml`. The hand-authored `index.mdx` survives; every
  other subdirectory is wiped, and the section `meta.json` is rewritten from
  `REFERENCE_META` in the script — including the `"root": true` that makes it a
  tab, so edit the script, not the file.
- **CLI reference** (`content/docs/(guide)/usage/cli.mdx`) — `pnpm generate:cli`
  builds the whole page from `.cli-snapshot.json` plus the hand-authored
  overlays in `cli-overlays/`. It is **one page**: `cli-overlays/index.md`
  supplies the frontmatter and the intro, and each `cli-overlays/<group>.md`
  supplies a `##` section (its `title:` is the heading, the prose before the
  first `## @` is the section intro, and each `## @<command>` block is appended
  to that command's subsection). Section headings are anchor targets that
  `next.config.ts` redirects at, so renaming one means updating those
  redirects. When the documented binary changes, re-capture the snapshot
  locally with `pnpm snapshot:cli` (needs `bitrouter` on PATH, or
  `BITROUTER_BIN=...`), review the diff, and commit both files.
