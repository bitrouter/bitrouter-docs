# Landing Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the compact single-row marketing footer with a config-driven, server-rendered mega-footer (up to nine grouped columns in a responsive grid) across the landing/marketing surface.

**Architecture:** A pure, unit-tested assembler (`buildFooterColumns`) composes nine column definitions from static config plus injected dynamic data (Compare, Blog, Community). Server helpers fetch the dynamic pieces; a dumb async RSC renders the grid + bottom bar. Empty columns auto-hide, so Use Cases (no content yet) and an empty Blog degrade gracefully. The component mounts once per marketing route-group layout.

**Tech Stack:** Next.js App Router (RSC), TypeScript, Tailwind, fumadocs content sources, vitest, next-intl.

**Two decisions surfaced during planning (confirm at review):**
1. **8 live columns, not 9.** The config declares all nine; `buildFooterColumns` filters out columns with zero links. **Use Cases** ships with an empty item list (hidden) until its separate content spec defines items — avoids a one-link padding column. Adding items later is a one-line edit.
2. **Integrations links bridge to `/integrations#<slug>`** anchors on a stub index page (created in Task 6). The per-tool marketing pages are a separate content spec; repoint to `/integrations/<slug>` when they ship.

**Deviation note vs. spec:** The spec says "emit `Organization` JSON-LD on marketing pages." A site-wide `Organization` block already exists in `app/layout.tsx` but its `sameAs` is stale (points at `AIMOverse`). Task 7 **fixes the existing block** to derive `sameAs` from `SOCIAL_LINKS` rather than adding a second Organization schema (duplicate Organization schemas confuse crawlers). Also: footer labels use literal strings, not i18n keys — the site is de-facto English-only (`setRequestLocale("en")` everywhere); full i18n is deferred (noted in spec's future section).

---

## File Structure

| File | Responsibility |
|---|---|
| `components/landing/footer-nav.ts` (new) | Types, `deriveCompareLabel`, static column data, pure `buildFooterColumns` (filters empty columns) |
| `components/landing/footer-nav.test.ts` (new) | Unit tests for the pure logic |
| `scripts/generate-footer-compare.mjs` (new) | Build-time scan of `app/(home)/compare/*` → generated slug list |
| `lib/footer-compare.generated.ts` (new, generated) | `FOOTER_COMPARE: string[]` — checked in, regenerated in prebuild |
| `lib/footer-data.ts` (new) | Server helpers: `getCompareLinks`, `getLatestBlogLinks`, `getCommunityLinks` |
| `components/landing/landing-footer.tsx` (new) | Async RSC: fetch dynamic data → `buildFooterColumns` → render grid + bottom bar |
| `app/(home)/integrations/page.tsx` (new) | Stub index page with anchored sections for the five tools |
| `source.config.ts` (modify) | Add optional `date` to blog schema (for latest-post sort) |
| `package.json` (modify) | Add `generate:footer` script + prebuild step |
| `app/(home)/layout.tsx`, `app/blog/layout.tsx`, `app/changelog/layout.tsx` (modify) | Mount `<LandingFooter />` |
| `app/(home)/about/page.tsx`, `app/(home)/brand/page.tsx`, `components/legal-doc.tsx` (modify) | Remove now-redundant `<SiteFooter />` |
| `app/layout.tsx` (modify) | Fix `siteJsonLd.sameAs` to derive from `SOCIAL_LINKS` |

---

## Task 1: Footer types, static config, and pure assembler (TDD)

**Files:**
- Create: `components/landing/footer-nav.ts`
- Test: `components/landing/footer-nav.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// components/landing/footer-nav.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run components/landing/footer-nav.test.ts`
Expected: FAIL — "Failed to resolve import ./footer-nav" / functions not defined.

- [ ] **Step 3: Implement `footer-nav.ts`**

```ts
// components/landing/footer-nav.ts
export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { title: string; links: FooterLink[] };

const BRAND_CASING: Record<string, string> = {
  openrouter: "OpenRouter",
  litellm: "LiteLLM",
  portkey: "Portkey",
};

export function deriveCompareLabel(slug: string): string {
  const competitor = slug.replace(/^bitrouter-vs-/, "");
  const label =
    BRAND_CASING[competitor] ??
    competitor
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return `vs ${label}`;
}

// Third-party tools you plug BitRouter into. Links bridge to anchors on the
// /integrations stub index until per-tool pages ship (separate content spec),
// then repoint to /integrations/<slug>.
const INTEGRATIONS: FooterLink[] = [
  { label: "Claude Code", href: "/integrations#claude-code" },
  { label: "Codex", href: "/integrations#codex" },
  { label: "OpenCode", href: "/integrations#opencode" },
  { label: "OpenClaw", href: "/integrations#openclaw" },
  { label: "Hermes Agent", href: "/integrations#hermes-agent" },
];

// Populated by the Use Cases content spec. Empty => column is hidden.
const USE_CASES: FooterLink[] = [];

// NOTE: API/CLI/MCP hrefs point at real docs routes; confirm CLI target
// (no dedicated CLI page today — using get-started).
const PRODUCTS: FooterLink[] = [
  { label: "Models", href: "/models" },
  { label: "Providers", href: "/providers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
];
const DEVELOPERS: FooterLink[] = [
  { label: "API", href: "/docs/reference" },
  { label: "CLI", href: "/docs/get-started" },
  { label: "MCP", href: "/docs/ai-resources/mcp" },
];
const RESOURCES: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "AI Resources", href: "/docs/ai-resources" },
];
const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Brand", href: "/brand" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
];

export function buildFooterColumns(dynamic: {
  compare: FooterLink[];
  blog: FooterLink[];
  community: FooterLink[];
  includeEmpty?: boolean;
}): FooterColumn[] {
  const columns: FooterColumn[] = [
    { title: "Products", links: PRODUCTS },
    { title: "Developers", links: DEVELOPERS },
    { title: "Integrations", links: INTEGRATIONS },
    { title: "Resources", links: RESOURCES },
    { title: "Compare", links: dynamic.compare },
    { title: "Use Cases", links: USE_CASES },
    { title: "Blog", links: dynamic.blog },
    { title: "Community", links: dynamic.community },
    { title: "Company", links: COMPANY },
  ];
  return dynamic.includeEmpty
    ? columns
    : columns.filter((c) => c.links.length > 0);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run components/landing/footer-nav.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add components/landing/footer-nav.ts components/landing/footer-nav.test.ts
git commit -m "feat(footer): add footer nav config and pure column assembler"
```

---

## Task 2: Build-time Compare generation

**Files:**
- Create: `scripts/generate-footer-compare.mjs`
- Create (generated): `lib/footer-compare.generated.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the generate script** (mirrors `scripts/generate-changelog-latest.mjs`)

```js
// scripts/generate-footer-compare.mjs
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = "app/(home)/compare";
const OUT = "lib/footer-compare.generated.ts";

let slugs = [];
try {
  const entries = await readdir(DIR, { withFileTypes: true });
  slugs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
} catch {
  // No compare dir yet — emit an empty list.
}

await writeFile(
  OUT,
  `// Generated by scripts/generate-footer-compare.mjs — do not edit.\n` +
    `export const FOOTER_COMPARE: string[] = ${JSON.stringify(slugs, null, 2)};\n`,
);
console.log(`Wrote ${OUT} (${slugs.length} compare pages)`);
```

- [ ] **Step 2: Run it and verify output**

Run: `node scripts/generate-footer-compare.mjs`
Expected: prints `Wrote lib/footer-compare.generated.ts (3 compare pages)` and the file contains `bitrouter-vs-litellm`, `bitrouter-vs-openrouter`, `bitrouter-vs-portkey`.

- [ ] **Step 3: Wire into package.json scripts + prebuild**

In `package.json`, add a script and extend `prebuild`:

```json
"generate:footer": "node scripts/generate-footer-compare.mjs",
"prebuild": "node scripts/sync-docs.mjs && node scripts/generate-openapi.mjs && node scripts/generate-models.mjs && node scripts/generate-changelog-latest.mjs && node scripts/generate-footer-compare.mjs",
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-footer-compare.mjs lib/footer-compare.generated.ts package.json
git commit -m "feat(footer): generate compare column from compare route dirs"
```

---

## Task 3: Blog date schema + server data helpers

**Files:**
- Modify: `source.config.ts`
- Create: `lib/footer-data.ts`

- [ ] **Step 1: Add optional `date` to the blog schema**

In `source.config.ts`, change the `blog` definition's schema so latest-post sorting has a field:

```ts
export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string().optional(), // ISO YYYY-MM-DD; used for footer "latest posts" sort
    }),
  },
  meta: {
    schema: metaSchema,
  },
});
```

- [ ] **Step 2: Write the server data helpers**

```ts
// lib/footer-data.ts
import "server-only";
import { blogSource } from "@/lib/source";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import { FOOTER_COMPARE } from "@/lib/footer-compare.generated";
import { deriveCompareLabel, type FooterLink } from "@/components/landing/footer-nav";

