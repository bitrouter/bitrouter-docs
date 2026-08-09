import type { LanguageModelUsage, UIMessage } from "ai";

import type { HarnessId } from "@/lib/harnesses";

/**
 * Models offered in the `/chat` playground.
 *
 * This is a deliberate allowlist, not the full `/v1/models` catalog: the page
 * runs on the site's shared BitRouter key, so the route handler must never
 * forward an arbitrary client-supplied model id. Keep the set small, cheap to
 * serve, and spread across vendors — the point is to show that one endpoint
 * reaches every provider.
 *
 * Prices are USD per million tokens, mirrored from `.models-snapshot.json`
 * for display only; the router is the source of truth for billing.
 */
export type ChatModel = {
  id: string;
  label: string;
  vendor: string;
  /** Key for `ProviderIcon` — matches the vendor prefix of `id`. */
  provider: string;
  inputUsdPerM: number;
  outputUsdPerM: number;
  /** Context window in tokens, used by the `Context` usage meter. */
  contextWindow: number;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "deepseek/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    vendor: "DeepSeek",
    provider: "deepseek",
    inputUsdPerM: 0.112,
    outputUsdPerM: 0.224,
    contextWindow: 262144,
  },
  {
    id: "minimax/minimax-m3",
    label: "MiniMax M3",
    vendor: "MiniMax",
    provider: "minimax",
    inputUsdPerM: 0.3,
    outputUsdPerM: 1.2,
    contextWindow: 1048576,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    vendor: "DeepSeek",
    provider: "deepseek",
    inputUsdPerM: 0.435,
    outputUsdPerM: 0.87,
    contextWindow: 256000,
  },
  {
    id: "z-ai/glm-5.2",
    label: "GLM 5.2",
    vendor: "Z.ai",
    provider: "z-ai",
    inputUsdPerM: 0.979,
    outputUsdPerM: 3.08,
    contextWindow: 1000000,
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    vendor: "Anthropic",
    provider: "anthropic",
    inputUsdPerM: 1,
    outputUsdPerM: 5,
    contextWindow: 200000,
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "GPT-5.4 mini",
    vendor: "OpenAI",
    provider: "openai",
    inputUsdPerM: 0.75,
    outputUsdPerM: 4.5,
    contextWindow: 128000,
  },
  {
    id: "x-ai/grok-4.5",
    label: "Grok 4.5",
    vendor: "xAI",
    provider: "x-ai",
    inputUsdPerM: 2,
    outputUsdPerM: 6,
    contextWindow: 500000,
  },
  {
    id: "qwen/qwen3.8-max",
    label: "Qwen 3.8 Max",
    vendor: "Qwen",
    provider: "qwen",
    inputUsdPerM: 2,
    outputUsdPerM: 6,
    contextWindow: 1000000,
  },
];

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].id;

export function isAllowedChatModel(id: unknown): id is string {
  return typeof id === "string" && CHAT_MODELS.some((m) => m.id === id);
}

export function getChatModel(id: string): ChatModel | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}

/**
 * Per-message metadata the route streams back on `finish`, so the client can
 * render real token usage instead of estimating it.
 */
export type ChatMetadata = {
  model?: string;
  /** Which harness produced the turn — both axes are shown per message. */
  harness?: HarnessId;
  usage?: LanguageModelUsage;
};

export type ChatUIMessage = UIMessage<ChatMetadata>;

/**
 * Cost in USD for a token count on a given model.
 *
 * Deliberately not `tokenlens` (which AI Elements' `Context` ships with by
 * default): tokenlens resolves prices from its own catalog, which does not
 * know BitRouter's model ids — it returns an empty `costUSD`, and the
 * component then renders a confident `$0.00`. Our prices are the ones in
 * `.models-snapshot.json`, so use those and return `undefined` when a model
 * is unknown, so callers can omit the figure rather than print a wrong zero.
 */
export function estimateCostUsd({
  modelId,
  inputTokens = 0,
  outputTokens = 0,
}: {
  modelId?: string;
  inputTokens?: number;
  outputTokens?: number;
}): number | undefined {
  const model = modelId ? getChatModel(modelId) : undefined;
  if (!model) return undefined;

  return (
    (inputTokens / 1_000_000) * model.inputUsdPerM +
    (outputTokens / 1_000_000) * model.outputUsdPerM
  );
}
