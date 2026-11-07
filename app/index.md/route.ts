import { LLMS_PRODUCT_SUMMARY } from "@/lib/llms-shared";
import { getSiteOrigin } from "@/lib/site-origin";
import { markdownHeaders } from "@/lib/markdown-http";

export const dynamic = "force-static";

export function GET() {
  const origin = getSiteOrigin();
  return new Response(`# BitRouter — The Open Market for Elastic Inference

${LLMS_PRODUCT_SUMMARY}

## Start here

- [Quickstart](${origin}/docs/overview/quickstart.md)
- [Pricing](${origin}/pricing.md)
- [Documentation index](${origin}/llms.txt)
- [Documentation MCP endpoint](${origin}/mcp)
- [Cloud OpenAPI schema](${origin}/openapi.json)
`, { headers: markdownHeaders });
}
