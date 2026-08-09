import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { searchServer } from "@/lib/search-server";
import { getPostHogClient } from "@/lib/posthog-server";
import { bitrouter } from "@/lib/bitrouter-provider";

export const maxDuration = 30;

const DOCS_MODEL = "deepseek/deepseek-v4-pro";

const INSTRUCTIONS =`You are a helpful assistant for BitRouter documentation.
Always use the \`search\` tool to find relevant documentation before answering.
Base your answer only on the search results and cite the pages you used.
Be concise and accurate. If the search returns nothing relevant, say you don't know.`;

export async function POST(req: Request) {
  const distinctId = req.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";
  const { messages }: { messages: UIMessage[] } = await req.json();

  let searchCalls = 0;

  const tools = {
    search: tool({
      description:
        "Search the BitRouter documentation. Returns relevant sections, each with its page title and URL.",
      inputSchema: z.object({
        query: z.string().describe("The search query"),
      }),
      async execute({ query }) {
        searchCalls++;
        const results = await searchServer.search(query);
        return results.slice(0, 8).map((r) => ({
          url: r.url,
          title: r.breadcrumbs?.length ? r.breadcrumbs.join(" › ") : r.content,
          content: r.content,
        }));
      },
    }),
  };

  const result = streamText({
    model: bitrouter(DOCS_MODEL),
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(4),
    tools,
    onEnd() {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId,
        event: "ai_chat_completion",
        properties: { model: DOCS_MODEL, search_calls: searchCalls },
      });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, tools }),
  });
}
