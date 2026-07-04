# Landing Footer — Mega-Footer Redesign

**Date:** 2026-07-04
**Status:** Design approved, pending spec review
**Scope:** Landing / marketing pages only

## Problem

The current footer ([components/site-footer.tsx](../../../components/site-footer.tsx)) is a compact
single-row strip: a `BitRouter` wordmark, ~8 flat nav links hardcoded inline in JSX, a row of six
social icons, a theme toggle, and copyright. It scales poorly — every new page means editing footer
markup — and it presents no site structure to visitors, crawlers, or AI answer engines.

The goal is a sitemap-style mega-footer (à la the openstatus footer used as reference) for the
landing/marketing surface: six grouped columns of navigation, a bottom bar, and a data model that
stays fresh and doubles as a source of truth for SEO/GEO signals.

## Scope decision

- **New component: `LandingFooter`** — used only on marketing routes (landing, `/models`,
  `/providers`, `/pricing`, `/enterprise`, `/compare/*`, `/about`, `/brand`, blog, changelog).
- **Docs keep the current footer.** `SiteFooter` stays as-is for docs pages, which already have
  their own sidebar navigation. A six-column sitemap under every docs page would be visually heavy.
- This is a **landing/marketing footer only** — not a site-wide replacement.

## Columns (6 groups, 3×2 grid)

All links map to routes that exist today. Order is a suggestion; it is data and trivially
reorderable.

| Products      | Developers   | Resources    |
| ------------- | ------------ | ------------ |
| Models        | API          | Docs         |
| Providers     | CLI          | Blog         |
| Pricing       | MCP          | Changelog    |
| Enterprise    | Agent Skill  | AI Resources |

| Compare        | Community              | Company  |
| -------------- | ---------------------- | -------- |
| vs OpenRouter  | GitHub                 | About    |
| vs LiteLLM     | Discord                | Brand    |
| vs Portkey     | Telegram               | Privacy  |
|                | Reddit · X · LinkedIn  | Terms    |

**Column naming note:** the "Developers" column holds *integration surfaces* (API, CLI, MCP, Agent
Skill). A future **"Tools"** column — standalone SEO/top-of-funnel utilities like a cost-tracker — is
explicitly **out of scope for now**. It is not created until ~2-3 real tools exist; a column with one
"coming soon" link reads as unfinished. The data model (below) makes promoting it to its own column a
one-line change.

## Data model — the core refactor

Replace hardcoded JSX links with a single server-side config that is **column-count-agnostic**.

```ts
// components/landing/footer-nav.ts
type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [ /* 6 groups */ ];
```

Three columns are **generated**, not hand-maintained, so the footer cannot rot:

- **Compare** — derived from `app/(home)/compare/*` directory names. A new comparison page
  auto-appears.
- **Community** — sourced from the existing `SOCIAL_LINKS` array
  ([components/landing/social-links.ts](../../../components/landing/social-links.ts)). No
  duplication.
- **Resources / Blog** — static "Blog" link (latest-N-posts is possible later but not required).

The `LandingFooter` component becomes a dumb renderer: it maps `FOOTER_COLUMNS` → a responsive grid.
Adding a page is a data edit, never a markup edit. When "Tools" graduates, it is appended to the
array and the grid reflows to a fourth column with no rewrite.

## Rendering & layout

- **Server-rendered** (async RSC, as today). Footer links must be present in the initial HTML —
  never a client `useEffect`. This is required for crawlers and JS-less LLM fetchers.
- **Grid:** `grid grid-cols-2 md:grid-cols-3` for the six groups — 2-up on mobile, 3-up on desktop
  (the 3×2). Reflows to a 4th column automatically when a seventh group is added.
- **Semantic markup**, one consistent structure the dumb component controls:
  ```html
  <footer>
    <nav aria-label="Products"><h2>Products</h2><ul><li><a href>…</a></li>…</ul></nav>
    …
  </footer>
  ```
  Descriptive anchor text ("BitRouter vs OpenRouter", not "Compare") for both anchor-signal SEO and
  LLM readability.
- **Bottom bar** (full-width, below the grid): `BitRouter` wordmark + `© <year>` on the left; status
  pill + theme toggle on the right.
- **Socials move** out of the old icon row into the **Community column as text links** (better for
  SEO than an icon row). The bottom bar keeps only status + theme.
- **Styling:** pure Tailwind, matching existing token conventions (`--background`, `--border`,
  `--muted-foreground`, etc.). No CSS modules / styled-components.

## SEO / GEO reuse (single source of truth)

The footer config is not just for rendering — it becomes a source of truth that keeps related
surfaces in sync:

- **`Organization` JSON-LD** with `sameAs: [<the six social URLs>]`, sourced from the same
  `SOCIAL_LINKS` array. This is the highest-value GEO item — it lets AI engines disambiguate the
  "BitRouter" entity via its verified social profiles.
- **Keep in sync with** `sitemap.xml` and the existing [app/llms.txt](../../../app/llms.txt) where
  practical, so navigation, sitemap, and the LLM index don't drift.

Rationale: sitewide footer links carry less ranking weight than in-content links (boilerplate is
discounted), so the win here is **discovery / crawlability + machine-readable structure + entity
signals** — exactly what GEO rewards — not raw link equity.

## Optional adds from the reference (deferred / user's call)

1. **Status pill** — the `LandingFooter.statusPill` string ("all systems operational") already exists
   in [content/messages/en.json](../../../content/messages/en.json) but is unimplemented. Wire it up
   as a small green-dot pill **only if** there is a status page URL to point at. Otherwise skip.
2. **Three-way theme toggle** — reference offers light / dark / **system**; current toggle is 2-way.
   Minor upgrade, optional.

Both are non-blocking and can be decided during implementation.

## i18n

Column titles and link labels flow through the existing i18n system (`Footer.*` /
`LandingFooter.*` keys in `content/messages/en.json`). New keys are added for the new column titles
and any labels not already present.

## Out of scope

- A standalone "Tools" column (deferred until real utilities exist).
- Replacing the docs footer.
- Latest-N-posts dynamic blog column (static link for now).
- Building the cost-tracker or any microtool.

## Success criteria

- Landing/marketing pages render a six-column server-rendered mega-footer; docs unchanged.
- Adding a compare page or social link updates the footer with no footer-markup edit.
- Footer markup is semantic (`nav[aria-label]` + heading + list) with descriptive anchors.
- `Organization` JSON-LD with `sameAs` socials is emitted on marketing pages.
- Grid reflows gracefully from 3 to 4 columns when a seventh group is added, with no rewrite.
