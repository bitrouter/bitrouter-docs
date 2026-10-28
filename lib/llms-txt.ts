import { LLMS_PRODUCT_SUMMARY } from "./llms-shared";

const BASE_URL = "https://bitrouter.ai";

export const LLMS_TXT = `# BitRouter

${LLMS_PRODUCT_SUMMARY}

## Quickstart for Agents

If you are an AI agent setting up BitRouter, follow these steps:

1. Install via Agent Skills (recommended for skill-capable runtimes — Claude Code, Cursor, Codex, Copilot): run \`npx skills add bitrouter/bitrouter\`, then invoke the skill ("Set up BitRouter for me"). The skill runs the wizard, defaults to BitRouter Cloud, and verifies the connection autonomously — no further input needed.
2. Or install the CLI directly (pick one): \`curl --proto '=https' --tlsv1.2 -LsSf https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh | sh\` · \`npm install -g bitrouter\` · \`brew install bitrouter/tap/bitrouter\` · \`cargo install bitrouter\`. Then run \`bro\` for onboarding. Choose local to BYOK with your own provider keys, or Cloud for the hosted endpoint; use \`bro claude\` or \`bro codex\` for native harness interaction. The goal-oriented BRO interface is documented as a design preview under CLI.
3. Route your runtime through BitRouter by changing its base URL: local proxy \`http://127.0.0.1:4356/v1\` (OpenAI-compatible) or \`http://127.0.0.1:4356\` (Anthropic-compatible); hosted Cloud \`https://api.bitrouter.ai/v1\`. Ask for \`bitrouter/auto\` to apply a routing policy, or name a logical \`provider/model\` id such as \`anthropic/claude-opus-4.8\`. Use \`provider:model\` only to pin one configured provider.
4. Verify: \`curl http://127.0.0.1:4356/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"anthropic/claude-haiku-4.5","messages":[{"role":"user","content":"Hello!"}]}'\`

References:
- Full quickstart walkthrough: ${BASE_URL}/docs/overview/quickstart
- Agent Skill (install/configure BitRouter from inside an agent): https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter
- BitRouter CLI (proxy, onboarding, and TUI conversation): https://github.com/bitrouter/bitrouter
- Coding-agent modes and supported adapters (Claude, Codex, OpenCode, Pi, and more): ${BASE_URL}/docs/integration/coding-agents

## Overview

- [Model markets](${BASE_URL}/models): Flex Inference design preview with four assumed listings, illustrative bid/ask history, token volume, settled trading volume, available liquidity, weighted slippage, and platform fees; all data is demo, not live
- [Quickstart](${BASE_URL}/docs/overview/quickstart): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [How BitRouter Works](${BASE_URL}/docs/overview/what-is-bitrouter): The one-page explanation — \`bitrouter/auto\`, how routing reads each call, and the two loops that improve it
- [Models](${BASE_URL}/docs/overview/supported-models): Hosted model catalog, pricing, and model IDs
- [Flex Inference](${BASE_URL}/docs/overview/flex-inference): Optional cloud service for buying and selling inference across price, time, and heterogeneous models, with limit-order tables and provisional JSON examples
- [Agent Skill](https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter): Versioned instructions that teach an agent to install and operate BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, onboarding, and TUI conversation
- [Enterprise](${BASE_URL}/enterprise): Choose between self-hosted OSS, BitRouter Cloud, and a design partnership for requirements not shipped today

### Comparison

- [OpenRouter](${BASE_URL}/docs/overview/comparison/openrouter): Hosted model access, automatic selection, and policy ownership
- [Router (Ramp)](${BASE_URL}/docs/overview/comparison/router-ramp): Managed routing, evaluation, and deployment control
- [vLLM Semantic Router](${BASE_URL}/docs/overview/comparison/vllm-semantic-router): Programmable signals, model paths, and context ownership
- [LiteLLM](${BASE_URL}/docs/overview/comparison/litellm): SDK/proxy integration, gateway operations, and routing configuration

## Usage

- [Desktop](${BASE_URL}/docs/usage/desktop): Coming soon; current terminal and API alternatives
- [CLI](${BASE_URL}/docs/usage/cli): Self-driving workflows, interactive terminal, and native headless scripting, and the complete captured command reference, with preview boundaries
- [Responses API](${BASE_URL}/docs/usage/responses-api): Recommended generation interface, streaming, tool results, and continuation
- [MCP](${BASE_URL}/docs/usage/mcp): Coming soon
- [Web](${BASE_URL}/docs/usage/web): Coming soon

## Coding Agents

- [Claude Code](${BASE_URL}/docs/integration/claude-code): Local/Cloud proxy setup, a Claude-only model pool, customization, and request verification
- [Codex](${BASE_URL}/docs/integration/codex): Local/Cloud provider setup, a GPT-only model pool, catalog requirements, and request verification
- [DeepSeek Harness](${BASE_URL}/docs/integration/deepseek-harness): Coming soon
- [OpenCode](${BASE_URL}/docs/integration/opencode): Coming soon
- [Pi](${BASE_URL}/docs/integration/pi): Coming soon

## Market

- [Buy Inference](${BASE_URL}/docs/market/buy-inference): Documentation placeholder for obtaining inference access through BitRouter
- [Sell Inference](${BASE_URL}/docs/market/sell-inference): Documentation placeholder for optional marketplace supply
- [Agentic Payment](${BASE_URL}/docs/market/agentic-payment): Coming soon
- [Auto-bidding](${BASE_URL}/docs/market/auto-bidding): Coming soon
- [Market Data](${BASE_URL}/docs/market/market-data): Coming soon

## Router

- [Auto Router](${BASE_URL}/docs/routing/auto-router): Initialize bitrouter/auto, send requests, and inspect the serving route
- [Workload Optimization](${BASE_URL}/docs/routing/workload-optimization): Planned workload learning; existing policy artifacts, evaluations, evidence snapshots, and reviewed publication tools
- [State Affinity](${BASE_URL}/docs/routing/state-affinity): Coming soon; canonical guide for state-aware source selection
- [Routing Traces](${BASE_URL}/docs/routing/routing-traces): Follow router decisions, serving routes, and upstream attempts across the available workflow trajectory
- [Strategies](${BASE_URL}/docs/routing/strategies): Resolve selectors, constrain the inference pool, and reuse endpoint ordering, presets, and variants

Supporting guides linked from Strategies:
- [Context Routing](${BASE_URL}/docs/routing/context-routing): Select retained evidence for the next native model call
- [Configuration (YAML)](${BASE_URL}/docs/routing/configuration): Load, validate, and apply bitrouter.yaml; look up pinned schema fields in the inline configuration reference

## Model

- [Model Fallbacks](${BASE_URL}/docs/models-routing/model-fallback): Define failure-driven replacement across providers, models, and accounts
- [Virtual Models](${BASE_URL}/docs/models-routing/virtual-models): Define named model endpoints, request selectors, and reusable presets
- [Structured Output](${BASE_URL}/docs/models-routing/structured-output): Coming soon
- [BYOK & Subscriptions](${BASE_URL}/docs/models-routing/byok-subscriptions): Connect keys, subscription logins, multiple accounts, and custom endpoints
- [Local Models](${BASE_URL}/docs/models-routing/local-models): Connect and verify inference servers you run yourself

## Context

- [ACP servers](${BASE_URL}/docs/context-routing/acp-servers): Connect external agents and understand session and context ownership
- [MCP servers](${BASE_URL}/docs/context-routing/mcp-servers): Use MCP discovery, direct and aggregate gateways, and agent connections
- [Agent Skills](${BASE_URL}/docs/context-routing/skills): Inspect and scaffold instruction packages with host-owned activation
- [Server tools](${BASE_URL}/docs/context-routing/server-tools): Server-side tool configuration and execution in BitRouter
- [Context Switcher](${BASE_URL}/docs/context-routing/context-switcher): Coming soon

## Reference

- [Changelog](${BASE_URL}/docs/changelog): All release notes on one page
- [Privacy Policy](${BASE_URL}/docs/privacy-policy): Data collection, storage, third-party processing, and privacy contact
- [Terms of Service](${BASE_URL}/docs/terms-of-service): Service terms, usage policies, payments, and availability
- [Troubleshooting](${BASE_URL}/docs/troubleshooting): Coming soon
- [API reference](${BASE_URL}/docs/reference): Authentication, typed decisions, compatibility guides, and generated endpoint families

## Optional

- [llms-full.txt](${BASE_URL}/api/docs/llms-full.txt): Complete documentation as plain text for ingestion
- [Blog: Introducing BitRouter](${BASE_URL}/blog/introducing-bitrouter): Long-form launch post
`;
