import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import type { PlaygroundCredential } from "@/lib/playground-credential";

/**
 * AI SDK providers pointed at the BitRouter router.
 *
 * BitRouter speaks the OpenAI wire format, so `@ai-sdk/openai-compatible` is
 * the right adapter — `bitrouter("<vendor>/<model>")` passes the model id
 * through untouched and the router resolves it to an upstream provider.
 *
 * There are two, because the site spends on two different things:
 *
 * - {@link bitrouter} is the house account. It backs the docs "Ask AI" search,
 *   which is site functionality rather than something a visitor is billed for.
 * - {@link createBitrouterProvider} is per-request, built from a credential the
 *   playground resolved for whoever is signed in, so their turns are attributed
 *   and capped against their own grant.
 *
 * Neither key reaches the client; every call goes through a route handler under
 * `app/api/`.
 */
export const bitrouter = createOpenAICompatible({
  name: "bitrouter",
  baseURL: process.env.BITROUTER_API_BASE!,
  apiKey: process.env.BITROUTER_API_KEY,
});

/**
 * A provider bound to one resolved credential.
 *
 * Built per request rather than memoised: in session mode the token is minted
 * for a single visitor and expires within minutes, so caching it across
 * requests would leak one user's spend authority into another's turn.
 */
export function createBitrouterProvider(credential: PlaygroundCredential) {
  return createOpenAICompatible({
    name: "bitrouter",
    baseURL: credential.baseUrl,
    apiKey: credential.token,
  });
}