export function getCompareLinks(): FooterLink[] {
  return FOOTER_COMPARE.map((slug) => ({
    label: deriveCompareLabel(slug),
    href: `/compare/${slug}`,
  }));
}

export function getLatestBlogLinks(limit = 5): FooterLink[] {
  const pages = blogSource.getPages("en");
  const sorted = [...pages].sort((a, b) => {
    const da = (a.data as { date?: string }).date ?? "";
    const db = (b.data as { date?: string }).date ?? "";
    return db.localeCompare(da);
  });
  const links = sorted
    .slice(0, limit)
    .map((p) => ({ label: p.data.title, href: p.url }));
  // Empty-safe: content/blog may be unsynced in dev. Fall back to the index.
  return links.length ? links : [{ label: "Blog", href: "/blog" }];
}

export function getCommunityLinks(): FooterLink[] {
  return SOCIAL_LINKS.map(({ label, href }) => ({ label, href, external: true }));
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors from these files.

- [ ] **Step 4: Commit**

```bash
git add source.config.ts lib/footer-data.ts
git commit -m "feat(footer): add server data helpers for compare/blog/community"
```

---

## Task 4: LandingFooter component

**Files:**
- Create: `components/landing/landing-footer.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/landing/landing-footer.tsx
import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import {
  getCompareLinks,
  getLatestBlogLinks,
  getCommunityLinks,
} from "@/lib/footer-data";
import { ThemeToggleIcon } from "@/components/landing/sections/ThemeToggleIcon";

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

export async function LandingFooter() {
  const columns = buildFooterColumns({
    compare: getCompareLinks(),
    blog: getLatestBlogLinks(5),
    community: getCommunityLinks(),
  });
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {col.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}:${link.href}:${link.label}`}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider"
          >
            <img src="/logo.svg" alt="BitRouter" className="h-4 w-4 dark:invert" />
            <span>
              BitRouter<span className="text-foreground/30">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground/70">
              © {year} BitRouter
            </span>
            <span className="h-3 w-px bg-border" />
            <ThemeToggleIcon label="Toggle theme" />
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-footer.tsx
git commit -m "feat(footer): add LandingFooter mega-footer component"
```

---

## Task 5: Integrations stub index page

**Files:**
- Create: `app/(home)/integrations/page.tsx`

The footer's Integrations links point at `/integrations#<slug>`. This stub makes those anchors resolve (no 404s) until the Integrations content spec ships real per-tool pages.

