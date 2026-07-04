// Shared product summary for the llms.txt surfaces. Used by both
// /llms.txt (the curated index) and /api/docs/llms-full.txt (the full-text
// ingestion bundle) so the value proposition, key facts, and comparison never
// drift between the two files. Keep this in sync with the landing page copy.
export const LLMS_PRODUCT_SUMMARY = `> BitRouter is an open-source LLM router that optimizes your agent for cost and performance with every run — it sends routine calls to open models and pays frontier prices only for the calls that earn them, with zero harness changes. A single local binary that gives any agent one endpoint to discover, route to, and pay for 200+ models across OpenAI, Anthropic, Google, and permissionlessly-registered open-source providers. Point any runtime at it and every model call becomes reliable, traceable, secure, and cost-effective. Built for autonomous agent loops with cross-protocol routing (OpenAI Chat + Responses, Anthropic Messages, Google Generative AI), runtime guardrails, CLI/TUI observability, and agent-native auth and payment (KYA identity, x402/MPP stablecoins). Self-host the Apache-2.0 binary with your own provider keys at zero cost, or use the hosted node — no KYC, no geo-restrictions.

## Key Facts

- Four mechanisms built into the router: Reliability (transparent multi-provider failover mid-run, so one outage doesn't kill an agent run), Observability (full call-chain traces with cost attributed per run), Security (prompt-injection detection, PII/output redaction, and rate limits enforced once at the router), Efficiency (price-aware model-per-task routing — match each call to the right model by complexity).
- Zero harness changes: drop-in proxy for any runtime with a custom OpenAI or Anthropic base URL. Local proxy at http://localhost:8787; hosted API at https://api.bitrouter.ai/v1.
- Zero-ops: single Rust binary, no Postgres/Redis/Docker, ~5ms p50 routing overhead.
- Free BYOK auto-detected from environment variables; failed requests are never billed.
- Pricing: 0% markup — you pay the exact upstream provider price on every model. Flat-rate Subscription for open-source models ($20/$100/$200 per month). Outcome-based pricing for teams (enterprise): BitRouter guarantees your loop stays under the budget you set and takes 20% of the savings it delivers, only on runs that clear your quality floor, and never more than it saved you. Self-host has no platform fee; failed requests are never billed.
- Apache 2.0, open-sourced; Cloud is opt-in.

## How BitRouter Compares

BitRouter, LiteLLM, and OpenRouter all route LLM traffic — BitRouter is the open-source one built for cost and performance optimization.

- Open source & self-hostable: BitRouter — Apache 2.0 single binary; LiteLLM — partial (Python + Postgres + Redis); OpenRouter — closed.
- Permissionless provider marketplace: BitRouter — yes, PR-based; LiteLLM — no; OpenRouter — curated only.
- Agent gateway (MCP / ACP / Skills + KYA + guardrails): BitRouter — built-in; LiteLLM — no; OpenRouter — no.
- Autonomous agent payments (x402 / MPP): BitRouter — yes; LiteLLM — no; OpenRouter — no.
- Multi-provider failover mid-run: BitRouter — automatic; LiteLLM — manual; OpenRouter — limited.
- Routing overhead: BitRouter — ~5ms p50; LiteLLM — higher (Python GIL); OpenRouter — ~30ms.`;
