const LLMS_SMALL_TXT = `# BitRouter

Open-source LLM gateway for AI agent runtimes. High-performance Rust proxy — 200+ models (OpenAI, Anthropic, Google, etc.) via one OpenAI-compatible endpoint.

- Single binary, zero-ops deployment — no Postgres, no Redis, no Docker
- Sub-10ms routing overhead with smart fallbacks
- Self-host or use hosted option with stablecoin payments — no KYC, no geo-restrictions
- Agent-native: KYA identity, payment delegation, CLI/TUI observability

Agent Skills: https://github.com/bitrouter/agent-skills
Base URL: https://bitrouter.ai/api/v1
Docs: https://bitrouter.ai/docs/overview
Full context: https://bitrouter.ai/llms.txt
`;

export function GET() {
  return new Response(LLMS_SMALL_TXT.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
