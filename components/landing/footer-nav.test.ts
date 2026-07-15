import { describe, it, expect } from "vitest";
import { buildFooterColumns } from "./footer-nav";

describe("buildFooterColumns", () => {
  it("returns the five text columns in grid order", () => {
    expect(buildFooterColumns().map((c) => c.title)).toEqual([
      "Product", "Developers", "Resources", "Company", "Integrations",
    ]);
  });
  it("keeps Compare and Use Cases out as top-level columns", () => {
    // Compare is now a link under Resources; Use Cases doesn't exist yet.
    // Community is rendered separately from SOCIAL_LINKS, not from this model.
    const titles = buildFooterColumns().map((c) => c.title);
    expect(titles).not.toContain("Compare");
    expect(titles).not.toContain("Use Cases");
    expect(titles).not.toContain("Community");
  });
  it("Integrations column links to the per-agent pages", () => {
    const int = buildFooterColumns().find((c) => c.title === "Integrations")!;
    expect(int.links.map((l) => l.href)).toEqual([
      "/claude-code",
      "/codex",
      "/openclaw",
      "/hermes-agent",
      "/opencode",
    ]);
  });
  it("Developers lists the docs entry points, no Integrations", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    expect(dev.links.map((l) => l.label)).toEqual([
      "Docs", "API", "CLI", "MCP", "Agent Skills",
    ]);
  });
  it("CLI and MCP point at the concepts interface docs, Agent Skills at ai-resources", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    const byLabel = Object.fromEntries(dev.links.map((l) => [l.label, l.href]));
    expect(byLabel["CLI"]).toBe("/docs/concepts/cli");
    expect(byLabel["MCP"]).toBe("/docs/concepts/mcp");
    expect(byLabel["Agent Skills"]).toBe("/docs/ai-resources/skills");
  });
  it("Product lists Enterprise and Startup, not Providers", () => {
    const product = buildFooterColumns().find((c) => c.title === "Product")!;
    const labels = product.links.map((l) => l.label);
    expect(labels).toContain("Enterprise");
    expect(labels).toContain("Startup");
    expect(labels).not.toContain("Providers");
  });
  it("Resources folds in Compare alongside its static links", () => {
    const res = buildFooterColumns().find((c) => c.title === "Resources")!;
    expect(res.links.map((l) => l.label)).toEqual([
      "Blog", "Changelog", "Compare", "Status",
    ]);
    expect(res.links.find((l) => l.label === "Compare")!.href).toBe("/compare");
  });
  it("Status lives in Resources, not Product", () => {
    const cols = buildFooterColumns();
    const product = cols.find((c) => c.title === "Product")!;
    const res = cols.find((c) => c.title === "Resources")!;
    expect(product.links.map((l) => l.label)).not.toContain("Status");
    expect(res.links.map((l) => l.label)).toContain("Status");
  });
});
