import { LLMS_PRODUCT_SUMMARY } from "./llms-shared";

const BASE_URL = "https://bitrouter.ai";

export const LLMS_TXT = `# BitRouter

${LLMS_PRODUCT_SUMMARY}

## Quickstart for Agents

If you are an AI agent setting up BitRouter, follow these steps:

1. Install via Agent Skills (recommended for skill-capable runtimes — Claude Code, Cursor, Codex, Copilot): run \`npx skills add bitrouter/bitrouter\`, then invoke the skill ("Set up BitRouter for me"). The skill runs the wizard, defaults to BitRouter Cloud, and verifies the connection autonomously — no further input needed.
2. Or install the CLI directly (pick one): \`curl -fsSL https://bitrouter.ai/install.sh | sh\` · \`npm install -g bitrouter\` · \`brew install bitrouter/tap/bitrouter\` · \`cargo install bitrouter\`. Then run \`bitrouter\` to launch the setup wizard/TUI. It asks Cloud or local (default Cloud); choose local to BYOK with your own provider keys, which starts the proxy at http://127.0.0.1:4356.
3. Route your runtime through BitRouter with zero code changes — just point the base URL: local proxy \`http://127.0.0.1:4356/v1\` (OpenAI-compatible) or \`http://127.0.0.1:4356\` (Anthropic-compatible); hosted Cloud \`https://api.bitrouter.ai/v1\`. Ask for \`bitrouter/auto\` to let BitRouter pick the model per call, or name a \`provider/model\` id to pin one, e.g. \`anthropic/claude-opus-4.8\`, \`anthropic/claude-haiku-4.5\`.
4. Verify: \`curl http://127.0.0.1:4356/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"anthropic/claude-haiku-4.5","messages":[{"role":"user","content":"Hello!"}]}'\`

References:
- Full quickstart walkthrough: ${BASE_URL}/docs/overview/quickstart
- Agent Skills (install/configure BitRouter from inside an agent): https://github.com/bitrouter/agent-skills
- BitRouter CLI (proxy, setup wizard, TUI dashboard): https://github.com/bitrouter/bitrouter
- Per-runtime setup recipes (Claude Code, Codex, OpenCode, DeepSeek Harness, and more): ${BASE_URL}/docs/integrations

## Getting Started

- [What is BitRouter?](${BASE_URL}/docs/overview/what-is-bitrouter): The one-page explanation — \`bitrouter/auto\`, how routing reads each call, and the two loops that improve it
- [Quick Start](${BASE_URL}/docs/overview/quickstart): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [Supported Models](${BASE_URL}/docs/overview/supported-models): The curated catalog the router can score, downgrade, and fail over between, with pricing
- [vs OpenRouter](${BASE_URL}/docs/overview/bitrouter-vs-openrouter): Honest side-by-side with the cloud catalog
- [vs LiteLLM](${BASE_URL}/docs/overview/bitrouter-vs-litellm): Honest side-by-side with the all-in-one proxy
- [Agent Skills](https://github.com/bitrouter/agent-skills): Drop-in skills that teach an agent to install and use BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, setup wizard, and TUI dashboard

## Models & Routing

- [ACP Gateway](${BASE_URL}/docs/models-and-routing/acp-gateway): Sub-agents as first-class routable primitives — a task goes to the sub-agent that best fits it
- [Model Fallbacks](${BASE_URL}/docs/models-and-routing/model-fallback): Automatic fallback across models when an upstream fails
- [Provider Selection](${BASE_URL}/docs/models-and-routing/provider-selection): How models resolve to upstream providers, with cost and performance policies
- [Virtual Model](${BASE_URL}/docs/models-and-routing/virtual-model): Define a named model of your own — base model, prompt, params, and routing rules behind \`@name\`
- [Model Variants](${BASE_URL}/docs/models-and-routing/model-variants): Append \`:cost\`, \`:latency\`, or \`:throughput\` to a model id to pick a ranking axis inline
- [Bring Your Own Model](${BASE_URL}/docs/models-and-routing/bring-your-own-model): Put a model you serve yourself behind BitRouter and route to it like any hosted model
- [Bring Your Own Provider](${BASE_URL}/docs/models-and-routing/bring-your-own-provider): Route through your own provider account at list price, with no rev share or per-token fee
- [Structured Outputs](${BASE_URL}/docs/models-and-routing/structured-outputs): Enforce a JSON schema across every provider, with the protocol translation handled for you
- [Guardrails](${BASE_URL}/docs/models-and-routing/guardrails): Named regex rules that block or redact matching content in requests and responses

## Tool Calling

- [Server Tools](${BASE_URL}/docs/models-and-routing/tool-calling/server-tools): Move the tool-calling loop into BitRouter — declare tools, and the router executes and re-calls until the model is done
- [Advisor](${BASE_URL}/docs/models-and-routing/tool-calling/advisor): Let a fast model escalate one hard sub-question to a stronger model mid-generation
- [Sub-agent](${BASE_URL}/docs/models-and-routing/tool-calling/subagent): Delegate a self-contained task to a cheaper worker model that returns only its result
- [Fusion](${BASE_URL}/docs/models-and-routing/tool-calling/fusion): A panel of models answers in parallel, a judge compares them, and your model writes the final reply
- [Web Search](${BASE_URL}/docs/models-and-routing/tool-calling/websearch): A built-in \`web_search\` server tool that gives any routed model a search, on a backend you bring keys for
- [Web Fetch](${BASE_URL}/docs/models-and-routing/tool-calling/web-fetch): A built-in \`web_fetch\` server tool that turns a URL into clean page content for any routed model

## Usage

- [Config (YAML)](${BASE_URL}/docs/usage/configuration): The \`bitrouter.yaml\` reference, including the policy table and the adaptive loop
- [CLI](${BASE_URL}/docs/usage/cli): Every command of the binary — serve, route, models, policy, optimize, providers
- [TUI](${BASE_URL}/docs/usage/tui): The terminal dashboard for live routing, spend, and traces
- [Agent](${BASE_URL}/docs/usage/agent): \`npx @bitrouter/agent\` — reads an agentic codebase and writes an MVP policy, a cost audit, and an observed-spend optimization
- [MCP](${BASE_URL}/docs/usage/mcp): Drive BitRouter itself as an MCP tool from inside an agent
- [Skills](${BASE_URL}/docs/usage/skills): Skills as governed, routable resources an agent loads on demand

## Self-hosting

- [Self-hosting Overview](${BASE_URL}/docs/self-hosting): Run the Apache-2.0 router on your own infrastructure — one binary, no database required, no container required, no platform fee
- [Install & Upgrade](${BASE_URL}/docs/self-hosting/install): Install methods, version pinning, in-place upgrade with \`bitrouter update\`, and rollback by release tag
- [Production Configuration](${BASE_URL}/docs/self-hosting/production-config): Commit \`bitrouter.yaml\` as infrastructure-as-code — config resolution, \`\${VAR}\` secrets, and CI validation
- [Run as a Service](${BASE_URL}/docs/self-hosting/run-as-a-service): \`serve\` vs \`start\`, a systemd unit, logs via \`RUST_LOG\`, and the Unix control socket
- [Networking & TLS](${BASE_URL}/docs/self-hosting/networking): Bind address, a streaming-safe reverse proxy, and the \`upstream.timeouts\` knobs that decide when a long stream dies
- [Authentication & Virtual Keys](${BASE_URL}/docs/self-hosting/authentication): \`skip_auth\`, \`brvk_\` virtual keys, and exactly what the auth hook checks per request
- [Hardening Checklist](${BASE_URL}/docs/self-hosting/hardening): The pre-flight list for any deployment reachable from beyond localhost
- [Day-2 Operations](${BASE_URL}/docs/self-hosting/operations): Reload vs restart, the diagnostic commands, and rolling out a config change
- [State & Backups](${BASE_URL}/docs/self-hosting/state-and-backups): What persists, SQLite/Postgres/MySQL, backups, and what is shared across instances

## Evals & Observability

- [OpenTelemetry](${BASE_URL}/docs/evals-and-observability/opentelemetry): Self-run OTLP export — traces and metrics of every request, pushed to a Collector, Honeycomb, Grafana, or Datadog
- [Cloud Tracing](${BASE_URL}/docs/evals-and-observability/tracing): Hosted Activity view — spend, token, and latency KPIs plus a per-request log, nothing to operate
- [Evaluation](${BASE_URL}/docs/evals-and-observability/evaluation): Per-request outcome signals and cost metering today, with an objective-scored eval engine landing on top

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

## Integrations (Harness Setup Guides)

- [Harnesses overview](${BASE_URL}/docs/integrations/harnesses): Harness vs. model source, and every runtime with a recipe
- [Claude Code](${BASE_URL}/docs/integrations/claude-code): Route Claude Code via ANTHROPIC_BASE_URL
- [Codex](${BASE_URL}/docs/integrations/codex): Route OpenAI Codex through BitRouter
- [OpenCode](${BASE_URL}/docs/integrations/opencode): Provider block in opencode.json
- [Pi](${BASE_URL}/docs/integrations/pi): Minimal terminal coding harness via models.json
- [DeepSeek Harness](${BASE_URL}/docs/integrations/deepseek-harness): Custom provider route in dsh settings.yaml

## Guides (Model Sources and Migration)

- [Model sources](${BASE_URL}/docs/guides/models): The three shapes of model source — subscription, aggregator key, self-served
- [Claude subscription](${BASE_URL}/docs/guides/claude-subscription): Route your Claude Pro/Max plan — OAuth, no key
- [Codex subscription](${BASE_URL}/docs/guides/codex-subscription): Route your ChatGPT plan via the Codex backend
- [Ollama](${BASE_URL}/docs/guides/ollama): Run open models locally
- [vLLM](${BASE_URL}/docs/guides/vllm): High-throughput GPU serving
- [Unsloth](${BASE_URL}/docs/guides/unsloth): Run or fine-tune locally
- [Migrate from LiteLLM](${BASE_URL}/docs/guides/migrate-from-litellm): Swap your gateway, keep your code
- [Migrate from OpenRouter](${BASE_URL}/docs/guides/migrate-from-openrouter): Change base URL and key
- [Migrate from TensorZero](${BASE_URL}/docs/guides/migrate-from-tensorzero): Drop the LLMOps stack for a single binary

## Optional

- [llms-full.txt](${BASE_URL}/api/docs/llms-full.txt): Complete documentation as plain text for ingestion
- [Blog: Introducing BitRouter](${BASE_URL}/blog/introducing-bitrouter): Long-form launch post
`;
