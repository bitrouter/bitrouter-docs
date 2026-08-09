import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Shared AI SDK provider pointed at the BitRouter router.
 *
 * BitRouter speaks the OpenAI wire format, so `@ai-sdk/openai-compatible` is
 * the right adapter — `bitrouter("<vendor>/<model>")` passes the model id
 * through untouched and the router resolves it to an upstream provider.
 *
 * This uses the site's own server-side key. It is never exposed to the client;
 * every call goes through a route handler under `app/api/`.
 */
export const bitrouter = createOpenAICompatible({
  name: "bitrouter",
  baseURL: process.env.BITROUTER_API_BASE!,
  apiKey: process.env.BITROUTER_API_KEY,
});
