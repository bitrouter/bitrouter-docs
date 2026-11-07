import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createMcpAdapter } from "libfx/mcp";
import { playgroundToolDefinitions } from "@/lib/playground-tools";

const names = ["search_docs", "get_doc", "lookup_model"] as const;

export function openPlaygroundDocs() {
  const client = new Client({ name: "bitrouter-playground", version: "1.0.0" });
  let connection: Promise<void> | undefined;
  let transport: StreamableHTTPClientTransport | undefined;
  return createMcpAdapter({
    // Pin the exposed tools to the same contract enforced by the inference proxy.
    listTools: () => names.map((name) => ({ name, ...playgroundToolDefinitions[`docs_${name}`] })),
    async callTool({ name, arguments: args, _meta }, _schema, options) {
      const signal = AbortSignal.any([AbortSignal.timeout(10_000), ...(options?.signal ? [options.signal] : [])]);
      if (!connection) {
        transport = new StreamableHTTPClientTransport(new URL("/mcp", window.location.origin));
        connection = client.connect(transport, { signal }).catch(async (error) => {
          connection = undefined;
          await transport?.close();
          throw error;
        });
      }
      await connection;
      const result = await client.callTool({ name, arguments: args as Record<string, unknown>, _meta }, undefined, { signal });
      const content = Array.isArray(result.content) ? result.content : [];
      const text = content.flatMap((part) => part?.type === "text" && typeof part.text === "string" ? [part.text] : []).join("\n");
      return { isError: result.isError, content: [{ type: "text", text: text.length > 8000 ? `${text.slice(0, 8000)}\n[Truncated]` : text }] };
    },
    close: () => client.close(),
  }, { prefix: "docs_", serverName: "bitrouter-docs" });
}
