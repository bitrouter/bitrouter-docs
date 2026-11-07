"use client";

// Adapted from @fumadocs/cli feature webmcp (1.8.1). No polyfill: browsers
// without the experimental API keep using HTTP Markdown and the MCP endpoint.
import { useEffect } from "react";
import { useRouter } from "fumadocs-core/framework";
import { fetchClient } from "fumadocs-core/search/client/fetch";
import { docsToolUrl, docsToolMarkdownUrl } from "@/lib/webmcp";

interface ModelContextTool<Input> {
  name: string;
  description: string;
  inputSchema: object;
  execute: (input: Input) => Promise<unknown>;
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: <Input>(
        tool: ModelContextTool<Input>,
        options?: { signal?: AbortSignal },
      ) => Promise<void>;
    };
  }
}

export function WebMCP() {
  const router = useRouter();
  useEffect(() => {
    const context = document.modelContext;
    if (!context) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const client = fetchClient();
    const register = <Input,>(tool: ModelContextTool<Input>) => {
      void context.registerTool(tool, options).catch(() => {
        // Experimental implementations may reject registration; HTTP stays available.
      });
    };
    register({
      name: "search_docs",
      description:
        "Search BitRouter docs for matching pages and headings with URLs.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
      async execute({ query }: { query: string }) {
        return client.search(query);
      },
    });
    register({
      name: "read_page",
      description: "Read a BitRouter docs page as Markdown by its URL.",
      inputSchema: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
      async execute({ url }: { url: string }) {
        const response = await fetch(docsToolMarkdownUrl(url, location.origin));
        if (!response.ok) throw new Error(`Page not found: ${url}`);
        return response.text();
      },
    });
    register({
      name: "open_page",
      description: "Navigate to a BitRouter docs page on the current website.",
      inputSchema: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
      async execute({ url }: { url: string }) {
        const target = docsToolUrl(url, location.origin);
        target.pathname = target.pathname.replace(/\.md$/, "");
        await router.push(target.pathname + target.hash);
        return `Opened ${target.href}`;
      },
    });
    return () => controller.abort();
  }, [router]);
  return null;
}
