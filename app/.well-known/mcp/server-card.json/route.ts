import { docsMcpServerInfo } from "@/lib/mcp/server-info";
import { getSiteOrigin } from "@/lib/site-origin";

export const dynamic = "force-static";

export function GET() {
  const origin = getSiteOrigin();
  return Response.json({
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    ...docsMcpServerInfo,
    description: "Search and read BitRouter documentation and look up routable models.",
    websiteUrl: origin,
    remotes: [{ type: "streamable-http", url: `${origin}/mcp` }],
  }, { headers: { "Content-Type": "application/mcp-server-card+json" } });
}
