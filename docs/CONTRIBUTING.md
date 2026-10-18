# Contributing to the docs

The published documentation site ([bitrouter.ai/docs](https://bitrouter.ai/docs))
is rendered from this repo — docs are committed directly here under
`content/docs/` and ship with the site.

## What publishes

Documentation uses one unified Fumadocs page tree with no layout tabs. Its
top-level order is the `pages` list in `content/docs/meta.json`:

1. **Overview** — Quickstart, Supported Models, How BitRouter Works, then a
   collapsed Comparison folder. Enterprise remains a linked deployment-decision entry.
2. **Usage** — Desktop, CLI, and Responses API. Desktop is Coming soon until
   its installation and behavior can be documented from a verified implementation.
   CLI combines the self-driving, interactive terminal, and headless guides.
3. **Coding Agents** — shared `bro [harness]` launch configuration and product-specific guides.
4. **Routing** — Configuration (YAML), Model Routing, Context Routing, and Strategies.
5. **Model** — Virtual Models, Model Fallback, BYOK & Subscriptions, and Local Models.
6. **Context** — ACP servers, MCP gateway configuration/use,
   Agent Skills, and AGENTS.md.
7. **Reference** — Changelog, CLI reference, config reference, and API reference. Changelog and CLI
   reference are each one page. API reference keeps its collapsed endpoint-family
   hierarchy and includes Decisions / System One and Chat Completions / Messages.

Each group name in `content/docs/meta.json` is a native Fumadocs separator, not
a page or collapsible folder. Seven meta-only guide folders — `(overview-nav)`,
`(usage-nav)`, `(integration-nav)`, `(routing-nav)`, `(models-routing-nav)`,
`(context-routing-nav)`, and `(reference-nav)` — are extracted into the root with `...folder`.
They link to canonical pages rather than copies.

Comparison under Overview and API reference are the only hierarchy exceptions.
Both are native folders with `collapsible: true` and `defaultOpen: false`.
Comparison has no index page: its header only expands or collapses its four
canonical comparison guides. Keep competitor claims sourced and qualified.

API reference retains `content/docs/reference/` and its generated native API
families and endpoints. Its overview and the Decisions and compatibility guides
are hand-authored root files. Change generated ordering through
`scripts/generate-openapi.mjs`; builds replace generated metadata.

CLI reference is generated at `content/docs/(guide)/cli/reference.mdx` by
`scripts/generate-cli.mjs` from `.cli-snapshot.json` and `cli-overlays/`.
It is a canonical, searchable page. Former group pages redirect to this manual;
command anchors stay stable, and internal links target the exact section.

Changelog is generated at `content/docs/changelog.mdx` by
`scripts/generate-changelog-latest.mjs`. Keep release input files in
`content/changelog/` for sync, curation, announcements, and RSS/Atom. All releases
render on `/docs/changelog`; old `/changelog` and per-release URLs redirect into
this page. The established RSS/Atom endpoints remain available. Do not hand-edit
the generated changelog page.

Three rules keep the unified navigation intact:

1. Do not add `"root": true`; Fumadocs root folders isolate content into layout
   tabs and would split the page tree again.
2. Keep source paths aligned with the information architecture. When a page
   changes jobs, move it and update its internal links and URL-history target.
3. A page should appear in one user-facing group. Cross-link it from content
   when another journey needs it instead of duplicating the navigation entry.

### Keep non-Reference sections flat

Source pages can remain nested where that keeps related files together, but the
public sidebar is a flat list beneath each section separator, with Comparison
and API reference as explicit exceptions. Every public page
must be listed exactly once in the matching `*-nav/meta.json`, including the
four Comparison children. Cards and inline links provide additional
discovery, not a substitute for sidebar visibility.
Rare intentional exceptions must be added to `HIDDEN_SIDEBAR_ROUTES` in
`scripts/check-docs.mjs`. BitRouter Agent and the
retained Coding agents guide remain hidden. The supporting Request receipts page has no sidebar entry; feature guides retain
its links. Configuration (YAML) is visible under Routing.
Self-hosting is also omitted from Overview navigation and remains accessible through
deployment-related content links.
Routing's four guides and Local Models are public sidebar pages and participate
in search, sitemap, and full-text ingestion. Retained compatibility guides carry
`noindex` metadata while remaining directly readable.

Use this boundary when classifying content:

- **Model** explains named model endpoint definitions, selectors, request
  profiles, compatibility, failure-driven fallback, credentials and subscription
  sources, custom endpoints, and local inference. Its four visible
  guides are Virtual Models, Model Fallback, BYOK & Subscriptions, and Local Models.
  Do not reintroduce Providers or a generic Config group.
- **Routing** owns Configuration (YAML) (file discovery, secrets references,
  schema validation, reload, and configuration/policy artifact boundaries),
  Model Routing (candidate eligibility and selection mechanics), Context Routing
  (native context-view selection), and Strategies (existing routing approaches,
  customization, policy bindings, adequacy, objective evaluation evidence, and
  reviewed publication). Keep feature-specific YAML examples with their owning
  guide and link to them. Strategy customization composes supported settings;
  it does not imply an arbitrary algorithm plugin interface. Keep model and
  context ownership explicit: proxying an external harness's calls does not give
  BitRouter control over its history. Decisions API lives inside API reference.
- **Context** shows ACP servers, MCP servers, Agent Skills, and AGENTS.md. It keeps
  ACP session ownership and transport
  configuration, MCP configuration and use, and harness-owned instructions/skills.
  Both Server tools guides are retired during their implementation refactor.
- **Usage > CLI** owns interactive/headless operation. Request receipts stays
  a supporting guide; the command manual lives under Reference. Common configuration-file mechanics belong to Routing's
  Configuration (YAML) guide. Self-driving, Interactive TUI, and Headless & Scripting are sections of
  the single CLI guide; receipts remain a supporting guide. The Self-driving guide
  owns Goal coordination and completion semantics; Interactive TUI owns navigation, input
  scope, decisions, and result inspection. Headless & Scripting describes native BRO
  task execution, managed sessions, structured output, verification gates, and
  the pending full Goal automation contract. External one-prompt ACP invocation
  and its approval policies live in ACP servers. Keep each feature's YAML example in its guide.
- **Coding Agents** explains native harness launch configuration and product-specific
  connections. Native launch keeps the harness's interface and does not create a
  BRO Goal. Native launch support, ACP connectivity, and managed worker execution
  are separate capabilities. Link to Self-driving for Goal coordination, Model
  for inference sources, and Context for ACP/MCP behavior.
- **Usage > Responses API** explains the default generation interface and its
  request examples. **API reference** owns typed decisions and System One,
  Chat Completions/Messages compatibility, and generated endpoint schemas.
  Availability is stated per deployment.

### BRO design preview and merge validation

The Self-driving and Interactive TUI sections of the CLI guide describe the target product contract from
`006-BRO-Goal-Oriented-Workflow-PRD.md`, Draft v0.8 (2026-10-15), sections 1,
4, 6, 7, 8, 9, and 10. The CLI guide is at `/docs/usage/cli` and introduces the product
as BitRouter Orchestrator (BRO). Both sections are preview documentation pending the BRO refactor;
the PRD is not evidence that a released binary supports the behavior.

Before merging or removing the preview notices, validate the Goals entry for
`bro` / `bro code`, independent built-in execution, supported ACP workers, input
scope and in-flight steering, read-only Workflow, evidence-backed completion,
and pause/budget/recovery behavior against the implemented runtime. Confirm that
`bro code <agent>` is removed without silently interpreting its old argument as
Goal input. Check native launch and external `bro acp serve <agent>` independently.

Regenerate command references only after capturing a verified implementation's
CLI snapshot. Update the matching `cli-overlays/harnesses.md` explanations from
that verified command behavior before regenerating. The current reference retains the older ACP conversation
contract; do not rewrite it by hand or invent future flags or headless Goal
commands from the PRD. Keep external ACP invocation semantics separate from native BRO tasks.

Headless & Scripting's native examples are source-checked against the local BRO
refactor checkout's `apps/bitrouter/src/main.rs` (`TaskRunArgs`, `TaskAction`, and
`run_native_task`), `managed_task.rs`, `crates/bitrouter-orchestrator/src/turn.rs`,
and `docs/CLI.md`. This is static source evidence, not released-binary or live
provider validation. `task run` executes one native Turn; `task managed` retains a
native managed session. Neither establishes the full persistent Goal lifecycle.
Verify native argument parsing, output/exit behavior, permissions, verification,
and recovery against the eventual binary before removing the development notice.
A full Goal scripting contract must independently define creation/control,
identity, retry, budgets, observation, and completion; no future syntax is inferred
from 006 or from the existing one-prompt ACP flags.

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
than restating them. The Configuration (YAML) page in Routing covers common file mechanics. Feature guides
own their configuration examples. Self-hosting covers process supervision,
authentication, rollout, state, and OpenTelemetry exporter setup, capture, and sampling.

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

Four parts of the docs are generated at build time:

- **API reference** (`content/docs/reference/<tag>/`) — `pnpm generate:openapi`
  regenerates endpoints, families, and metadata from `openapi.yaml`. Root authored
  MDX files survive regeneration. Update ordering in `scripts/generate-openapi.mjs`.
- **CLI reference** (`content/docs/(guide)/cli/reference.mdx`) — `pnpm generate:cli`
  combines `.cli-snapshot.json` and `cli-overlays/*` into one manual. The index
  overlay supplies common setup, conventions, environment guidance, and the command
  map; group overlays supply section intros and `## @<command>` guidance. The
  generator rejects missing or duplicate command ownership. Preserve command
  anchors and capture a verified binary before changing the snapshot.
- **Changelog** (`content/docs/changelog.mdx`) — `pnpm generate:changelog` combines
  `content/changelog/*.mdx` into one newest-first page with stable release anchors.
  It also refreshes the latest-date data. Edit source release files and regenerate.

- **config reference** (`content/docs/configuration-reference.mdx`) —
  `pnpm generate:config` renders the committed `config-reference/schema.json`
  snapshot and `config-reference/index.md`. It also publishes the same schema at
  `public/schemas/bitrouter.config.schema.json`. `config-reference/source.json`
  records the upstream commit, schema version, date, and SHA-256 checksum.
  Builds are offline and deterministic for these artifacts. Use
  `pnpm snapshot:config --repo /path/to/bitrouter --ref <commit-or-tag>` to refresh
  from a committed upstream schema, review the source-checked prose at the same
  revision, then regenerate. Never edit snapshots or generated output by hand.
  `pnpm lint:config` checks for drift. This root page stays outside the collapsed
  API reference folder; Routing's Configuration (YAML) remains the workflow guide.
