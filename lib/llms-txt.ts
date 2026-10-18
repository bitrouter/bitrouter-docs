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

- [Quickstart](${BASE_URL}/docs/overview/quickstart): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [Supported Models](${BASE_URL}/docs/overview/supported-models): The curated catalog the router can score, downgrade, and fail over between, with pricing
- [How BitRouter Works](${BASE_URL}/docs/overview/what-is-bitrouter): The one-page explanation — \`bitrouter/auto\`, how routing reads each call, and the two loops that improve it
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
- [CLI](${BASE_URL}/docs/usage/cli): Self-driving workflows, interactive terminal, and native headless scripting, with preview boundaries
- [Responses API](${BASE_URL}/docs/usage/responses-api): Recommended generation interface, streaming, tool results, and continuation

## Coding Agents

- [bro [harness]](${BASE_URL}/docs/integration/bro-harness): Launch a native harness with process-scoped routing, model, and supported MCP configuration
- [DeepSeek Harness](${BASE_URL}/docs/integration/deepseek-harness): Coming soon
- [OpenCode](${BASE_URL}/docs/integration/opencode): Coming soon
- [Pi](${BASE_URL}/docs/integration/pi): Coming soon

## Routing

- [Configuration (YAML)](${BASE_URL}/docs/routing/configuration): Load, validate, and apply bitrouter.yaml and its policy bindings
- [Model Routing](${BASE_URL}/docs/routing/model-routing): Resolve selectors, candidate eligibility, and policy-driven model selection
- [Context Routing](${BASE_URL}/docs/routing/context-routing): Select retained evidence for the next native model call
- [Strategies](${BASE_URL}/docs/routing/strategies): Choose and customize routing strategies, evaluate evidence, and publish reviewed changes

## Model

- [Virtual Models](${BASE_URL}/docs/models-routing/virtual-models): Define named model endpoints, request selectors, and reusable presets
- [Model Fallback](${BASE_URL}/docs/models-routing/model-fallback): Define failure-driven replacement across providers, models, and accounts
- [BYOK & Subscriptions](${BASE_URL}/docs/models-routing/byok-subscriptions): Connect keys, subscription logins, multiple accounts, and custom endpoints
- [Local Models](${BASE_URL}/docs/models-routing/local-models): Connect and verify inference servers you run yourself

## Context

- [ACP servers](${BASE_URL}/docs/context-routing/acp-servers): Connect external agents and understand session and context ownership
- [MCP servers](${BASE_URL}/docs/context-routing/mcp-servers): Use MCP discovery, direct and aggregate gateways, and agent connections
- [Agent Skills](${BASE_URL}/docs/context-routing/skills): Inspect and scaffold instruction packages with host-owned activation
- [AGENTS.md](${BASE_URL}/docs/context-routing/agents-md): Write repository instructions and verify the selected harness's loading behavior

## Reference

- [Changelog](${BASE_URL}/docs/changelog): All release notes on one page
- [CLI reference](${BASE_URL}/docs/cli/reference): Complete captured command and flag reference on one page
- [config reference](${BASE_URL}/docs/configuration-reference): Pinned local YAML schema, field types, defaults, environment references, and reload boundaries
- [API reference](${BASE_URL}/docs/reference): Authentication, typed decisions, compatibility guides, and generated endpoint families

## Optional

- [llms-full.txt](${BASE_URL}/api/docs/llms-full.txt): Complete documentation as plain text for ingestion
- [Blog: Introducing BitRouter](${BASE_URL}/blog/introducing-bitrouter): Long-form launch post
`;
