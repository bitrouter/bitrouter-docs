import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isNavItemActive } from "./nav-config";

describe("global navigation", () => {
  it("includes Blog while keeping Changelog out of the product header", () => {
    expect(NAV_ITEMS.map((item) => item.webPath)).toEqual([
      "/models",
      "/pricing",
      "/enterprise",
      "/blog",
      "/docs",
    ]);
  });

  it("treats docs and changelog routes as one global section", () => {
    const docs = NAV_ITEMS.find((item) => item.key === "docs");
    expect(docs).toBeDefined();
    expect(isNavItemActive("/docs/usage/cli", docs!)).toBe(true);
    expect(isNavItemActive("/changelog", docs!)).toBe(true);
    expect(isNavItemActive("/changelog/v1-0-0", docs!)).toBe(true);
  });

  it("matches route boundaries instead of lookalike prefixes", () => {
    const docs = NAV_ITEMS.find((item) => item.key === "docs");
    expect(docs).toBeDefined();
    expect(isNavItemActive("/docs-preview", docs!)).toBe(false);
    expect(isNavItemActive("/changelogger", docs!)).toBe(false);
  });
});
