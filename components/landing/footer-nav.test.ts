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
  const dynamic = {
    compare: [{ label: "vs OpenRouter", href: "/compare/bitrouter-vs-openrouter" }],
    blog: [{ label: "Blog", href: "/blog" }],
    community: [{ label: "GitHub", href: "https://github.com/bitrouter", external: true }],
  };

  it("returns the full nine-column order when all have links", () => {
    const cols = buildFooterColumns({ ...dynamic, includeEmpty: true });
    expect(cols.map((c) => c.title)).toEqual([
      "Products", "Developers", "Integrations", "Resources",
      "Compare", "Use Cases", "Blog", "Community", "Company",
    ]);
  });

  it("drops columns with zero links (Use Cases is empty by default)", () => {
    const cols = buildFooterColumns(dynamic);
    expect(cols.map((c) => c.title)).not.toContain("Use Cases");
    expect(cols).toHaveLength(8);
  });

  it("injects the dynamic Compare/Blog/Community links", () => {
    const cols = buildFooterColumns(dynamic);
    expect(cols.find((c) => c.title === "Compare")!.links).toEqual(dynamic.compare);
    expect(cols.find((c) => c.title === "Community")!.links[0].external).toBe(true);
  });
});
