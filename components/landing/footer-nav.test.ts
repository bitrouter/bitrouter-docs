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
  it("Integrations column links straight into the docs setup guides", () => {
    const int = buildFooterColumns().find((c) => c.title === "Integrations")!;
    expect(int.links.map((l) => l.href)).toEqual([
      "/docs/integrations/claude-code",
      "/docs/integrations/codex",
      "/docs/integrations/opencode",
      "/docs/integrations/pi",
      "/docs/integrations",
    ]);
  });
  it("Integrations no longer points at the retired per-agent routes", () => {
    // /claude-code, /codex, /opencode, /openclaw, /hermes-agent were stubs and
    // are now 301s (next.config.ts). Nothing should link at them directly.
    const int = buildFooterColumns().find((c) => c.title === "Integrations")!;
    for (const l of int.links) expect(l.href.startsWith("/docs/")).toBe(true);
  });
  it("Integrations surfaces four harnesses plus a More escape hatch", () => {
    const int = buildFooterColumns().find((c) => c.title === "Integrations")!;
    expect(int.links.map((l) => l.label)).toEqual([
      "Claude Code", "Codex", "OpenCode", "Pi", "More",
    ]);
    expect(int.links.at(-1)!.href).toBe("/docs/integrations");
  });
  it("Developers lists the docs entry points, no Integrations", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    expect(dev.links.map((l) => l.label)).toEqual([
      "Docs", "API", "CLI", "MCP", "Agent Skills",
    ]);
  });
  it("CLI, MCP, and Agent Skills point at the Usage section", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    const byLabel = Object.fromEntries(dev.links.map((l) => [l.label, l.href]));
    expect(byLabel["CLI"]).toBe("/docs/usage/cli");
    expect(byLabel["MCP"]).toBe("/docs/usage/mcp");
    expect(byLabel["Agent Skills"]).toBe("/docs/usage/skills");
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
    expect(res.links.find((l) => l.label === "Compare")!.href).toBe("/docs/overview/bitrouter-vs-openrouter");
  });
  it("Status lives in Resources, not Product", () => {
    const cols = buildFooterColumns();
    const product = cols.find((c) => c.title === "Product")!;
    const res = cols.find((c) => c.title === "Resources")!;
    expect(product.links.map((l) => l.label)).not.toContain("Status");
    expect(res.links.map((l) => l.label)).toContain("Status");
  });
});
