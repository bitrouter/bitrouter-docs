# BitRouter-docs updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship six site changes to bitrouter-docs (single $20 plan, condensed footer, fumadocs bump, compare→MDX for SEO/GEO, remove Reddit, new hero copy); a seventh (docs "Models" title) is tracked as an upstream change in `bitrouter/bitrouter`.

**Architecture:** Three independent PRs against this Next.js + fumadocs repo. PR A is the fumadocs dependency bump in isolation. PR B is a batch of low-risk content/UI edits (pricing, footer, Reddit, hero). PR C ports the custom-TSX compare pages onto fumadocs-sourced MDX while preserving the mono/terminal aesthetic via whitelisted MDX components.

**Tech Stack:** Next.js (App Router), TypeScript, fumadocs-core/ui/mdx, vitest, posthog-js. Tests use `vitest` (`npm test`). Presentational/copy changes are verified by build + typecheck; data/logic changes are covered by co-located vitest tests (existing precedent: `components/landing/footer-nav.test.ts`).

---

## File Structure

**PR A — fumadocs bump**
- Modify: `package.json` (four fumadocs deps), lockfile.

**PR B — content/UI batch**
- Modify: `components/pricing/pricing-page.tsx` (single tier, disabled CTA, JSON-LD/FAQ copy).
- Modify: `components/landing/social-links.ts` (drop Reddit + icon import).
- Modify: `components/landing/footer-nav.ts` (4-column model, static Resources links).
- Modify: `components/landing/footer-nav.test.ts` (assert new columns).
- Modify: `components/landing/mono/site-mono-footer.tsx` (4 cols + social-icon header row + Integrations in bar).
- Modify: `lib/footer-data.ts` (prune now-unused helpers).
- Modify: `components/landing/mono/landing.tsx` (hero title + subtitle).

**PR C — compare → MDX**
- Create: `content/compare/{bitrouter-vs-litellm,bitrouter-vs-openrouter,bitrouter-vs-portkey}.mdx`.
- Create: `components/landing/compare/compare-programs.tsx` (per-competitor Terminal programs + table rows, extracted from existing TSX).
- Create: `components/landing/compare/compare-mdx.tsx` (`CompareTerminal`, `CompareTable`, `CompareTradeoffs`, `CompareCTA` — MDX-facing components).
- Modify: `source.config.ts` (add `compare` fumadocs source).
- Modify: `mdx-components.tsx` (register compare components).
- Modify: `lib/source.ts` (export `compareSource`).
- Create: `app/(home)/compare/[slug]/page.tsx` (fumadocs page route + metadata + JSON-LD).
- Create: `app/(home)/compare/(index)/page.tsx` (compare index listing).
- Delete: `components/landing/compare/{compare-page,litellm-page,openrouter-page,portkey-page}.tsx` and the three `app/(home)/compare/bitrouter-vs-*/` route dirs.
- Modify: `components/landing/footer-nav.ts` (repoint Compare link to `/compare`).
- Check: `scripts/generate-footer-compare.mjs` still enumerates slugs from the new content dir.

**Upstream (not in this repo) — PR against `bitrouter/bitrouter`**
- Modify: `docs/get-started/models` frontmatter title (and/or `meta.json` label) → "Supported Models".

---

# PR A — Fumadocs bump

### Task A1: Bump fumadocs to latest

**Files:**
- Modify: `package.json:42-45`
- Modify: lockfile (`package-lock.json` / `pnpm-lock.yaml`, whichever the repo uses)

- [ ] **Step 1: Update the four version strings**

In `package.json`, set:

```json
"fumadocs-core": "16.11.1",
"fumadocs-mdx": "15.1.0",
"fumadocs-openapi": "11.1.1",
"fumadocs-ui": "16.11.1",
```

- [ ] **Step 2: Install and regenerate the lockfile**

