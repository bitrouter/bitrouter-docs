import { describe, expect, it } from "vitest";

import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  estimateCostUsd,
  getChatModel,
  isAllowedChatModel,
} from "./chat-models";

describe("isAllowedChatModel", () => {
  it("accepts every allowlisted id", () => {
    for (const model of CHAT_MODELS) {
      expect(isAllowedChatModel(model.id)).toBe(true);
    }
  });

  it("rejects ids that are not on the allowlist", () => {
    // The route spends the site's shared key, so anything not allowlisted
    // must fall back rather than reach the router.
    expect(isAllowedChatModel("anthropic/claude-opus-5")).toBe(false);
    expect(isAllowedChatModel("")).toBe(false);
    expect(isAllowedChatModel(undefined)).toBe(false);
    expect(isAllowedChatModel({ id: "x" })).toBe(false);
  });

  it("has a default that is itself allowlisted", () => {
    expect(isAllowedChatModel(DEFAULT_CHAT_MODEL)).toBe(true);
  });
});

describe("estimateCostUsd", () => {
  it("prices a million input tokens at the model's input rate", () => {
    // Claude Haiku 4.5 is $1/M in, $5/M out.
    expect(
      estimateCostUsd({
        modelId: "anthropic/claude-haiku-4.5",
        inputTokens: 1_000_000,
      }),
    ).toBeCloseTo(1);

    expect(
      estimateCostUsd({
        modelId: "anthropic/claude-haiku-4.5",
        outputTokens: 1_000_000,
      }),
    ).toBeCloseTo(5);
  });

  it("sums input and output", () => {
    expect(
      estimateCostUsd({
        modelId: "anthropic/claude-haiku-4.5",
        inputTokens: 500_000,
        outputTokens: 200_000,
      }),
    ).toBeCloseTo(0.5 + 1);
  });

  it("returns undefined for unknown models rather than a misleading zero", () => {
    // The reason this helper exists instead of tokenlens: an unknown model
    // must not render as "$0.00".
    expect(estimateCostUsd({ modelId: "who/knows", inputTokens: 1000 })).toBe(
      undefined,
    );
    expect(estimateCostUsd({ inputTokens: 1000 })).toBe(undefined);
  });

  it("treats missing token counts as zero", () => {
    expect(estimateCostUsd({ modelId: DEFAULT_CHAT_MODEL })).toBe(0);
  });
});

describe("model catalog", () => {
  it("gives every model a provider icon key and a context window", () => {
    for (const model of CHAT_MODELS) {
      expect(model.provider).toBeTruthy();
      // The vendor prefix of the id is what ProviderIcon is keyed on.
      expect(model.id.startsWith(`${model.provider}/`)).toBe(true);
      expect(model.contextWindow).toBeGreaterThan(0);
    }
  });

  it("resolves models by id", () => {
    expect(getChatModel(DEFAULT_CHAT_MODEL)?.id).toBe(DEFAULT_CHAT_MODEL);
    expect(getChatModel("nope/nope")).toBe(undefined);
  });
});
