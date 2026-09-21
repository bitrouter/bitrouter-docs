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
- Coding-agent modes and supported adapters (Claude, Codex, OpenCode, Pi, and more): ${BASE_URL}/docs/usage/coding-agents

## Overview

- [What is BitRouter?](${BASE_URL}/docs/overview/what-is-bitrouter): The one-page explanation — \`bitrouter/auto\`, how routing reads each call, and the two loops that improve it
- [Quick Start](${BASE_URL}/docs/overview/quickstart): Install via Agent Skills or the CLI, start routing in under a minute, then optimize against your own workflow
- [Supported Models](${BASE_URL}/docs/overview/supported-models): The curated catalog the router can score, downgrade, and fail over between, with pricing
- [Comparison](${BASE_URL}/docs/overview/comparison): Compare BitRouter with OpenRouter and LiteLLM across ownership, routing, deployment, and migration
- [Agent Skill](https://github.com/bitrouter/bitrouter/tree/main/skills/bitrouter): Versioned instructions that teach an agent to install and operate BitRouter
- [BitRouter CLI](https://github.com/bitrouter/bitrouter): \`cargo install bitrouter\` — the Rust binary, onboarding, and TUI conversation
- [Enterprise](${BASE_URL}/docs/enterprise): Choose between self-hosted OSS, BitRouter Cloud, and a design partnership for requirements not shipped today
- [Self-hosting](${BASE_URL}/docs/self-hosting): Install, deploy, secure, and operate the Apache-2.0 router on infrastructure you control

## Configuration

- [Config file](${BASE_URL}/docs/configuration/config-file): Create, validate, and operate \`bitrouter.yaml\`
- [Routing](${BASE_URL}/docs/configuration/routing): Resolve selectors, define ordered fallback chains, presets, and variants, then inspect the result
- [Guardrails](${BASE_URL}/docs/configuration/guardrails): Block or redact matching request and response content in the router
- [Structured outputs](${BASE_URL}/docs/configuration/structured-outputs): Translate one JSON Schema constraint across supported API protocols
- [Observability](${BASE_URL}/docs/configuration/observability): Preview routes, export OpenTelemetry, inspect Cloud Activity, and keep evaluation separate from telemetry

## Customization

- [Models & providers](${BASE_URL}/docs/customization/models): Connect a provider account, declare a private endpoint, or contribute to the open registry
- [Guardrails](${BASE_URL}/docs/configuration/guardrails): Named regex rules that block or redact matching content in requests and responses
- [Tool calling](${BASE_URL}/docs/customization/tools): Choose router-owned tool execution or an MCP gateway
- [Server tools](${BASE_URL}/docs/customization/tools/server-tools): Understand the bounded loop and two-gate activation model
- [Model-backed tools](${BASE_URL}/docs/customization/tools/model-backed-tools): Compare Advisor, Sub-agent, and Fusion
- [Web tools](${BASE_URL}/docs/customization/tools/web-tools): Configure Web Search and Web Fetch backends together

## Usage

- [CLI](${BASE_URL}/docs/usage/cli): Every command of the binary — serve, route, models, policy, optimize, providers
- [TUI](${BASE_URL}/docs/usage/tui): BitRouter's interactive ACP conversation with route, activity, permissions, and attributed cost
- [Coding agents](${BASE_URL}/docs/usage/coding-agents): Run supported harnesses, configure Claude Code and Codex, and connect model sources
- [MCP Support](${BASE_URL}/docs/usage/mcp): Connect and aggregate upstream MCP servers, expose selected tools to model requests, and search BitRouter documentation
- [ACP Support](${BASE_URL}/docs/usage/acp): Discover adapters, run headless turns, or expose one over stdio
- [Agent Skills](${BASE_URL}/docs/usage/skills): Install the BitRouter Skill, inspect local skills, or scaffold a SKILL.md

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

- [Development Overview](${BASE_URL}/docs/development): Choose the repository and contribution path for the router, documentation, or agent skills
- [BitRouter Source](https://github.com/bitrouter/bitrouter): Rust router source and issue tracker
- [Documentation Source](https://github.com/bitrouter/bitrouter-docs): Website and documentation source

## Optional

- [llms-full.txt](${BASE_URL}/api/docs/llms-full.txt): Complete documentation as plain text for ingestion
- [Blog: Introducing BitRouter](${BASE_URL}/blog/introducing-bitrouter): Long-form launch post
`;
