import { describe, expect, it } from "vitest";

import { CHAT_MODELS } from "../chat-models";
import {
  buildPiModelsJson,
  PI_ALIAS_PREFIX,
  piAlias,
  piAliasToModelId,
} from "./models-json";

const baseUrl = "https://api.bitrouter.ai/v1";

describe("buildPiModelsJson", () => {
  it("nests providers under the `providers` key Pi's schema requires", () => {
    const json = buildPiModelsJson({ baseUrl });
    // A bare provider map fails Pi's validation, and the error surfaces only on
    // ModelConfig.error — the catalog silently ends up empty.
    expect(Object.keys(json)).toEqual(["providers"]);
    expect(json.providers.bitrouter.baseUrl).toBe(baseUrl);
    expect(json.providers.bitrouter.api).toBe("openai-completions");
    expect(json.providers.bitrouter.authHeader).toBe(true);
  });

  it("keeps the bare model id as the wire value", () => {
    const json = buildPiModelsJson({ baseUrl });
    const ids = json.providers.bitrouter.models.map((m) => m.id);
    expect(ids).toEqual(CHAT_MODELS.map((m) => m.id));
  });

  it("gives every model a prefixed name so builtin ids cannot win", () => {
    // Pi ships ~1,070 builtin models whose ids are also `vendor/model` shaped;
    // `deepseek/deepseek-v4-flash` exists there under openrouter. Its resolver
    // matches id-or-name and takes the first hit, so an unprefixed entry routes
    // to the builtin provider instead of BitRouter.
    const json = buildPiModelsJson({ baseUrl });
    for (const model of json.providers.bitrouter.models) {
      expect(model.name).toBe(`${PI_ALIAS_PREFIX}${model.id}`);
      expect(model.name).not.toBe(model.id);
    }
  });

  it("carries the display cost and context window across", () => {
    const [first] = buildPiModelsJson({
      baseUrl,
      models: [
        {
          id: "vendor/model",
          label: "Model",
          vendor: "Vendor",
          provider: "vendor",
          inputUsdPerM: 1.5,
          outputUsdPerM: 6,
          contextWindow: 128000,
        },
      ],
    }).providers.bitrouter.models;

    expect(first).toEqual({
      id: "vendor/model",
      name: "bitrouter:vendor/model",
      contextWindow: 128000,
      cost: { input: 1.5, output: 6, cacheRead: 0, cacheWrite: 0 },
    });
  });
});

describe("piAlias", () => {
  it("round-trips", () => {
    for (const model of CHAT_MODELS) {
      expect(piAliasToModelId(piAlias(model.id))).toBe(model.id);
    }
  });

  it("leaves an unprefixed id alone", () => {
    expect(piAliasToModelId("deepseek/deepseek-v4-flash")).toBe(
      "deepseek/deepseek-v4-flash",
    );
  });
});
