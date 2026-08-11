// Shared product summary for the llms.txt surfaces. Used by both
// /llms.txt (the curated index) and /api/docs/llms-full.txt (the full-text
// ingestion bundle) so the value proposition, key facts, and comparison never
// drift between the two files. Keep this in sync with the landing page copy.
export const LLMS_PRODUCT_SUMMARY = `> BitRouter is a context-aware LLM router that continuously improves your agent workflows. Send \`bitrouter/auto\` instead of a model name and BitRouter picks the model for every call — projecting each request onto where it sits in the agent's trajectory and how much risk it carries, then resolving that through a routing policy you own, review, and commit. A single local binary (or the hosted endpoint) gives any agent one endpoint to discover, route to, and pay for 50+ SOTA models across OpenAI, Anthropic, Google, and permissionlessly-registered open-source providers — a curated agentic/coding tier, not an everything-catalog. Built for autonomous agent loops with cross-protocol routing (OpenAI Chat + Responses, Anthropic Messages, Google Generative AI), runtime guardrails, CLI/TUI observability, and agent-native auth and payment (KYA identity, x402/MPP stablecoins). Self-host the Apache-2.0 binary with your own provider keys at zero cost, or use the hosted node — no KYC, no geo-restrictions.

## Key Facts

- One model id replaces every model decision: \`bitrouter/auto\` routes each call through your policy. Explicit ids stay passthrough — \`anthropic/claude-opus-4.8\` still means that model — so routing and pinning mix freely.
- Two loops improve routing. Online: live traffic is classified by outcome (deterministic, no LLM judge in the path), failures escalate a route immediately, and a cheaper route must succeed repeatedly before it earns traffic. Offline: \`bitrouter optimize\` runs your own workflow command twice — once as-is, once with exactly one routing change — and reports cost and quality deltas against a success contract you wrote. You publish or roll back; the policy lock is a file you commit.
- Four mechanisms built into the router: Reliability (transparent multi-provider failover mid-run, so one outage doesn't kill an agent run), Observability (full call-chain traces with cost attributed per run), Security (prompt-injection detection, PII/output redaction, and rate limits enforced once at the router), Efficiency (context-aware model-per-task routing — match each call to the right model by trajectory position and risk).
- Zero harness changes: drop-in proxy for any runtime with a custom OpenAI or Anthropic base URL. Local proxy at http://127.0.0.1:4356; hosted API at https://api.bitrouter.ai/v1.
- Zero-ops: single Rust binary, no Postgres/Redis/Docker, ~5ms p50 routing overhead.
- Free BYOK auto-detected from environment variables; failed requests are never billed.
- Pricing: 0% markup — you pay the exact upstream provider price on every model. Flat-rate Subscription for open-source models ($20/$100/$200 per month). Outcome-based pricing for teams (enterprise): BitRouter guarantees your loop stays under the budget you set and takes 20% of the savings it delivers, only on runs that clear your quality floor, and never more than it saved you. Self-host has no platform fee; failed requests are never billed.
- Apache 2.0, open-sourced; Cloud is opt-in.

## How BitRouter Compares

BitRouter, LiteLLM, and OpenRouter all route LLM traffic — BitRouter is the open-source one whose routing policy learns from your own workflows instead of staying as it shipped.

- Open source & self-hostable: BitRouter — Apache 2.0 single binary; LiteLLM — partial (Python + Postgres + Redis); OpenRouter — closed.
- Permissionless provider marketplace: BitRouter — yes, PR-based; LiteLLM — no; OpenRouter — curated only.
- Agent gateway (MCP / ACP / Skills + KYA + guardrails): BitRouter — built-in; LiteLLM — no; OpenRouter — no.
- Autonomous agent payments (x402 / MPP): BitRouter — yes; LiteLLM — no; OpenRouter — no.
- Multi-provider failover mid-run: BitRouter — automatic; LiteLLM — manual; OpenRouter — limited.
- Routing overhead: BitRouter — ~5ms p50; LiteLLM — higher (Python GIL); OpenRouter — ~30ms.`;