- [ ] **Step 1: Write the stub index page**

```tsx
// app/(home)/integrations/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — Use BitRouter with your agent",
  description:
    "Point Claude Code, Codex, OpenCode, OpenClaw, or Hermes Agent at BitRouter to route any model through one API.",
};

const TOOLS = [
  { slug: "claude-code", name: "Claude Code" },
  { slug: "codex", name: "Codex" },
  { slug: "opencode", name: "OpenCode" },
  { slug: "openclaw", name: "OpenClaw" },
  { slug: "hermes-agent", name: "Hermes Agent" },
];

export default function IntegrationsIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
        Integrations
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Use BitRouter with the agent you already run. Detailed guides are on the
        way — reach out on Discord if you need one sooner.
      </p>
      <ul className="mt-8 space-y-6">
        {TOOLS.map((t) => (
          <li
            key={t.slug}
            id={t.slug}
            className="scroll-mt-24 border-t border-border/60 pt-4"
          >
            <h2 className="font-mono text-sm font-medium uppercase tracking-wider">
              {t.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guide coming soon.
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Verify the route renders**

Run: `npm run dev`, then open `http://localhost:3000/integrations` — expect the five anchored sections; `http://localhost:3000/integrations#codex` scrolls to Codex.

- [ ] **Step 3: Commit**

```bash
git add "app/(home)/integrations/page.tsx"
git commit -m "feat(footer): add integrations stub index for footer anchors"
```

---

## Task 6: Mount LandingFooter on marketing layouts; remove redundant SiteFooter

**Files:**
- Modify: `app/(home)/layout.tsx`
- Modify: `app/blog/layout.tsx`
- Modify: `app/changelog/layout.tsx`
- Modify: `app/(home)/about/page.tsx`
- Modify: `app/(home)/brand/page.tsx`
- Modify: `components/legal-doc.tsx`

- [ ] **Step 1: Mount in `app/(home)/layout.tsx`**

Add the import and render `<LandingFooter />` as the last child inside `HomeLayout`:

```tsx
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteProviders } from "@/components/site-providers";
import { baseOptions } from "@/lib/layout.shared";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomeGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <HomeLayout {...baseOptions()}>
        {children}
        <LandingFooter />
      </HomeLayout>
    </SiteProviders>
  );
}
```

- [ ] **Step 2: Mount in `app/blog/layout.tsx` and `app/changelog/layout.tsx`**

