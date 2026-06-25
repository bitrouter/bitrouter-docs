import { LLMS_PRODUCT_SUMMARY } from "./llms-shared";

const BASE_URL = "https://bitrouter.ai";

export const LLMS_TXT = `# BitRouter

${LLMS_PRODUCT_SUMMARY}

## Quickstart for Agents

If you are an AI agent setting up BitRouter, follow these steps:

1. Install via Agent Skills (recommended for skill-capable runtimes — Claude Code, Cursor, Codex, Copilot): run \`npx skills add bitrouter/bitrouter\`, then invoke the skill ("Set up BitRouter for me"). The skill runs the wizard, defaults to BitRouter Cloud, and verifies the connection autonomously — no further input needed.
2. Or install the CLI directly (pick one): \`curl -fsSL https://bitrouter.ai/install.sh | sh\` · \`npm install -g bitrouter\` · \`brew install bitrouter/tap/bitrouter\` · \`cargo install bitrouter\`. Then run \`bitrouter\` to launch the setup wizard/TUI. It asks Cloud or local (default Cloud); choose local to BYOK with your own provider keys, which starts the proxy at http://localhost:8787.
3. Route your runtime through BitRouter with zero code changes — just point the base URL: local proxy \`http://localhost:8787/v1\` (OpenAI-compatible) or \`http://localhost:8787\` (Anthropic-compatible); hosted Cloud \`https://api.bitrouter.ai/v1\`. Models use \`provider/model\` ids, e.g. \`openai/gpt-4o\`, \`anthropic/claude-sonnet-4\`.
4. Verify: \`curl http://localhost:8787/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"openai/gpt-4o","messages":[{"role":"user","content":"Hello!"}]}'\`

References:
- Full quickstart walkthrough: ${BASE_URL}/docs/get-started/quickstart
- Agent Skills (install/configure BitRouter from inside an agent): https://github.com/bitrouter/agent-skills
- BitRouter CLI (proxy, setup wizard, TUI dashboard): https://github.com/bitrouter/bitrouter
- Per-runtime setup recipes (Claude Code, Codex, OpenClaw, OpenCode, and more): ${BASE_URL}/docs/integrations

## Getting Started

- [Introduction](${BASE_URL}/docs): What BitRouter is, what's in the box, and why we're building it
- [Quick Start](${BASE_URL}/docs/get-started/quickstart): Install via Agent Skills or the CLI and start routing in under a minute
- [Comparison](${BASE_URL}/docs/get-started/comparison): How BitRouter differs from OpenRouter, LiteLLM, and other LLM gateways
- [Agent Skills](https://github.com/bitrouter/agent-skills): Drop-in skills that teach an agent to install and use BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, setup wizard, and TUI dashboard

## Routing

- [Model Fallback](${BASE_URL}/docs/features/model-fallback): Automatic fallback across models when an upstream fails
- [Provider Selection](${BASE_URL}/docs/features/provider-selection): How models resolve to upstream providers, with cost and performance policies

## Features

- [Workspaces](${BASE_URL}/docs/cloud/workspaces): Per-team routing tables, keys, and observability
- [BYOK](${BASE_URL}/docs/cloud/byok): Bring your own provider keys at zero cost; auto-detected from env vars
- [OpenTelemetry](${BASE_URL}/docs/features/opentelemetry): Self-run OTLP export — traces and metrics of every request, pushed to a Collector, Honeycomb, Grafana, or Datadog
- [Cloud Tracing](${BASE_URL}/docs/cloud/tracing): Hosted Activity view — spend, token, and latency KPIs plus a per-request log, nothing to operate
- [Guardrails](${BASE_URL}/docs/features/guardrails): Inspect, warn, redact, or block risky content at the proxy layer

## API Reference

- [API Overview](${BASE_URL}/docs/reference): Base URL (\`https://api.bitrouter.ai\`), auth, and conventions
- [OpenAI-Compatible](${BASE_URL}/docs/reference/openai-compatible/createChatCompletion): \`/v1/chat/completions\` — drop-in for any OpenAI SDK
- [Anthropic-Compatible](${BASE_URL}/docs/reference/anthropic-compatible/createMessage): \`/v1/messages\` — drop-in for the Anthropic SDK
- [Discovery](${BASE_URL}/docs/reference/discovery/listModels): List models, providers, and routing tables
- [BYOK](${BASE_URL}/docs/reference/byok/getEncryptionPubkey): Encrypted upload of upstream provider keys
- [Billing](${BASE_URL}/docs/reference/billing/createCheckoutSession): Stripe checkout for prepaid credits
- [Webhooks](${BASE_URL}/docs/reference/webhooks/stripeWebhook): Stripe webhook receiver
- [Health](${BASE_URL}/docs/reference/health/ping): Liveness probe

## Cookbook (Agent Recipes)

- [Cookbook Index](${BASE_URL}/docs/integrations): All supported agent runtimes with setup-time matrix
- [Claude Code](${BASE_URL}/docs/integrations/agents/claude-code): Route Claude Code through BitRouter
- [Codex](${BASE_URL}/docs/integrations/agents/codex): Route OpenAI Codex through BitRouter
- [OpenClaw](${BASE_URL}/docs/integrations/agents/openclaw): Route the OpenClaw multi-channel agent
- [Opencode](${BASE_URL}/docs/integrations/agents/opencode): Route the provider-agnostic Opencode runtime

## Open Network

- [For Providers](${BASE_URL}/docs/guides/register-as-a-provider): Permissionless provider registration via the open [provider-registry](https://github.com/bitrouter/provider-registry); list an OpenAI- or Anthropic-compatible endpoint and earn per-request payment via x402/MPP

## Optional

- [llms-full.txt](${BASE_URL}/api/docs/llms-full.txt): Complete documentation as plain text for ingestion
- [Blog: Introducing BitRouter](${BASE_URL}/blog/introducing-bitrouter): Long-form launch post
`;
