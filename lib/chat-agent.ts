import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { getDoc, lookupModel, searchDocs } from "@/lib/mcp/tools";

/**
 * Tools for `/chat` agent mode.
 *
 * These are the same read-only capabilities the public MCP server at `/mcp`
 * exposes (`lib/mcp/tools.ts`) — docs search, doc read, model lookup. Agent
 * mode deliberately has no sandbox, shell, file write, or outbound web fetch:
 * the endpoint is unauthenticated and spends the site's shared key, so every
 * tool here has to be safe to run unattended for an anonymous visitor.
 */
export const agentTools = {
  search_docs: tool({
    description:
      "Search BitRouter's documentation. Returns titled hits, each with a canonical URL and a `path` to pass to read_doc. Use this first to find relevant pages.",
    inputSchema: z.object({
      query: z.string().describe("Search query, e.g. 'provider fallback'"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe("Max hits (default 6)"),
    }),
    execute: ({ query, limit }) => searchDocs(query, { limit: limit ?? 6 }),
  }),

  read_doc: tool({
    description:
      "Read one BitRouter documentation page as Markdown. Pass the `path` returned by search_docs, e.g. 'guides/routing/model-fallback'.",
    inputSchema: z.object({
      path: z.string().describe("Doc slug path or full URL"),
    }),
    execute: ({ path }) => getDoc(path),
  }),

  lookup_model: tool({
    description:
      "Look up models in BitRouter's catalog by name, vendor, or capability. Returns pricing, context window, and modalities. Use this for any question about what a model costs or supports.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Model name, vendor, or capability, e.g. 'cheap vision'"),
    }),
    execute: ({ query }) => lookupModel(query),
  }),
} as const;

export const AGENT_INSTRUCTIONS = `You are BitRouter's research agent.

Work autonomously: when a question needs facts about BitRouter's docs, models, or pricing, plan a short sequence of tool calls, run them, and then answer. Do not ask the user for permission to search.

Rules:
- Ground every factual claim about BitRouter in a tool result. Never guess at pricing, model ids, or config syntax.
- Cite the pages you used, as Markdown links.
- Prefer lookup_model for anything about model cost, context window, or modalities.
- If the tools return nothing relevant, say so plainly rather than inventing an answer.
- Be concise. Use Markdown, and fenced code blocks for config or commands.`;

/**
 * Hard ceiling on agent steps.
 *
 * Agent mode multiplies token spend per user message, and this endpoint runs
 * on the site's shared key with no auth in front of it. This cap is the only
 * thing bounding the cost of a single request.
 */
export const AGENT_MAX_STEPS = 6;

/**
 * Model used for the agent's tool-calling steps.
 *
 * The point of routing: intermediate steps are mostly "decide which tool to
 * call next", which a cheap model does fine. The user's selected model is
 * reserved for the final synthesis, where quality actually shows.
 */
export const AGENT_STEP_MODEL = "deepseek/deepseek-v4-flash";
