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
landing/marketing surface: a 3×3 grid of grouped navigation columns, a bottom bar, and a data model
that stays fresh and doubles as a source of truth for SEO/GEO signals.

## Scope decision

- **New component: `LandingFooter`** — used only on marketing routes (landing, `/models`,
  `/providers`, `/pricing`, `/enterprise`, `/compare/*`, `/about`, `/brand`, blog, changelog, and the
  new `/integrations/*` and `/use-cases/*` routes).
- **Docs keep the current footer.** `SiteFooter` stays as-is for docs pages, which already have their
  own sidebar navigation. A nine-column sitemap under every docs page would be visually heavy.
- This is a **landing/marketing footer only** — not a site-wide replacement.

## Columns — final 9-column, 3×3 grid

All order is data and trivially reorderable. Reading order left-to-right, top-to-bottom:

| Products      | Developers    | Integrations   |
| ------------- | ------------- | -------------- |
| Models        | API           | Claude Code    |
| Providers     | CLI           | Codex          |
| Pricing       | MCP           | OpenCode       |
| Enterprise    |               | OpenClaw       |
|               |               | Hermes Agent   |

| Resources     | Compare        | Use Cases      |
| ------------- | -------------- | -------------- |
| Docs          | vs OpenRouter  | *(net-new)*    |
| Changelog     | vs LiteLLM     |                |
| AI Resources  | vs Portkey     |                |

| Blog                | Community              | Company  |
| ------------------- | ---------------------- | -------- |
| *(latest ~5 posts)* | GitHub                 | About    |
|                     | Discord                | Brand    |
|                     | Telegram               | Privacy  |
|                     | Reddit · X · LinkedIn  | Terms    |

**Content status per column:**

- **Full today (7):** Products, Developers, Resources, Compare, Blog, Community, Company.
- **Net-new content (2):** **Integrations** and **Use Cases**. Both point at index routes and are
  built via **separate content specs** (see below). The footer just links to `/integrations/<slug>`
  and `/use-cases/<slug>`.

**Column notes:**

- **Developers** = BitRouter's own surfaces (API, CLI, MCP). **"Agent Skill" is merged into CLI** —
  the CLI page covers agent-skill usage rather than being its own link.
- **Integrations** = third-party tools you plug BitRouter into (Claude Code, Codex, OpenCode,
  OpenClaw, Hermes Agent). One column for now.
- **Resources** = Docs, Changelog, AI Resources. **Blog moves out** of Resources into its own column.
- **Blog** = the latest ~5 posts, auto-pulled for freshness and zero maintenance; optionally pin 1–2
  cornerstone posts for stable internal links.
- **Community** = the existing `SOCIAL_LINKS` array rendered as text links (not an icon row).

## Data model — the core refactor

Replace hardcoded JSX links with a single server-side config that is **column-count-agnostic** (so a
future 10th column is a one-line add).

```ts
// components/landing/footer-nav.ts
type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [ /* 9 groups */ ];
```

Several columns are **generated**, not hand-maintained, so the footer cannot rot:

- **Compare** — derived from `app/(home)/compare/*` directory names.
- **Community** — sourced from the existing `SOCIAL_LINKS` array
  ([components/landing/social-links.ts](../../../components/landing/social-links.ts)).
- **Blog** — latest N posts from the blog content source (+ optional pinned slugs).
- **Integrations / Use Cases** — generated from their respective content collections once those
  exist (until then, curated links to the index pages).

The `LandingFooter` component becomes a dumb renderer: map `FOOTER_COLUMNS` → responsive grid. Adding
a page is a data/content edit, never a markup edit.

## Rendering & layout

- **Server-rendered** (async RSC, as today). Footer links must be present in the initial HTML — never
  a client `useEffect`. Required for crawlers and JS-less LLM fetchers.
- **Grid:** `grid grid-cols-2 md:grid-cols-3` for the nine groups — 2-up on mobile, 3-up on desktop
  (the 3×3). Reflows automatically if a group is added or removed.
- **Semantic markup**, one consistent structure the dumb component controls:
  ```html
  <footer>
    <nav aria-label="Products"><h2>Products</h2><ul><li><a href>…</a></li>…</ul></nav>
    …
  </footer>
  ```
  Descriptive anchor text ("BitRouter vs OpenRouter", not "Compare") for anchor-signal SEO and LLM
  readability.
- **Bottom bar** (full-width, below the grid): `BitRouter` wordmark + `© <year>` on the left; status
  pill + theme toggle on the right.
