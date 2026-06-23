# Feature Proposal: The Router Dashboard — replace `/models` with a router eval

**Date:** 2026-06-22
**Status:** Proposal (design); pending review → implementation plan
**Surfaces:** `bitrouter-docs` (Next.js 16, App Router, `next-intl` i18n, `.br-mono` theme).
Replaces/absorbs `app/(home)/models/page.tsx` + `components/models/mono-models-page.tsx`;
shares layout language with `app/(home)/providers/page.tsx`.

---

## Problem

The current `/models` page is an OpenRouter-style catalog: a dense, filterable table of
200+ models sorted by `$/1M in`, `$/1M out`, latency, with OSS −25% badges
(`components/models/mono-models-page.tsx`). It is a competent *catalog* and the wrong
*centerpiece* for BitRouter.

BitRouter's value proposition is **"cost-optimize agentic workloads — harness-agnostic,
model-agnostic."** That is a claim about *routing*, not *cataloging*. A static price table:

- Conveys **breadth**, which BitRouter shares with OpenRouter — i.e. it advertises the one
  thing that is *not* the differentiator.
- Conveys **nothing about the router** — the scoring/selection engine that is the actual
  product.
- Uses **`$/token` as the unit**, which is misleading for agentic workloads, where spend is
  driven by cost-per-*run*, cache-read economics, quality-floor gating, and reliability
  (a failed run burns all prior tokens).

The page should answer the visitor's real question — *"how do I cost-optimize my agentic
workload, and what metrics justify the decision?"* — and in doing so, **show the core of
BitRouter: the router.**

## The wedge (positioning)

**Artificial Analysis (AA) is a map. BitRouter is the driver and the road.**

AA (`artificialanalysis.ai/models`, `/agents/coding-agents`) stands *outside* the system,
runs benchmarks, and reports what is true on average. Its atom is a **model** (or an agent),
its authority comes from **neutrality**, and it is **read-only** — you consult it, then leave
to act elsewhere.

BitRouter sits *inside the data path* and **makes the routing decision**. This yields the
differentiation, and every design choice below is a consequence of it:

1. **The unit is the route, not the model.** The first-class object is the alias/intent
   (`code/balanced`), which floats across models and providers over time. Models are the
   implementation detail you expand to. AA structurally cannot copy this — it does not route.
2. **The numbers are the user's, not the world's.** Cost is computed against the visitor's
   workload profile and baseline; signed-in users see real routed spend and realized savings.
3. **The numbers are live, not a snapshot.** Current p50, uptime, cheapest-healthy provider,
   live cache-hit rate. AA feels quarterly; the router is deciding *now*.
4. **AA's disclaimer is our headline.** AA prints: *"cache-hit rates vary by routing, which
   can materially change effective cost — we don't control for it."* That variance is our
   product; we optimize it, we don't disclaim it.

**Positioning line:** *AA is where you learn what's good; BitRouter is where good happens to
your workload.*

### What to steal from AA (visual grammar)

- The hero is a **scatter**, and the unit is **cost-per-task**, not `$/token` (their flagship
  is *Intelligence Index vs. Cost per Task*, with the upper-left / lower-right quadrant as the
  attractive zone).
- **Cache is a first-class cost axis** (cache-hit / input / output / blended decomposition).
- **Harness is a variable** (their coding-agents page holds Opus constant and varies the
  harness — Cursor / Claude Code / OpenCode — to isolate harness effect from model effect).

### The trap we explicitly avoid

We **do not** pick the neutrality fight. We sell inference, so "we're cheapest" asserted as
authority is self-serving and a sophisticated visitor discounts it on sight. We win on
**checkability**, not claimed expertise: every number is auditable against the user's own
reality (raw direct-provider price shown next to the routed price; zero markup as a verifiable
line item; signed-in reconciliation against the actual bill). For the **quality axis**, where
we have no authority, we **cite AA** rather than inventing a competing index — borrow their
neutrality instead of fighting it.

---

## Core concept: evaluate the *router*, not the models