For each file: add `import { LandingFooter } from "@/components/landing/landing-footer";` and render `<LandingFooter />` as the last child of the top-level element the layout returns (immediately after `{children}`). Read each file first to place it correctly within the existing wrapper.

- [ ] **Step 3: Remove the redundant `<SiteFooter />` usages**

These pages now inherit the footer from their layout, so remove the manual import + render in all three:
- `app/(home)/about/page.tsx` — remove the `SiteFooter` import and its `<SiteFooter />` element.
- `app/(home)/brand/page.tsx` — same.
- `components/legal-doc.tsx` — remove the import (line 3) and the `<SiteFooter />` element (line 44). (`legal-doc.tsx` renders privacy/terms, which live under `(home)` and now get `LandingFooter` from the layout.)

- [ ] **Step 4: Verify no double footers and no dangling imports**

Run: `npx tsc --noEmit` (expect no "unused SiteFooter" or missing-import errors).
Run: `npm run dev` and confirm each of `/`, `/models`, `/about`, `/brand`, `/privacy-policy`, `/blog`, `/changelog` shows exactly **one** footer (the new mega-footer).

- [ ] **Step 5: Commit**

```bash
git add "app/(home)/layout.tsx" app/blog/layout.tsx app/changelog/layout.tsx \
  "app/(home)/about/page.tsx" "app/(home)/brand/page.tsx" components/legal-doc.tsx
git commit -m "feat(footer): mount LandingFooter across marketing layouts"
```

---

## Task 7: Fix Organization JSON-LD `sameAs` to real socials

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Derive `sameAs` from `SOCIAL_LINKS`**

At the top of `app/layout.tsx`, add:

```tsx
import { SOCIAL_LINKS } from "@/components/landing/social-links";
```

Then in the `siteJsonLd` object (around line 45), replace the stale line:

```tsx
      sameAs: ["https://github.com/AIMOverse", "https://x.com/AIMOverse"],
```

with:

```tsx
      sameAs: SOCIAL_LINKS.map((s) => s.href),
```

- [ ] **Step 2: Verify the emitted JSON-LD**

Run: `npm run dev`, open `/`, view source, find the `application/ld+json` block, and confirm `sameAs` now lists the six BitRouter social URLs (github.com/bitrouter, discord, telegram, reddit, x.com/BitRouterAI, linkedin) and no longer references `AIMOverse`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(seo): point Organization sameAs at real BitRouter socials"
```

---

## Task 8: Full verification

- [ ] **Step 1: Run the test suite**

Run: `npm test`
Expected: all pass, including `footer-nav.test.ts`.

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit` then `npm run build`
Expected: clean build; `generate:footer` runs in prebuild and regenerates `lib/footer-compare.generated.ts`.

- [ ] **Step 3: Manual sweep** (`npm run dev`)

Confirm:
- `/` and other `(home)` pages, `/blog`, `/changelog` render the mega-footer with **8 columns** (Use Cases hidden — it has no items).
- Columns are 2-up on mobile, 3-up on desktop; each is a `<nav aria-label>` with an `<h2>` heading.
- Compare column shows `vs OpenRouter / vs LiteLLM / vs Portkey` linking to the real compare pages.
- Community column shows the six socials as text links opening in new tabs.
- Blog column shows latest posts (or a single "Blog" link if `content/blog` is unsynced locally).
- Integrations links jump to anchors on `/integrations`.
- Theme toggle in the bottom bar works; exactly one footer per page.

- [ ] **Step 4: Final commit (if any polish)**

```bash
git add -A
git commit -m "chore(footer): verification polish"
```

---

## Self-Review (completed)

- **Spec coverage:** 9-column config ✓ (Task 1), config-driven/generated Compare ✓ (Task 2), generated Blog/Community ✓ (Task 3), server-rendered semantic markup ✓ (Task 4), bottom bar + socials-as-text ✓ (Task 4), marketing-only mount + docs untouched ✓ (Task 6), Organization `sameAs` ✓ (Task 7). Deviations (8 live columns, Integrations anchors, reuse existing JSON-LD, literal-string labels) are called out at the top and in-task.
- **Deferred per spec (not in this plan):** Integrations/Use-Cases per-item content pages (separate specs), Agents/SDKs split, Tools column, status pill, 3-way theme toggle, sitemap/llms.txt sync.
- **Type consistency:** `FooterLink`/`FooterColumn`, `buildFooterColumns`, `deriveCompareLabel`, `FOOTER_COMPARE`, and the three `get*Links` helpers are named identically across Tasks 1–4.
- **Open items to confirm during execution:** CLI href (`/docs/get-started` placeholder — no dedicated CLI page today); real OpenClaw/Hermes URLs (only needed for the later content spec).
