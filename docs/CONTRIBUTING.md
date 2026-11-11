# Contributing to the docs

The published documentation site ([bitrouter.ai/docs](https://bitrouter.ai/docs))
is rendered from this repo — docs are committed directly here under
`content/docs/` and ship with the site.

## What publishes

Documentation uses four native Fumadocs Layout Tabs:
**Guides, CLI, API, Integrations**.
`content/docs/meta.json` lists their root folders in that order. Each root's
`meta.json` has `root: true`, and Notebook Layout uses `tabMode="navbar"`.
The shared site Header composes the native Notebook Header for the desktop tab
row; the native sidebar supplies the section dropdown on smaller screens.
Guides contains Overview, Market, Router, Model, and Reference.
CLI, API, and Integrations have independent sidebars. Integrations retains the
existing five coding-agent connection guides. Changelog is the last entry in
Guides > Overview, after Comparison, and opens its existing single page.
Content ownership is:

1. **Overview** — Quickstart, How BitRouter Works, Elastic Inference,
   then a collapsed Comparison folder and Changelog. The retired Models URL redirects to API
   model discovery at `/docs/reference#model-discovery`; selector forms belong to
   Virtual Models. The catalog snapshot and model detail pages remain separate. Elastic Inference is an authored overview
   of the optional cloud service, with price/time/model flexibility, the
   electricity-exchange vision, illustrative buy/sell limit-order tables and JSON,
   and next-step links to the five top-level Market entries in sidebar order. The concise
   description replaces a duplicate introduction.
   An opening info Callout explains the optional Cloud service and standalone OSS
   path, linking to Auto Router before the What section.
   JSON payloads are labeled provisional; no released HTTP endpoint is implied.
   The approved copy is prepared for publication after deployment; its prose
   does not verify live availability. Purchase validity and completion timing
   remain distinct. The retired Spot and Forwards URLs redirect to it.
   `/docs/overview/elastic-inference` is canonical; the previous
   `/docs/overview/flex-inference` URL redirects directly here. Preserve its
   historical What/Why section anchors and `/pricing#flex-inference` anchor.
   Enterprise remains a linked deployment-decision entry.
2. **CLI** — Getting Started, Configuration, Run & Inspect, Cloud Management,
   Command Reference. It owns router setup, operation, inspection, and Cloud
   management. The three generated workflows use `/docs/cli/getting-started`,
   `/docs/cli/run-inspect`, and `/docs/cli/cloud-management`. Configuration is
   visible here at its existing `/docs/routing/configuration` URL. Command Reference
   retains `/docs/usage/cli` and every captured command.
3. **API** — Getting Started (`/docs/reference`), Authentication
   (`/docs/reference/authentication`), Inference APIs (`/docs/usage/responses-api`),
   then collapsed Endpoint Reference. Inference APIs combines Responses, Chat
   Completions, Messages, and GenerateContent; preserve old anchors and redirect
   the retired compatibility guide directly. Decisions stays a hidden supporting
   local-interface guide with explicit hosted-availability boundaries.
4. **Integrations** — DeepSeek Harness, Hermes Agent, OpenClaw, OpenCode, and Pi,
   in alphabetical order. These five authored guides follow the development `bro connect`
   CLI in BitRouter PR #1016 and qualify availability separately from the installed
   release and captured CLI reference. Claude Code
   and Codex retain their authored integration guides but are temporarily hidden
   from the sidebar; their existing URLs remain accessible.
5. **Market** — Price-Time Priority, Inference Types, Inference Tiers, Buy
   Inference, and Sell Inference, in that order. Price-Time Priority covers
   purchase timing, price caps, and the approved public pricing terms.
   Buy Inference and Sell Inference retain their pricing and State Affinity links.
   Inference Types is one page with On-demand, Interruptible, and Reserved sections.
   Reserved is Coming soon. Inference Tiers covers Unverified, Verified, and
   Secured as a market design preview. The former Market Pricing URL redirects to
   Price-Time Priority. The former On-demand and Interruptible child URLs redirect
   to their sections. The retired Priority, Standard, and Flex pages, former
   Service Tiers URLs, and `/docs/market/market-data` redirect to Inference Types.
   Auto-bidding and Verify Inference are retired, redirecting to Buy Inference
   and `/enterprise#verification`, respectively.
6. **Router** — Auto Router, Workload Optimization, State Affinity, Routing Traces,
   and Strategies, in that order. Workload Optimization and State Affinity are Coming soon.
   Context Routing remains a supporting guide linked from Strategies;
   Configuration is visible under CLI at its existing URL.
7. **Model** — Model Fallbacks, Virtual Models, Structured Output, BYOK & Subscriptions,
   and Local Models. Structured Output is a Coming soon placeholder.
8. **Reference** — Privacy Policy, Terms of Service, Troubleshooting.
   The two policies are authored docs pages; Troubleshooting is Coming soon.
   Configuration fields remain embedded in Configuration under CLI.

Desktop, Usage MCP, Agentic Payment, and Context remain outside first-release
scope. Their HTML and Markdown URLs redirect to retained task guides. Desktop
and Web lead to CLI Getting Started; MCP leads to Responses; payment leads to Buy Inference.

`(documentation-nav)/meta.json` extracts the five Guides groups from
their existing meta-only `*-nav` folders using relative `...../folder` entries.
Their labels are native separators, not pages or collapsible folders.
`(cli-nav)`, `(api-nav)`, and `(integration-nav)` are sibling root folders with direct links to their
canonical pages. API also references `../reference` for its generated endpoint
folder. These metadata projections do not move or copy authored pages or URLs.

Comparison under Overview and Endpoint Reference under API are the explicit hierarchy
exceptions. Both are native folders with `collapsible: true`
and `defaultOpen: false`. Comparison has no index page: its header only expands
or collapses its four canonical comparison guides. Keep competitor claims sourced
and qualified.

API reference retains `content/docs/reference/` and its generated endpoint URLs.
Only the outer Endpoint Reference folder collapses: generated tag folders are extracted
with `...folder` beneath native separators, so no family needs a second expansion.
New operations and tags stay visible automatically; undeclared tags are inferred
from operations, and untagged operations use an Other endpoints group.
Getting Started, Authentication, and the supporting Decisions guide are
hand-authored root files excluded from the endpoint folder. `(api-nav)/meta.json`
projects the first two and Inference APIs into API. Decisions stays linked from content. Change generated ordering through
`scripts/generate-openapi.mjs`; builds replace generated metadata.

All four CLI pages are generated by `scripts/generate-cli.mjs`. Edit
`cli-overlays/guide.md`, `run-inspect.md`, and `cloud-management.md` for their
respective workflow pages. `index.md` and `<group>.md` own the command manual at
`/docs/usage/cli#command-reference`; `legacy-workflows.md` retains the old workflow
anchors with a retirement notice and links to current operational guides. Never hand-edit the generated pages.

The Configuration (YAML) page at `content/docs/(guide)/routing/configuration.mdx`
is also generated in full. Edit `config-reference/guide.md` for the setup workflow
and `config-reference/index.md` for the schema reference introduction. The field
reference follows the guide under `/docs/routing/configuration#configuration-reference`.
Both generators preserve authored guide headings and nest reference headings
without changing their anchors or fenced examples. `pnpm lint:docs` checks the
source guides for the import-free authoring contract.
Changelog is generated at `content/docs/changelog.mdx` by
`scripts/generate-changelog-latest.mjs`. Keep release input files in
`content/changelog/` for sync, curation, announcements, and RSS/Atom. All releases
render on `/docs/changelog`; old `/changelog` and per-release URLs redirect into
this page. The established RSS/Atom endpoints remain available. Do not hand-edit
the generated changelog page.

Three rules keep the layout tabs consistent:

1. Keep `"root": true` only on the four approved meta-only layout folders.
   Do not introduce additional tabs or nested root folders by default.
2. Keep source paths aligned with the information architecture. When a page
   changes jobs, move it and update its internal links and URL-history target.
3. A page should appear in one user-facing group. Cross-link it from content
   when another journey needs it instead of duplicating the navigation entry.

### Keep non-Reference sections flat

Source pages can remain nested where that keeps related files together, but the
public sidebar is a flat list beneath each section separator, with Comparison
and Endpoint Reference as explicit exceptions. Every public guide must be listed
exactly once in the matching `*-nav/meta.json`, including the four Comparison
children. `scripts/check-docs.mjs` checks sidebar coverage. Cards and inline links provide additional
discovery, not a substitute for sidebar visibility.
Rare intentional exceptions must be assigned to `HIDDEN_SIDEBAR_SECTIONS` in
`lib/docs-navigation.mjs`, shared by the sidebar and lint. The Cloud placeholder remains accessible at
`/docs/usage/cloud` without a sidebar entry. The retired Models page is absent
from canonical discovery; API owns catalog discovery and Virtual Models owns selector forms. BitRouter Agent and the
retained Coding agents guide remain hidden. The shared `bro [harness]` launch
guide also remains accessible at `/docs/integration/bro-harness` without a sidebar entry.
Claude Code and Codex are temporarily hidden from the sidebar at the user's request;
their existing pages and URLs remain intact. The supporting Request receipts page has no sidebar entry; feature guides retain
its links. Context Routing and Configuration (YAML) are intentional supporting-guide
exceptions in Router: Context Routing is hidden; Configuration is shown under CLI.
Both remain linked from Strategies.
Self-hosting is also omitted from Overview navigation and remains accessible through
deployment-related content links.
Router's five main guides and Local Models are public sidebar pages. Supporting
Context Routing and Configuration guides remain discoverable through Strategies,
search, sitemap, and full-text ingestion. Retained compatibility guides carry
`noindex` metadata while remaining directly readable.

Use this boundary when classifying content:

- **Market** follows Overview and precedes Router within Guides. It owns pricing, inference
  types and tiers, buying and selling inference, and future trading, delivery, and
  settlement guides. Its order is Price-Time Priority, Inference Types, Inference
  Tiers, Buy Inference, and Sell Inference, all canonical under `/docs/market/`.
  Price-Time Priority covers purchasing constraints and the approved commercial
  terms. Buy Inference and Sell Inference retain their pricing boundaries and
  State Affinity links. Inference Types covers On-demand, Interruptible, and
  Reserved, with Reserved marked Coming soon. Inference Tiers describes
  Unverified, Verified, and Secured as a design preview. Auto-bidding and Verify
  Inference are retired. The Agentic Payment guide is omitted from the first release.
  Connecting an endpoint belongs to Model; offering its inference for sale belongs
  to Market. Overview's Elastic Inference introduces the product concept;
  Market owns the operational workflows.
- **Router** contains Auto Router, Workload Optimization, State Affinity, Routing
  Traces, and Strategies, in that order, under `/docs/routing/`. Auto Router owns
  setup, binding initialization, per-call overrides, and serving-route inspection.
  Workload Optimization separates the Coming soon recurring-workload learning
  feature from the existing policy lifecycle: artifacts, runtime adequacy,
  objective evaluation evidence, reproducibility, and reviewed publication.
  Collecting observations or deriving a candidate does not automatically publish it.
  Routing Traces follows router behavior across the available workflow trajectory:
  requested and serving routes, correlation, upstream attempts, decision evidence,
  usage, and coverage limits. Use receipts and OTLP export; do not imply a unified
  timeline UI or complete visibility into an external harness. The former Auditable
  Policies URL redirects to Routing Traces, with old section anchors linking to
  their migrated Workload Optimization sections. Legacy policy/evaluation redirects
  target those sections directly. Strategies owns selector resolution, the inference
  pool, candidate eligibility, filters, variants, and ordering limits. Routing Rules
  redirects to Strategies; Model Variants redirects to its Variants section.
  State Affinity is Coming soon; Market owns its trading applications. Context
  Routing remains a hidden supporting guide; Configuration is visible under CLI.
  Preserve historical section anchors on Auto Router and Strategies. Routing uses
  already-accessible sources and does not purchase supply or grant access. Keep
  rule examples in Strategies and policy lifecycle examples in Workload Optimization.
  External harnesses retain ownership of their history and compaction. Decisions
  remains a supporting local-interface guide linked from API and Router.
- **Model** owns source connections and callable interfaces: provider credentials,
  subscription accounts, custom endpoints, self-run inference, named model
  endpoints, request defaults, protocol compatibility, and fallback configuration.
  Its five guides, in order, are Model Fallbacks, Virtual Models, Structured Output,
  BYOK & Subscriptions, and Local Models, under `/docs/models-routing/`.
  Structured Output is Coming soon; the existing API response-format guide remains
  in Responses API. Named routing variants belong to Router's Strategies.
  Custom Provider is retired and redirects to BYOK's custom endpoints section.
  Model and provider remain distinct technical concepts in the same navigation group.
  Keep feature-specific configuration examples with their owning guide and link
  from Router when explaining execution.
- **First-release scope** omits the Context group and its five authored guides:
  ACP servers, MCP servers, Agent Skills, Server tools, and Context Switcher.
  They are absent from published content, search, and canonical discovery. Their
  HTML and Markdown URLs redirect directly to the retained CLI/configuration
  references, Quickstart skill setup, or supporting Context Routing guide.
  Update historical aliases to the final destination. The supporting Router guide
  `/docs/routing/context-routing` and public read-only documentation MCP remain
  separate capabilities. Preserve source-faithful captured CLI and schema references.
- **CLI** owns setup, configuration-file mechanics, operation, inspection, and
  Cloud account management. Configuration keeps its existing URL and generated
  schema reference. Feature-specific settings stay in Router or Model. Routine
  scripting belongs in Run & Inspect and Cloud Management. Request receipts
  stays a supporting guide. BRO/Goal orchestration previews, Interactive, and
  Headless & Scripting are retired from first-release docs; retain direct HTML
  and Markdown redirects and fragment recovery without advertising those previews.
  Keep every source-faithful captured command in Command Reference.
- **Integrations** shows DeepSeek Harness, Hermes Agent, OpenClaw, OpenCode, and Pi
  in alphabetical order, with native-connection guides based on development PR #1016.
  The five independent-provider adapters preserve existing defaults and support
  repeated `--model` for an explicit ordered selector set. The first retains its
  primary native alias/display name. Updates replace the full set when model flags
  are supplied and preserve it otherwise; catalog checks cover every ID. Workflow
  bindings remain native, with no BitRouter binding wizard. Explain that strategies are defined in BitRouter
  and selected through native agent/profile/session/job model settings. Basic setup
  requires no self-driving extension or separate classifier; submitted request
  context is distinct from full native session observation. The retained Coding
  agents guide owns shared endpoint/authentication, lifecycle, and strategy-boundary
  details. Keep the captured CLI snapshot unchanged until a verified replacement is
  captured. Claude Code and Codex are temporarily hidden
  from the sidebar, with their authored guides and URLs retained. They cover prerequisites and one launch command,
  official local/Cloud proxy configuration, default model pools and customization,
  and Verify & troubleshoot. Claude Code pools contain only Claude models; Codex
  pools contain only GPT models. Example pools require explicit configuration and
  do not promise account access or install a routing policy. Keep Codex catalog
  metadata distinct from BitRouter model routing. The shared `bro [harness]` guide retains native
  harness launch configuration without a sidebar entry. Native launch keeps the harness's interface and does not create a
  BRO Goal. Native launch support, ACP connectivity, and managed worker execution
  are separate capabilities. Link to CLI for router operation and Cloud management, Model
  for named routes and inference sources, Market for buying and selling, and
  the CLI/configuration references for captured ACP/MCP commands and fields.
- **API > Inference APIs** explains the four supported generation protocols,
  with their own request and response shapes. Authentication owns caller credentials
  and scopes. Decisions / System One remains an advanced local guide with hosted
  availability explicitly unverified. Generated endpoint contracts stay in Endpoint Reference.

### First-release CLI scope

The public CLI guides focus on router and Cloud operation. BRO Goal coordination
and the former Interactive and Headless & Scripting previews are outside this
release. Keep legacy anchors as recovery links, without reintroducing the preview
copy. Captured command reference output remains source-faithful. A future BRO
workflow publication requires validation against its implemented runtime.

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
than restating them. The Configuration (YAML) page in Router covers common file mechanics. Feature guides
own their configuration examples. Self-hosting covers process supervision,
authentication, rollout, state, and OpenTelemetry exporter setup, capture, and sampling.

Folders under `content/docs/(guide)/` own their routes and local source
ordering. Public sidebar order comes from the `*-nav/meta.json` files, which
must expose the non-Reference source tree except for the explicit hidden-page
allowlist. `pnpm lint:docs` fails when a public page is missing, duplicated, or
points to a route that does not exist.

Privacy Policy and Terms of Service are hand-authored root docs pages at
`/docs/privacy-policy` and `/docs/terms-of-service`, listed directly under Reference.
Their existing policy prose is preserved during the layout migration. The former
standalone site URLs redirect to these docs. Subprocessors remains a standalone
legal page. Data handling is retired and redirects to Privacy Policy.
Troubleshooting is a root docs page at `/docs/troubleshooting`, currently Coming soon.

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

## Agent discovery

The complete `llms.txt` index, documentation sitemap entries, and full-text export
share `getCanonicalDocs()` and the policy in `lib/docs-visibility.ts`. Supporting
guides omitted from the sidebar still belong in this public inventory. Retained
compatibility pages remain reachable but are excluded from canonical discovery.
Curated task links precede the complete index, and model data has a separate JSON
catalog entry.

`pnpm build` ends with `scripts/check-agent-discovery.mjs`. It compares the built
index against every canonical documentation URL in the sitemap, requires each
page exactly once in the complete list, and verifies the emitted Markdown and
linked section anchors. `pnpm lint:agent-index` repeats that check after a build.
The report at `.next/agent-discovery-report.json` separates exhaustive docs
coverage from model detail pages and other site pages; model pages do not count
toward the documentation denominator.

See [Maintaining agent readiness](AGENT_READINESS.md) for change-based verification,
the live HTTP/MCP command, external scans, and the required evidence handoff.

## Pricing language

Use three commercial options consistently: OSS Self-hosted (no BitRouter fee),
Cloud ($0.01 per million processed tokens — Early access pricing), and Enterprise
(custom terms). Cloud Auto Routing with BYOK and Elastic Inference share the
same platform fee. Processed usage is actual input + output tokens, accumulated
across requests and counted once per request, including routing into Elastic.
Model inference charges are separate; Elastic adds supplier charges to the same
Cloud platform fee, with no percentage-based transaction fee. Buyer caps cover
both charges at the full output limit, while estimates use expected output.
Catalog rates remain supplier rates before platform fees; market buyer quotes
include $0.01 per million total tokens. Keep settlement fees token-based and
preserve supplier-based volume, slippage, and the independent 5% liquidity band.
The homepage shows one Cloud rate, a short self-hosting message, and the welcome
offer. Pricing presents BYOK/Elastic as two usage paths and compact OSS/Enterprise
entries without a second Enterprise section. The former model-market promotional
block stays removed.
Payment-processing fees are separate. Do not invent token floors, minimums,
cached-token discounts, retry/failed-request billing rules, or new refund terms.

New Cloud accounts receive a one-time $10 welcome credit toward platform fees,
covering one billion processed input + output tokens at the current early access
rate. Keep provider inference charges explicitly separate wherever this offer is
promoted. The website does not grant credit or read an account balance.
The credit is not a monthly allowance. Do not invent expiry or refund rules or
change existing refund commitments. Keep the homepage, Pricing/FAQ, metadata,
and LLM discovery consistent with `CLOUD_WELCOME_CREDIT`.

Pricing has no calculator or fictional savings explorer. Defer cost or performance
comparisons until real supplier prices and service conditions are available.

`lib/commercial-pricing.ts` supplies website options; authored docs use the same
terms. These publication changes do not verify deployed billing behavior.

## Enterprise positioning

The homepage trust section and Enterprise page pair open provider participation
with verified inference. The homepage connects illustrative provider nodes under
“Permissionless” to a per-request model-specification checklist under “Trustless,”
with one Enterprise link. Label the flow as illustrative, stack it on narrow
screens, and preserve `/#trust` and the legacy `/#privacy` anchor. The nodes and
checks are not live provider inventory or verification results.
Providers meet open technical requirements without case-by-case
approval. Every inference request on the BitRouter platform is verified against
its declared model version, weights, and precision, with end-to-end request and
response evidence. These are user-confirmed product claims; the website does not
implement or validate the verification service. Arbitrary sources connected to
the OSS router do not acquire attestation automatically.

Enterprise explains suitable workflows: Background agents, Evaluation &
distillation, and Batch pipelines. Distillation refers to inference for generating
distillation data, not a managed training service. Inference capacity reservations
are in alpha testing, presented in a callout linked to the contact form without
capacity guarantees, reservation prices, or SLA claims. Verification scope lives
in the FAQ at `/enterprise#verification`, not in a separate section.
Describe actual capabilities without fabricated reports, hashes, statuses, or
verifier endpoints. Privacy and self-hosting are supporting topics. Preserve
the `/#privacy` and `/enterprise#enterprise-self-hosting` anchors, existing privacy
commitments, custom Enterprise pricing, and contact-form delivery behavior.

## Adding a page

1. Create `content/docs/(guide)/<section>/<name>.mdx`.
2. Add it to the source section's `meta.json` when that local ordering is used.
3. Add its canonical URL link to the appropriate `*-nav/meta.json`; every public
   non-Reference page must appear in the sidebar exactly once. If the product
   decision is to hide it, assign the route to `HIDDEN_SIDEBAR_SECTIONS` in
   `lib/docs-navigation.mjs` instead. The layout projection retains its native
   section context while the sidebar Item slot omits the link.
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
- **CLI workflows and command manual** — `pnpm generate:cli`
  publishes the three workflow inputs (`guide.md`, `run-inspect.md`,
  `cloud-management.md`) separately. The command manual combines `index.md`,
  command overlays, `.cli-snapshot.json`, and `legacy-workflows.md`. Author changes
  in those inputs; never hand-edit the published pages. Command and group anchors stay stable.
  The generator rejects missing or duplicate command ownership. Capture and
  verify a binary before changing the snapshot.
- **Changelog** (`content/docs/changelog.mdx`) — `pnpm generate:changelog` combines
  `content/changelog/*.mdx` into one newest-first page with stable release anchors.
  It also refreshes the latest-date data. Edit source release files and regenerate.

- **Configuration page** (`content/docs/(guide)/routing/configuration.mdx`) —
  `pnpm generate:config` combines the authored workflow in `config-reference/guide.md`,
  reference prose in `config-reference/index.md`, and the pinned schema field tables.
  It also publishes the same schema at `public/schemas/bitrouter.config.schema.json`.
  `config-reference/source.json` records the upstream commit, version, date, and
  SHA-256 checksum. Builds are offline and deterministic for these artifacts.
  Use `pnpm snapshot:config --repo /path/to/bitrouter --ref <commit-or-tag>` to refresh
  the snapshot, review matching prose, and regenerate. Never edit snapshots or
  generated output by hand. `pnpm lint:config` checks for drift. Workflow and schema
  reference are one Router page; the former standalone reference URL redirects there.

## Blog, changelog and feedback integrations

Blog posts live in `content/blog/*.mdx`. Use an ISO `date`, `tags`, `authors`
(keys registered in `lib/blog.ts`), and optionally a local cover `image`. Unknown
registered-author keys display as names. Keep the singular `author: kelsen` or
`author: archer` as the primary publication account for the existing blog-to-X
workflow; `authors` controls the displayed byline. Legacy posts without `authors`
fall back to `author`, and missing publish dates fall back to the Git date.
Use local images by default; allow specific remote hosts in `next.config.ts`
before using remote covers or avatars. The post filename is its URL slug; avoid
the reserved `tags` and `llms.txt` names. Tags have their own index and pages.
Each post exposes `.md` and content negotiation; `/blog/llms.txt` is a separate
blog index and does not change the canonical documentation denominator.

Changelog remains one page at `/docs/changelog`, under Guides > Overview. Its Fumadocs timeline uses the
curated `content/changelog/` collection and the generated aggregate page's TOC
for heading IDs. Keep generation and editorial significance checks: do not replace
these files with live, unreviewed GitHub release bodies. RSS/Atom GUIDs and old
release redirects remain stable. Verify historical anchors after timeline changes.

Page and selected-text feedback use the Fumadocs components and `remarkBlockId`.
Heading anchors are unchanged. Block IDs depend on content and order; feedback
includes the selected quote and reported page revision, rather than treating a
block ID as a permanent identifier. GitHub App settings and the `Docs Feedback`
discussion category are required for delivery. Test delivery with a mocked GitHub
adapter; do not publish test feedback to the repository.

The public documentation MCP endpoint stays at `/mcp`. Native Fumadocs tools
`list_pages`, `get_page`, and `search` use the canonical source and shared Markdown
renderer; compatibility tools `search_docs`, `get_doc`, and `lookup_model` remain.
The `bitrouter-docs://llms-index` resource and `list_pages` must match `/llms.txt`.
WebMCP follows the Fumadocs CLI feature and registers `search_docs`, `read_page`,
and `open_page` only when `document.modelContext` exists. Registration is scoped
to the component lifecycle. Reads/navigation stay under `/docs` on the current
deployment, including when an agent supplies a production URL while on staging.
Browser support is experimental; HTTP Markdown and MCP remain independently usable.