AA evals models. The thing only BitRouter can eval — and the only thing that *is* the core of
BitRouter — is **the router**. The contestant being graded is not "is Opus good?" but "did the
router make the right call?"

The router's job: for a given workload + quality bar, find the cheapest route that stays above
the quality floor and completes reliably. Grade it against two reference points — and the gap
to each is the whole story:

```
  naive baseline  ──────►  BitRouter route  ──────►  oracle (best in hindsight)
   (pin Opus,                (what it picked,           (cheapest route that
    pick by reputation)       live)                      met the quality bar)
        └──── value delivered ─────┘   └─ router's remaining error ─┘
```

- **baseline → BitRouter** = savings delivered (the headline).
- **BitRouter → oracle** = how far the router still is from perfect (the honesty).

Showing the **second gap** is what defeats the "marking your own homework" problem. An eval
that only ever wins is self-serving and discounted instantly. An eval that says *"we captured
87% of available savings; here's the 13% we left and why"* is credible *because* it admits a
ceiling. **We show where the router loses, and the wins become believable.**

### The eval visualized = AA's scatter, weaponized

The AA-style cost-vs-quality scatter gets, **per task-class, three marked points and an arrow**
between them: *you are here (baseline) → the router moves you here → perfection is here
(oracle).* AA's chart is dots you interpret; ours is a **vector**. The arrow is the product.

---

## Two surfaces (the eval + the proof-of-life)

An eval alone is aggregate and periodic-feeling — AA's home turf. The router's other
superpower is that it is *deciding right now*. So the dashboard has two complementary surfaces:

1. **Router-as-eval (the proof).** Aggregate regret triangle per task-class:
   % savings realized, % quality retained, audited against baseline + oracle. *Convinces* you
   the router routes well.
2. **Router-as-live-trace (the proof-of-life).** A real-time feed of actual decisions —
   *"request → scored 6 providers → picked X (cheapest healthy above bar) → saved Z · 287ms."*
   *Shows* it routing, and reuses the terminal aesthetic already built in
   `components/landing/mono/terminal.tsx`. AA literally cannot render this.

The trace pulls you in (it's alive); the eval makes you believe (it's good). Together they
*are* the router.

---

## Data sources (decision)

An eval needs ground truth; the two surfaces have different needs, so they use different
sources — each played to its strength:

- **Synthetic task suite → powers the eval / regret triangle.** BitRouter runs a standard
  battery (coding, RAG, agentic-long-context, summarization) through (a) its own router,
  (b) the naive baselines, and (c) computes the oracle (cheapest route that cleared the bar in
  hindsight). Chosen for the eval because the regret triangle **needs a known-good answer**,
  and **reproducibility is how we beat the neutrality problem** — the methodology is publishable
  and auditable. This is real eval infrastructure to build and maintain (acknowledged cost).
- **Live traffic telemetry → powers the live trace and personalized savings.** Real routed
  requests yield current p50 / uptime / cache-hit and realized per-user savings. Maximally
  authentic and live; it is the moat data. Carries a privacy/aggregation requirement and has
  no clean per-task quality ground truth (we don't know if the user's task succeeded) — which
  is exactly why it powers the *trace*, not the *eval*.

Where eval data is missing for a model/route, the dashboard **shows the gap rather than
fabricating a point**. Modeled figures (cost-per-task derived from registry pricing against a
stated profile) are permitted **only when labeled "modeled at profile X"** — never presented as
measured.

---

## Page anatomy

A control bar drives an opinion-first hero, with the catalog demoted to an evidence substrate.

### 1. Control bar (persistent) — the thesis made interactive

- **Profile** (the harness-agnostic hook): presets like *"Claude Code · long context · heavy
  cache reuse," "Codex · short bursts," "RAG agent · big input / small output."* Each preset is
  a labeled token-shape + cache-hit assumption. Changing it recomputes every panel.
- **Baseline** (so "optimize" has a number): *vs. Opus direct / vs. GPT direct / vs. my current
  sub.* Every savings figure is relative to this.

### 2. Hero band (opinion) — the regret triangle

- The cost-vs-quality scatter with **baseline → router → oracle** vectors per selected
  task-class.
