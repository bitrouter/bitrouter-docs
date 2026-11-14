# BitRouter

{{PRODUCT_SUMMARY}}

## Cloud API tasks

- [Cloud authentication]({{SITE_ORIGIN}}/docs/reference.md#get-a-cloud-credential): Console sign-in, browser device login, and an API key scoped to inference:invoke
- [First Cloud request]({{SITE_ORIGIN}}/docs/reference.md#first-cloud-request): Call the hosted Responses API with a BitRouter Cloud key
- [Python client]({{SITE_ORIGIN}}/docs/reference.md#python-client): OpenAI Python SDK example using the BitRouter base URL and Cloud key
- [Cloud quickstart]({{SITE_ORIGIN}}/docs/overview/quickstart.md#authenticate-and-send-your-first-request): Install the CLI, sign in, mint a key, and send the first request

## Quickstart for Agents

If you are an AI agent setting up BitRouter, follow these steps:

1. Install via Agent Skills (recommended for skill-capable runtimes — Claude Code, Cursor, Codex, Copilot): run `npx skills add bitrouter/bitrouter`, then invoke the skill ("Set up BitRouter for me"). The skill runs the wizard, defaults to BitRouter Cloud, and verifies the connection autonomously — no further input needed.
2. Or install the CLI directly (pick one): `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh | sh` · `npm install -g bitrouter` · `brew install bitrouter/tap/bitrouter` · `cargo install bitrouter`. Then run `bro` for onboarding. Choose local to BYOK with your own provider keys, or Cloud for the hosted endpoint; use `bro claude` or `bro codex` for native harness interaction. The goal-oriented BRO interface is documented as a design preview under CLI.
3. Route your runtime through BitRouter by changing its base URL: local proxy `http://127.0.0.1:4356/v1` (OpenAI-compatible) or `http://127.0.0.1:4356` (Anthropic-compatible); hosted Cloud `https://api.bitrouter.ai/v1`. On the local proxy, use `bitrouter/auto` with a bound routing policy, a logical `provider/model` id, or `provider:model` to pin one configured provider. On Cloud, use a catalog model ID or an enabled workspace routing preset such as `@<name>`.
4. Verify: `curl http://127.0.0.1:4356/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"anthropic/claude-haiku-4.5","messages":[{"role":"user","content":"Hello!"}]}'`

References:
- Full quickstart walkthrough: {{SITE_ORIGIN}}/docs/overview/quickstart
- Agent Skill (install/configure BitRouter from inside an agent): https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter
- BitRouter CLI (proxy, onboarding, and TUI conversation): https://github.com/bitrouter/bitrouter

## Documentation tools and publications

- [Docs MCP server card]({{SITE_ORIGIN}}/.well-known/mcp/server-card.json): Public read-only Streamable HTTP endpoint at /mcp; native Fumadocs tools list_pages, get_page, and search; compatibility search_docs/get_doc and model lookup remain available
- [Blog Markdown index]({{SITE_ORIGIN}}/blog/llms.txt): Published articles, separate from the documentation index

## Overview

- [Model markets]({{SITE_ORIGIN}}/models): Elastic Inference design preview with four assumed listings, illustrative bid/ask history, token volume, settled trading volume, available liquidity, weighted slippage, and platform fees; all data is demo, not live
- [Quickstart]({{SITE_ORIGIN}}/docs/overview/quickstart.md): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [How BitRouter Works]({{SITE_ORIGIN}}/docs/overview/what-is-bitrouter): The one-page explanation — `bitrouter/auto`, how routing reads each call, and the two loops that improve it
- [Models]({{SITE_ORIGIN}}/docs/overview/supported-models): Hosted model catalog, pricing, and model IDs
- [Elastic Inference]({{SITE_ORIGIN}}/docs/overview/elastic-inference.md): Optional cloud service for buying and selling inference across price, time, and heterogeneous models, with limit-order tables and provisional JSON examples
- [Agent Skill](https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter): Versioned instructions that teach an agent to install and operate BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): `cargo install bitrouter` — the Rust binary, onboarding, and TUI conversation
- [Enterprise]({{SITE_ORIGIN}}/enterprise): Choose between self-hosted OSS, BitRouter Cloud, and a design partnership for requirements not shipped today

### Comparison

- [OpenRouter]({{SITE_ORIGIN}}/docs/overview/comparison/openrouter): Hosted model access, automatic selection, and policy ownership
- [Router (Ramp)]({{SITE_ORIGIN}}/docs/overview/comparison/router-ramp): Managed routing, evaluation, and deployment control
- [vLLM Semantic Router]({{SITE_ORIGIN}}/docs/overview/comparison/vllm-semantic-router): Programmable signals, model paths, and context ownership
- [LiteLLM]({{SITE_ORIGIN}}/docs/overview/comparison/litellm): SDK/proxy integration, gateway operations, and routing configuration

## Usage

- [Desktop]({{SITE_ORIGIN}}/docs/usage/desktop): Coming soon; current terminal and API alternatives
- [CLI]({{SITE_ORIGIN}}/docs/usage/cli): Self-driving workflows, interactive terminal, and native headless scripting, and the complete captured command reference, with preview boundaries
- [Responses API]({{SITE_ORIGIN}}/docs/usage/responses-api.md): Recommended generation interface, streaming, tool results, and continuation
- [MCP]({{SITE_ORIGIN}}/docs/usage/mcp): Coming soon
- [Agentic Payment]({{SITE_ORIGIN}}/docs/usage/agentic-payment): Coming soon

## Coding Agents

- [DeepSeek Harness]({{SITE_ORIGIN}}/docs/integration/deepseek-harness): Development bro connect setup for initialized profiles, native model selection, protocols, and restoration
- [Hermes Agent]({{SITE_ORIGIN}}/docs/integration/hermes-agent): Development bro connect setup for an existing profile/backend; native chat and cron route selection, with explicit multi-selector registration
- [OpenClaw]({{SITE_ORIGIN}}/docs/integration/openclaw): Development bro connect setup for a Gateway instance; native agent/automation route selection, credentials, and removal
- [OpenCode]({{SITE_ORIGIN}}/docs/integration/opencode): Development bro connect setup for native CLI/TUI, Desktop, or Web backends; gateway protocols and connection checks
- [Pi]({{SITE_ORIGIN}}/docs/integration/pi): Development bro connect setup for a persistent native provider, agent-directory scope, model selection, and restoration

## Market

- [Buy Inference]({{SITE_ORIGIN}}/docs/market/buy-inference): Documentation placeholder for obtaining inference access through BitRouter
- [Sell Inference]({{SITE_ORIGIN}}/docs/market/sell-inference): Documentation placeholder for optional marketplace supply
- [Verify Inference]({{SITE_ORIGIN}}/docs/market/verify-inference): Coming soon
- [Auto-bidding]({{SITE_ORIGIN}}/docs/market/auto-bidding): Coming soon
- [Service Tiers]({{SITE_ORIGIN}}/docs/market/service-tiers): Coming soon
  - [Priority]({{SITE_ORIGIN}}/docs/market/service-tiers/priority): Coming soon
  - [Standard]({{SITE_ORIGIN}}/docs/market/service-tiers/standard): Coming soon
  - [Flex]({{SITE_ORIGIN}}/docs/market/service-tiers/flex): Coming soon

## Router

- [Auto Router]({{SITE_ORIGIN}}/docs/routing/auto-router): Initialize bitrouter/auto, send requests, and inspect the serving route
- [Workload Optimization]({{SITE_ORIGIN}}/docs/routing/workload-optimization): Planned workload learning; existing policy artifacts, evaluations, evidence snapshots, and reviewed publication tools
- [State Affinity]({{SITE_ORIGIN}}/docs/routing/state-affinity): Coming soon; canonical guide for state-aware source selection
- [Routing Traces]({{SITE_ORIGIN}}/docs/routing/routing-traces): Follow router decisions, serving routes, and upstream attempts across the available workflow trajectory
- [Strategies]({{SITE_ORIGIN}}/docs/routing/strategies): Resolve selectors, constrain the inference pool, and reuse endpoint ordering, presets, and variants

Supporting guides linked from Strategies:
- [Context Routing]({{SITE_ORIGIN}}/docs/routing/context-routing): Select retained evidence for the next native model call
- [Configuration (YAML)]({{SITE_ORIGIN}}/docs/routing/configuration): Load, validate, and apply bitrouter.yaml; look up pinned schema fields in the inline configuration reference

## Model

- [Model Fallbacks]({{SITE_ORIGIN}}/docs/models-routing/model-fallback): Define failure-driven replacement across providers, models, and accounts
- [Virtual Models]({{SITE_ORIGIN}}/docs/models-routing/virtual-models): Define named model endpoints, request selectors, and reusable presets
- [Structured Output]({{SITE_ORIGIN}}/docs/models-routing/structured-output): Coming soon
- [BYOK & Subscriptions]({{SITE_ORIGIN}}/docs/models-routing/byok-subscriptions): Connect keys, subscription logins, multiple accounts, and custom endpoints
- [Local Models]({{SITE_ORIGIN}}/docs/models-routing/local-models): Connect and verify inference servers you run yourself

## Context

- [ACP servers]({{SITE_ORIGIN}}/docs/context-routing/acp-servers): Connect external agents and understand session and context ownership
- [MCP servers]({{SITE_ORIGIN}}/docs/context-routing/mcp-servers): Use MCP discovery, direct and aggregate gateways, and agent connections
- [Agent Skills]({{SITE_ORIGIN}}/docs/context-routing/skills): Inspect and scaffold instruction packages with host-owned activation
- [Server tools]({{SITE_ORIGIN}}/docs/context-routing/server-tools): Server-side tool configuration and execution in BitRouter
- [Context Switcher]({{SITE_ORIGIN}}/docs/context-routing/context-switcher): Coming soon

## Reference

- [Changelog]({{SITE_ORIGIN}}/docs/changelog): All release notes on one page
- [Privacy Policy]({{SITE_ORIGIN}}/docs/privacy-policy): Data collection, storage, third-party processing, and privacy contact
- [Terms of Service]({{SITE_ORIGIN}}/docs/terms-of-service): Service terms, usage policies, payments, and availability
- [Troubleshooting]({{SITE_ORIGIN}}/docs/troubleshooting): Coming soon
- [API reference]({{SITE_ORIGIN}}/docs/reference.md): Authentication, typed decisions, compatibility guides, and generated endpoint families
- [Create a response]({{SITE_ORIGIN}}/docs/reference/openai-responses/createResponse.md): Hosted POST /v1/responses contract, authentication, example request and errors
- [OpenAPI schema]({{SITE_ORIGIN}}/openapi.json): Machine-readable Cloud contract used by this documentation release

## Optional

- [Model catalog JSON]({{SITE_ORIGIN}}/api/bitrouter/models): Structured model catalog from the hosted API; model IDs, metadata, and available pricing. This is JSON data, separate from the documentation and the illustrative market preview.
- [llms-full.txt]({{SITE_ORIGIN}}/llms-full.txt): Complete documentation as plain text for ingestion

