import { z } from "zod";
import { playgroundError } from "./playground-auth";
import { maxPlaygroundImageBytes, playgroundImageTypes, playgroundToolDefinitions, playgroundToolNames } from "./playground-tools";

const cloudBase = "https://api.bitrouter.ai/v1";
const requestId = z.string().regex(/^[\w:-]{1,128}$/);
const text = z.string().max(48_000);
const textPart = z.object({ type: z.literal("text"), text });
const dataImageUrl = z.string().max(Math.ceil(maxPlaygroundImageBytes / 3) * 4 + 32).refine((url) => {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(url);
  if (!match || !playgroundImageTypes.some((type) => type === match[1])) return false;
  const bytes = Buffer.from(match[2], "base64");
  return bytes.length > 0 && bytes.length <= maxPlaygroundImageBytes &&
    bytes.toString("base64").replace(/=+$/, "") === match[2].replace(/=+$/, "");
});
const imagePart = z.object({ type: z.literal("image_url"), image_url: z.object({ url: dataImageUrl }) });
const userContent = z.union([text, z.array(z.discriminatedUnion("type", [textPart, imagePart])).min(1).max(16)]);
const toolCall = z.object({
  id: requestId,
  type: z.literal("function"),
  function: z.object({ name: z.enum(playgroundToolNames), arguments: text }),
});

export const playgroundCloudRequest = z.object({
  messages: z.array(z.discriminatedUnion("role", [
    z.object({ role: z.literal("system"), content: text }),
    z.object({ role: z.literal("user"), content: userContent }),
    z.object({ role: z.literal("assistant"), content: text.nullish(), reasoning_content: text.nullish(), tool_calls: z.array(toolCall).max(12).optional() }),
    z.object({ role: z.literal("tool"), tool_call_id: requestId, content: text }),
  ])).min(1).max(48),
  max_tokens: z.number().int().positive().optional(),
});

const tools = playgroundToolNames.map((name) => ({
  type: "function",
  function: { name, description: playgroundToolDefinitions[name].description, parameters: playgroundToolDefinitions[name].inputSchema },
}));

export function playgroundCloudConfig() {
  const apiKey = process.env.BITROUTER_PLAYGROUND_API_KEY?.trim();
  const model = process.env.BITROUTER_PLAYGROUND_MODEL?.trim();
  const vision = process.env.BITROUTER_PLAYGROUND_VISION_MODEL?.trim();
  if (apiKey && model && /^[\w.-]+\/[\w.-]+$/.test(model)) {
    return { apiKey, model, visionModel: vision && /^[\w.-]+\/[\w.-]+$/.test(vision) ? vision : undefined };
  }
}

export function hasPlaygroundImages(input: z.infer<typeof playgroundCloudRequest>) {
  return input.messages.some((message) => message.role === "user" && Array.isArray(message.content) &&
    message.content.some((part) => part.type === "image_url"));
}

type CloudConfig = NonNullable<ReturnType<typeof playgroundCloudConfig>>;

export async function streamPlaygroundCloud(
  config: CloudConfig,
  input: z.infer<typeof playgroundCloudRequest>,
  signal: AbortSignal,
) {
  const model = hasPlaygroundImages(input) ? config.visionModel : config.model;
  if (!model) return playgroundError("Image input is unavailable right now. Remove the image to continue.", 422);
  const upstream = await fetch(`${cloudBase}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: input.messages,
      tools,
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: Math.min(input.max_tokens ?? 2048, 2048),
    }),
    signal,
    redirect: "error",
    cache: "no-store",
  });
  if (!upstream.ok || !upstream.body || !upstream.headers.get("content-type")?.startsWith("text/event-stream")) {
    await upstream.body?.cancel();
    if (upstream.status === 401 || upstream.status === 403) return playgroundError("The agent could not connect to BitRouter Cloud. Please try again later.", 502);
    if (upstream.status === 402 || upstream.status === 429) {
      return playgroundError("The agent has reached its inference limit. Please try again later.", upstream.status);
    }
    return playgroundError("BitRouter Cloud inference could not start.", 502);
  }
  const id = requestId.safeParse(upstream.headers.get("x-bitrouter-request-id")).data;
  // Cloud owns usage and settlement. Keep the request correlation server-side.
  console.info("playground.inference", { requestId: id ?? null, model, status: upstream.status });
  return new Response(upstream.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "private, no-store" },
  });
}
