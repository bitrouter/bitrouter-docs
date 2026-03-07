import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { source } from "@/lib/source";

export const maxDuration = 30;

const bitrouter = createOpenAICompatible({
  name: "bitrouter",
  baseURL: "https://bitrouter.ai/api/v1",
  apiKey: process.env.BITROUTER_API_KEY,
});

async function getDocsContext(): Promise<string> {
  const pages = source.getPages();
  const texts = await Promise.all(
    pages.map(async (page) => {
      const processed = await page.data.getText("processed");
      return `# ${page.data.title} (${page.url})\n\n${processed}`;
    }),
  );
  return texts.join("\n\n---\n\n");
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const docsContext = await getDocsContext();

  const result = streamText({
    model: bitrouter("bitrouter-balanced"),
    system: `You are a helpful assistant for BitRouter documentation. Answer questions based on the following documentation content. Be concise and accurate. If you don't know the answer, say so.

Documentation:
${docsContext}`,
    messages,
  });

  return result.toDataStreamResponse();
}
