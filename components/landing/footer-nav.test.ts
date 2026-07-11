import { describe, it, expect } from "vitest";
import { buildFooterColumns } from "./footer-nav";

describe("buildFooterColumns", () => {
  it("returns the five text columns in grid order", () => {
    expect(buildFooterColumns().map((c) => c.title)).toEqual([
      "Product", "Developers", "Resources", "Company", "Compare",
    ]);
  });
  it("keeps Integrations and Use Cases out as top-level columns", () => {
    // Integrations is a link under Developers; Use Cases doesn't exist yet.
    // Community is rendered separately from SOCIAL_LINKS, not from this model.
    const titles = buildFooterColumns().map((c) => c.title);
    expect(titles).not.toContain("Integrations");
    expect(titles).not.toContain("Use Cases");
    expect(titles).not.toContain("Community");
  });
  it("Compare column links to the real comparison pages", () => {
    const cmp = buildFooterColumns().find((c) => c.title === "Compare")!;
    expect(cmp.links.map((l) => l.href)).toEqual([
      "/compare/bitrouter-vs-openrouter",
      "/compare/bitrouter-vs-litellm",
      "/compare/bitrouter-vs-portkey",
      "/compare",
    ]);
  });
  it("Developers merges the docs entry points and Integrations, no Quickstart", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    expect(dev.links.map((l) => l.label)).toEqual(["Docs", "Integrations", "API", "CLI", "MCP"]);
  });
  it("Product lists Enterprise and Startup, not Providers", () => {
    const product = buildFooterColumns().find((c) => c.title === "Product")!;
    const labels = product.links.map((l) => l.label);
    expect(labels).toContain("Enterprise");
    expect(labels).toContain("Startup");
    expect(labels).not.toContain("Providers");
  });
  it("Resources uses single static links, Compare moved to its own column", () => {
    const res = buildFooterColumns().find((c) => c.title === "Resources")!;
    expect(res.links.map((l) => l.label)).toEqual(["Blog", "Changelog", "Status"]);
  });
  it("Status lives in Resources, not Product", () => {
    const cols = buildFooterColumns();
    const product = cols.find((c) => c.title === "Product")!;
    const res = cols.find((c) => c.title === "Resources")!;
    expect(product.links.map((l) => l.label)).not.toContain("Status");
    expect(res.links.map((l) => l.label)).toContain("Status");
  });
});
