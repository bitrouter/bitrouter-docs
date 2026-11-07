# Maintaining agent readiness

This is the maintenance procedure for this repository. Follow the task's scope,
existing authorization, and the product/authoring rules in [AGENTS.md](../AGENTS.md)
and [CONTRIBUTING.md](CONTRIBUTING.md).

The reference is [AgentReady](https://www.agentready.org/), reviewed on
2026-11-07: Find → Read → Act. Its specification distinguishes MUST, SHOULD,
and MAY; scanner checks and scores can change independently. Markdown and AI
Catalog are adopted project capabilities even where the external specification
treats them as optional. Maintain their working behavior.

## Start each change at the owning source

Identify the affected user task, owning input, derived outputs, discovery
entries, and necessary checks before editing. Keep the scope proportional.

| Content or behavior | Owning source |
| --- | --- |
| Authored docs | Canonical `.mdx` files in `content/docs/`, subject to the generator exceptions below |
| API reference | `openapi.yaml`, its normalization/rendering code, and `pnpm generate:openapi` |
| CLI guide/reference | `cli-overlays/` and the verified captured snapshot; `pnpm generate:cli` |
| Configuration guide/reference | `config-reference/` authored inputs and verified upstream snapshot; `pnpm generate:config` |
| Shared pricing and product facts | Owning shared modules, including `lib/commercial-pricing.ts`; keep page copy, visible facts, JSON-LD, and LLM summaries consistent |
| Canonical inventory | `getCanonicalDocs()` in `lib/source.ts` and `lib/docs-visibility.ts` |
| Curated task links/product summary | `lib/llms-txt.ts` and `lib/llms-shared.ts` |
| Markdown and HTTP behavior | `lib/source.ts`, Markdown helpers, `proxy.ts`, route handlers, and `next.config.ts` |
| Docs MCP/search | `app/mcp/route.ts`, `lib/mcp/`, and the search source |

Regenerate derived files using their scripts. Snapshot capture requires a
verified upstream implementation, not guessed future flags or schema fields.
Check the resulting diff and keep unrelated snapshot/price refreshes out of the
change unless the task includes them.

## Find: maintain reachable entry points

- Every canonical doc belongs in the complete `llms.txt` index, documentation
  sitemap entries, and full-text export. Sidebar omissions do not exclude a page
  from this inventory. Compatibility exclusions share one explicit policy.
- Curated task links should lead directly to the current instructions, including
  authentication, first request, and compatible client examples where relevant.
- Preserve meaningful descriptions, absolute Markdown links, usable section
  anchors, homepage discovery links, AI Catalog, and the MCP server card.
- Moving or retiring a page requires the existing redirect-history procedure.
  Verify the final destination and status. Keep useful legacy URLs working.
- Keep model data in its separate structured catalog. Report canonical docs
  coverage, model detail/catalog coverage, and whole-site direct links separately.
- Review robots and bot protection when modifying access policy. A successful
  local request or spoofed user-agent does not establish access from a real
  agent's network; consult authorized server logs or a real external run when
  that distinction matters.

## Read: preserve answers in initial HTML and Markdown

Key setup, credential, pricing, limitation, and API example facts must be readable
in initial HTML. JSON-LD and hydration payloads supplement visible content.
Inspect affected pages through plain HTTP as well as the browser when changing
rendering or interaction. Browser success alone does not verify fetch-only access.

For routes with Markdown support, preserve useful content, fenced language-tagged
examples, all relevant tabs/callouts, portable links, and alternate links. Compare
changed facts, parameters, examples, and responses across representations.
Schema-derived Markdown should reflect the source contract; do not invent missing
examples or silently describe summaries as complete schema coverage.

Missing pages return real 404s with recovery links. HTTP redirects and errors
must preserve their actual meaning. MCP tool errors use MCP's `isError` contract;
an HTTP 200 carrying a valid MCP result/error is not a missing-page response.

Keep HTML and Markdown isolated in caches. Next currently overwrites HTML
`Vary`; the project uses `private, no-store` on negotiated variants. A replacement
must prove correct content types and content in both HTML→Markdown and
Markdown→HTML request order.

Staging document links, recovery links, search hits, and metadata use staging's
origin, while actual Cloud API examples retain the documented API host. Keep
staging `noindex` and production canonical intent intact.

## Act: preserve real task instructions

When changing setup/authentication instructions, verify the sequence: installation,
sign-in URL/device flow, credential creation and scope, environment variable,
correct base URL, first request, and supported client example. Identify which
steps were inspected, mocked, or really executed. Follow the task's existing
authorization for credential actions and billable calls.

This repository owns the website and public read-only docs MCP. Cloud inference,
account authentication, rate enforcement, and payment behavior belong to their
actual services. Publish only verified contracts and availability. A docs check
does not establish that an authenticated request, payment, or model execution
works. New protocol/action surfaces need real supported tasks and appropriate
scope; empty endpoints or invented compliance facts do not improve readiness.

## Choose checks for the change

Use the trigger table in `AGENTS.md`. For ordinary text edits, run docs lint and
inspect affected facts/links. For relevant runtime/generator changes, run the
appropriate tests and build. CI runs `pnpm test` and `pnpm build` for every PR.

```sh
pnpm lint:docs
pnpm test
pnpm build
```

`pnpm build` runs generators and authoring checks before compilation, followed by
`scripts/check-agent-discovery.mjs`. The latter compares built sitemap/index
inventories, checks each canonical doc exactly once, and validates linked
Markdown artifacts and HTML anchors. It writes
`.next/agent-discovery-report.json`. To recheck existing build output:

```sh
pnpm lint:agent-index
```

Do not repeat that command immediately after a successful build without a reason.
The artifact check does not verify live routing, cache behavior, WAF access, or
semantic equivalence of every HTML/API schema field.

## Run the maintained HTTP/MCP check

Start the built app in production mode in one terminal:

```sh
pnpm start --port 3000
```

For a normal local build, whose published links use the production origin:

```sh
pnpm check:agent-http http://localhost:3000 --environment local --site-origin https://bitrouter.ai --report .next/agent-http-local.json
```

For a local build made with staging environment variables, pass that build's
staging published origin instead. `--site-origin` describes the links expected
in responses; the first argument is the server to contact. The script maps those
site paths to the local server and refuses cross-origin navigation fetches.

After an authorized staging deployment, confirm the release commit and run:

```sh
pnpm check:agent-http https://bitrouter-docs-staging.up.railway.app --environment staging --exhaustive --report .next/agent-http-staging.json
```

The default check covers HTML/Markdown negotiation in both request orders,
Accept preferences, HEAD, cache isolation, script-free Quickstart facts,
honest Markdown/HTML 404s, environment-local recovery, robots/sitemap and
canonical index coverage, Markdown alternates, discovery manifests, OpenAPI's
real API host, and MCP handshake/tool discovery/search/section reading/index
equality/error behavior. It uses the installed MCP SDK for the protocol.

`--exhaustive` also fetches every indexed docs Markdown link/anchor, compares the
full-text inventory, reads the model catalog, and looks up one returned model
through MCP. Catalog/lookup checks depend on the live public model service.
These are read-only checks: they do not sign in, mint keys, invoke inference,
submit forms, or make payments. Any failed check produces a nonzero exit and a
failure report; recorded prior groups are not evidence that later groups passed.

Run the production mode only when the authorized task includes production
verification. Preserve existing release gates. A browser check is still needed
for layout/interactive changes, and affected facts need manual review beyond the
representative scripted probes.

## External scanners and real-agent tasks

Trigger these for discovery, authentication, protocol, or major workflow changes
and important releases. They are not required for every wording edit. Read current
tool documentation; record tool version and scope for reproducibility. Review the
AgentReady guide when revising maintenance policy or adopting a new protocol.

The existing focused AFDocs regression can verify discovery and links separately
from the unrelated content-size/API-parity backlog:

```sh
npx --yes afdocs@0.23.0 check https://bitrouter-docs-staging.up.railway.app --canonical-origin https://bitrouter.ai --checks llms-txt-exists,llms-txt-links-resolve,llms-txt-coverage --coverage-exclusions '/models/**,/,/enterprise,/pricing,/blog,/blog/**,/subprocessors' --max-links 200 --sampling none --format json
```

This is an explicit docs-only denominator. Review exclusions when site structure
changes; never exclude a canonical doc to hide an omission. Keep whole-site and
model-catalog findings visible in the separate coverage report. Update tool pins
deliberately when changing a reproducible baseline.

For general readiness, use the current suitable scanner, for example:

```sh
npx --yes is-agentic https://bitrouter-docs-staging.up.railway.app --json
```

Verify `scanned_at` against the actual deployment before treating a stored score
as fresh. Use the tool's documented refresh method if needed. Different tools
and different scope/denominators are not interchangeable scores.

A real-agent retrieval task should start at the homepage and find the official
setup/auth docs, correct API host, scoped credential procedure, and a first
request with a compatible client. Check the final answer against source facts,
not just the harness completion status. Record omissions and `partial` verdicts
accurately. Repeated runs are useful for workflow changes; mock execution and
retrieval tests do not prove authenticated product execution.

## Finish with evidence and a bounded handoff

Record the change, relevant commands/results, environment and deployed commit if
applicable, scanner time/version/scope, and unverified behavior. Do not hardcode
current page counts or scores into permanent instructions. Reuse successful
checks until a new change, failure, or unresolved concern warrants rerunning them.

Current limitations to consider when touching the relevant implementation:
generated API Markdown does not yet expose every nested request/response schema
field; the full CLI and configuration references can exceed an agent's fetch
budget. The compatibility `get_doc` tool supports section reads and caps full-page reads;
native `get_page` returns the complete page and can exceed an agent fetch budget.
Validate the affected content and report remaining gaps; unrelated maintenance
does not require implementing the entire backlog. Update this list when the
underlying capabilities change.
