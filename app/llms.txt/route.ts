const BASE_URL = "https://bitrouter.ai";

const LLMS_TXT = `# BitRouter

> BitRouter is an open-source LLM gateway purpose-built for AI agent runtimes. It's a high-performance Rust proxy that gives agents like OpenClaw, OpenCode, and Claude Code unified access to 200+ models from OpenAI, Anthropic, Google, and more — through a single OpenAI-compatible endpoint. Self-host with your own provider keys, or use the hosted option with agent-native stablecoin payments.

## Key Capabilities

- **Agent-Native Gateway**: Built for autonomous agents, not human-in-the-loop chatbots. Features Know-Your-Agent (KYA) identity and payment delegation keys.
- **Zero-Ops Deployment**: Single Rust binary. No Postgres, no Redis, no Docker orchestration required.
- **Smart Routing**: Configurable routing tables with cost/performance optimization, automatic fallbacks, and sub-10ms routing overhead.
- **OpenAI-Compatible API**: Drop-in replacement — change one base URL and use any OpenAI SDK, LangChain, or Vercel AI SDK.
- **Stablecoin Payments**: Pay-per-use with stablecoins on the hosted service. No credit cards, no KYC, no geo-restrictions. Agents can pay autonomously.
- **CLI + TUI Observability**: Monitor and control agent sessions in real time from the terminal.

## How It Compares

BitRouter is like OpenRouter but open-source, self-hostable, agent-native, and permissionless (no KYC, no geo-restrictions). Unlike LiteLLM, it ships as a single binary with zero infrastructure dependencies.

## Getting Started

- [Quick Start](${BASE_URL}/docs/overview): Install agent skills or CLI and start routing
- [Agent Skills](https://github.com/bitrouter/agent-skills): Install skills into your agent for autonomous setup
- [What is BitRouter?](${BASE_URL}/docs/overview/what-is-bitrouter): Detailed explainer and comparisons

## Docs

- [Service Primitives](${BASE_URL}/docs/overview/service-primitives): Models, tools, and agents — the three service primitives
- [Agent-Native Control](${BASE_URL}/docs/overview/agent-native-control): Self-custodial pay-per-use and payment delegation keys
- [Intelligent Routing](${BASE_URL}/docs/overview/intelligent-routing): Routing tables, fallbacks, and performance
- [Onboarding Guide](${BASE_URL}/docs/overview/manual-guide): Step-by-step manual setup guide

## API Reference

- [API Overview](${BASE_URL}/docs/api-reference): Base URL, authentication, and conventions
- [Chat Completions](${BASE_URL}/docs/api-reference/chat): OpenAI-compatible chat API
- [Image Generation](${BASE_URL}/docs/api-reference/image): Image generation API
- [Video Generation](${BASE_URL}/docs/api-reference/video): Video generation API
- [Models](${BASE_URL}/docs/api-reference/models): List available models and pricing

## SDKs

- [TypeScript SDK](${BASE_URL}/docs/sdk-reference/typescript): Install and use @aimo.network/sdk
- [Python SDK](${BASE_URL}/docs/sdk-reference/python): Install and use aimo-network-sdk
- [Vercel AI Provider](${BASE_URL}/docs/sdk-reference/ts-provider): Use BitRouter with Vercel AI SDK

## Tutorials

- [OpenAI SDK Integration](${BASE_URL}/docs/tutorial/openai-sdk): Drop-in replacement for OpenAI SDK
- [LangChain Integration](${BASE_URL}/docs/tutorial/langchain): Use BitRouter with LangChain
- [Vercel AI SDK Integration](${BASE_URL}/docs/tutorial/ai-sdk): Use BitRouter with Vercel AI SDK
- [Claude Code Integration](${BASE_URL}/docs/tutorial/claude-code): Use BitRouter with Claude Code

## Optional

- [Compact Summary (llms-small.txt)](${BASE_URL}/llms-small.txt): Token-constrained version (~200 tokens) for quick context
- [Full Documentation](${BASE_URL}/api/docs/llms-full.txt): Complete docs as plain text for LLM ingestion
- [What is BitRouter?](${BASE_URL}/docs/overview/what-is-bitrouter): Detailed explainer and comparison with OpenRouter
- [Changelog](${BASE_URL}/docs/overview/changelog): Recent updates and changes
- [Blog](${BASE_URL}/blog/introducing-bitrouter): Introduction to BitRouter
`;

export function GET() {
  return new Response(LLMS_TXT.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
