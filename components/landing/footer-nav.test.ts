import { describe, it, expect } from "vitest";
import { buildFooterColumns } from "./footer-nav";

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
