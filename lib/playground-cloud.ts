import { createHmac, timingSafeEqual } from "node:crypto";
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

export const playgroundProfile = z.enum(["latency", "cost"]);
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
  const model = process.env.BITROUTER_PLAYGROUND_MODEL?.trim() || "z-ai/glm-5.3-flash";
  const vision = process.env.BITROUTER_PLAYGROUND_VISION_MODEL?.trim();
  if (apiKey && /^[\w.-]+\/[\w.-]+$/.test(model)) {
    return { apiKey, model, visionModel: vision && /^[\w.-]+\/[\w.-]+$/.test(vision) ? vision : undefined };
  }
}

export function hasPlaygroundImages(input: z.infer<typeof playgroundCloudRequest>) {
  return input.messages.some((message) => message.role === "user" && Array.isArray(message.content) &&
    message.content.some((part) => part.type === "image_url"));
}

type CloudConfig = NonNullable<ReturnType<typeof playgroundCloudConfig>>;

function receiptSignature(value: string, principal: string, key: string) {
  return createHmac("sha256", key).update("playground-receipt\0").update(principal).update("\0").update(value).digest();
}

function makeHandle(id: string, principal: string, key: string) {
  const value = Buffer.from(`${Date.now() + 5 * 60_000}:${id}`).toString("base64url");
  return `${value}.${receiptSignature(value, principal, key).toString("base64url")}`;
}

function readHandle(handle: string, principal: string, key: string) {
  if (handle.length > 260) return;
  const [value, signature, extra] = handle.split(".");
  if (!value || !signature || extra !== undefined) return;
  const provided = Buffer.from(signature, "base64url");
  const expected = receiptSignature(value, principal, key);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return;
  const decoded = Buffer.from(value, "base64url").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator === -1 || Number(decoded.slice(0, separator)) <= Date.now()) return;
  return requestId.safeParse(decoded.slice(separator + 1)).data;
}

export async function streamPlaygroundCloud(
  config: CloudConfig,
  input: z.infer<typeof playgroundCloudRequest>,
  profile: z.infer<typeof playgroundProfile>,
  principal: string,
  signal: AbortSignal,
) {
  const model = hasPlaygroundImages(input) ? config.visionModel : config.model;
  if (!model) return playgroundError("This preview needs a configured vision model to run a task with images.", 422);
  const upstream = await fetch(`${cloudBase}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `${model}:${profile}`,
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
    if (upstream.status === 401 || upstream.status === 403) return playgroundError("BitRouter Cloud rejected the preview credential.", 502);
    if (upstream.status === 402 || upstream.status === 429) {
      return playgroundError("BitRouter Cloud could not admit the request. Check the demo budget and limits.", upstream.status);
    }
    return playgroundError("BitRouter Cloud inference could not start.", 502);
  }
  const id = requestId.safeParse(upstream.headers.get("x-bitrouter-request-id")).data;
  const headers = new Headers({ "Content-Type": "text/event-stream", "Cache-Control": "no-store" });
  if (id) headers.set("X-Playground-Receipt", makeHandle(id, principal, config.apiKey));
  return new Response(upstream.body, { headers });
}

const receiptPayload = z.object({
  state: z.enum(["pending", "settlement_missing", "computed", "not_charged", "unknown"]),
  model_id: z.string().nullable(),
  provider_id: z.string().nullable(),
  final_charge_micro_usd: z.number().nullable(),
  usage: z.object({
    uncached_input_tokens: z.number(), cache_read_tokens: z.number(),
    cache_write_tokens: z.number(), output_tokens: z.number(),
  }).nullable(),
});

export async function getPlaygroundReceipt(config: CloudConfig, handle: string, principal: string, signal: AbortSignal) {
  const id = readHandle(handle, principal, config.apiKey);
  if (!id) return new Response(null, { status: 404 });
  const upstream = await fetch(`${cloudBase}/requests/${encodeURIComponent(id)}/settlement`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
    signal,
    cache: "no-store",
    redirect: "error",
  });
  if (upstream.status === 404) return Response.json({ state: "pending" }, { headers: { "Cache-Control": "no-store" } });
  if (!upstream.ok) return new Response(null, { status: 502 });
  const data = receiptPayload.safeParse(await upstream.json());
  if (!data.success) return new Response(null, { status: 502 });
  const { state, model_id, provider_id, final_charge_micro_usd, usage } = data.data;
  return Response.json({
    state, model: model_id, provider: provider_id, chargeMicroUsd: final_charge_micro_usd,
    inputTokens: usage && usage.uncached_input_tokens + usage.cache_read_tokens + usage.cache_write_tokens,
    outputTokens: usage?.output_tokens ?? null,
  }, { headers: { "Cache-Control": "no-store" } });
}
