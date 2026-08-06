# Contributing to the docs

The published documentation site ([bitrouter.ai/docs](https://bitrouter.ai/docs))
is rendered from this repo — docs are committed directly here under
`content/docs/` and ship with the site.

## What publishes

The docs site has two **tabs**, and each is a folder marked `"root": true` in
its `meta.json`:

- **Documentation** — `content/docs/(guide)/`. The parentheses make it a
  *folder group*: fumadocs strips it from the URL, so `(guide)/overview/quickstart.md`
  still publishes at `/docs/overview/quickstart`. It exists only to give the tab
  something to hang off.
- **API Reference** — `content/docs/reference/`, generated from the BitRouter
  Cloud OpenAPI spec.

Two rules follow from that, and breaking either one silently deletes a tab:

1. A root folder needs a landing URL. Fumadocs takes it from `pagesIndex` in
   `meta.json`, or from the folder's first direct *page* child — a root folder
   whose children are all folders resolves to nothing and is dropped from the
   tab bar without an error.
2. Only these two folders carry `"root": true`. Adding it to a section would
   turn that section into a third tab.

Each folder under `content/docs/(guide)/` (`overview`, `usage`,
`gateway-and-routing`, `observability`, `integrations`, `guides`,
`ai-resources`) is a section within the Documentation tab. Page order within a
section is the `pages` list in that section's `meta.json`; the section order is
the `pages` list in `content/docs/(guide)/meta.json`.

`usage/` holds the CLI and MCP server references — generated, so don't
hand-author those.

## Authoring contract (plain Markdown)

Pages are plain Markdown (`.md`), not MDX with imports. The build enforces this:

1. **Frontmatter** — every page needs `title:` (and ideally `description:`).
2. **No `import` / `export` lines.** A whitelisted set of components is available
   globally without imports: `Callout`, `Tabs`/`Tab`, `Cards`/`Card`, and (on the
   relevant pages) `ModelsTable`, `ProvidersTable`, `CompareTable`, `CalInline`.
   Any other `<Capitalized>` tag fails the check.
3. **Callouts** — prefer GitHub-style `> [!NOTE]` / `> [!WARNING]` blockquotes, or
   the `<Callout>` component.
4. **Internal links** are site paths without extensions: `/docs/features/byok`,
   not `./byok.md`.
5. **English only** — the site no longer ships localized docs; don't add
   `<name>.zh.md` translation files.

## Adding a page

1. Create `content/docs/(guide)/<section>/<name>.md`.
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
- **CLI reference** (`content/docs/(guide)/usage/cli/`) — `pnpm generate:cli`
  builds the command pages from `.cli-snapshot.json` plus the hand-authored
  overlays in `cli-overlays/<group>.md` (page intros, per-command examples).
  When the documented binary changes, re-capture the snapshot locally with
  `pnpm snapshot:cli` (needs `bitrouter` on PATH, or `BITROUTER_BIN=...`),
  review the diff, and commit both files.
