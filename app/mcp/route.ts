import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchDocs, getDoc, lookupModel } from "@/lib/mcp/tools";
import { LLMS_TXT } from "@/lib/llms-txt";

export const runtime = "nodejs";
export const maxDuration = 60;

// Mounted at the top-level `/mcp` path. `basePath: ""` makes mcp-handler derive
// its streamable endpoint as `/mcp`, matching the real request path — a Next.js
// rewrite cannot be used here because mcp-handler inspects the *external* URL,
// not the rewritten internal one.
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "search_docs",
      {
        title: "Search BitRouter docs",
        description:
          "Full-text search over BitRouter's documentation. Returns titled hits, each with a canonical URL and a `path` to pass to get_doc. Use this first to find relevant guides.",
        inputSchema: {
          query: z.string().describe("Search query, e.g. 'provider fallback'"),
          limit: z
            .number()
            .int()
            .min(1)
            .max(20)
            .optional()
            .describe("Max hits (default 8)"),
          locale: z
            .enum(["en", "zh"])
            .optional()
            .describe("Docs locale; defaults to en"),
        },
      },
      async ({ query, limit, locale }) => {
        const hits = await searchDocs(query, { limit, locale });
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      },
    );

    server.registerTool(
      "get_doc",
      {
        title: "Read a BitRouter doc page",
        description:
          "Fetch one documentation page as Markdown. Pass the `path` (or full URL) returned by search_docs, e.g. 'guides/routing/model-fallback'.",
        inputSchema: {
          path: z.string().describe("Doc slug path or full URL"),
          locale: z
            .enum(["en", "zh"])
            .optional()
            .describe("Docs locale; defaults to en"),
        },
      },
      async ({ path, locale }) => {
        const res = await getDoc(path, locale ?? "en");
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
          "Check whether a model is routable through BitRouter and get its pricing, context window, and a copy-paste config snippet. Accepts a provider/model id (e.g. 'anthropic/claude-sonnet-4') or a name fragment.",
        inputSchema: {
          query: z.string().describe("provider/model id or name fragment"),
        },
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
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: LLMS_TXT.trim() }],
      }),
    );
  },
  {
    serverInfo: { name: "bitrouter-docs", version: "1.0.0" },
    instructions:
      "BitRouter documentation server (public, no auth). Use search_docs to find guides, get_doc to read a page, and lookup_model to check model availability and config.",
  },
  {
    basePath: "",
    maxDuration: 60,
    disableSse: true,
    verboseLogs: false,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
