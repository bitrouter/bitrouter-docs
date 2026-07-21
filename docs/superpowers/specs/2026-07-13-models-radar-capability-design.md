# Models page — capability radar + cards/table + model pages

**Date:** 2026-07-13
**Status:** Draft for review
**Scope:** Frames 2, 3, 4 of the models-page refactor. Frame 1 (the live-router hero) is **deferred** — see [Deferred](#deferred).

---

## 1. Goal

Reframe `/models` from a flat price catalog into a **capability surface**: every model is shown as a
capability *shape*, and that same shape is what the router matches a call against. Two ways to read the
same data:

- **Cards view** — each model's capability shown as a radar (its "fingerprint").
- **Table view** — the radar's axes shown as sortable numeric columns.

Clicking any model opens a **dedicated model page** (a real route, not an inline expand), which shows the
full shape plus *how the router uses this model*.

This session is **UI/UX + mock data only**. No telemetry, no live routing. The data model is wired so the
mock → real swap is a single function later.

Core value-prop tie-in: the capability shape is the substrate the context-aware router reasons over. This
page is the "what the router sees" reference; the routing *decision* itself is the deferred hero.

### Non-goals
- Frame 1 live-router hero (deferred).
- Any real routing telemetry, traffic shares, or "% of calls" that isn't clearly labelled mock.
- Changing the filter sidebar, search, or the underlying `useModels` data flow.
- A new radar charting dependency — the radar is hand-rolled SVG (see §3).

---

## 2. The shared capability model

One vocabulary of **six axes** drives the card radar, the table columns, and the model page. Six axes = a
clean hexagon and it's the largest set that stays legible at card size (~150px). The axes are chosen to
reflect BitRouter's moat, **not** to mirror Artificial Analysis's benchmark breakdown — three describe
capability, three describe what the model costs to run in production.

| Axis | Meaning | Source now | Normalize to 0–100 |
|---|---|---|---|
| `intelligence` | general capability | **real** — `intelligenceIndex` (0–100) | passthrough |
| `coding` | coding ability | **real** — `codingIndex` (0–100) | passthrough |
| `agentic` | tool-use / multi-step | **mock** — no field yet | deterministic mock (§2.1) |
| `cost` | **affordability** (cheaper = higher) | **real** — `pricing.input` | inverse log-scale: cheap → 100 |
| `speed` | output throughput | **real** — `outputTokensPerSecond` | log-scale 5–300 tok/s → 0–100 |
| `reliability` | uptime / failover success | **mock** — BitRouter telemetry later | deterministic mock (§2.1) |

Design notes:
- **Not the AA axes.** Academic benchmarks (math, GPQA, MMLU) are dropped. `intelligence` is the one axis
  that overlaps AA's headline index; it's kept as a familiar anchor. `agentic` and `reliability` are axes
  AA structurally can't publish — `reliability` especially, since only a router in the request path sees
  provider health and failover. That axis is the moat, drawn.
- **`cost` is plotted as affordability, never raw price.** On a radar, outward = better on every axis or
  the shape lies. So the `cost` spoke plots inverse-normalized price (cheap = outward); the raw `$` price
  still appears as plain fields. (This supersedes the earlier draft's "cost is never an axis" — it enters
  as affordability, distinct from the price fields.)
- **Correlation is intentional.** The three capability axes (`intelligence`/`coding`/`agentic`) move
  together, so models differ most on the operational axes (`cost`/`speed`/`reliability`). The resulting
  silhouette is a **value-frontier signature**: open models render fat on cost/speed/reliability with
  respectable capability; frontier models render lean on cost, spiky on capability. That open→frontier
  gradient is the pitch, drawn automatically.
- `speed` (throughput) and latency (`timeToFirstToken`) are different. The radar uses `speed`; `p50 ttft`
  stays a plain field.
- **Axis order is fixed everywhere**, clockwise from top: `intelligence, coding, agentic, cost, speed,
  reliability` — capability axes grouped on one side, operational on the other, so the value seesaw reads.
  Reordering changes the silhouette, so the order is a constant, never per-model.
- **Data backing:** 4 of 6 axes are real today (`intelligence`, `coding`, `cost`, `speed`); `agentic` and
  `reliability` are mock-first this session. `reliability`'s real source is BitRouter's own routing
  telemetry — which is exactly why it can't be copied from a benchmark site.

### 2.1 `lib/model-capability.ts` (new)

Single source of truth for axes + normalization + the mock fallback.

```ts
export const AXES = ["intelligence", "coding", "agentic", "cost", "speed", "reliability"] as const;
export type Axis = (typeof AXES)[number];
export type AxisSet = Record<Axis, number>;              // each 0..100
export type SourceSet = Record<Axis, "real" | "mock">;   // per-axis provenance

export function capabilityAxes(m: Model): { axes: AxisSet; sources: SourceSet };
```

- Per-axis provenance: `intelligence`/`coding`/`speed` are `real` when `m.benchmarks` has them, and `cost`
  is always `real` (derived from `pricing.input`); `agentic`/`reliability` are always `mock` for now.
- **Real axes with missing data** (dev has no `AA_API_KEY`, or a model AA doesn't cover) fall back to a
  **deterministic** mock seeded by a hash of `m.id` (stable across renders/reloads), biased by
  `pricing.input` and `maxInputTokens` so pricier/larger models look stronger — plausible, not random —
  and marked `mock`.
- Any axis whose source is `mock` is tagged in the UI (a small `~ estimated`), so we never imply a number
  we don't have. Real axes are attributed to Artificial Analysis; `reliability`/`agentic` to BitRouter.

---

## 3. Radar component

`components/models/capability-radar.tsx` (new) — pure inline SVG, no dependency.

```ts
type Props = {
  values: AxisSet;
  size?: number;              // px, default 120
  variant?: "filled" | "outline";
  showLabels?: boolean;       // axis labels around the ring
  className?: string;
  title?: string;             // <title> for a11y, e.g. "qwen/qwen-3.7 capability shape"
};
```

- Renders 3 concentric hex grid rings + 6 spokes + the value polygon.
- Colors via `currentColor` / mono tokens (`--line`, `--mono`, `--accent`) so it themes with `.br-mono`.
  No `<style>` color blocks.
- `role="img"` + `<title>`/`<desc>`; the numeric values are also exposed in adjacent text (card
  footer / table cells), so the chart is never the *only* representation of the data.
- **Two visual jobs, one component, deliberately distinct treatments:**
  - Card + model page = a model's *fixed* shape → `variant="filled"`, quiet, single polygon.
  - (Reserved) hero decision = the *deciding* verb → not this component; deferred with Frame 1.

---

## 4. Frame 2 — Cards view

Grid of model cards; each card is a link to `/models/{id}`. **Each card is a two-column split: facts on
the left, radar on the right** — the radar is the visual anchor and a row of cards gets a clean vertical
rhythm of radars down the right edge.

```
[▦ cards] [▤ table]                                          sort: in$ ▾

┌─ one card · facts left, radar right ─────────────────┐   grid: auto-fit
│ ◈ qwen/qwen-3.7          oss     intelligence         │   3-up desktop,
│ fast · open                        ·▲·                │   2-up tablet,
│                            relia·⟋  ▨▨  ⟍·coding      │   1-up mobile
│ in   $0.07 / 1M                ⟍ ▨████▨ ⟋             │
│ out  $0.28 / 1M            speed·⟍  ▨▨  ⟋·agentic     │   ▨ filled shape
│ ctx  256K · TXT                    ·▼·                │   ~ = estimated axes
│ ~ agentic·reliability est         cost               │
└───────────────────────────────────────────────────────┘
whole card → <a href="/models/{id}">  · no expand · no terminal in card
```

**Card anatomy — a flex/grid split (`1fr | auto`):**

*Left column (facts, top → bottom):*
1. Header: provider icon + `m.id` (truncating) + `oss` badge if open-source.
2. Tier + tier class (`fast · open` / `balanced · open` / `frontier`) — reuse `tierOf()`.
3. Price: `in` / `out` per 1M (reuse `formatCompactPricePerMillionTokens`).
4. Meta: `ctx` + modality tags (`modTag`).
5. `~ estimated` tag naming which axes are mock (from `sources`), when any are.

*Right column:*
6. `capability-radar` `variant="filled"`, `showLabels`, ~120px, vertically centered.

**Layout:** card is `display:flex` (facts `1fr`, radar `auto`), `align-items:center`. Grid of cards is
`repeat(auto-fit, minmax(280px, 1fr))` — 3-up desktop, 2-up tablet, 1-up mobile, no breakpoints. On the
narrowest 1-up cards the small radar can stay beside the facts, or wrap below — decide in build.

**Interaction:** whole card is an `<a href="/models/{id}">`; hover raises border (`--line` → strong). No
expand. No terminal in the card (the terminal moves to the model page).

---

## 5. Frame 3 — Table view

The existing `.mtable` extended: five axes become numeric columns, everything sortable, rows link out.

```
[▦ cards] [▤ table]                                    sort: any column ▾

model                     ctx    in/1M  out/1M │ int code agnt spd rel │ mod
────────────────────────────────────────────── │ ──────────────────────│ ────
qwen/qwen-3.7        oss   256K   $0.07  $0.28  │  61   72   58   90  88 │ TXT
deepseek/deepseek-v4pro    164K   $0.20  $0.80  │  78   80   74   61  84 │ TXT
moonshot/kimi-k2.6   oss   200K   $0.15  $2.50  │  70   68   66   55  79 │ TXT
claude-opus-4.8            200K   $15.0  $75.0  │  95   90   92   50  99 │ TXT·IMG
────────────────────────────────────────────── │ ──────────────────────│ ────
   axes 0–100 · int/code/agentic/speed/reliability · cost = the $ columns · ~ estimated
```

**Columns:** `model` (icon + id + oss) · `ctx` · `in/1M` · `out/1M` · **`int` `code` `agnt` `spd` `rel`**
(0–100, `tabular-nums`, right-aligned; `agnt`/`rel` rendered faint + `~`-flagged since they're mock) ·
`modality`. The radar's 6th axis, `cost`, is **not** a duplicate 0–100 column — it's already represented
by the `in/1M` + `out/1M` price columns. So five axis columns map to five spokes; the sixth (cost) maps
to the price columns. `ctx` stays a plain fact column (it is no longer a radar axis).

**Sorting:** extend the existing `SORTS`/`cmp` map with `intelligence|coding|agentic|speed|reliability`
(cost is already covered by the `in$`/`out$` sorts). Clicking a column header sorts by it (asc/desc
toggle); the toolbar `sort` pills stay as a secondary control. Default sort unchanged (`in$`).

**Rows:** each row is a link to `/models/{id}`. No caret, no expand, no per-row terminal (all removed).

**Responsive:** the five axis columns are the overflow risk. On `< 900px` wrap the table body in an
`overflow-x: auto` scroller (the `model` column stays sticky-left); do **not** drop columns silently.

---

## 6. View switch (cards ⇄ table)

- A segmented control in the existing `.toolbar`, right of Filters, left of `sort`:
  `[▦ cards] [▤ table]`, `role="group"`, each button `aria-pressed`.
- State in `mono-models-page.tsx`: `const [view, setView] = useState<"cards"|"table">(...)`.
- **Persistence:** reflect in the URL as `?view=cards|table` (shareable, SSR-friendly) and mirror to
  `localStorage` for the next visit. URL wins on load.
- **Default:** `cards` on first visit (leads with the new capability shape); returning users get their
  last choice. *(Open question — see §10.)*
- Only the list region swaps. Toolbar (search / oss / filters / sort) and the page head are shared.

---

## 7. Frame 4 — Per-model page

**Kill the inline expand entirely.** Cards and rows link to `/models/{id}`, which already exists at
`app/(home)/models/[...slug]/page.tsx` (server-rendered, `fetchModelById`, canonical URL, `notFound()`).
This route is **re-skinned to mono** and **enriched**, not rebuilt.

```
/models/qwen/qwen-3.7                                        ← all models

┌──────────────────────────────────────────────────────────────────────────┐
│ ◈ Qwen · qwen/qwen-3.7          oss · fast · open      [ copy id ] [ key ] │
│ 256K ctx · $0.07 in · $0.28 out · p50 61ms                                │
└──────────────────────────────────────────────────────────────────────────┘

┌ capability shape ─────────────┐   ┌ how the router uses this model ───────┐
│       intelligence            │   │ policies routing here          (mock) │
│  relia·⟋ ▨▨ ⟍·coding          │   │  ● cost     default open pool  ▓▓▓▓▓▓ │
│      ⟍▨████▨⟋                 │   │  ◆ latency  fast tier          ▓▓▓░░░ │
│  speed·⟍▨▨⟋·agentic           │   │  ▲ balance  under 0.6 cx       ▓▓▓▓░░ │
│        cost                   │   │  ✕ accuracy rarely             ░░░░░░ │
│ intel ██████░61  code ███████ │   │ role   reads · edits · format         │
│ agentic █████58  cost █████████│   │ ~78% of cost-policy calls  (mock)     │
│ speed █████████90  relia ████88│   └───────────────────────────────────────┘
└───────────────────────────────┘
┌ pricing & limits ────────────┐    ┌ call · qwen/qwen-3.7 ─────────────────┐
│ input $0.07 · output $0.28   │    │ $ bitrouter chat --model qwen/qwen-3.7│
│ cache $0.01 · ctx 256K · TXT │    │ ✓ routed → qwen · 61ms · $.07/$.28 ▍  │
└──────────────────────────────┘    └── compare: deepseek-v4 · kimi-k2.6 ───┘
```

**Sections:**
1. **Header** — keep existing content (provider, name, `m.id`, copy-id, API-key CTA), re-skinned to mono
   (`h-display`, mono tokens; drop `RuledSectionLabel`/`Button` warm styling). Add a one-line stat strip
   (`ctx · in · out · p50`).
2. **Capability shape** — `capability-radar` (larger, ~200px) beside horizontal axis bars for all six
   axes (`intelligence · coding · agentic · cost · speed · reliability`), each 0–100 with its value.
   Real axes attributed to Artificial Analysis; `agentic`/`reliability` `~ estimated` and attributed to
   BitRouter telemetry.
3. **How the router uses this model** *(new, mock)* — the differentiator vs an AA card. Which of the four
   policies (cost / accuracy / latency / balance) route here, the model's role (reads/edits/reasoning/…),
   and an illustrative traffic share. **Every number here is labelled `(mock)`** until telemetry exists.
4. **Pricing & limits** — the existing overview stat grid, re-skinned; add cache tiers when present.
5. **Call terminal** — reuse the mono `Terminal` (the program currently inline in the expand row moves
   here).
6. **Compare** — links to `/compare/{a}-vs-{b}` for 2–3 sibling models (same tier or same provider),
   reusing the existing compare route.
7. **Quickstart** — keep the OpenAI + Anthropic `SnippetCard`s, re-skinned.

**Metadata:** keep `generateMetadata`; extend description to mention the capability axes so the page is a
strong GEO/citation surface (each model = one indexable URL).

---

## 8. Mock data plan

- `capabilityAxes(m)` (§2.1) is the only mock surface for the shapes — cards, table, and model page all
  read through it, so they agree. `intelligence`/`coding`/`speed` use real AA values when present (mock
  fallback when missing); `cost` is always real (from `pricing.input`); `agentic`/`reliability` are always
  mock this session, with `reliability`'s real source being BitRouter routing telemetry later.
- The model page's "how the router uses this model" panel is **fully mock** for now: a small static map
  keyed by `tierOf(m)` (e.g. `fast/open` → cost-heavy; `frontier` → accuracy-heavy) so it's plausible and
  consistent, every figure tagged `(mock)`.
- No mock in the price/context/modality fields — those are already real from `useModels`.

---

## 9. Files

**New**
- `lib/model-capability.ts` — axes, normalization, `capabilityAxes()`, mock fallback.
- `components/models/capability-radar.tsx` — SVG radar.
- `components/models/model-card.tsx` — the card (§4).
- (optional) `components/models/axis-bars.tsx` — the horizontal 0–100 bars for the model page.

**Modified**
- `components/models/mono-models-page.tsx` — add `view` state + URL/localStorage sync, view switch in
  toolbar, render cards grid or table, extend sort map, **remove the expand/`ModelRow` detail + per-row
  terminal**, make rows/cards link to `/models/{id}`.
- `app/(home)/models/[...slug]/page.tsx` — re-skin to mono; add capability + router-usage sections.
- `components/landing/mono/mono.css` — card classes (`.mcard*`), axis-column classes, radar helpers,
  view-switch classes, model-page section classes.

**Untouched**
- `lib/models-server.ts`, `lib/models-data.ts`, `useModels`, `FilterSidebar`, search/filter logic.

---

## 10. Open questions (for review)

1. **Default view** — cards or table on first visit? Spec proposes **cards** (showcases the shape); table
   is the denser lookup. Reasonable to flip to table if `/models` is treated as a pure utility.
2. **Table axis columns on mobile** — horizontal scroll (spec's choice) vs. collapse axes into a single
   "shape" mini-radar cell vs. hide axes under `< 900px`. Scroll keeps all data; mini-radar is prettier
   but less precise.
3. **"How the router uses this model"** — keep it first-class on the model page even while fully mock, or
   gate it behind a flag until telemetry lands? Spec keeps it (labelled) because it's the panel that makes
   the page *ours* and not a re-skinned AA card.
4. **Mock shapes when AA data is missing** — acceptable to ship estimated shapes with a `~` tag, or only
   render radars for models that have real AA coverage (and show a "no benchmark" state otherwise)? Note
   `agentic` + `reliability` are *always* estimated this session regardless, so some `~` is unavoidable.
5. **`agentic` real source** — no field is fetched today. Options later: AA's agentic/tool-use index if
   licensed, or BitRouter's own tool-call success telemetry (same pipe as `reliability`). Which do we aim
   the mock at?

---

## Deferred

**Frame 1 — live-router hero.** Deferred by decision on 2026-07-13. Open thread: radar is likely the
*wrong* grammar for the hero (radar = one entity's profile; the hero's verb is a live routing *decision*
across four co-equal policies). Candidate grammars parked for later: live decision lanes, a traffic-flow
Sankey, or a compact route ticker. Revisit after Frames 2–4 land. Whatever it becomes, it must read as a
different *verb* than the card/table radars so the page isn't radar-on-radar.