Run (use the repo's package manager — `package-lock.json` present ⇒ npm):

```bash
npm install
```

Expected: installs the new versions, updates the lockfile, runs `postinstall` (`fumadocs-mdx`) without error.

- [ ] **Step 3: Read the migration notes for the two major bumps**

`fumadocs-mdx` 14→15 and `fumadocs-openapi` 10→11 are majors. Check the changelogs:

```bash
npm view fumadocs-mdx@15.1.0 dist.tarball >/dev/null 2>&1 # sanity: version resolvable
```

Read https://fumadocs.dev (changelog / upgrade guides) for `fumadocs-mdx` v15 and `fumadocs-openapi` v11. Note any config/API changes affecting `source.config.ts`, `lib/source.ts`, `scripts/generate-openapi.mjs`, and `mdx-components.tsx`.

- [ ] **Step 4: Run the prebuild generators**

Run:

```bash
npm run prebuild
```

Expected: `sync-docs`, `generate-openapi`, `generate-models`, `generate-changelog-latest`, `generate-footer-compare` all complete without error. Fix any breakage surfaced by the mdx/openapi majors (most likely in `scripts/generate-openapi.mjs` or `source.config.ts`).

- [ ] **Step 5: Typecheck + build**

Run:

```bash
npm run build
```

Expected: build succeeds; OpenAPI reference pages and docs render. If the build fails on a fumadocs API change, fix at the call site and re-run.

- [ ] **Step 6: Run tests**

Run:

```bash
npm test
```

Expected: PASS (vitest suite green).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): bump fumadocs to core/ui 16.11.1, mdx 15.1.0, openapi 11.1.1"
```

---

# PR B — Content/UI batch

### Task B1: Pricing — single flat $20 plan, Subscribe disabled

**Files:**
- Modify: `components/pricing/pricing-page.tsx`

- [ ] **Step 1: Collapse `SUB_TIERS` to a single tier**

Replace the `SUB_TIERS` array (lines 31-44) with a single constant:

```tsx
const SUB_FEATS: Feat[] = [
  "20 req / min",
  "1M tokens / day",
  "All open-source models",
  "Frontier via passthrough",
];
```

- [ ] **Step 2: Rewrite `SubscriptionCol` — no tier tabs, disabled CTA, "Coming soon"**

Replace the whole `SubscriptionCol` function (lines 65-104) with:

```tsx
function SubscriptionCol() {
  return (
    <div className="pcol">
      <span className="pcol-tier">override</span>
      <span className="pcol-name">Subscription</span>
      <div className="pcol-price">
        $20 <small>/ mo</small>
      </div>
      <p className="pcol-desc">
        A flat monthly rate for the open-source models that hold the routine 90%.
        Frontier still runs at passthrough on the same key.
      </p>
      <FeatList items={SUB_FEATS} />
      <span
        className="pcol-cta"
        aria-disabled="true"
        data-coming-soon="true"
        onClick={() => posthog.capture("subscription_coming_soon_viewed")}
      >
        Coming soon
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Style the disabled CTA as non-interactive**

In `components/pricing/pricing.css`, add a rule so the coming-soon CTA reads as disabled (muted, `cursor: default`, no hover lift). Match the existing `.pcol-cta` look but neutralized:

```css
.pcol-cta[aria-disabled="true"] {
  opacity: 0.55;
  cursor: default;
  pointer-events: none;
}
```

(If `.pcol-cta` relies on being an `<a>` for layout, keep the `<span>` above with the same class so spacing is preserved.)

- [ ] **Step 4: Update the Subscription FAQ answer (single price)**

In the `FAQS` array, replace the "What's included in the Subscription tiers?" entry (line 325-327) with a single-plan version:

```tsx
  {
    q: "What's included in the Subscription plan?",
    a: "The $20/month plan buys flat-rate access to the leading open-source models — Kimi, GLM, DeepSeek, Qwen, MiniMax, and more — at 20 requests/min and 1M tokens/day. Frontier models stay one alias away at passthrough. If you hit the plan's limits, BitRouter falls back to pay-as-you-go so your workloads keep running. (Subscription billing is coming soon.)",
  },
```

- [ ] **Step 5: Update `PRODUCT_JSONLD` offers (drop $100/$200)**

Replace the `offers` array in `PRODUCT_JSONLD` (lines 381-386) with:

```tsx
  offers: [
    { "@type": "Offer", name: "Pay-as-you-go", price: "0", priceCurrency: "USD", description: "0% markup — the exact upstream provider price on every model." },
    { "@type": "Offer", name: "Subscription", price: "20", priceCurrency: "USD", description: "Flat monthly rate for open-source models." },
  ],
```

- [ ] **Step 6: Check the compare-matrix + stack note copy**

The pricing compare matrix (`ROWS`) and the `pstack-note` reference "Subscription" generically — no per-tier price — so they need no change. Grep to confirm no other "$100"/"$200"/"tiers" copy remains:

Run:

```bash
grep -nE '\$100|\$200|three (tiers|plans)|tier tabs|SUB_TIERS' components/pricing/pricing-page.tsx
```

Expected: no matches (empty output).

- [ ] **Step 7: Build + typecheck**

Run:

```bash
npm run build
```

Expected: PASS. Visit `/pricing` in `npm run dev` and confirm: one $20 subscription plan, no tier tabs, CTA reads "Coming soon" and is non-clickable.

- [ ] **Step 8: Commit**

```bash
git add components/pricing/pricing-page.tsx components/pricing/pricing.css
git commit -m "feat(pricing): single flat \$20 subscription, Subscribe disabled (coming soon)"
```

---

### Task B2: Remove Reddit from social links

**Files:**
- Modify: `components/landing/social-links.ts`

- [ ] **Step 1: Remove the Reddit entry and its icon import**

In `components/landing/social-links.ts`: delete the `RedditIcon` name from the import (lines 2-9) and delete the Reddit object from `SOCIAL_LINKS` (line 21). Result:

```tsx
import type { ComponentProps } from "react";
import {
  DiscordIcon,
  GitHubIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons";

export type SocialLink = {
  label: string;
  href: string;
  icon: (props: ComponentProps<"svg">) => React.ReactElement;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/bitrouter", icon: GitHubIcon },
  { label: "Discord", href: "https://discord.gg/G3zVrZDa5C", icon: DiscordIcon },
  { label: "Telegram", href: "https://t.me/bitrouterai", icon: TelegramIcon },
  { label: "Twitter/X", href: "https://x.com/BitRouterAI", icon: XIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bitrouterai",
    icon: LinkedInIcon,
  },
];
```

- [ ] **Step 2: Confirm no other references to Reddit remain**

Run:

```bash
grep -rniE "reddit" components app lib | grep -v node_modules
```

Expected: no matches (the `RedditIcon` definition in `components/icons` may remain unused — leave it; it's a shared icon barrel). If `components/icons` re-exports cause an unused-import lint error anywhere, fix at that site.

- [ ] **Step 3: Typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS (no "RedditIcon is declared but never used" in `social-links.ts`).

- [ ] **Step 4: Commit**

```bash
git add components/landing/social-links.ts
git commit -m "chore(footer): remove Reddit from social links"
```

---

### Task B3: Footer nav — 4-column model (logic + tests)

**Files:**
- Modify: `components/landing/footer-nav.ts`
- Modify: `components/landing/footer-nav.test.ts`

Target columns (Option A): **Product** (unchanged), **Developers** (Docs, Quickstart, API, CLI, MCP), **Resources** (Blog, Compare, Changelog — single static links; Use Cases omitted until those pages ship), **Company** (unchanged). Compare link points to `/compare/bitrouter-vs-openrouter` for now (no `/compare` index yet; repointed to `/compare` in Task C6). Community/Integrations/Blog-expansion/Compare-expansion columns are removed.

- [ ] **Step 1: Write the failing test for the new column shape**

In `components/landing/footer-nav.test.ts`, add/replace tests asserting the new structure. Example (adapt to the file's existing imports/style):

```ts
import { describe, it, expect } from "vitest";
import { buildFooterColumns } from "./footer-nav";

describe("buildFooterColumns", () => {
  it("returns the four condensed columns in order", () => {
    const cols = buildFooterColumns();
    expect(cols.map((c) => c.title)).toEqual([
      "Product",
      "Developers",
      "Resources",
      "Company",
    ]);
  });

  it("no longer emits Community, Integrations, or Use Cases columns", () => {
    const titles = buildFooterColumns().map((c) => c.title);
    expect(titles).not.toContain("Community");
    expect(titles).not.toContain("Integrations");
    expect(titles).not.toContain("Use Cases");
  });

  it("Developers merges docs entry points", () => {
    const dev = buildFooterColumns().find((c) => c.title === "Developers")!;
    expect(dev.links.map((l) => l.label)).toEqual([
      "Docs",
      "Quickstart",
      "API",
      "CLI",
      "MCP",
    ]);
  });

  it("Resources uses single static links, not expanded lists", () => {
    const res = buildFooterColumns().find((c) => c.title === "Resources")!;
    expect(res.links.map((l) => l.label)).toEqual([
      "Blog",
      "Compare",
      "Changelog",
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- footer-nav
```

Expected: FAIL — `buildFooterColumns` currently takes a `dynamic` argument and returns different titles.

- [ ] **Step 3: Rewrite `footer-nav.ts` to the 4-column model**

Replace the column definitions and `buildFooterColumns` in `components/landing/footer-nav.ts`. Keep `FooterLink`/`FooterColumn` types and `deriveCompareLabel` (still used by `generate-footer-compare` / `footer-data`). New body:

```ts
const PRODUCT: FooterLink[] = [
  { label: "Models", href: "/models" },
  { label: "Providers", href: "/providers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Status", href: "https://status.bitrouter.ai", external: true },
];
const DEVELOPERS: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Quickstart", href: "/docs/get-started/quickstart" },
  { label: "API", href: "/docs/reference" },
  { label: "CLI", href: "/docs/get-started" },
  { label: "MCP", href: "/docs/ai-resources/mcp" },
];
// Single links — Compare/Blog no longer auto-expand in the footer.
// Compare repoints to /compare (index) in the compare-MDX PR.
const RESOURCES: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Compare", href: "/compare/bitrouter-vs-openrouter" },
  { label: "Changelog", href: "/changelog" },
];
const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Brand", href: "/brand" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
];

export function buildFooterColumns(): FooterColumn[] {
  return [
    { title: "Product", links: PRODUCT },
    { title: "Developers", links: DEVELOPERS },
    { title: "Resources", links: RESOURCES },
    { title: "Company", links: COMPANY },
  ];
}
```

Delete the now-unused `INTEGRATIONS`, `USE_CASES`, and old `PRODUCTS`/`DEVELOPERS`/`RESOURCES`/`COMPANY` constants they replace. Keep `deriveCompareLabel` and `BRAND_CASING` (used elsewhere).

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
npm test -- footer-nav
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/landing/footer-nav.ts components/landing/footer-nav.test.ts
git commit -m "feat(footer): condense nav to 4 columns (Option A)"
```

---

### Task B4: Footer render — social header row, 4 columns, Integrations in bar

**Files:**
- Modify: `components/landing/mono/site-mono-footer.tsx`
- Modify: `lib/footer-data.ts`
- Modify: `components/landing/mono/mono.css` (footer social-row styles)

- [ ] **Step 1: Prune unused footer-data helpers**

`buildFooterColumns` no longer takes dynamic data. In `lib/footer-data.ts`, remove `getCompareLinks` and `getLatestBlogLinks` (footer no longer expands them). Keep the file importing `SOCIAL_LINKS` only if still needed elsewhere; the footer now uses `SOCIAL_LINKS` directly (icons). Verify nothing else imports the removed helpers:

Run:

```bash
grep -rn "getCompareLinks\|getLatestBlogLinks" app components lib | grep -v node_modules
```

Expected: only the (now-removed) definitions — if any consumer remains, leave the helper it needs. If `getCommunityLinks` is unused after Step 2, remove it too.

- [ ] **Step 2: Rewrite `SiteMonoFooter` — social row + 4 columns + Integrations link in bar**

Replace `components/landing/mono/site-mono-footer.tsx` with:

```tsx
import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import { MonoThemeSwitch } from "./theme-switch";
import "./mono.css";

const FOUNDERS_CONTACT = "mailto:contact@bitrouter.ai";
const STATUS_URL = "https://status.bitrouter.ai";
const INTEGRATIONS_URL = "/integrations";

/**
 * Site-wide mono-themed footer (condensed, Option A). Brand + social-icon row
 * on top, four nav columns, then a slim legal bar. Self-contained: wraps itself
 * in `.br-mono` so its terminal styling applies on any page.
 */
export function SiteMonoFooter() {
  const columns = buildFooterColumns();
  const year = new Date().getFullYear();

  return (
    <div className="br-mono">
      <footer className="footer footer-mega">
        <div className="wrap">
          <div className="footer-head">
            <Link className="brand footer-bar-brand" href="/">
              <img src="/logo.svg" alt="BitRouter" className="brand-logo" />
              <span className="brand-name">
                bitrouter<span className="brand-dot">.</span>
              </span>
            </Link>
            <div className="footer-social" aria-label="BitRouter on social media">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={label}
                >
                  <Icon className="footer-social-icon" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-cols">
            {columns.map((col) => (
              <nav className="footer-col" key={col.title} aria-label={col.title}>
                <h2 className="footer-col-h">{col.title}</h2>
                {col.links.map((link) =>
                  link.external ? (
                    <a
                      key={`${col.title}:${link.href}:${link.label}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={`${col.title}:${link.href}:${link.label}`}
                      href={link.href}
                      className="footer-link"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            ))}
          </div>

          <div className="footer-bar">
            <div className="footer-bar-left">
              <span className="footer-copy">© {year} BitRouter, Inc.</span>
              <Link href={INTEGRATIONS_URL} className="footer-link">
                Integrations
              </Link>
            </div>
            <div className="footer-bar-right">
              <a href={FOUNDERS_CONTACT} className="footer-founders">
                Talk to the founders
              </a>
              <a
                href={STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-status"
              >
                <span className="footer-status-dot" aria-hidden />
                Operational
              </a>
              <MonoThemeSwitch />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

Note: `SiteMonoFooter` is no longer `async` (it no longer awaits data). If any layout `await`s it, remove the `await` at the call site (Step 4 checks this).

- [ ] **Step 3: Add footer social-row styles**

In `components/landing/mono/mono.css`, add:

```css
.footer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 28px;
  flex-wrap: wrap;
}
.footer-social {
  display: flex;
  align-items: center;
  gap: 14px;
}
.footer-social-link {
  color: var(--mut, currentColor);
  opacity: 0.7;
  transition: opacity 0.15s ease;
}
.footer-social-link:hover { opacity: 1; }
.footer-social-icon { width: 18px; height: 18px; display: block; }
```

Adjust `.footer-cols` to a 4-column grid if it was hard-coded to more; grep the existing rule and set `grid-template-columns: repeat(4, minmax(0, 1fr));` with the existing responsive breakpoints collapsing to 2 / 1 on narrow widths.

- [ ] **Step 4: Fix the call site if `await`ed**

Run:

```bash
grep -rn "SiteMonoFooter" app components | grep -v node_modules
```

For each usage, ensure it's rendered as `<SiteMonoFooter />` (not `await SiteMonoFooter()`); remove any `await`.

- [ ] **Step 5: Build + visual check**

Run:

```bash
npm run build
```

Expected: PASS. In `npm run dev`, confirm the footer shows: brand + 5 social icons (no Reddit) on top, 4 columns, and a legal bar with "Integrations". Resize to mobile and confirm columns stack.

- [ ] **Step 6: Commit**

```bash
git add components/landing/mono/site-mono-footer.tsx lib/footer-data.ts components/landing/mono/mono.css
git commit -m "feat(footer): social-icon header row, 4-column render, Integrations in legal bar"
```

---

### Task B5: Hero copy

**Files:**
- Modify: `components/landing/mono/landing.tsx` (hero block, ~lines 335-339)

- [ ] **Step 1: Replace the hero title and subtitle**

Replace:

```tsx
          <h1 className="h-display hero-title">Agentic workflows cost too much.</h1>
          <p className="hero-sub">
            Long autonomous runs get expensive — that&rsquo;s the workflow, not
            your mistake. BitRouter routes every call to the cheapest model that
            does the job, so the bill drops on its own.
          </p>
```

with:

```tsx
          <h1 className="h-display hero-title">Stop tokenmaxxing your agentic loops</h1>
          <p className="hero-sub">
            The open-source LLM gateway &amp; router that cost-optimizes every run
            — and stays configurable your way. Cloud opt-in.
          </p>
```

- [ ] **Step 2: Build + visual check**

Run:

```bash
npm run build
```

Expected: PASS. In `npm run dev`, confirm the hero renders the new H1/subtitle and layout still fits (long H1 wraps acceptably at desktop and mobile).

- [ ] **Step 3: Commit**

```bash
git add components/landing/mono/landing.tsx
git commit -m "feat(landing): new hero copy — stop tokenmaxxing your agentic loops"
```

---

# PR C — Compare → fumadocs MDX

**Design:** Each comparison becomes an MDX file whose **prose is real markdown** (crawlable H2/H3 + paragraphs) — this is the SEO/GEO win. The animated `Terminal` programs (JSX arrays) and the comparison table **cannot live in raw MDX**, so they stay in a TSX data module and are surfaced through registered MDX components (`<CompareTerminal>`, `<CompareTable>`, `<CompareTradeoffs>`, `<CompareCTA>`). This preserves the mono aesthetic while making the substance crawlable.

### Task C1: Add the `compare` fumadocs source

**Files:**
- Modify: `source.config.ts`
- Modify: `lib/source.ts`
- Create: `content/compare/` (dir)

- [ ] **Step 1: Define the source in `source.config.ts`**

After the `blog` definition, add:

```ts
export const compare = defineDocs({
  dir: "content/compare",
  docs: {
    schema: frontmatterSchema.extend({
      competitor: z.string(),
      angle: z.string(),
      migrationHref: z.string().optional(),
      migrationLabel: z.string().optional(),
    }),
  },
  meta: { schema: metaSchema },
});
```

- [ ] **Step 2: Export the loader in `lib/source.ts`**

Add `compare` to the `@/.source/server` import and add:

```ts
export const compareSource = loader({
  baseUrl: "/compare",
  source: compare.toFumadocsSource(),
  i18n,
});
export type ComparePage = InferPageType<typeof compareSource>;
```

- [ ] **Step 3: Create a placeholder MDX so the source builds**

Create `content/compare/bitrouter-vs-litellm.mdx` with minimal frontmatter (full content in Task C4):

```mdx
---
title: BitRouter vs LiteLLM
description: BitRouter is a zero-ops open-source LLM router. LiteLLM is an embedded Python library. Compare deployment, routing, and cost efficiency.
competitor: LiteLLM
angle: LiteLLM is a Python library you embed in your app. BitRouter is a binary you drop in front of everything — no code changes, no infra.
migrationHref: /docs/guides/migrate-from-litellm
migrationLabel: Read the migration guide →
---

Placeholder.
```

- [ ] **Step 4: Regenerate the source and typecheck**

Run:

```bash
npm run postinstall && npx tsc --noEmit
```

Expected: `.source` regenerates with a `compare` collection; typecheck passes.

- [ ] **Step 5: Commit**

```bash
git add source.config.ts lib/source.ts content/compare/bitrouter-vs-litellm.mdx
git commit -m "feat(compare): add fumadocs compare content source"
```

---

### Task C2: Extract Terminal programs + table rows into a TSX registry

**Files:**
- Create: `components/landing/compare/compare-programs.tsx`

- [ ] **Step 1: Build the per-competitor data registry**

Read the three existing data modules (`components/landing/compare/{litellm,openrouter,portkey}-page.tsx`) and lift their `differentiators` (each has `n`, `kicker`, `title`, `body`, `powered`, `term`, `prog`), `tableRows`, `tradeoffs`, and CTA fields into one registry keyed by slug. Create `components/landing/compare/compare-programs.tsx`:

```tsx
import * as React from "react";
import { Ok, Err, Dim, Faint } from "../mono/terminal";

export type TermStep = { term: string; prog: () => unknown[] };
export type CompareRow = { feat: string; them: string; br: string };

export interface CompareRegistryEntry {
  competitor: string;
  terminals: Record<string, TermStep>; // keyed by differentiator number, e.g. "01"
  rows: CompareRow[];
  tradeoffs: string[];
  ctaTitle?: string;
  ctaBody?: string;
}

export const COMPARE_REGISTRY: Record<string, CompareRegistryEntry> = {
  "bitrouter-vs-litellm": {
    competitor: "LiteLLM",
    terminals: {
      "01": {
        term: "deploy · bitrouter",
        prog: () => [
          ["print", <span className="mut">LiteLLM production</span>, 240],
          ["print", <span><Err>✗</Err> <Dim>postgres · redis · docker-compose · nginx</Dim></span>, 200],
          ["print", <span className="mut">BitRouter</span>, 300],
          ["print", <span><Ok>✓</Ok> <span className="lbl">bitrouter serve</span> <Faint>· 1 binary · 0 deps</Faint></span>, 320],
          ["print", <span><Ok>●</Ok> <Dim>ready in</Dim> <span className="lbl">340ms</span></span>, 600],
          ["loop", 2000],
        ],
      },
      // "02", "03", ... — copy each remaining `prog`/`term` from litellm-page.tsx verbatim
    },
    rows: [
      // copy tableRows from litellm-page.tsx: { feat, them, br }
    ],
    tradeoffs: [
      // copy tradeoffs[] from litellm-page.tsx
    ],
    // ctaTitle / ctaBody if the source overrode them
  },
  // "bitrouter-vs-openrouter": { ... copy from openrouter-page.tsx ... },
  // "bitrouter-vs-portkey":    { ... copy from portkey-page.tsx ... },
};
```

Fill every commented section by copying verbatim from the corresponding existing `-page.tsx` `DATA` object. The differentiator **prose** (`kicker`, `title`, `body`, `powered`) does NOT go here — it becomes MDX in Task C4. Only the terminal `term`/`prog`, `rows`, `tradeoffs`, and CTA overrides live here.

- [ ] **Step 2: Typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/landing/compare/compare-programs.tsx
git commit -m "feat(compare): extract terminal programs + table rows into TSX registry"
```

---

### Task C3: MDX-facing compare components + registration

**Files:**
- Create: `components/landing/compare/compare-mdx.tsx`
- Modify: `mdx-components.tsx`
- Modify: `lib/docs-sync/constants.mjs` (whitelist — only if these are usable from synced docs; compare content is authored locally so this is optional)

- [ ] **Step 1: Create the MDX components**

`components/landing/compare/compare-mdx.tsx` exposes components that take a `slug` and read from `COMPARE_REGISTRY`. Reuse `Terminal` and the existing `.compare-*` / `.mech-*` CSS classes so the look is identical:

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Terminal } from "../mono/terminal";
import { COMPARE_REGISTRY } from "./compare-programs";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";

function CompareCell({ text }: { text: string }) {
  const m = text.match(/^([✓✗⚠—])\s*(.*)$/);
  if (!m) return <span className="compare-mark-text">{text}</span>;
  const mark = m[1];
  const rest = m[2];
  const cls =
    mark === "✓" ? "compare-mark-yes"
    : mark === "✗" ? "compare-mark-no"
    : mark === "⚠" ? "compare-mark-partial"
    : "compare-mark-na";
  return (
    <>
      <span className={`compare-mark ${cls}`}>{mark}</span>
      {rest && <span className="compare-mark-text">{rest}</span>}
    </>
  );
}

export function CompareTerminal({ slug, step }: { slug: string; step: string }) {
  const t = COMPARE_REGISTRY[slug]?.terminals[step];
  if (!t) return null;
  return (
    <div className="mech-vis">
      <Terminal title={t.term} program={t.prog as never} accentPrompt={false} className="mech-term" />
    </div>
  );
}

export function CompareTable({ slug }: { slug: string }) {
  const entry = COMPARE_REGISTRY[slug];
  if (!entry) return null;
  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th className="compare-th compare-th-feat">Feature</th>
            <th className="compare-th compare-th-prod">{entry.competitor}</th>
            <th className="compare-th compare-th-prod">
              <span className="compare-th-brand">BitRouter</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entry.rows.map((r) => (
            <tr className="compare-row" key={r.feat}>
              <th className="compare-feat" scope="row">{r.feat}</th>
              <td className="compare-cell"><CompareCell text={r.them} /></td>
              <td className="compare-cell br"><CompareCell text={r.br} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="compare-legend">
        <span><span className="compare-mark compare-mark-yes">✓</span> yes</span>
        <span><span className="compare-mark compare-mark-no">✗</span> no</span>
        <span><span className="compare-mark compare-mark-partial">⚠</span> partial</span>
        <span><span className="compare-mark compare-mark-na">—</span> n/a</span>
      </div>
    </div>
  );
}

export function CompareTradeoffs({ slug }: { slug: string }) {
  const entry = COMPARE_REGISTRY[slug];
  if (!entry) return null;
  return (
    <ul className="cmpg-tradeoffs-list">
      {entry.tradeoffs.map((t) => (
        <li key={t} className="cmpg-tradeoff-item"><span className="prob-dot">└</span>{t}</li>
      ))}
    </ul>
  );
}

export function CompareCTA({ slug }: { slug: string }) {
  const href = COMPARE_MIGRATION[slug]?.href ?? "/docs";
  const label = COMPARE_MIGRATION[slug]?.label ?? "Read the docs →";
  return (
    <div className="cta-actions">
      <a href={SIGN_IN_URL} className="btn btn-primary">Get API key →</a>
      <Link href={href} className="btn btn-ghost">{label}</Link>
    </div>
  );
}

// Migration targets keyed by slug (from each page's frontmatter, mirrored here
// so the client CTA doesn't need the server page context).
const COMPARE_MIGRATION: Record<string, { href: string; label: string }> = {
  "bitrouter-vs-litellm": { href: "/docs/guides/migrate-from-litellm", label: "Read the migration guide →" },
  "bitrouter-vs-openrouter": { href: "/docs/guides/migrate-from-openrouter", label: "Read the migration guide →" },
  "bitrouter-vs-portkey": { href: "/docs/guides/migrate-from-portkey", label: "Read the migration guide →" },
};
```

(Confirm each `migrationHref` against the existing `-page.tsx` before deleting them in Task C6.)

- [ ] **Step 2: Register the components for MDX**

In `mdx-components.tsx`, import and spread them into `getMDXComponents`:

```tsx
import { CompareTerminal, CompareTable, CompareTradeoffs, CompareCTA } from "@/components/landing/compare/compare-mdx";
```

and add `CompareTerminal, CompareTable, CompareTradeoffs, CompareCTA,` to the returned object.

- [ ] **Step 3: Typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/landing/compare/compare-mdx.tsx mdx-components.tsx
git commit -m "feat(compare): MDX-facing components (terminal, table, tradeoffs, CTA)"
```

---

### Task C4: Author the three MDX comparison pages

**Files:**
- Modify: `content/compare/bitrouter-vs-litellm.mdx`
- Create: `content/compare/bitrouter-vs-openrouter.mdx`
- Create: `content/compare/bitrouter-vs-portkey.mdx`

- [ ] **Step 1: Write the litellm MDX (prose + component slots)**

Replace the placeholder body. Port every differentiator's `kicker`/`title`/`body`/`powered` into markdown, with a `<CompareTerminal>` after each. Pattern:

```mdx
---
title: BitRouter vs LiteLLM
description: BitRouter is a zero-ops open-source LLM router that optimizes agent cost and performance. LiteLLM is an embedded Python library. Compare deployment, routing, and cost efficiency.
competitor: LiteLLM
angle: LiteLLM is a Python library you embed in your app. BitRouter is a binary you drop in front of everything — no code changes, no infra.
migrationHref: /docs/guides/migrate-from-litellm
migrationLabel: Read the migration guide →
---

## One binary. No Postgres. No Redis. No Docker.

_Zero-ops._ Running LiteLLM in production means managing Postgres, Redis, Docker Compose, and a proxy process. BitRouter is a single binary with no runtime dependencies — drop it in a container, a CI step, or run it from the terminal.

**Powered by** Single binary · Zero infrastructure deps

<CompareTerminal slug="bitrouter-vs-litellm" step="01" />

## Rust async vs the Python GIL.

_Performance._ LiteLLM is Python — under high concurrency, the single-process asyncio event loop saturates and tail latency climbs. BitRouter's Rust async runtime keeps latency flat at any concurrency level. At 1k req/s, that difference is material.

**Powered by** Rust async runtime · Flat tail latency

<CompareTerminal slug="bitrouter-vs-litellm" step="02" />

{/* ...repeat for every remaining differentiator in litellm-page.tsx... */}

## Feature comparison

BitRouter vs LiteLLM — side by side.

<CompareTable slug="bitrouter-vs-litellm" />

## When LiteLLM is the right call

<CompareTradeoffs slug="bitrouter-vs-litellm" />

## Ready to switch?

Drop-in replacement — change one URL and one key. The migration guide walks you through it in under five minutes.

<CompareCTA slug="bitrouter-vs-litellm" />
```

Copy the exact prose from `litellm-page.tsx` — do not paraphrase (the point is to preserve content while making it crawlable).

- [ ] **Step 2: Write the openrouter and portkey MDX**

Repeat Step 1 for `bitrouter-vs-openrouter.mdx` and `bitrouter-vs-portkey.mdx`, sourcing each `angle`, differentiator prose, and CTA copy from `openrouter-page.tsx` and `portkey-page.tsx` respectively, and using the matching `slug=` in each component. Ensure the `step` keys match the `terminals` keys you created in the registry (Task C2).

- [ ] **Step 3: Regenerate + typecheck**

Run:

```bash
npm run postinstall && npx tsc --noEmit
```

Expected: PASS; three compare pages present in the `compare` collection.

- [ ] **Step 4: Commit**

```bash
git add content/compare/
git commit -m "feat(compare): author litellm/openrouter/portkey comparison MDX"
```

---

### Task C5: Compare page route + index (fumadocs render, metadata, JSON-LD)

**Files:**
- Create: `app/(home)/compare/[slug]/page.tsx`
- Create: `app/(home)/compare/(index)/page.tsx`

- [ ] **Step 1: Write the `[slug]` page**

Render the MDX through fumadocs, with the mono hero + server-rendered metadata + comparison JSON-LD. Mirror the pattern in `app/blog/(posts)/[slug]/page.tsx` (read it first for the repo's exact fumadocs render call):

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compareSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export function generateStaticParams() {
  return compareSource.getPages().map((p) => ({ slug: p.slugs[0] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = compareSource.getPage([slug]);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: `https://bitrouter.ai/compare/${slug}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = compareSource.getPage([slug]);
  if (!page) notFound();
  const MDX = page.data.body;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    about: [{ "@type": "Thing", name: "BitRouter" }, { "@type": "Thing", name: page.data.competitor }],
  };
  return (
    <div className="br-mono">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <section className="cmpg-hero">
        <div className="wrap">
          <h1 className="h-display cmpg-title">{page.data.title}</h1>
          <p className="cmpg-angle">{page.data.angle}</p>
        </div>
      </section>
      <section className="sec mechs">
        <div className="wrap">
          <MDX components={getMDXComponents()} />
        </div>
      </section>
    </div>
  );
}
```

Adjust the MDX render call (`page.data.body` vs `page.data.exports.default`) to match whatever `app/blog/(posts)/[slug]/page.tsx` uses in this repo.

- [ ] **Step 2: Write the `/compare` index**

`app/(home)/compare/(index)/page.tsx` lists all comparisons (cards linking to each slug):

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { compareSource } from "@/lib/source";

export const metadata: Metadata = {
  title: "Compare BitRouter — vs LiteLLM, OpenRouter, Portkey",
  description: "How BitRouter compares to other LLM routers and gateways on deployment, routing, cost, and agent features.",
  alternates: { canonical: "https://bitrouter.ai/compare" },
};

export default function CompareIndex() {
  const pages = compareSource.getPages();
  return (
    <div className="br-mono">
      <section className="page-head">
        <div className="wrap">
          <h1 className="h-display page-title">Compare BitRouter</h1>
          <div className="cards">
            {pages.map((p) => (
              <Link key={p.url} href={p.url} className="card">
                <h2>{p.data.title}</h2>
                <p>{p.data.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: PASS; `/compare`, `/compare/bitrouter-vs-litellm`, `-openrouter`, `-portkey` all statically generate.

- [ ] **Step 4: Verify prose is in the server-rendered HTML (the SEO/GEO goal)**

Run:

```bash
npm run build && npx next start &
sleep 4
curl -s http://localhost:3000/compare/bitrouter-vs-litellm | grep -o "No Postgres. No Redis. No Docker." | head -1
kill %1
```

Expected: the differentiator prose string is present in the raw HTML (proves it's crawlable, not JS-gated).

- [ ] **Step 5: Commit**

```bash
git add app/\(home\)/compare/
git commit -m "feat(compare): fumadocs [slug] route + index with metadata and JSON-LD"
```

---

### Task C6: Remove old TSX compare, repoint links, verify generator

**Files:**
- Delete: `components/landing/compare/{compare-page,litellm-page,openrouter-page,portkey-page}.tsx`
- Delete: `app/(home)/compare/bitrouter-vs-litellm/`, `bitrouter-vs-openrouter/`, `bitrouter-vs-portkey/`
- Modify: `components/landing/footer-nav.ts` (Compare → `/compare`)
- Check: `scripts/generate-footer-compare.mjs`

- [ ] **Step 1: Confirm nothing else imports the old TSX**

Run:

```bash
grep -rn "litellm-page\|openrouter-page\|portkey-page\|ComparePageTemplate\|ComparePageData" app components | grep -v node_modules
```

Expected: only the files slated for deletion. If `compare-mdx.tsx` still needs `CompareCell` logic, it already has its own copy (Task C3) — no dependency on `compare-page.tsx`.

- [ ] **Step 2: Delete old TSX pages and route dirs**

Run:

```bash
git rm components/landing/compare/compare-page.tsx \
       components/landing/compare/litellm-page.tsx \
       components/landing/compare/openrouter-page.tsx \
       components/landing/compare/portkey-page.tsx
git rm -r "app/(home)/compare/bitrouter-vs-litellm" \
          "app/(home)/compare/bitrouter-vs-openrouter" \
          "app/(home)/compare/bitrouter-vs-portkey"
```

- [ ] **Step 3: Repoint the footer Compare link to the index**

In `components/landing/footer-nav.ts`, change the Resources `Compare` link from `/compare/bitrouter-vs-openrouter` to:

```ts
  { label: "Compare", href: "/compare" },
```

- [ ] **Step 4: Verify the footer-compare generator reads the new content dir**

Read `scripts/generate-footer-compare.mjs`. It currently enumerates compare slugs (writes `lib/footer-compare.generated.ts`). Point it at `content/compare/*.mdx` (strip extension for slugs) if it was reading the old `app/(home)/compare/*` dirs. If `FOOTER_COMPARE` / `footer-compare.generated` is now unused (footer no longer expands compare), either leave the generator (harmless) or remove the generated import from `lib/footer-data.ts` if that file still references it. Confirm:

```bash
grep -rn "footer-compare.generated\|FOOTER_COMPARE" app components lib scripts | grep -v node_modules
```

Resolve any dangling reference so the build is clean.

- [ ] **Step 5: Full build + prebuild + tests**

Run:

```bash
npm run prebuild && npm run build && npm test
```

Expected: all PASS. `/compare/*` served from MDX; no references to deleted TSX.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(compare): remove custom TSX pages, repoint footer to /compare index"
```

---

### Task C7: Final verification of PR C

- [ ] **Step 1: Manual smoke of all compare routes**

In `npm run dev`, visit `/compare`, `/compare/bitrouter-vs-litellm`, `-openrouter`, `-portkey`. Confirm: mono hero renders, terminals animate, comparison table + tradeoffs + CTA render, and prose reads identically to the old pages.

- [ ] **Step 2: Confirm metadata + JSON-LD per page**

Run:

```bash
npm run build && npx next start &
sleep 4
for s in litellm openrouter portkey; do
  echo "== $s =="; curl -s http://localhost:3000/compare/bitrouter-vs-$s | grep -oE '"@type":"TechArticle"|<title>[^<]*</title>' | head -3
done
kill %1
```

Expected: each page emits its `<title>` and the `TechArticle` JSON-LD.

- [ ] **Step 3: Commit any fixups, open the PR**

```bash
git add -A && git commit -m "test(compare): verify MDX render, metadata, crawlable prose" --allow-empty
```

---

# Upstream follow-up (separate repo — not executed here)

### Task U1: Rename docs "Models" → "Supported Models" in `bitrouter/bitrouter`

The `/docs/get-started` section is synced from `bitrouter/bitrouter` (`docs/` on `main`) at build time via `scripts/sync-docs.mjs` — editing it in this repo is overwritten on the next sync.

- [ ] In the `bitrouter/bitrouter` repo, open `docs/get-started/models.md(x)` and/or `docs/get-started/meta.json`.
- [ ] Change the page `title` / nav label from "Models" to "Supported Models".
- [ ] Open a PR there; after merge + the next docs sync, the bitrouter-docs sidebar label updates automatically. No change in this repo.

---

## Notes for the implementer
- **PR boundaries:** land PR A, then PR B, then PR C — each is independently buildable and reviewable.
- **DRY:** `compare-mdx.tsx` owns the only remaining copy of `CompareCell`; the old `compare-page.tsx` copy is deleted in C6.
- **Verification bias:** presentational/copy tasks (B1, B4, B5, C5) are gated on `npm run build` + a manual visual check, not brittle DOM unit tests. Logic tasks (B3) use vitest, matching `footer-nav.test.ts`.
