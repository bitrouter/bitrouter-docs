import { getSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-static";

export function GET() {
  const origin = getSiteOrigin();
  const host = new URL(origin).hostname;
  const entries = [
    ["mcp:docs", "BitRouter documentation MCP", "application/mcp-server-card+json", "/.well-known/mcp/server-card.json"],
    ["api:cloud", "BitRouter Cloud OpenAPI", "application/vnd.oai.openapi+json", "/openapi.json"],
    ["docs:index", "BitRouter documentation index", "text/plain", "/llms.txt"],
    ["docs:quickstart", "BitRouter Quickstart", "text/markdown", "/docs/overview/quickstart.md"],
  ].map(([id, displayName, type, path]) => ({
    identifier: `urn:air:${host}:${id}`,
    displayName,
    type,
    url: `${origin}${path}`,
  }));
  return Response.json({ specVersion: "1.0", entries }, {
    headers: { "Content-Type": "application/ai-catalog+json" },
  });
}
