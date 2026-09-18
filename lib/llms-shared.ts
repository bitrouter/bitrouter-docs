// Shared product summary for the llms.txt surfaces. Used by both
// /llms.txt (the curated index) and /api/docs/llms-full.txt (the full-text
// ingestion bundle) so the value proposition, key facts, and comparison never
// drift between the two files. Keep this in sync with the landing page copy.
export const LLMS_PRODUCT_SUMMARY = `> BitRouter is a context-aware LLM router that improves agent workflows through a routing policy you own, review, and commit. Send \`bitrouter/auto\` to invoke that policy, or send a logical \`provider/model\` id to choose a model while preserving provider fallback. A local binary or hosted endpoint gives an agent one cross-protocol routing surface for OpenAI Chat and Responses, Anthropic Messages, and Google Generative AI. The open-source binary also includes configurable guardrails, OpenTelemetry export, an MCP gateway for upstream tools, and local ACP adapters for agent sessions. Self-host the Apache-2.0 router with your own provider keys and no BitRouter inference fee, or use BitRouter Cloud as a managed endpoint.

## Key Facts

- One model id can replace repeated model decisions: \`bitrouter/auto\` routes each call through your policy. A slash-form id such as \`anthropic/claude-opus-4.8\` selects a logical model and preserves eligible provider fallback; a colon-form \`provider:model\` selector pins one configured provider.
- Two loops improve routing. Online: live traffic is classified by outcome (deterministic, no LLM judge in the path), failures escalate a route immediately, and a cheaper route must succeed repeatedly before it earns traffic. Offline: \`bro optimize\` runs your own workflow command twice — once as-is, once with exactly one routing change — and reports cost and quality deltas against a success contract you wrote. You publish or roll back; the policy lock is a file you commit.
- Four mechanisms built into the router: Reliability (ordered retry and multi-provider fallback), Observability (request and upstream-attempt traces with cost metadata), Security (configured block/redact rules plus virtual-key policies), and Efficiency (context-aware routing by trajectory position and policy).
- Runtimes that accept a custom OpenAI or Anthropic base URL can switch by changing the endpoint. The local proxy is http://127.0.0.1:4356; the hosted API is https://api.bitrouter.ai/v1.
- One Rust binary; basic local routing needs no external service. Persistent identity, metering, and adaptive evidence use SQLite by default, with Postgres and MySQL also supported.
- BYOK credentials can be detected from environment variables. Self-hosted BYOK traffic is billed by the upstream provider, not by BitRouter.
- Self-hosting is free: run the Apache-2.0 router with your own provider keys and pay providers directly, with no BitRouter platform or request fee. BitRouter Cloud runs the same routing engine as a managed endpoint; Cloud usage is billed at providers' published token prices with 0% token markup and no separate routing fee. Cost-per-session is a comparison unit, never a quoted price or billing unit. BitRouter does not package a separate enterprise suite today; teams with deployment, security, procurement, or support requirements can work directly with the founders as early design partners.
- Apache 2.0, open-sourced; Cloud is opt-in.

## How BitRouter Compares

BitRouter, LiteLLM, and OpenRouter all route LLM traffic. BitRouter is specifically organized around an open-source router plus an operator-owned, outcome-informed policy loop.

- Deployment: BitRouter — Apache 2.0 binary or managed Cloud; LiteLLM — importable Python SDK plus self-hosted proxy and commercial Enterprise offering; OpenRouter — hosted service.
- Model/provider extensibility: BitRouter's registry is open and changed through reviewed pull requests; hosted catalogs remain service-owned.
- Agent surfaces: BitRouter includes an MCP gateway and local ACP adapters; Agent Skills are installed and executed by the agent host.
- Routing policy: BitRouter can publish outcome-informed policy changes to a file under operator and Git control.`;
