# Unified Theme System — Model 3 (Themeable Terminal)

**Date:** 2026-07-04
**Status:** Design approved, pending spec review
**Scope:** Site-wide theme/token architecture + light-terminal design

## Problem

The site runs **two parallel token systems**:

1. **Drafting-board tokens** ([theme.css](../../../theme.css) + [app/globals.css](../../../app/globals.css)) —
   a `--bp-*` palette defined per-theme (`:root` light / `.dark` dark), mapped to shadcn names
   (`--background: var(--bp-bg)`) and surfaced as Tailwind utilities via `@theme inline`. Themeable.
   Used by docs, blog, plain marketing pages, nav, and footer chrome.
2. **Terminal skin** ([components/landing/mono/mono.css](../../../components/landing/mono/mono.css)) —
   a **completely separate, hardcoded-dark** palette (`--bg`, `--fg`, `--panel`, `--line`, `--mono`,
   `--accent`, `--term-ok/info/warn/err`, grain, custom scrollbars). Used by the flagship pages
   (landing / models / providers / compare) and the site-wide footer.

The same concepts exist twice under different names (`--bp-bg`/`--bg`, `--bp-ink`/`--fg`,
`--bp-ok`/`--term-ok`, `--accent-brand`/`--accent` — both `#a779ff`). Because one system is themeable
and the other is always-dark, shared chrome that straddles them needs special-casing. This produced a
string of edge cases and hacks (see below).

## Goal

**One unified, themeable token system. The terminal aesthetic becomes themeable (light + dark) like a
real terminal color scheme (Solarized, GitHub, One, etc.), eliminating every "always-dark" exception.**

Concretely:
- A single source of truth for the palette (the `--bp-*` / shadcn chain), each token defined for both
  `:root` (light) and `.dark`.
- `.br-mono` surfaces **inherit the active theme** instead of hardcoding dark.
- All the straddle hacks are **deleted** (enumerated below).
- Any single terminal-window *component* that genuinely cannot look good in light may remain a
  self-contained **dark island** (like a code block) — the page canvas still themes, so this
  reintroduces no nav/footer edge cases. This is the pragmatic escape hatch, used sparingly.

## Key insight: the light palette is half-built

[theme.css](../../../theme.css) already defines **light-appropriate ANSI values** in `:root`:
`--bp-ok: #1f9d4d`, `--bp-warn: #b07d12`, `--bp-red: #c4341c` (vs. the bright `.dark` values
`#46d160` / `#d6a93b` / `#f0533f`). So the terminal's status colors already have a legible light
variant — the color work is largely a **mapping** job, not a from-scratch design.

## Architecture — how unification works

The elegant, low-churn move: **mono.css's `.br-mono { … }` token-definition block aliases the shared
`--bp-*` tokens instead of hardcoding hex.** The ~2400 lines of terminal *component* CSS keep
referencing `--bg`/`--fg`/`--term-*` unchanged — only the ~30-line **definition** block changes from
hardcoded to aliased, so `.br-mono` themes automatically because `--bp-*` already do.

Illustrative mapping (final values confirmed in the plan):

| mono token        | aliases → |
| ----------------- | --------- |
| `--bg`            | `var(--bp-bg)` |
| `--panel`/`-2`/`-3` | `var(--bp-paper)` / `--bp-paper-dark` / (new step) |
| `--line`/`-2`/`-bright` | `var(--bp-rule-soft)` / `--bp-rule` / (new step) |
| `--fg` / `--fg-dim` | `var(--bp-ink)` / `var(--bp-ink-mid)` |
| `--muted` / `--faint` / `--ghost` | `var(--bp-ink-dim)` / `var(--bp-ink-faint)` / (new step) |
| `--term-ok` / `--term-warn` / `--term-err` | `var(--bp-ok)` / `var(--bp-warn)` / `var(--bp-red)` |
| `--term-info`     | new `--bp-info` (light + dark) — no existing equivalent |
| `--accent`        | `var(--accent-brand)` (`#a779ff`; keep purple both themes) |
| `--mono`          | `var(--font-mono)` (already themeable/constant) |

**Missing tokens to add (in `globals.css`, per theme):** `--bp-info` (terminal blue), and any extra
panel/line/ink steps the terminal uses that `--bp-*` lacks (`--panel-3`, `--line-bright`, `--ghost`).
Each gets a light and a dark value.

Note: with the file consolidation (below), the aliased `.br-mono { --bg: var(--bp-bg); … }`
definition block lives in `globals.css`, not `mono.css`.

### Hardcoded-dark component fixes (the audit)

mono.css assumes dark in a few non-token places that must become theme-aware:
- The **grain/vignette** `::before` (`rgba(255,255,255,.045)` radial glow on black) — needs a light
  equivalent (subtle dark glow) or to no-op in light.
