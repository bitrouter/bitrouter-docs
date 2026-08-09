// Relative, not `@/` — vitest runs this file without path aliases and
// CHAT_MODELS is a value import, so an alias here breaks the test run.
import { CHAT_MODELS, type ChatModel } from "../chat-models";

/**
 * Pi's `models.json`, generated from the `/chat` allowlist.
 *
 * Pi never discovers models over the network — `@ai-sdk/harness-pi` hardcodes
 * `allowModelNetwork: false`, so BitRouter's `/v1/models` is never consulted
 * and a catalog file is the only way Pi learns our ids exist. Without one it
 * silently resolves nothing and falls back to its own default model.
 */

/**
 * Alias prefix for every BitRouter model id.
 *
 * Pi ships a builtin catalog of ~1,070 models across ~34 providers, and its
 * ids are `vendor/model` shaped — exactly like ours. `deepseek/deepseek-v4-flash`
 * already exists there under both `openrouter` and `vercel-ai-gateway`, so the
 * bare id is ambiguous.
 *
 * Pi's resolver matches `model.id === query || model.name === query` and takes
 * the *first* hit, which is a builtin — meaning a bare id routes to OpenRouter
 * and fails with "No API key found for openrouter", naming a provider we never
 * configured. Addressing models by a prefixed `name` disambiguates, while `id`
 * stays the value that goes out on the wire so BitRouter receives what we mean.
 */
export const PI_ALIAS_PREFIX = "bitrouter:";

export function piAlias(modelId: string): string {
  return `${PI_ALIAS_PREFIX}${modelId}`;
}

export function piAliasToModelId(alias: string): string {
  return alias.startsWith(PI_ALIAS_PREFIX)
    ? alias.slice(PI_ALIAS_PREFIX.length)
    : alias;
}

export type PiModelsJson = {
  providers: {
    bitrouter: {
      name: string;
      baseUrl: string;
      api: "openai-completions";
      /** Send `Authorization: Bearer <key>`. */
      authHeader: true;
      models: {
        id: string;
        name: string;
        contextWindow: number;
        cost: {
          input: number;
          output: number;
          cacheRead: number;
          cacheWrite: number;
        };
      }[];
    };
  };
};

/**
 * Build the catalog Pi reads at startup.
 *
 * The `providers` wrapper is required — Pi validates against a schema whose
 * root object needs it, and a bare provider map is rejected with the error
 * buried on `ModelConfig.error` rather than thrown.
 */
export function buildPiModelsJson({
  baseUrl,
  models = CHAT_MODELS,
}: {
  baseUrl: string;
  models?: ChatModel[];
}): PiModelsJson {
  return {
    providers: {
      bitrouter: {
        name: "BitRouter",
        baseUrl,
        api: "openai-completions",
        authHeader: true,
        models: models.map((m) => ({
          id: m.id,
          name: piAlias(m.id),
          contextWindow: m.contextWindow,
          // Display only — the router bills, not Pi.
          cost: {
            input: m.inputUsdPerM,
            output: m.outputUsdPerM,
            cacheRead: 0,
            cacheWrite: 0,
          },
        })),
      },
    },
  };
}