- A **savings headline** tied to profile + baseline: *"route `code/balanced` → −73% vs. Opus
  direct at this profile, 91% quality retained."*
- An honesty line: *"captured 87% of available savings; 13% gap → see why."*

### 3. Live trace (proof-of-life)

- Streaming decision feed reusing the mono `Terminal` component; rows resolve aliases live and
  show provider pick, reason, latency, and savings. Falls back to a representative replay when
  no live stream is available.

### 4. Catalog substrate (evidence + SEO)

- The existing dense table is **retained but demoted**, re-columned for agentic reality:
  cost-per-task (modeled/measured, labeled), cache savings, quality (cited), savings-vs-baseline
  — replacing raw `$/token` as the *primary* sort while keeping `$/token` as secondary context.
- Preserves the SEO + "is my model here?" funnel the catalog currently serves.
- Row drill-down reuses the existing expandable-row pattern from `mono-models-page.tsx`:
  cost decomposition (input / output / cache-read credit / OSS −25% / markup = 0) and a
  cache-leverage curve (cost/run as cache-hit climbs 0→90%).

---

## Units & boundaries

- **Eval dataset** — input: task suite + router/baseline/oracle runs; output: per-task-class
  `{ savingsRealized, qualityRetained, regretToOracle }`. Produced by an offline pipeline,
  consumed by the dashboard as static JSON (mirrors the registry's `dist/*.json` pattern).
  Testable in isolation (known suite in, deterministic scores out).
- **Profile + baseline model** — input: profile preset + baseline selection + registry pricing;
  output: per-route modeled cost-per-task. Pure function; testable.
- **Live trace feed** — input: telemetry stream (or replay fixture); output: decision rows.
  Isolated behind an interface so the replay fixture and the live stream are interchangeable.
- **Catalog table** — input: routes/models + computed metrics; output: sortable rows. Extends
  the existing component rather than replacing the mechanism.

---

## Non-goals (v1, YAGNI)

- A competing benchmark/index to AA — cite AA for the quality axis instead.
- Signed-in real-spend reconciliation — design the control bar to accommodate it later, but v1
  ships the anonymous profile/baseline path only.
- A full interactive cost calculator (freeform token inputs) — v1 ships **presets**, not a
  number pad.
- Harness-comparison eval as a *measured* surface — if synthetic harness runs don't exist at
  build time, ship it as a clearly-marked roadmap panel rather than fabricating it.
- Removing the catalog entirely — it is demoted, not deleted (SEO + coverage funnel).

## Risks & open questions (for the implementation plan)

- **Does the synthetic suite exist?** If not, v1 leads with the **live trace** and treats the
  regret triangle as the roadmap hero. The plan must confirm what eval data is available today.
- **Aliases as a product.** The route-as-unit spine assumes aliases (`code/balanced`) are a
  real, trusted product feature, not just a terminal demo. Confirm their maturity before making
  the alias the first-class object; otherwise fall back to route≈model for v1.
- **AA licensing/attribution** for citing their quality index — verify terms before embedding.
- **Telemetry privacy/aggregation** story for the live trace and personalized savings.
- **Scope of replacement vs. coexistence** — does `/models` become the dashboard, or does the
  dashboard live at a new route (e.g. `/router`) with `/models` redirecting? Recommended:
  the dashboard becomes the new `/models` hero with the catalog beneath it, preserving the URL.

## Files touched (anticipated)

- Replace hero: `components/models/mono-models-page.tsx` (refactor into control bar + hero band
  + trace + catalog substrate), `app/(home)/models/page.tsx`.
- Reuse: `components/landing/mono/terminal.tsx`, `components/ui/filter-sidebar.tsx`,
  `lib/model-pricing.ts`, `lib/models-filter.ts`, provider/registry data via
  `lib/models-server.ts` / `lib/providers-server.ts`.
- New: eval dataset loader + types (consume static eval JSON), profile/baseline model,
  live-trace feed interface + replay fixture.
- i18n: `Models` namespace strings (extend; keep `zh` routes intact).
