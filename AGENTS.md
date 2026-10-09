# bitrouter-docs

Next.js 16 (App Router) + fumadocs site for [bitrouter.ai](https://bitrouter.ai) — landing, models catalog, recipes, blog, changelog, and the documentation under `content/docs/`.

## Documentation rules

- **English only.** The site no longer ships localized docs — do not create `<name>.zh.md` translation files or reintroduce i18n plumbing. Old `/zh/*` URLs 301 to the English pages via `next.config.ts` redirects.
- Docs are **`.mdx`**, import-free, using only the whitelisted global components — see `docs/CONTRIBUTING.md` for the full authoring contract. Write Markdown; the extension is what makes `<Callout>` / `<Cards>` / `<Tabs>` actually render (fumadocs-mdx picks its processor by extension, and `.md` silently drops those blocks).
- Lint with `pnpm lint:docs` (`scripts/check-docs.mjs`) after editing docs.
- Documentation is one unified Fumadocs page tree with no layout tabs. Its seven user-facing groups are **Overview, Config, Model, Context, CLI, Integration, API**. In `content/docs/meta.json`, each group name is a native Fumadocs separator and each meta-only `*-nav` folder is extracted into the root, so group labels are not clickable or collapsible. Changelog is a separate top-level `/changelog` section with its own `content/changelog/` source and release-version sidebar.
- **Show every non-Reference page in the sidebar exactly once unless it is an explicit product-navigation exception.** Overview, Config, Model, Context, CLI, Integration, and API are flat link lists beneath their separators; do not hide detailed pages or reintroduce nested folders by default. Intentional hidden pages must remain rare and be listed in `HIDDEN_SIDEBAR_ROUTES` in `scripts/check-docs.mjs`; currently BitRouter Agent, Local inference, the compatibility CLI manual, and the retained Coding agents guide are hidden. `pnpm lint:docs` enforces this coverage.
- **API and CLI each contain a collapsed Reference folder.** API has two flat guides (Responses API and Decisions API), followed by `content/docs/reference/` as a native folder preserving generated API families and endpoints. CLI keeps its operational guides flat and places generated command-group pages inside Reference. Make reference hierarchy changes in `scripts/generate-openapi.mjs` and `scripts/generate-cli.mjs`, never in generated metadata.
- **Config** owns BitRouter settings: file discovery, secrets, validation/reload, providers, model-route authoring, MCP transports/aggregation/cache, server-tool enablement/backends/limits, and telemetry configuration, receipts, and Cloud activity. **Model** owns selector resolution, compatibility, fallback behavior, routing policy and evidence, and evaluations. **Context** owns MCP gateway use, Agent Skills, AGENTS.md, and request-level server-tool declarations and execution. **CLI** owns TUI, Headless, and generated command-group references. **API** owns Responses/Decisions guides and the generated endpoint reference. **Integration** owns coding-agent and ACP server guides. Keep each setting's authoring example in Config and link to it from behavior guides. Harness-owned instruction and skill settings remain in Context; Self-hosting owns deployment operations. Enterprise is the Overview decision entry.
- Retiring or moving a page means adding a 301 to the `pairs` list in `next.config.ts` — that file is the URL history of the docs.
- **Always use the scripts — never hand-edit generated output.** Anything produced by a generator is regenerated at `prebuild`, so manual edits are silently lost:
  - API reference (`content/docs/reference/<tag>/`) — edit `openapi.yaml`, then `pnpm generate:openapi`.
  - CLI references (`content/docs/(guide)/cli/reference/*.mdx`, plus the compatibility manual at `cli/reference.mdx`) — edit `cli-overlays/index.md` (page intro) or `cli-overlays/<group>.md` (a `##` section), then `pnpm generate:cli`.
  - `.cli-snapshot.json` — re-capture from the binary with `pnpm snapshot:cli`; never edit by hand.
  - `.models-snapshot.json` / changelog-latest data — `pnpm generate:models` / `pnpm generate:changelog`.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm test` — vitest unit tests (`lib/**/*.test.*`)
- `pnpm lint:docs` — docs authoring-contract check (also runs at `prebuild`)
- `pnpm generate:openapi` / `pnpm generate:cli` — regenerate the reference sections (both run at `prebuild`)
- `pnpm snapshot:cli` — re-capture the CLI snapshot from the local `bitrouter` binary (set `BITROUTER_BIN` to override the path)
- `pnpm generate:models` / `pnpm generate:changelog` — refresh the models snapshot and latest-changelog data
