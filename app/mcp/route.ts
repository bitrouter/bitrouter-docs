import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { registerSourceTools, registerSearchTool } from "fumadocs-core/mcp";
import { canonicalSource, docsLlms } from "@/lib/source";
import { searchServer } from "@/lib/search-server";
import { z } from "zod";
import { searchDocs, getDoc, lookupModel } from "@/lib/mcp/tools";
import { getDocumentationIndex } from "@/lib/source";
import { docsMcpServerInfo } from "@/lib/mcp/server-info";

export const runtime = "nodejs";
export const maxDuration = 60;

// Fumadocs native tools share the same canonical index and Markdown renderer as HTTP.
// Keep /mcp and the existing aliases for agents with saved connection settings.
const handler = createMcpHandler(() => {
  const server = new McpServer(docsMcpServerInfo, {
    capabilities: {
      tools: { listChanged: false },
      resources: { listChanged: false },
    },
    instructions:
      "Public BitRouter documentation. Use list_pages, search and get_page; search_docs/get_doc and lookup_model remain available for section retrieval and model lookup.",
  });
  registerSourceTools(server, canonicalSource, docsLlms);
  registerSearchTool(server, searchServer);

  server.registerTool(
    "search_docs",
    {
      title: "Search BitRouter docs",
      description:
        "Full-text search over BitRouter's documentation. Pass a result's sectionUrl or path to get_doc.",
      inputSchema: z.object({
        query: z.string().describe("Search query, e.g. 'provider fallback'"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe("Max hits (default 8)"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async ({ query, limit }) => {
      const hits = await searchDocs(query, { limit });
      return {
        content: [{ type: "text", text: JSON.stringify(hits, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_doc",
    {
      title: "Read a BitRouter doc page",
      description:
        "Fetch one documentation page or section as Markdown. Use a path or sectionUrl returned by search_docs.",
      inputSchema: z.object({
        path: z.string().describe("Doc slug path or full URL"),
        section: z
          .string()
          .optional()
          .describe("Heading anchor, e.g. send-a-request"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async ({ path, section }) => {
      const res = await getDoc(path, section);
      if (!res.ok)
        return { content: [{ type: "text", text: res.error }], isError: true };
      return { content: [{ type: "text", text: res.markdown }] };
    },
  );

  server.registerTool(
    "lookup_model",
    {
      title: "Look up a routable model",
      description:
        "Check whether a model is routable through BitRouter and get its pricing, context window, and a copy-paste config snippet. Accepts a provider/model id (e.g. 'anthropic/claude-sonnet-4.6') or a name fragment.",
      inputSchema: z.object({
        query: z.string().describe("provider/model id or name fragment"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async ({ query }) => {
      const answer = await lookupModel(query);
      return {
        content: [{ type: "text", text: JSON.stringify(answer, null, 2) }],
      };
    },
  );

  server.registerResource(
    "llms-index",
    "bitrouter-docs://llms-index",
    {
      title: "BitRouter llms.txt index",
      description: "Curated index of BitRouter documentation (llms.txt).",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: getDocumentationIndex(),
        },
      ],
    }),
  );
  return server;
});

export async function GET(request: Request) {
  return handler.fetch(request);
}
export async function POST(request: Request) {
  return handler.fetch(request);
}
export async function DELETE(request: Request) {
  return handler.fetch(request);
}