- `::selection { background: var(--fg); color: #000 }` — the `#000` assumes fg is light; use a token.
- Any panel/border/shadow that hardcodes a dark-only value.
- The **hero mock terminal window** (the "claude-code — bitrouter" panel) — highest-stakes surface;
  needs a deliberate light-mode pass.

## File organization — one token home

Alongside the token unification, consolidate *where* tokens live. Today the palette is defined across
three files with confusing double-definition (`theme.css` sets JetBrains + 0px radius, `globals.css`
overrides to Geist + 7px). `theme.css` is **not actually shared** — this is a standalone repo (no
workspaces, no console app), and it's imported only by `globals.css`, so its "@repo/theme, shared with
the console" header is stale.

Target layout:

- **`app/globals.css` = the single home for all token & theme definitions.** Fold in `theme.css`'s
  `--bp-*` palette (both `:root` and `.dark`), the shadcn mappings, the `@theme inline` block, the
  brand overrides, **and** the terminal token aliases (the `.br-mono { --bg… }` definition block moved
  here). One place defines every token, once, per theme — no override-of-override.
- **Retire `theme.css`** — its contents move into `globals.css`; delete the file and its `@import`.
- **`mono.css` = terminal *components* only** — the ~2,500 lines of hero / install / spinner / loop /
  faq styles stay in their own file (one cohesive responsibility), but hold **no token definitions**;
  they only reference tokens now defined in `globals.css`. Do **not** merge these into `globals.css`
  (that would create a ~3,200-line mixed-concern mega-file).

Rationale: file-count isn't the edge-case fix (that's the token unification above) — but collapsing
token *definitions* into one file removes the double-definition indirection and gives a clean
split: **`globals.css` owns tokens/theme, `mono.css` owns terminal components.**

## What gets deleted

- The `body:has(.br-mono:not(.br-mono-footer)) header[data-site-header]` dark-override in mono.css
  (added this session as a stopgap).
- The `br-mono-footer` marker class on the footer wrapper and the `data-site-header` hook — no longer
  needed once `.br-mono` themes normally.
- The private hardcoded `--bg/--fg/...` values in `.br-mono` (replaced by aliases in `globals.css`).
- **`theme.css`** as a file — folded into `globals.css` (see File organization) — and the stale
  "forces `.dark` / shared with the console" comments.

Note: the three force-dark locks were already removed in commit `59e9bba`. This spec builds on that.

## Theme controls

Consolidate to **one** control (`MonoThemeSwitch`, the `[light][dark][system]` switch already in the
footer). Audit and remove/redirect the redundant `ThemeToggleIcon` (old, now unused) and reconcile
`sidebar-footer-controls` so docs and marketing share one switch behavior.

## Sequencing (hero prototyped first)

The hero is make-or-break, so we validate it before the full sweep:

1. **Unify tokens + consolidate files** — fold `theme.css` into `globals.css`; move the `.br-mono`
   token block into `globals.css` and alias it to `--bp-*`; add the missing `--bp-*` (info, extra
   steps) with light + dark values; retire `theme.css`. `mono.css` keeps components only.
2. **Flip one flagship page (landing) to themeable** — remove its hardcoded dark, delete the nav
   override + footer marker, and **render the light hero for review**. ← **CHECKPOINT: eyeball the
   light landing together before proceeding.** If the light hero doesn't land, either adjust the
   light token values or drop the hero mock to a dark island, then re-review.
3. **Roll across the remaining flagship pages** (models / providers / compare) + the footer, fixing
   the grain/`::selection`/panel hardcodes as they surface.
4. **Consolidate theme controls, delete dead hacks, fix stale comments.**
5. **Full light + dark audit** of every surface (flagship, docs, blog, plain, nav, footer).

## Risks

- **Light hero aesthetics** — the black terminal mock is the brand centerpiece; light may need real
  design iteration. Mitigated by the early checkpoint and the dark-island escape hatch.
- **Token-alias regressions** — aliasing could shift a color that a component depended on precisely;
  caught by the dark-mode audit (dark must look identical to today).
- **Contrast in light** — bright dark-theme ANSI (`#46d160`) is illegible on white; the `:root`
  light ANSI values handle this, but every terminal accent needs a light check.

## Out of scope

- Redesigning docs/blog visual language (they already theme via System A).
- Changing the footer's layout/content (done in prior commits).
- New content (integrations/use-cases pages).

## Success criteria

- One palette namespace; `.br-mono` contains **no hardcoded theme colors** — only aliases.
- Toggling `[light]`/`[dark]`/`[system]` re-themes **every** surface, including flagship terminal
  pages, with no page pinned dark (except any deliberate dark-island component).
- **Dark mode looks identical to today** (no regression).
- The nav/footer need **no** `:has`/marker special-casing; the override, `br-mono-footer` marker, and
  `data-site-header` hook are gone.
- One theme control; no stale "forces dark" comments.
- **`theme.css` is gone** — all token/theme definitions live in `globals.css`; `mono.css` holds only
  terminal component styles (no token definitions), and the site builds with the import removed.
