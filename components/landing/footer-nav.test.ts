import { describe, it, expect } from "vitest";
import { deriveCompareLabel, buildFooterColumns } from "./footer-nav";

describe("deriveCompareLabel", () => {
  it("maps known competitor slugs with correct brand casing", () => {
    expect(deriveCompareLabel("bitrouter-vs-openrouter")).toBe("vs OpenRouter");
    expect(deriveCompareLabel("bitrouter-vs-litellm")).toBe("vs LiteLLM");
    expect(deriveCompareLabel("bitrouter-vs-portkey")).toBe("vs Portkey");
  });
  it("title-cases unknown multi-word competitors", () => {
    expect(deriveCompareLabel("bitrouter-vs-some-tool")).toBe("vs Some Tool");
  });
});

describe("buildFooterColumns", () => {
  it("returns the four condensed columns in order", () => {
    expect(buildFooterColumns().map((c) => c.title)).toEqual([
      "Product", "Developers", "Resources", "Company",
    ]);
  });
  it("drops Community, Integrations, and Use Cases columns", () => {
    const titles = buildFooterColumns().map((c) => c.title);
    expect(titles).not.toContain("Community");
    expect(titles).not.toContain("Integrations");
    expect(titles).not.toContain("Use Cases");
  });
  it("Developers merges the docs entry points", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    expect(dev.links.map((l) => l.label)).toEqual(["Docs", "Quickstart", "API", "CLI", "MCP"]);
  });
  it("Resources uses single static links, not expanded lists", () => {
    const res = buildFooterColumns().find((c) => c.title === "Resources")!;
    expect(res.links.map((l) => l.label)).toEqual(["Blog", "Compare", "Changelog"]);
  });
});