- **Socials move** out of the old icon row into the **Community column as text links**. The bottom
  bar keeps only status + theme.
- **Styling:** pure Tailwind, matching existing token conventions (`--background`, `--border`,
  `--muted-foreground`, etc.). No CSS modules / styled-components.

## SEO / GEO reuse (single source of truth)

The footer config is a source of truth that keeps related surfaces in sync:

- **`Organization` JSON-LD** with `sameAs: [<the six social URLs>]`, sourced from the same
  `SOCIAL_LINKS` array — the highest-value GEO item; lets AI engines disambiguate the "BitRouter"
  entity via verified social profiles.
- **Keep in sync with** `sitemap.xml` and the existing [app/llms.txt](../../../app/llms.txt) where
  practical, so navigation, sitemap, and the LLM index don't drift.

Rationale: sitewide footer links carry less ranking weight than in-content links (boilerplate is
discounted), so the win is **discovery / crawlability + machine-readable structure + entity
signals** — exactly what GEO rewards — not raw link equity.

## Related content systems (SEPARATE specs)

The footer links to two net-new content systems, each its own spec written **after** this one:

1. **Integrations pages** (`/integrations/<slug>`) — one marketing page per third-party tool
   (Claude Code, Codex, OpenCode, OpenClaw, Hermes Agent), authored as an MDX collection via
   fumadocs with a marketing (non-docs-sidebar) layout, plus an `/integrations` index hub.
2. **Use Cases pages** (`/use-cases/<slug>`) — intent-targeted marketing pages, same delivery
   pattern, plus a `/use-cases` index hub.

**Quality bar for both** (carried into their specs, non-negotiable):

- **No doorway pages.** Integration pages especially risk being near-duplicate "point your base URL
  at BitRouter" templates. Each page must carry genuinely tool-specific content — real config file
  location, actual flags/env vars, tool-specific gotchas, a screenshot — or be cut. Fewer rich pages
  beat many thin ones.
- **Accuracy.** Use verified, canonical BitRouter integration facts — no plausible-looking guesses.
  (This project has prior history with fabricated integration docs.)

## Deferred / future evolution

- **Agents / SDKs split.** The Integrations column is a candidate to later split by persona/funnel
  into **Agents** (individual coding CLIs — self-serve/PLG) and **SDKs** (frameworks for teams
  building production agents — Claude Agent SDK, LangChain, LlamaIndex, Vercel AI SDK, OpenAI SDK;
  cross-linked to Enterprise). Deferred until real SDK content exists; at that point Blog may fold
  back into Resources or the grid grows to 10. Persona insight drives page *copy/CTAs*, but column
  *labels* stay artifact-based (`Agents` / `SDKs`) for scannability and SEO.
- **Tools column.** Standalone free microtools (e.g. `cost-tracker`) — a future top-of-funnel column,
  added only once ~3 exist.
- **Status pill.** The `LandingFooter.statusPill` string ("all systems operational") already exists in
  [content/messages/en.json](../../../content/messages/en.json) but is unimplemented. Wire up as a
  small green-dot pill only if there is a status page URL to point at.
- **Three-way theme toggle** — reference offers light / dark / **system**; current toggle is 2-way.

## i18n

Column titles and link labels flow through the existing i18n system (`Footer.*` / `LandingFooter.*`
keys in `content/messages/en.json`). New keys are added for the new column titles and labels.

## Out of scope

- Building the Integrations and Use Cases page content (separate specs).
- Replacing the docs footer.
- The Agents/SDKs split, a Tools column, and the cost-tracker microtool.

## Open items to resolve before/at implementation

- **Developers column hrefs** — API/CLI/MCP likely deep-link into `docs/reference` and `app/mcp`
  rather than top-level routes; confirm real targets.
- **OpenClaw / Hermes Agent** — exact names + URLs needed for the Integrations spec (not a blocker
  for the footer structure).
- **Status page URL** — needed to decide whether to wire up the status pill.

## Success criteria

- Landing/marketing pages render a nine-column (3×3) server-rendered mega-footer; docs unchanged.
- Adding a compare page, social link, or blog post updates the footer with no footer-markup edit.
- Footer markup is semantic (`nav[aria-label]` + heading + list) with descriptive anchors.
- `Organization` JSON-LD with `sameAs` socials is emitted on marketing pages.
- Grid reflows gracefully when a group is added or removed, with no rewrite.
- Integrations and Use Cases columns link to working index routes.
