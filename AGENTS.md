# bitrouter-docs

Next.js 16 (App Router) + fumadocs site for [bitrouter.ai](https://bitrouter.ai) — landing, models catalog, recipes, blog, changelog, and the documentation under `content/docs/`.

## Documentation rules

- **English only.** The site no longer ships localized docs — do not create `<name>.zh.md` translation files or reintroduce i18n plumbing. Old `/zh/*` URLs 301 to the English pages via `next.config.ts` redirects.
- Docs are **`.mdx`**, import-free, using only the whitelisted global components — see `docs/CONTRIBUTING.md` for the full authoring contract. Write Markdown; the extension is what makes `<Callout>` / `<Cards>` / `<Tabs>` actually render (fumadocs-mdx picks its processor by extension, and `.md` silently drops those blocks).
- Lint with `pnpm lint:docs` (`scripts/check-docs.mjs`) after editing docs.
- The site has **four docs tabs**, each a folder marked `"root": true`: Documentation (`content/docs/(guide)/`), Integrations (`content/docs/integrations/`), Guides (`content/docs/guides/`), API Reference (`content/docs/reference/`). Tab order is `content/docs/meta.json`.
- Retiring or moving a page means adding a 301 to the `pairs` list in `next.config.ts` — that file is the URL history of the docs.
- **Always use the scripts — never hand-edit generated output.** Anything produced by a generator is regenerated at `prebuild`, so manual edits are silently lost:
  - API reference (`content/docs/reference/<tag>/`) — edit `openapi.yaml`, then `pnpm generate:openapi`.
  - CLI reference (`content/docs/(guide)/usage/cli.mdx`, one page) — edit `cli-overlays/index.md` (page intro) or `cli-overlays/<group>.md` (a `##` section), then `pnpm generate:cli`.
  - `.cli-snapshot.json` — re-capture from the binary with `pnpm snapshot:cli`; never edit by hand.
  - `.models-snapshot.json` / changelog-latest data — `pnpm generate:models` / `pnpm generate:changelog`.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm test` — vitest unit tests (`lib/**/*.test.*`)
- `pnpm lint:docs` — docs authoring-contract check (also runs at `prebuild`)
- `pnpm generate:openapi` / `pnpm generate:cli` — regenerate the reference sections (both run at `prebuild`)
- `pnpm snapshot:cli` — re-capture the CLI snapshot from the local `bitrouter` binary (set `BITROUTER_BIN` to override the path)
- `pnpm generate:models` / `pnpm generate:changelog` — refresh the models snapshot and latest-changelog data
