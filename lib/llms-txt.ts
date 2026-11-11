import { LLMS_PRODUCT_SUMMARY } from "./llms-shared";
import { getSiteOrigin } from "./site-origin";

const BASE_URL = getSiteOrigin();

export const LLMS_TXT = `# BitRouter

${LLMS_PRODUCT_SUMMARY}

## Cloud API tasks

- [Cloud authentication](${BASE_URL}/docs/reference/authentication.md#cloud-api-keys): Caller credentials, Cloud inference scopes, local virtual keys, and provider-key boundaries
- [First Cloud request](${BASE_URL}/docs/reference.md#first-cloud-request): Call the hosted Responses API with a BitRouter Cloud key
- [Python client](${BASE_URL}/docs/reference.md#python-client): OpenAI Python SDK example using the BitRouter base URL and Cloud key
- [Cloud quickstart](${BASE_URL}/docs/overview/quickstart.md#authenticate-and-send-your-first-request): Install the CLI, sign in, mint a key, and send the first request

## Quickstart for Agents

If you are an AI agent setting up BitRouter, follow these steps:

1. Install via Agent Skills (recommended for skill-capable runtimes — Claude Code, Cursor, Codex, Copilot): run \`npx skills add bitrouter/bitrouter\`, then invoke the skill ("Set up BitRouter for me"). The skill runs the wizard, defaults to BitRouter Cloud, and verifies the connection autonomously — no further input needed.
2. Or install the CLI directly (pick one): \`curl --proto '=https' --tlsv1.2 -LsSf https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh | sh\` · \`npm install -g bitrouter\` · \`brew install bitrouter/tap/bitrouter\` · \`cargo install bitrouter\`. Then run \`bro init --after exit\` for onboarding. Choose local to BYOK with your own provider keys, or Cloud for the hosted endpoint; use \`bro claude\` or \`bro codex\` for native harness interaction.
3. Route your runtime through BitRouter by changing its base URL: local proxy \`http://127.0.0.1:4356/v1\` (OpenAI-compatible) or \`http://127.0.0.1:4356\` (Anthropic-compatible); hosted Cloud \`https://api.bitrouter.ai/v1\`. On the local proxy, use \`bitrouter/auto\` with a bound routing policy, a logical \`provider/model\` id, or \`provider:model\` to pin one configured provider. On Cloud, use a catalog model ID or an enabled workspace routing preset such as \`@<name>\`.
4. Verify: \`curl http://127.0.0.1:4356/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"anthropic/claude-haiku-4.5","messages":[{"role":"user","content":"Hello!"}]}'\`

References:
- Full quickstart walkthrough: ${BASE_URL}/docs/overview/quickstart
- Agent Skill (install/configure BitRouter from inside an agent): https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter
- BitRouter CLI (proxy, onboarding, and TUI conversation): https://github.com/bitrouter/bitrouter

## Documentation tools and publications

- [Docs MCP server card](${BASE_URL}/.well-known/mcp/server-card.json): Public read-only Streamable HTTP endpoint at /mcp; native Fumadocs tools list_pages, get_page, and search; compatibility search_docs/get_doc and model lookup remain available
- [Blog Markdown index](${BASE_URL}/blog/llms.txt): Published articles, separate from the documentation index

## Overview

- [Model markets](${BASE_URL}/models): Elastic Inference design preview with four assumed listings, illustrative bid/ask history, token volume, settled trading volume, available liquidity, weighted slippage, and platform fees; all data is demo, not live
- [Quickstart](${BASE_URL}/docs/overview/quickstart.md): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [How BitRouter Works](${BASE_URL}/docs/overview/what-is-bitrouter): The one-page explanation — \`bitrouter/auto\`, how routing reads each call, and the two loops that improve it
- [Elastic Inference](${BASE_URL}/docs/overview/elastic-inference.md): Optional cloud service for buying and selling inference across price, time, and heterogeneous models, with limit-order tables and provisional JSON examples
- [Agent Skill](https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter): Versioned instructions that teach an agent to install and operate BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, onboarding, and TUI conversation
- [Enterprise](${BASE_URL}/enterprise): Choose between self-hosted OSS, BitRouter Cloud, and a design partnership for requirements not shipped today
- [Changelog](${BASE_URL}/docs/changelog): All release notes on one page

### Comparison

- [OpenRouter](${BASE_URL}/docs/overview/comparison/openrouter): Hosted model access, automatic selection, and policy ownership
- [Router (Ramp)](${BASE_URL}/docs/overview/comparison/router-ramp): Managed routing, evaluation, and deployment control
- [vLLM Semantic Router](${BASE_URL}/docs/overview/comparison/vllm-semantic-router): Programmable signals, model paths, and context ownership
- [LiteLLM](${BASE_URL}/docs/overview/comparison/litellm): SDK/proxy integration, gateway operations, and routing configuration

## CLI

- [Getting Started](${BASE_URL}/docs/cli/getting-started.md): Install and check the CLI, select Cloud or local sources, and start the router
- [Configuration](${BASE_URL}/docs/routing/configuration.md): File discovery, environment references, validation, applying changes, and generated field reference
- [Run & Inspect](${BASE_URL}/docs/cli/run-inspect.md): Daemon lifecycle, route previews, request inspection, diagnostics, and scripting
- [Cloud Management](${BASE_URL}/docs/cli/cloud-management.md): CLI login, namespaces, API keys, usage, balances, budgets, and account policies
- [Command Reference](${BASE_URL}/docs/usage/cli.md): Complete commands and flags from the captured release binary

## API

- [Getting Started](${BASE_URL}/docs/reference.md): Deployment choice, model discovery, first request, and a compatible Python client
- [Authentication](${BASE_URL}/docs/reference/authentication.md): Cloud keys, local virtual keys, request headers, and permissions
- [Inference APIs](${BASE_URL}/docs/usage/responses-api.md): Responses, Chat Completions, Messages, and GenerateContent with streaming, tools, and compatibility limits
- [Model discovery endpoint](${BASE_URL}/docs/reference/discovery/listModels.md): GET /v1/models catalog contract and filters
- [Create a response endpoint](${BASE_URL}/docs/reference/openai-responses/createResponse.md): Hosted POST /v1/responses contract, authentication, example request and errors
- [OpenAPI schema](${BASE_URL}/openapi.json): Machine-readable Cloud contract used by this documentation release

## Integrations

- [DeepSeek Harness](${BASE_URL}/docs/integration/deepseek-harness): Development bro connect setup for initialized profiles, native model selection, protocols, and restoration
- [Hermes Agent](${BASE_URL}/docs/integration/hermes-agent): Development bro connect setup for an existing profile/backend; native chat and cron route selection, with explicit multi-selector registration
- [OpenClaw](${BASE_URL}/docs/integration/openclaw): Development bro connect setup for a Gateway instance; native agent/automation route selection, credentials, and removal
- [OpenCode](${BASE_URL}/docs/integration/opencode): Development bro connect setup for native CLI/TUI, Desktop, or Web backends; gateway protocols and connection checks
- [Pi](${BASE_URL}/docs/integration/pi): Development bro connect setup for a persistent native provider, agent-directory scope, model selection, and restoration

## Market

- [Price-Time Priority](${BASE_URL}/docs/market/price-time-priority): Purchase timing, price caps, supplier charges, Cloud platform fees, and the one-time welcome credit
- [Inference Types](${BASE_URL}/docs/market/inference-types): On-demand and Interruptible capacity, with Reserved marked Coming soon
- [Inference Tiers](${BASE_URL}/docs/market/inference-tiers): Market design terminology for Unverified, Verified, and Secured inference
- [Buy Inference](${BASE_URL}/docs/market/buy-inference): Documentation placeholder for obtaining inference access through BitRouter
- [Sell Inference](${BASE_URL}/docs/market/sell-inference): Documentation placeholder for optional marketplace supply

## Router

- [Auto Router](${BASE_URL}/docs/routing/auto-router): Initialize bitrouter/auto, send requests, and inspect the serving route
- [Workload Optimization](${BASE_URL}/docs/routing/workload-optimization): Planned workload learning; existing policy artifacts, evaluations, evidence snapshots, and reviewed publication tools
- [State Affinity](${BASE_URL}/docs/routing/state-affinity): Coming soon; canonical guide for state-aware source selection
- [Routing Traces](${BASE_URL}/docs/routing/routing-traces): Follow router decisions, serving routes, and upstream attempts across the available workflow trajectory
- [Strategies](${BASE_URL}/docs/routing/strategies): Resolve selectors, constrain the inference pool, and reuse endpoint ordering, presets, and variants

Supporting guide linked from Strategies:
- [Context Routing](${BASE_URL}/docs/routing/context-routing): Select retained evidence for the next native model call

## Model

- [Model Fallbacks](${BASE_URL}/docs/models-routing/model-fallback): Define failure-driven replacement across providers, models, and accounts
- [Virtual Models](${BASE_URL}/docs/models-routing/virtual-models): Define named model endpoints, request selectors, and reusable presets
- [Structured Output](${BASE_URL}/docs/models-routing/structured-output): Coming soon
- [BYOK & Subscriptions](${BASE_URL}/docs/models-routing/byok-subscriptions): Connect keys, subscription logins, multiple accounts, and custom endpoints
- [Local Models](${BASE_URL}/docs/models-routing/local-models): Connect and verify inference servers you run yourself

## Reference

- [Privacy Policy](${BASE_URL}/docs/privacy-policy): Data collection, storage, third-party processing, and privacy contact
- [Terms of Service](${BASE_URL}/docs/terms-of-service): Service terms, usage policies, payments, and availability
- [Troubleshooting](${BASE_URL}/docs/troubleshooting): Coming soon

## Optional

- [Model catalog JSON](${BASE_URL}/api/bitrouter/models): Structured model catalog from the hosted API; model IDs, metadata, and available pricing. This is JSON data, separate from the documentation and the illustrative market preview.
- [llms-full.txt](${BASE_URL}/llms-full.txt): Complete documentation as plain text for ingestion
`;
