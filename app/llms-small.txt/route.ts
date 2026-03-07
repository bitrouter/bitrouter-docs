const LLMS_SMALL_TXT = `# BitRouter

AI model router: unified API access to 200+ models (OpenAI, Anthropic, Google, etc.) via one OpenAI-compatible endpoint. Permissionless, crypto pay-per-use, intelligent routing.

- 93.2% SWE-bench resolve rate at 42% All-Opus cost (BitRouter Balanced)
- Sub-10ms routing overhead
- Pay with stablecoins (Solana/Base) — no KYC, no geo-restrictions

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
