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
- Full quickstart walkthrough: ${BASE_URL}/docs/overview/quickstart
- Agent Skills (install/configure BitRouter from inside an agent): https://github.com/bitrouter/agent-skills
- BitRouter CLI (proxy, setup wizard, TUI dashboard): https://github.com/bitrouter/bitrouter
- Per-runtime setup recipes (Claude Code, Codex, OpenClaw, OpenCode, and more): ${BASE_URL}/docs/integrations

## Getting Started

- [Introduction](${BASE_URL}/docs): What BitRouter is, what's in the box, and why we're building it
- [Quick Start](${BASE_URL}/docs/overview/quickstart): Install via Agent Skills or the CLI and start routing in under a minute
- [Comparison](${BASE_URL}/docs/overview/bitrouter-vs-openrouter): How BitRouter differs from OpenRouter, LiteLLM, and other LLM gateways
- [Agent Skills](https://github.com/bitrouter/agent-skills): Drop-in skills that teach an agent to install and use BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, setup wizard, and TUI dashboard

## Models & Routing

- [Model Fallbacks](${BASE_URL}/docs/models-and-routing/model-fallback): Automatic fallback across models when an upstream fails
- [Provider Selection](${BASE_URL}/docs/models-and-routing/provider-selection): How models resolve to upstream providers, with cost and performance policies
- [Virtual Model](${BASE_URL}/docs/models-and-routing/virtual-model): Define a named model of your own — base model, prompt, params, and routing rules behind \`@name\`
- [Model Variants](${BASE_URL}/docs/models-and-routing/model-variants): Append \`:cost\`, \`:latency\`, or \`:throughput\` to a model id to pick a ranking axis inline
- [Bring Your Own Model](${BASE_URL}/docs/models-and-routing/bring-your-own-model): Put a model you serve yourself behind BitRouter and route to it like any hosted model
- [Bring Your Own Provider](${BASE_URL}/docs/models-and-routing/bring-your-own-provider): Route through your own provider account at list price, with no rev share or per-token fee
- [Structured Outputs](${BASE_URL}/docs/models-and-routing/structured-outputs): Enforce a JSON schema across every provider, with the protocol translation handled for you
- [Guardrails](${BASE_URL}/docs/models-and-routing/guardrails): Named regex rules that block or redact matching content in requests and responses

## Tool Calling

- [MCP Gateway](${BASE_URL}/docs/usage/mcp-gateway): One endpoint in front of many MCP servers and Agent Skills — uniform auth, merged discovery, one policy point
- [Server Tools](${BASE_URL}/docs/models-and-routing/tool-calling/server-tools): Move the tool-calling loop into BitRouter — declare tools, and the router executes and re-calls until the model is done
- [Advisor](${BASE_URL}/docs/models-and-routing/tool-calling/advisor): Let a fast model escalate one hard sub-question to a stronger model mid-generation
- [Sub-agent](${BASE_URL}/docs/models-and-routing/tool-calling/subagent): Delegate a self-contained task to a cheaper worker model that returns only its result
- [Fusion](${BASE_URL}/docs/models-and-routing/tool-calling/fusion): A panel of models answers in parallel, a judge compares them, and your model writes the final reply
- [Web Search](${BASE_URL}/docs/models-and-routing/tool-calling/websearch): A built-in \`web_search\` server tool that gives any routed model a search, on a backend you bring keys for
- [Web Fetch](${BASE_URL}/docs/models-and-routing/tool-calling/web-fetch): A built-in \`web_fetch\` server tool that turns a URL into clean page content for any routed model

## Evals & Tracing

- [OpenTelemetry](${BASE_URL}/docs/evals-and-tracing/opentelemetry): Self-run OTLP export — traces and metrics of every request, pushed to a Collector, Honeycomb, Grafana, or Datadog
- [Cloud Tracing](${BASE_URL}/docs/evals-and-tracing/tracing): Hosted Activity view — spend, token, and latency KPIs plus a per-request log, nothing to operate
- [Evaluation](${BASE_URL}/docs/evals-and-tracing/evaluation): Per-request outcome signals and cost metering today, with an objective-scored eval engine landing on top

## API Reference

- [API Overview](${BASE_URL}/docs/reference): Base URL (\`https://api.bitrouter.ai\`), auth, and conventions
- [OpenAI-Compatible](${BASE_URL}/docs/reference/openai-compatible/createChatCompletion): \`/v1/chat/completions\` — drop-in for any OpenAI SDK
- [Anthropic-Compatible](${BASE_URL}/docs/reference/anthropic-compatible/createMessage): \`/v1/messages\` — drop-in for the Anthropic SDK
- [Discovery](${BASE_URL}/docs/reference/discovery/listModels): List models, providers, and routing tables
- [Management](${BASE_URL}/docs/reference/management/listNamespaces): Workspaces — per-team routing tables, keys, and usage
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
