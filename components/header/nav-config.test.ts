import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isNavItemActive } from "./nav-config";

describe("global navigation", () => {
  it("links to the four primary site sections", () => {
    expect(NAV_ITEMS.map((item) => item.webPath)).toEqual([
      "/models",
      "/pricing",
      "/enterprise",
      "/docs",
    ]);
  });

  it("keeps enterprise and docs as distinct global sections", () => {
    const docs = NAV_ITEMS.find((item) => item.key === "docs");
    const enterprise = NAV_ITEMS.find((item) => item.key === "enterprise");
    expect(docs).toBeDefined();
    expect(enterprise).toBeDefined();
    expect(isNavItemActive("/docs/usage/cli", docs!)).toBe(true);
    expect(isNavItemActive("/enterprise", docs!)).toBe(false);
    expect(isNavItemActive("/enterprise", enterprise!)).toBe(true);
    expect(isNavItemActive("/blog", enterprise!)).toBe(false);
    expect(isNavItemActive("/changelog", enterprise!)).toBe(false);
  });

  it("matches route boundaries instead of lookalike prefixes", () => {
    const docs = NAV_ITEMS.find((item) => item.key === "docs");
    const enterprise = NAV_ITEMS.find((item) => item.key === "enterprise");
    expect(docs).toBeDefined();
    expect(enterprise).toBeDefined();
    expect(isNavItemActive("/docs-preview", docs!)).toBe(false);
    expect(isNavItemActive("/enterprises", enterprise!)).toBe(false);
  });
});
