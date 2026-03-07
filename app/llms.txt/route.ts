const BASE_URL = "https://bitrouter.ai";

const LLMS_TXT = `# BitRouter

> BitRouter is an AI model router that provides unified API access to 200+ models from OpenAI, Anthropic, Google, and more through a single OpenAI-compatible endpoint. It features pay-per-use pricing with crypto payments, intelligent routing, and SDKs for TypeScript and Python.

## Docs

- [Overview](${BASE_URL}/docs/overview): Introduction to BitRouter, key concepts, and getting started
- [FAQs](${BASE_URL}/docs/overview/faqs): Frequently asked questions
- [Service Primitives](${BASE_URL}/docs/overview/service-primitives): Core concepts — routing, payments, and agent identity
- [Pay-Per-Use](${BASE_URL}/docs/overview/pay-per-use): How pricing and crypto payments work
- [Onboarding Guide](${BASE_URL}/docs/overview/manual-guide): Step-by-step setup guide

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

- [Full Documentation](${BASE_URL}/api/docs/llms-full.txt): Complete docs as plain text for LLM ingestion
- [Changelog](${BASE_URL}/docs/overview/changelog): Recent updates and changes
- [Blog](${BASE_URL}/docs/blog/introducing-bitrouter): Introduction to BitRouter
`;

export function GET() {
  return new Response(LLMS_TXT.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
