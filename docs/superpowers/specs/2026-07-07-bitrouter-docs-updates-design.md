# BitRouter-docs updates — design spec

**Date:** 2026-07-07
**Repo:** bitrouter-docs
**Status:** Approved for planning

A batch of seven changes to the BitRouter marketing/docs site. Six land in this
repo; one (#3) is an upstream change tracked here but executed in `bitrouter/bitrouter`.

---

## 1. Pricing — single flat $20/mo subscription, Subscribe disabled

**File:** `components/pricing/pricing-page.tsx`

Today `SUB_TIERS` has three tiers ($20 / $100 / $200). Collapse to **one** tier:

- Price: **$20 / month**
- Feature list: `20 req / min`, `1M tokens / day`, `All open-source models`,
  `Frontier via passthrough` (unchanged — the current $20 tier's features).

The Subscribe CTA is **disabled** and shows a **"Coming soon"** state:

- Button rendered disabled (non-interactive, visually muted).
- A "Coming soon" badge/label on the plan or button.

**Acceptance:**
- Pricing page shows a single subscription plan at $20/mo.
- No $100 / $200 tiers remain in code or UI.
- Subscribe button is not clickable and is clearly marked "Coming soon".
- Pay-as-you-go (0% markup) and Outcome-based (enterprise) sections unchanged.

---

## 2. Footer — condense from 9 columns to Option A

**Files:** `components/landing/mono/site-mono-footer.tsx`,
`components/landing/footer-nav.ts`, `lib/footer-data.ts`,
`components/landing/social-links.ts`

Replace the 9-column mega-footer with a condensed layout:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BitRouter                                                                 │
│  Cost-optimized LLM gateway      [social icons →  GH  Discord  TG  X  in]  │
│                                                                            │
│  PRODUCT        DEVELOPERS       RESOURCES        COMPANY                   │
│  Models         Docs             Blog             About                    │
│  Providers      Quickstart       Compare          Brand                    │
│  Pricing        API              Use Cases        Privacy                  │
│  Enterprise     CLI              Changelog        Terms                    │
│  Status         MCP                                                        │
│                                                                            │
├──────────────────────────────────────────────────────────────────────────┤
│  © <year> BitRouter                                 Integrations ▾         │
└──────────────────────────────────────────────────────────────────────────┘
```

Changes from current:
- **9 columns → 4**: Product, Developers, Resources, Company.
- **Community** is no longer a column — social links move to a **social-icon row**
  in the brand header (top-left of footer).
- **Compare / Use Cases / Blog** become **single section links** under Resources
  (no auto-expansion; the footer no longer lists the latest 5 blog posts or every
  compare page). The SEO-useful links remain present, just not exploded.
- **Integrations** column is demoted to a single link (or dropped). Keep as one
  link in the legal/utility bar for now.
- Slim **legal bar**: `© <year> BitRouter` + Integrations link.

**Acceptance:**
- Footer renders 4 named columns + brand/social header + legal bar.
- Social icons appear once (in the header row), not as a column.
- Blog/Compare/Use Cases appear as single links, not expanded lists.
- All destination hrefs preserved from the current `footer-nav.ts` data.
- Responsive: columns stack cleanly on mobile.

---

## 3. Docs "Models" → "Supported Models" — UPSTREAM (separate repo)

**Not executed in this repo.** The `docs/get-started` section (including the
"Models" page at `/docs/get-started/models`) is **synced in at build time** from
`bitrouter/bitrouter` (`docs/` on `main`) via `scripts/sync-docs.mjs`. Editing it
here would be overwritten on the next sync.

**Action:** change the page/section title from "Models" to "Supported Models" in
the **`bitrouter/bitrouter`** repo's `docs/get-started/models` source (frontmatter
title and/or the relevant `meta.json` label). Tracked as a **separate follow-up PR**
against that repo — out of scope for the bitrouter-docs implementation plan.

**Acceptance (upstream):**
- After the next docs sync, the sidebar/nav label reads "Supported Models".

---

## 4. Fumadocs — bump to latest

**File:** `package.json`

| Package | From | To |
|---|---|---|
| `fumadocs-core` | 16.8.8 | 16.11.1 |
| `fumadocs-ui` | 16.8.8 | 16.11.1 |
| `fumadocs-mdx` | 14.2.9 | 15.1.0 |
| `fumadocs-openapi` | 10.8.1 | 11.1.1 |

`mdx` (14→15) and `openapi` (10→11) are **major** bumps — review changelogs/migration
notes and fix breakages. This ships as its **own PR** gated on a clean
`build` + typecheck (the prebuild pipeline runs sync-docs, generate-openapi,
generate-models, generate-changelog, generate-footer-compare — all must pass).

**Acceptance:**
- All four packages at target versions; lockfile updated.
- `pnpm/npm build` (including prebuild generators) passes.
- Typecheck passes; OpenAPI reference pages still render.

---

## 5. Compare → fumadocs MDX (SEO/GEO), keep mono aesthetic

**Files:** `components/landing/compare/*` (current custom TSX),
`app/(home)/compare/bitrouter-vs-*/`, `mdx-components.tsx`,
`source.config.ts`, `lib/docs-sync/constants.mjs` (whitelist)

Port each comparison from bespoke TSX (`ComparePageData` + `ComparePageTemplate`)
to **MDX content rendered through fumadocs**, matching how blog content flows.

- New content dir: `content/compare/*.mdx` (one file per competitor:
  litellm, openrouter, portkey), defined as a fumadocs source in
  `source.config.ts` alongside `docs` and `blog`.
- **Preserve the mono look**: register the **comparison table** and **Terminal**
  as **whitelisted MDX components** (add to `mdx-components.tsx` and the
  `COMPONENT_WHITELIST`) so authors use them inside MDX. The animated terminal and
  structured differentiator table survive; the prose body becomes real crawlable
  content with semantic headings.
- Add **per-page metadata + JSON-LD** for GEO (title, description, comparison
  schema) rendered server-side.
- Footer "Compare" links and `generate-footer-compare.mjs` continue to enumerate
  the compare pages (now MDX-sourced).

**Acceptance:**
- `/compare/bitrouter-vs-{litellm,openrouter,portkey}` render from MDX.
- Comparison prose is present in server-rendered HTML (crawlable, not JS-gated).
- Comparison table + Terminal still render with the mono aesthetic.
- Metadata/JSON-LD present per page.
- No dead custom TSX left behind; footer compare enumeration still works.

---

## 6. Remove Reddit from community/social links

**File:** `components/landing/social-links.ts`

Remove the Reddit entry from `SOCIAL_LINKS`, and remove the now-unused
`RedditIcon` import/definition. Remaining: GitHub, Discord, Telegram, X, LinkedIn.

**Acceptance:**
- No Reddit link or icon anywhere in the footer/social row.
- No unused `RedditIcon` import remains (lint/typecheck clean).

---

## 7. Hero copy

**File:** `components/landing/mono/landing.tsx`

- **Title (H1):** `Stop tokenmaxxing your agentic loops`
- **Subtitle:** `The open-source LLM gateway & router that cost-optimizes every run — and stays configurable your way. Cloud opt-in.`

("your way" intentionally signals highly configurable / customizable.)

**Acceptance:**
- Hero H1 and subtitle read exactly as above.
- Existing hero chip, InstallBar, and action buttons unchanged unless they
  conflict with the new copy.

---

## Sequencing / PRs

1. **PR A — Fumadocs bump** (#4) first, in isolation, so a dependency regression
   can't be confused with content changes.
2. **PR B — Content/UI batch** (#1, #2, #6, #7): pricing, footer, Reddit, hero.
   Low-risk, no shared surface area beyond the footer/social files.
3. **PR C — Compare port** (#5): the largest change; its own PR and review.
4. **Upstream** (#3): separate PR in `bitrouter/bitrouter`.

## Out of scope
- Building the (currently empty) Use Cases pages.
- Any redesign beyond the seven items above.
- Changing pricing for PAYG or Outcome-based tiers.
