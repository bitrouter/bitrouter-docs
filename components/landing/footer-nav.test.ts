import { describe, it, expect } from "vitest";
import { FOOTER_LINKS, LEGAL_LINKS, type FooterLink } from "./footer-nav";
import { SOCIAL_LINKS } from "./social-links";
import { NAV_ITEMS } from "../header/nav-config";

const columnLinks = (): FooterLink[] => FOOTER_LINKS;
const allLinks = (): FooterLink[] => [...columnLinks(), ...LEGAL_LINKS];

/**
 * Invariants, not shape. These deliberately do not pin column titles or label
 * order — the footer gets re-cut regularly, and tests that encode the current
 * design have to be rewritten every time without ever catching a real defect.
 * What must hold is that no link is broken, dead, or listed twice.
 */
describe("footer links", () => {
  it("has no duplicate destinations", () => {
    const hrefs = allLinks().map((l) => l.href);
    expect(hrefs).toHaveLength(new Set(hrefs).size);
  });

  it("marks every off-site link external, and no on-site link", () => {
    for (const l of allLinks()) {
      if (l.href.startsWith("http")) expect(l.external, l.href).toBe(true);
      else expect(l.external, l.href).toBeUndefined();
    }
  });

  it("routes internal links from the site root", () => {
    for (const l of allLinks()) {
      if (l.external) continue;
      expect(l.href.startsWith("/"), l.href).toBe(true);
      expect(l.href.endsWith("/"), `${l.href} has a trailing slash`).toBe(false);
    }
  });

  it("never links a retired per-harness marketing route", () => {
    // /claude-code, /codex, /opencode, /openclaw, /hermes-agent were content-free
    // stubs, retired 2026-08 and 301'd in next.config.ts. Harness links belong
    // under /docs/integrations/.
    const retired = ["/claude-code", "/codex", "/opencode", "/openclaw", "/hermes-agent"];
    for (const l of allLinks()) expect(retired).not.toContain(l.href);
  });

  it("keeps the compliance links reachable", () => {
    expect(LEGAL_LINKS.map((l) => l.href)).toEqual(
      expect.arrayContaining(["/privacy-policy", "/terms-of-service", "/subprocessors"]),
    );
  });

  it("keeps compliance links out of the nav columns", () => {
    // They live in the bottom bar; listing them twice was the old Status bug.
    const legal = new Set(LEGAL_LINKS.map((l) => l.href));
    for (const l of columnLinks()) expect(legal.has(l.href)).toBe(false);
  });

  it("does not duplicate the status page, which the bottom bar owns", () => {
    for (const l of columnLinks()) expect(l.href).not.toMatch(/status\.bitrouter\.ai/);
  });

  it("keeps the footer to a single row of cells", () => {
    // The grid is lg:grid-cols-6. More than six cells wraps to a second row and
    // the design stops being the one-strip footer it was cut down to.
    expect(FOOTER_LINKS.length).toBeLessThanOrEqual(6);
  });

  it("carries at least one internal page the header does not", () => {
    // Repeating a header link is harmless but earns nothing, so the footer has
    // to justify itself with something only it links — today that is /blog,
    // which would otherwise have no internal link anywhere on the site.
    const header = new Set(NAV_ITEMS.map((i) => i.webPath));
    const only = FOOTER_LINKS.filter((l) => !l.external && !header.has(l.href));
    expect(only.length).toBeGreaterThan(0);
  });

  it("takes its social hrefs from the one social-links source", () => {
    const known = new Set(SOCIAL_LINKS.map((s) => s.href));
    for (const l of FOOTER_LINKS) {
      if (l.external) expect(known.has(l.href), l.href).toBe(true);
    }
  });

  it("does not link a page that was retired", () => {
    // /about and /startup were removed in 2026-09 and now 301 to the homepage.
    const retired = ["/about", "/startup", "/open"];
    for (const l of [...columnLinks(), ...LEGAL_LINKS]) {
      expect(retired).not.toContain(l.href);
    }
  });
});
