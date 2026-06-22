import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { searchServer } from "@/lib/search-server";
import { getPostHogClient } from "@/lib/posthog-server";

export const maxDuration = 30;

const bitrouter = createOpenAICompatible({
  name: "bitrouter",
  baseURL: process.env.BITROUTER_API_BASE!,
  apiKey: process.env.BITROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant for BitRouter documentation.
Always use the \`search\` tool to find relevant documentation before answering.
Base your answer only on the search results and cite the pages you used.
Be concise and accurate. If the search returns nothing relevant, say you don't know.`;

export async function POST(req: Request) {
  const distinctId = req.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";
  const { messages }: { messages: UIMessage[] } = await req.json();

  let searchCalls = 0;

  const result = streamText({
    model: bitrouter("bitrouter-balanced"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(4),
    tools: {
      search: tool({
        description:
          "Search the BitRouter documentation. Returns relevant sections, each with its page title and URL.",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
          locale: z
            .enum(["en", "zh"])
            .optional()
            .describe("Docs locale to search; defaults to en"),
        }),
        async execute({ query, locale }) {
          searchCalls++;
          const results = await searchServer.search(query, {
            locale: locale ?? "en",
          });
          return results.slice(0, 8).map((r) => ({
            url: r.url,
            title: r.breadcrumbs?.length ? r.breadcrumbs.join(" › ") : r.content,
            content: r.content,
          }));
        },
      }),
    },
    onFinish() {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId,
        event: "ai_chat_completion",
        properties: { model: "bitrouter-balanced", search_calls: searchCalls },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
