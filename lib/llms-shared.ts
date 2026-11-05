// Shared product summary for the llms.txt surfaces. Used by both
// /llms.txt (the curated index) and /api/docs/llms-full.txt (the full-text
// ingestion bundle) so the value proposition, key facts, and comparison never
// drift between the two files. Keep this in sync with the landing page copy.
import { CLOUD_WELCOME_CREDIT } from "./commercial-pricing";

export const LLMS_PRODUCT_SUMMARY = `> BitRouter is a context-aware LLM router that improves agent workflows through a routing policy you own, review, and commit. Send \`bitrouter/auto\` to invoke that policy, or send a logical \`provider/model\` id to choose a model while preserving provider fallback. A local binary or hosted endpoint gives an agent one cross-protocol routing surface for OpenAI Chat and Responses, Anthropic Messages, and Google Generative AI. The open-source binary also includes configurable guardrails, OpenTelemetry export, an MCP gateway for upstream tools, and local ACP adapters for agent sessions. Self-host the Apache-2.0 router with your own provider keys and no BitRouter inference fee, or use BitRouter Cloud as a managed endpoint.

## Key Facts

- One model id can replace repeated model decisions: \`bitrouter/auto\` routes each call through your policy. A slash-form id such as \`anthropic/claude-opus-4.8\` selects a logical model and preserves eligible provider fallback; a colon-form \`provider:model\` selector pins one configured provider.
- Two loops improve routing. Online: live traffic is classified by outcome (deterministic, no LLM judge in the path), failures escalate a route immediately, and a cheaper route must succeed repeatedly before it earns traffic. Offline: \`bro optimize\` runs your own workflow command twice — once as-is, once with exactly one routing change — and reports cost and quality deltas against a success contract you wrote. You publish or roll back; the policy lock is a file you commit.
- Four mechanisms built into the router: Reliability (ordered retry and multi-provider fallback), Observability (request and upstream-attempt traces with cost metadata), Security (configured block/redact rules plus virtual-key policies), and Efficiency (context-aware routing by trajectory position and policy).
- Runtimes that accept a custom OpenAI or Anthropic base URL can switch by changing the endpoint. The local proxy is http://127.0.0.1:4356; the hosted API is https://api.bitrouter.ai/v1.
- One Rust binary; basic local routing needs no external service. Persistent identity, metering, and adaptive evidence use SQLite by default, with Postgres and MySQL also supported.
- BYOK credentials can be detected from environment variables. Self-hosted BYOK traffic is billed by the upstream provider, not by BitRouter.
- OSS self-hosting has no BitRouter fee; you pay infrastructure and provider costs directly. Cloud Auto Routing and Elastic Inference share one platform fee: $0.01 per million processed input + output tokens at early access pricing. Tokens are counted once per request, including when routing into Elastic Inference. Provider or supplier inference charges are separate. Elastic purchase caps include supplier charges and the platform fee; estimates use expected output while budget checks use the full output limit. There is no percentage-based transaction fee. Enterprise services and terms are custom. Third-party payment-processing fees may apply when adding funds.
- Apache 2.0, open-sourced; Cloud is opt-in.
- Enterprise use cases include background agents, evaluation and distillation data generation, and batch pipelines. Inference capacity reservations are in alpha testing; teams can discuss participation with their models, expected volume, and time window. No general-availability, guaranteed-capacity, or SLA claim is implied.
- Permissionless participation and trustless inference. Providers join the Elastic Inference market by meeting open technical requirements, without case-by-case approval. Every inference request on the BitRouter platform is verified against its declared model version, weights, and precision, with end-to-end request and response evidence. This platform verification claim does not imply that arbitrary endpoints connected to the OSS router acquire attestation automatically.
- ${CLOUD_WELCOME_CREDIT.description} ${CLOUD_WELCOME_CREDIT.noCardRequired} At current early access pricing, the $10 welcome credit covers platform fees for one billion processed input + output tokens. It is not a monthly allowance.

## How BitRouter Compares

BitRouter, LiteLLM, and OpenRouter all route LLM traffic. BitRouter is specifically organized around an open-source router plus an operator-owned, outcome-informed policy loop.

- Deployment: BitRouter — Apache 2.0 binary or managed Cloud; LiteLLM — importable Python SDK plus self-hosted proxy and commercial Enterprise offering; OpenRouter — hosted service.
- OSS runtime extensibility: BitRouter's integration registry accepts changes through reviewed pull requests. This is separate from provider participation in the Elastic Inference market.
- Agent surfaces: BitRouter includes an MCP gateway and local ACP adapters; Agent Skills are installed and executed by the agent host.
- Routing policy: BitRouter can publish outcome-informed policy changes to a file under operator and Git control.`;
