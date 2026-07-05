# Unified Themeable Theme System Implementation Plan

> **For agentic workers:** This plan is CSS/visual-heavy — verification is by browser preview (light + dark screenshots) and build, not unit tests. Execute **interactively with review checkpoints** (superpowers:executing-plans), NOT fully-autonomous subagents: Task 2 has a mandatory human checkpoint on the light hero. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Merge the two parallel token systems into one themeable palette so the terminal aesthetic themes light/dark like a real terminal color scheme, delete all the always-dark straddle hacks, and consolidate token definitions into `globals.css` (retiring `theme.css`).

**Architecture:** `.br-mono`'s private hardcoded palette is replaced by aliases to the shared `--bp-*` tokens (which already switch per theme). All token definitions move into `app/globals.css`; `mono.css` keeps only terminal component styles. A few missing `--bp-*` steps get light+dark values. Flagship pages stop being pinned dark; the nav override / `.br-mono-footer` marker / `data-site-header` hook are removed.

**Tech Stack:** Tailwind v4 (`@theme inline`, Lightning CSS), fumadocs, next-themes, plain CSS custom properties.

**Reference spec:** `docs/superpowers/specs/2026-07-04-unified-theme-system-design.md`

**Guardrail (every task):** **Dark mode must look identical to today.** After each task, compare dark-mode screenshots of `/`, `/models`, `/about` against the current look before moving on.

---

## File Structure

| File | Change |
|---|---|
| `app/globals.css` | Absorb `theme.css` (all `--bp-*` + shadcn + `@theme inline`); add missing `--bp-*` (info + steps) light+dark; add the aliased `.br-mono { --bg: var(--bp-*) }` token block; drop the `@import "../theme.css"`. |
| `theme.css` | **Deleted** (contents moved to globals.css). |
| `components/landing/mono/mono.css` | Remove the `.br-mono { --bg…--ghost }` *token definitions* (keep the `.br-mono` *styling*: position/background/color/font); make grain + `::selection` theme-aware; delete the header dark-override block added this session. |
| `components/landing/mono/site-mono-footer.tsx` | Drop the `br-mono-footer` class (back to `br-mono`). |
| `components/header/site-header.tsx` | Drop the `data-site-header` attribute. |
| `components/landing/mono/theme-switch.tsx` | Unchanged (the single kept control). |
| `components/landing/sections/ThemeToggleIcon.tsx`, `components/site-footer.tsx` | Audited for removal if unused. |

---

## Task 1: Consolidate token files + unify the palette (no visual change in dark)

**Files:**
- Modify: `app/globals.css`
- Modify: `components/landing/mono/mono.css`
- Delete: `theme.css`

- [ ] **Step 1: Move `theme.css` into `globals.css`**

Copy the entire contents of `theme.css` (the `@theme inline` block, `:root`, `.dark`) into `app/globals.css`, replacing the `@import "../theme.css";` line (globals.css:5). Order matters: the moved `@theme inline` + `:root`/`.dark` must come **after** `@import "tailwindcss"` and the fumadocs `@import`s (so Tailwind is loaded first), and **before** the existing globals `@theme inline` brand override (globals.css:24) so the brand override (Geist font, 7px radius) still wins. Delete the now-duplicate `--font-sans`/`--radius` lines that `theme.css` set (JetBrains + 0px) — the globals brand override is the intended winner; keeping both is the current confusing double-definition.

- [ ] **Step 2: Add the missing `--bp-*` terminal tokens (light + dark)**

In the moved `:root` (light) block add:
```css
  --bp-info: #2563eb;        /* terminal blue — legible on white */
  --bp-panel-3: #e8e8e8;     /* elevated panel step */
  --bp-line-bright: #d4d4d4; /* bright hairline */
  --bp-ghost: #c8c8c8;       /* faintest ink/hairline */
```
In the moved `.dark` block add (current terminal dark values):
```css
  --bp-info: #5aa7ff;
  --bp-panel-3: #161616;
  --bp-line-bright: #343434;
  --bp-ghost: #3a3a3a;
```
(Light values are a first pass — tunable during the Task 3 light audit.)

- [ ] **Step 3: Add the aliased `.br-mono` token block to `globals.css`**

Add (after the `:root`/`.dark` blocks) — this replaces mono.css's hardcoded palette:
```css
/* Terminal skin tokens — alias the shared palette so .br-mono themes with the
   site (light + dark) instead of hardcoding dark. Layout tokens (--maxw etc.)
   stay in mono.css. */
.br-mono {
  --bg: var(--bp-bg);
  --panel: var(--bp-paper);
  --panel-2: var(--bp-paper-dark);
  --panel-3: var(--bp-panel-3);
  --line: var(--bp-rule-soft);
  --line-2: var(--bp-rule);
  --line-bright: var(--bp-line-bright);
  --fg: var(--bp-ink);
  --fg-dim: var(--bp-ink-mid);
  --muted: var(--bp-ink-dim);
  --faint: var(--bp-ink-faint);
  --ghost: var(--bp-ghost);
  --term-ok: var(--bp-ok);
  --term-err: var(--bp-red);
  --term-warn: var(--bp-warn);
  --term-info: var(--bp-info);
  --accent: var(--accent-brand);
  --accent-dim: var(--accent-brand-dim);
  --mono: var(--font-mono);
  --display: var(--font-sans);
  --body: var(--font-sans);
}
```

