# Contributing to the docs

The published documentation site ([bitrouter.ai/docs](https://bitrouter.ai/docs))
is rendered from this repo — docs are committed directly here under
`content/docs/` and ship with the site.

## What publishes

Each top-level folder under `content/docs/` (`overview`, `get-started`,
`models-and-routing`, `features`, `guides`, `integrations`) is a documentation
section on the site. Page order within a section is the `pages` list in that
section's `meta.json`; the overall section order is the `pages` list in
`content/docs/meta.json`.

The **API reference** (generated from the BitRouter Cloud OpenAPI spec) and
**AI resources** (docs MCP, llms.txt, drop-in skills) are also site sections,
but the reference pages are generated — don't hand-author those.

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

1. Create `content/docs/<section>/<name>.md`.
2. Add `<name>` to that section's `meta.json` `pages` list in the position you
   want it to appear in the nav.
3. Run `pnpm lint:docs` to check the authoring contract.

## Generated reference pages

Two parts of the docs are **generated at build time** — don't hand-edit their
output:

- **API reference** (`content/docs/reference/<tag>/`) — `pnpm generate:openapi`
  regenerates from `openapi.yaml`. Hand-authored top-level pages (`index.mdx`,
  `mcp.mdx`) survive; the section `meta.json` is rewritten.
- **CLI reference** (`content/docs/reference/cli/`) — `pnpm generate:cli`
  builds the command pages from `.cli-snapshot.json` plus the hand-authored
  overlays in `cli-overlays/<group>.md` (page intros, per-command examples).
  When the documented binary changes, re-capture the snapshot locally with
  `pnpm snapshot:cli` (needs `bitrouter` on PATH, or `BITROUTER_BIN=...`),
  review the diff, and commit both files.
