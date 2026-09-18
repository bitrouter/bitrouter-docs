import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isNavItemActive } from "./nav-config";

describe("global navigation", () => {
  it("uses the enterprise slot for the product changelog", () => {
    expect(NAV_ITEMS.map((item) => item.webPath)).toEqual([
      "/models",
      "/pricing",
      "/blog",
      "/changelog",
      "/docs",
    ]);
  });

  it("keeps docs and changelog as distinct global sections", () => {
    const docs = NAV_ITEMS.find((item) => item.key === "docs");
    const changelog = NAV_ITEMS.find((item) => item.key === "changelog");
    expect(docs).toBeDefined();
    expect(changelog).toBeDefined();
    expect(isNavItemActive("/docs/usage/cli", docs!)).toBe(true);
    expect(isNavItemActive("/changelog", docs!)).toBe(false);
    expect(isNavItemActive("/changelog", changelog!)).toBe(true);
    expect(isNavItemActive("/changelog/v1-0-0", changelog!)).toBe(true);
  });

  it("matches route boundaries instead of lookalike prefixes", () => {
    const docs = NAV_ITEMS.find((item) => item.key === "docs");
    const changelog = NAV_ITEMS.find((item) => item.key === "changelog");
    expect(docs).toBeDefined();
    expect(changelog).toBeDefined();
    expect(isNavItemActive("/docs-preview", docs!)).toBe(false);
    expect(isNavItemActive("/changelogger", changelog!)).toBe(false);
  });
});