- [ ] **Step 4: Remove the token *definitions* from `mono.css` (keep the styling)**

In `mono.css`, the `.br-mono { … }` rule (starts line 14) mixes token definitions (`--bg: #000` … `--radius: 7px`) with styling (`position: relative; background: var(--bg); color: var(--fg); font-family: var(--mono); …`). Delete the hardcoded color/type token lines (`--bg` through `--body`) now defined in globals.css. **Keep** the layout tokens (`--maxw`, `--gutter`, `--radius`) and the styling declarations (`position`, `background`, `color`, `font`, etc.). Result: mono.css's `.br-mono` block holds only layout tokens + visual styling, all referencing tokens defined in globals.css.

- [ ] **Step 5: Verify — dark mode is byte-for-byte unchanged**

Run: `npm run dev`. With theme = dark (default), screenshot `/`, `/models`, `/providers`, `/compare/bitrouter-vs-openrouter`. They must look **identical to before** (the aliases resolve to the same dark hex the hardcoded values used). If any color shifted, a `--bp-*` dark value doesn't match the old terminal hardcode — fix the `.dark` value.

Run: `npx tsc --noEmit` (no new errors) and confirm no build error from the removed `@import`.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css components/landing/mono/mono.css
git rm theme.css
git commit -m "refactor(theme): unify token defs into globals.css, alias .br-mono to --bp-*"
```

---

## Task 2: Flip the landing to themeable + delete the straddle hacks — HERO CHECKPOINT

**Files:**
- Modify: `components/landing/mono/mono.css` (delete the header dark-override block)
- Modify: `components/landing/mono/site-mono-footer.tsx` (drop `br-mono-footer`)
- Modify: `components/header/site-header.tsx` (drop `data-site-header`)

- [ ] **Step 1: Delete the nav dark-override**

In `mono.css`, delete the entire block added this session:
`body:has(.br-mono:not(.br-mono-footer)) header[data-site-header] { … }` (the `--bp-*`/`--color-*` header override). With `.br-mono` now themeable, the nav should simply follow the theme.

- [ ] **Step 2: Remove the marker + hook**

- `site-mono-footer.tsx`: change `<div className="br-mono br-mono-footer">` back to `<div className="br-mono">`.
- `site-header.tsx`: remove the `data-site-header` attribute from the `<header>`.

- [ ] **Step 3: Verify in BOTH themes, then STOP for review**

Run dev. Toggle to **light** via the footer `[light]` switch and load `/`:
- The whole landing (including the hero) now renders in the **light** palette.
- The nav follows the theme (light on light) with no override.

Screenshot the light landing (hero, install bar, "no lock-in" strip, loop section).

> **🛑 CHECKPOINT — do not proceed past this task without human review of the light hero.**
> Present the light-landing screenshots. Decide together:
> - **Looks good** → proceed to Task 3 (polish the remaining hardcoded-dark bits).
> - **Colors off** → adjust the light `--bp-*` values (Task 1 Step 2) and re-review.
> - **Hero mock unworkable in light** → make just the hero terminal panel a **dark island**
>   (scope the dark `--bp-*` values to that component only, like a code block), keep the rest themeable, re-review.

- [ ] **Step 4: Commit (after checkpoint approval)**

```bash
git add components/landing/mono/mono.css components/landing/mono/site-mono-footer.tsx components/header/site-header.tsx
git commit -m "refactor(theme): make .br-mono themeable, remove nav override + markers"
```

---

## Task 3: Make the remaining hardcoded-dark component bits theme-aware

**Files:**
- Modify: `components/landing/mono/mono.css`

- [ ] **Step 1: Grain/vignette**

The `.br-mono::before` grain (`rgba(255,255,255,0.045)` radial glow — assumes black bg). Make it theme-aware: in light it should be a subtle dark glow or disappear. Add:
```css
:root:not(.dark) .br-mono::before {
  background: radial-gradient(120% 80% at 50% -10%, rgba(0, 0, 0, 0.03), transparent 60%);
}
```
(Keep the existing dark glow as the default.)

- [ ] **Step 2: `::selection`**

`.br-mono ::selection { background: var(--fg); color: #000 }` hardcodes `#000`. Change `color: #000` → `color: var(--bg)` so the selection inverts correctly in both themes.

- [ ] **Step 3: Sweep for other hardcoded dark values**

Grep mono.css for hardcoded hex/`rgba(255,255,255…)`/`rgba(0,0,0…)` in visual rules:
```bash
grep -nE "#[0-9a-fA-F]{3,6}|rgba\((255|0)" components/landing/mono/mono.css
```
For each, decide: replace with a token, or scope a light-mode override. Focus on backgrounds, borders, shadows, and text colors that assume dark.

- [ ] **Step 4: Verify light + dark**

Reload `/` in light and dark; confirm grain, text selection, and any swept elements read correctly in both. Dark unchanged.

- [ ] **Step 5: Commit**

```bash
git add components/landing/mono/mono.css
git commit -m "fix(theme): make terminal grain/selection/hardcoded bits theme-aware"
```

---

## Task 4: Roll across the other flagship pages + footer; light audit each

**Files:** none expected (they inherit the themed `.br-mono`); fixes land in `mono.css` if issues surface.

- [ ] **Step 1: Audit each flagship surface in light**

With theme = light, load and screenshot each; note any dark-assuming component:
- `/models` (`ModelsMonoPage`)
- `/providers` (`ProvidersMonoPage`)
- `/compare/bitrouter-vs-openrouter` (+ litellm, portkey)
- The footer (`SiteMonoFooter`) on a plain page (e.g. `/about`) — it should now theme with the page, not be a forced dark band. **Decision:** confirm whether the footer should theme (light footer on light pages) or stay a dark island. If dark-island is wanted, scope dark `--bp-*` to the footer wrapper only.

- [ ] **Step 2: Fix any issues found** in `mono.css` (token or scoped light override), re-verifying dark is unaffected.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix(theme): light-mode audit fixes for models/providers/compare/footer"
```

---

## Task 5: Consolidate theme controls + kill stale comments

**Files:**
- Modify/Delete: `components/landing/sections/ThemeToggleIcon.tsx`, `components/site-footer.tsx`
- Modify: `components/sidebar-footer-controls.tsx`
- Modify: `app/globals.css` (comment cleanup)

- [ ] **Step 1: Find remaining usages**

```bash
grep -rn "ThemeToggleIcon\|SiteFooter" app components | grep -v "site-footer.tsx:"
```
`SiteFooter`/`ThemeToggleIcon` were unused after the footer refactor. Confirm, then delete `components/site-footer.tsx` and `components/landing/sections/ThemeToggleIcon.tsx` if nothing imports them. (If something still does, leave them and note it.)

- [ ] **Step 2: Reconcile the docs sidebar theme control**

`components/sidebar-footer-controls.tsx` uses `useTheme` — confirm it now works (theming enabled) and its 2-way/3-way behavior is consistent with the footer `MonoThemeSwitch`. Align to `[light][dark][system]` if trivial; otherwise note the difference.

- [ ] **Step 3: Remove stale comments**

In `app/globals.css` (the absorbed `theme.css` header) delete the "forces `.dark`" / "@repo/theme, shared with the console" language; replace with an accurate note (one themeable palette, single home).

- [ ] **Step 4: Verify + commit**

Run `npx tsc --noEmit` (no unused/missing-import errors). Then:
```bash
git add -A
git commit -m "chore(theme): consolidate theme controls, remove stale comments"
```

---

## Task 6: Full verification

- [ ] **Step 1:** `npm test` → 56 pass (footer-nav unaffected).
- [ ] **Step 2:** `npx tsc --noEmit` → no new errors; `npx next build` → clean.
- [ ] **Step 3: Theme matrix sweep** (`npm run dev`). For **light** and **dark** each, load and eyeball: `/`, `/models`, `/providers`, `/compare/bitrouter-vs-openrouter`, `/about`, `/pricing`, `/integrations`, `/blog`, `/changelog`, `/docs`, and the nav + footer on each. Confirm:
  - Every surface themes correctly in both modes (no page stuck in the wrong palette, except any agreed dark-island component).
  - **Dark mode is unchanged from the pre-refactor look.**
  - Nav matches its page in both themes with no special-casing.
  - The `[light][dark][system]` switch works and persists; new-visitor default is dark.
- [ ] **Step 4:** Confirm `theme.css` is deleted, `mono.css` has no token definitions, and grep finds no `br-mono-footer` / `data-site-header` / `body:has(.br-mono` references.

---

## Self-Review (completed)

- **Spec coverage:** token unification (T1), themeable `.br-mono` + hack deletion (T2), hardcoded-dark fixes (T3), flagship+footer audit (T4), controls + comments (T5), file consolidation / `theme.css` retirement (T1), dark-island escape hatch (T2 checkpoint + T4 footer decision). All covered.
- **No placeholders:** the alias block and new `--bp-*` values are concrete (light values flagged tunable at the checkpoint, which is a real design gate, not a TODO).
- **Consistency:** token names (`--bp-info`, `--bp-panel-3`, `--bp-line-bright`, `--bp-ghost`) match between Steps 2 and 3; `.br-mono` alias names match mono.css's existing usage.
- **Ordering risk:** T1 Step 1 flags the `@theme inline` / `:root` / `.dark` ordering vs the brand override — the one place a mistake would silently reskin the site.
