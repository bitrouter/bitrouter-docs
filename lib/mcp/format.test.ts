import { describe, it, expect } from "vitest";
import {
  pathToSlug,
  formatSearchResults,
  truncateMarkdown,
  stripMdxNoise,
  selectMarkdownSection,
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
    expect(pathToSlug("/docs/configuration/models#fallback-chains")).toEqual([
      "configuration", "models",
    ]);
  });
  it("strips a #hash and a full origin", () => {
    expect(pathToSlug("https://bitrouter.ai/docs/customization/tools/model-backed-tools#advisor")).toEqual([
      "customization", "tools", "model-backed-tools",
    ]);
  });
  it("accepts a bare slug path", () => {
    expect(pathToSlug("customization/tools/web-tools")).toEqual(["customization", "tools", "web-tools"]);
  });
});

describe("formatSearchResults", () => {
  const raw: RawSearchResult[] = [
    { id: "1", url: "/docs/configuration/models", type: "page", content: "Models" },
    { id: "2", url: "/docs/configuration/models#fallback-chains", type: "heading", content: "Fallback chains" },
    { id: "3", url: "/docs/customization/models", type: "page", content: "Models & providers" },
  ];
  it("dedups by page and caps to the limit", () => {
    const hits = formatSearchResults(raw, 1);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      title: "Models",
      path: "configuration/models",
      url: "https://bitrouter.ai/docs/configuration/models",
    });
  });
  it("returns one hit per distinct page", () => {
    expect(formatSearchResults(raw, 10)).toHaveLength(2);
  });
  it("keeps a heading URL for the best hit even at the page limit", () => {
    expect(formatSearchResults(raw, 1)[0].sectionUrl).toBe(
      "https://bitrouter.ai/docs/configuration/models#fallback-chains",
    );
  });
  it("returns staging URLs and deduplicates absolute canonical and relative hits", () => {
    const origin = "https://bitrouter-docs-staging.up.railway.app";
    const hits = formatSearchResults([
      ...raw,
      { id: "4", url: "https://bitrouter.ai/docs/configuration/models#example", type: "heading", content: "Example" },
      { id: "5", url: "https://bitrouter.ai/docs/overview/quickstart", type: "page", content: "Quickstart" },
    ], 10, origin);
    expect(hits.map((hit) => hit.url)).toEqual([
      `${origin}/docs/configuration/models`,
      `${origin}/docs/customization/models`,
      `${origin}/docs/overview/quickstart`,
    ]);
    expect(hits.at(-1)?.path).toBe("overview/quickstart");
  });
  it("strips fumadocs <mark> highlight tags from the title", () => {
    const hits = formatSearchResults(
      [{ id: "1", url: "/docs/configuration/models", type: "page", content: "Configured <mark>Models</mark>" }],
      5,
    );
    expect(hits[0].title).toBe("Configured Models");
  });
});

describe("selectMarkdownSection", () => {
  it("includes child headings and ignores heading-like lines in fenced examples", () => {
    const text = [
      "## Other [#other]", "Before",
      "## Set up [#setup]", "```bash", "# An example comment", "```",
      "### Verify [#verify]", "Verification", "## Next [#next]", "After",
    ].join("\n");
    expect(selectMarkdownSection(text, "setup")).toBe(
      "## Set up [#setup]\n```bash\n# An example comment\n```\n### Verify [#verify]\nVerification",
    );
    expect(selectMarkdownSection(text, "missing")).toBeUndefined();
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

describe("stripMdxNoise", () => {
  it("drops top-level MDX import lines and collapses blank lines", () => {
    const md = "# Title\n\nimport { Callout } from 'fumadocs-ui/components/callout';\n\n\nBody text.";
    expect(stripMdxNoise(md)).toBe("# Title\n\nBody text.");
  });
  it("keeps import lines inside fenced code blocks", () => {
    const md = "Use it:\n\n```ts\nimport OpenAI from 'openai';\n```";
    expect(stripMdxNoise(md)).toContain("import OpenAI from 'openai';");
  });
  it("does not strip prose containing the word import", () => {
    const md = "You can import your keys from the dashboard.";
    expect(stripMdxNoise(md)).toBe("You can import your keys from the dashboard.");
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
  it("returns [] for a whitespace-only query", () => {
    expect(matchModels(models, "   ")).toEqual([]);
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
