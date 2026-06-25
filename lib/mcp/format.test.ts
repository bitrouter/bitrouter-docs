import { describe, it, expect } from "vitest";
import {
  pathToSlug,
  formatSearchResults,
  truncateMarkdown,
  matchModels,
  buildConfigSnippet,
  formatModelAnswer,
  type RawSearchResult,
} from "./format";
import type { Model } from "../models-types";

const model = (over: Partial<Model>): Model => ({
  id: "anthropic/claude-sonnet-4",
  name: "Claude Sonnet 4",
  maxInputTokens: 200000,
  maxOutputTokens: 8192,
  modalities: ["text"],
  pricing: { input: 3, output: 15 },
  ...over,
});

describe("pathToSlug", () => {
  it("strips the /docs base", () => {
    expect(pathToSlug("/docs/guides/routing/model-fallback")).toEqual([
      "guides", "routing", "model-fallback",
    ]);
  });
  it("strips a leading locale and a #hash and a full origin", () => {
    expect(pathToSlug("https://bitrouter.ai/zh/docs/features/advisor#usage")).toEqual([
      "features", "advisor",
    ]);
  });
  it("accepts a bare slug path", () => {
    expect(pathToSlug("features/subagent")).toEqual(["features", "subagent"]);
  });
});

describe("formatSearchResults", () => {
  const raw: RawSearchResult[] = [
    { id: "1", url: "/docs/guides/routing/model-fallback", type: "page", content: "Model Fallback" },
    { id: "2", url: "/docs/guides/routing/model-fallback#auto", type: "heading", content: "Automatic fallback" },
    { id: "3", url: "/docs/features/byok", type: "page", content: "BYOK" },
  ];
  it("dedups by page and caps to the limit", () => {
    const hits = formatSearchResults(raw, 1);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      title: "Model Fallback",
      path: "guides/routing/model-fallback",
      url: "https://bitrouter.ai/docs/guides/routing/model-fallback",
    });
  });
  it("returns one hit per distinct page", () => {
    expect(formatSearchResults(raw, 10)).toHaveLength(2);
  });
});

describe("truncateMarkdown", () => {
  it("returns text unchanged under the cap", () => {
    expect(truncateMarkdown("short", "https://x", 100)).toBe("short");
  });
  it("truncates and appends a deep link over the cap", () => {
    const out = truncateMarkdown("a".repeat(50), "https://bitrouter.ai/docs/x", 10);
    expect(out.startsWith("aaaaaaaaaa")).toBe(true);
    expect(out).toContain("full page: https://bitrouter.ai/docs/x");
  });
});

describe("matchModels", () => {
  const models = [
    model({ id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" }),
    model({ id: "openai/gpt-4o", name: "GPT-4o" }),
  ];
  it("returns the exact id match alone", () => {
    expect(matchModels(models, "openai/gpt-4o").map((m) => m.id)).toEqual(["openai/gpt-4o"]);
  });
  it("fuzzy-matches on id or name fragments", () => {
    expect(matchModels(models, "sonnet").map((m) => m.id)).toEqual(["anthropic/claude-sonnet-4"]);
  });
  it("returns [] when nothing matches", () => {
    expect(matchModels(models, "llama")).toEqual([]);
  });
});

describe("buildConfigSnippet", () => {
  it("embeds the model id", () => {
    expect(buildConfigSnippet("openai/gpt-4o")).toContain('"model":"openai/gpt-4o"');
  });
});

describe("formatModelAnswer", () => {
  it("reports matched models with pricing and a snippet", () => {
    const ans = formatModelAnswer("sonnet", [model({})]);
    expect(ans.matched).toBe(true);
    expect(ans.models[0]).toMatchObject({
      id: "anthropic/claude-sonnet-4",
      routable: true,
      pricingPer1M: { input: 3, output: 15 },
    });
    expect(ans.models[0].configSnippet).toContain("anthropic/claude-sonnet-4");
  });
  it("reports no match with a helpful note", () => {
    const ans = formatModelAnswer("llama", []);
    expect(ans.matched).toBe(false);
    expect(ans.note).toContain("llama");
  });
});
