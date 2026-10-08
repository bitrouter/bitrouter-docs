import { LLMS_PRODUCT_SUMMARY } from "./llms-shared";

const BASE_URL = "https://bitrouter.ai";

export const LLMS_TXT = `# BitRouter

${LLMS_PRODUCT_SUMMARY}

## Quickstart for Agents

If you are an AI agent setting up BitRouter, follow these steps:

1. Install via Agent Skills (recommended for skill-capable runtimes — Claude Code, Cursor, Codex, Copilot): run \`npx skills add bitrouter/bitrouter\`, then invoke the skill ("Set up BitRouter for me"). The skill runs the wizard, defaults to BitRouter Cloud, and verifies the connection autonomously — no further input needed.
2. Or install the CLI directly (pick one): \`curl --proto '=https' --tlsv1.2 -LsSf https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh | sh\` · \`npm install -g bitrouter\` · \`brew install bitrouter/tap/bitrouter\` · \`cargo install bitrouter\`. Then run \`bro\` for onboarding. Choose local to BYOK with your own provider keys, or Cloud for the hosted endpoint; after setup, \`bro code\` opens the interactive ACP conversation.
3. Route your runtime through BitRouter by changing its base URL: local proxy \`http://127.0.0.1:4356/v1\` (OpenAI-compatible) or \`http://127.0.0.1:4356\` (Anthropic-compatible); hosted Cloud \`https://api.bitrouter.ai/v1\`. Ask for \`bitrouter/auto\` to apply a routing policy, or name a logical \`provider/model\` id such as \`anthropic/claude-opus-4.8\`. Use \`provider:model\` only to pin one configured provider.
4. Verify: \`curl http://127.0.0.1:4356/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"anthropic/claude-haiku-4.5","messages":[{"role":"user","content":"Hello!"}]}'\`

References:
- Full quickstart walkthrough: ${BASE_URL}/docs/overview/quickstart
- Agent Skill (install/configure BitRouter from inside an agent): https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter
- BitRouter CLI (proxy, onboarding, and TUI conversation): https://github.com/bitrouter/bitrouter
- Coding-agent modes and supported adapters (Claude, Codex, OpenCode, Pi, and more): ${BASE_URL}/docs/integration/coding-agents

## Overview

- [What is BitRouter?](${BASE_URL}/docs/overview/what-is-bitrouter): The one-page explanation — \`bitrouter/auto\`, how routing reads each call, and the two loops that improve it
- [Quick Start](${BASE_URL}/docs/overview/quickstart): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [Supported Models](${BASE_URL}/docs/overview/supported-models): The curated catalog the router can score, downgrade, and fail over between, with pricing
- [Comparison](${BASE_URL}/docs/overview/comparison): Compare BitRouter with OpenRouter and LiteLLM across ownership, routing, deployment, and migration
- [Agent Skill](https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter): Versioned instructions that teach an agent to install and operate BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, onboarding, and TUI conversation
- [Enterprise](${BASE_URL}/enterprise): Choose between self-hosted OSS, BitRouter Cloud, and a design partnership for requirements not shipped today
- [Self-hosting](${BASE_URL}/docs/self-hosting): Install, deploy, secure, and operate the Apache-2.0 router on infrastructure you control

## Models & routing

- [bitrouter/auto](${BASE_URL}/docs/models-routing/bitrouter-auto): Use one stable model id and inspect the route that served each request
- [Models & providers](${BASE_URL}/docs/models-routing/providers): Connect provider accounts, private endpoints, and custom model declarations
- [Model routing](${BASE_URL}/docs/models-routing/models): Configure selectors, eligibility, fallback, and protocol compatibility
- [Guardrails](${BASE_URL}/docs/models-routing/guardrails): Block or redact matching request and response content
- [Evaluations](${BASE_URL}/docs/models-routing/evaluations): Record objective outcomes and freeze reproducible evidence snapshots
- [Routing policy](${BASE_URL}/docs/models-routing/policy): Configure adequacy and publish reviewed routing-policy changes

## Context & routing

- [MCP servers](${BASE_URL}/docs/context-routing/mcp-servers): Connect upstream servers and expose selected tools through the gateway or server-tool loop
- [Agent Skills](${BASE_URL}/docs/context-routing/skills): Inspect and scaffold instruction packages with host-owned activation
- [AGENTS.md](${BASE_URL}/docs/context-routing/agents-md): Write repository instructions and verify the selected harness's loading behavior
- [Server tools](${BASE_URL}/docs/context-routing/server-tools): Configure bounded execution, Advisor, Sub-agent, Fusion, and web search and fetch

## CLI

- [CLI reference](${BASE_URL}/docs/cli/reference): Every command from the binary's help snapshot
- [TUI](${BASE_URL}/docs/cli/tui): Interactive ACP conversations, route selection, and activity
- [Configuration](${BASE_URL}/docs/cli/configuration): Discover, validate, and apply deployment configuration and linked policy files
- [Permissions](${BASE_URL}/docs/cli/permissions): Handle interactive and headless ACP tool permission requests
- [Telemetry](${BASE_URL}/docs/cli/telemetry): Inspect receipts, export OpenTelemetry, and view Cloud Activity

## Integration

- [ACP servers](${BASE_URL}/docs/integration/acp-servers): Discover and configure ACP servers or expose an adapter to another client
- [Coding agents](${BASE_URL}/docs/integration/coding-agents): Choose an interface and connect supported harnesses and model sources
- [DeepSeek Harness](${BASE_URL}/docs/integration/deepseek-harness): Coming soon
- [OpenCode](${BASE_URL}/docs/integration/opencode): Coming soon
- [Pi](${BASE_URL}/docs/integration/pi): Coming soon

## Reference

- [API Overview](${BASE_URL}/docs/reference): Choose an API family and apply the correct authentication
- [OpenAI Chat Completions](${BASE_URL}/docs/reference/openai-compatible/createChatCompletion): \`/v1/chat/completions\` — OpenAI Chat Completions request and response format
- [OpenAI Responses](${BASE_URL}/docs/reference/openai-responses/createResponse): \`/v1/responses\` — OpenAI Responses request and event format
- [Anthropic Messages](${BASE_URL}/docs/reference/anthropic-compatible/createMessage): \`/v1/messages\` — Anthropic Messages request and response format
- [Google GenerateContent](${BASE_URL}/docs/reference/google-compatible/googleGenerateContent): \`/v1beta/models/{model}:generateContent\` — Google Generative Language format
- [Models & providers](${BASE_URL}/docs/reference/discovery/listModels): Inspect the public catalog and aggregate platform usage
- [Cloud management](${BASE_URL}/docs/reference/management/listNamespaces): Manage namespaces, keys, billing, policy, presets, and OAuth clients
- [BYOK encryption](${BASE_URL}/docs/reference/byok/getEncryptionPubkey): Bootstrap client-side encryption of upstream provider keys
- [Health](${BASE_URL}/docs/reference/health/ping): Liveness probe

## Development

- [Contributing to BitRouter](${BASE_URL}/docs/development): Choose a contribution path, run the project locally, and validate changes
- [MCP for development](${BASE_URL}/docs/development/mcp): Give a coding agent searchable BitRouter docs and current model information
- [Agent Skills for development](${BASE_URL}/docs/development/agent-skills): Use supplied procedures for setup, diagnosis, route evaluation, and benchmarks
- [BitRouter Source](https://github.com/bitrouter/bitrouter): Rust router source and issue tracker
- [Documentation Source](https://github.com/bitrouter/bitrouter-docs): Website and documentation source

## Optional

- [llms-full.txt](${BASE_URL}/api/docs/llms-full.txt): Complete documentation as plain text for ingestion
- [Blog: Introducing BitRouter](${BASE_URL}/blog/introducing-bitrouter): Long-form launch post
`;
