import { LLMS_PRODUCT_SUMMARY } from "@/lib/llms-shared";
import { getSiteOrigin } from "@/lib/site-origin";
import { markdownHeaders } from "@/lib/markdown-http";

export const dynamic = "force-static";

export function GET() {
  const origin = getSiteOrigin();
  return new Response(`# BitRouter — The Open Market for Elastic Inference

${LLMS_PRODUCT_SUMMARY}

## Agent Playground

[Try the fx agent](${origin}/try) in a browser workspace, or use the embedded
playground on the homepage. Draft a task, sign in to BitRouter Cloud, and run it
with streamed responses and browser file tools. The workspace cannot access
files on your computer. WebAssembly JSPI support is required. Inference depends
on service availability; an unavailable service preserves your task for retry.

## Start here

- [Quickstart](${origin}/docs/overview/quickstart.md)
- [Pricing](${origin}/pricing.md)
- [Documentation index](${origin}/llms.txt)
- [Documentation MCP endpoint](${origin}/mcp)
- [Cloud OpenAPI schema](${origin}/openapi.json)
`, { headers: markdownHeaders });
}
