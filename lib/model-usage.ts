/* Mock "what the router routed to" usage series for the Models ranking hero.

   ┌──────────────────────────────────────────────────────────────────────────┐
   │ SWITCH TO REAL DATA BEFORE MERGE.                                          │
   │ This whole module is a deterministic MOCK (labelled "sample" in the UI).  │
   │ Replace `mockUsage` with real BitRouter routing telemetry:                │
   │   • daily routed-call counts per model over the window (→ series[].values)│
   │   • this-week vs last-week share per model (→ ranked[].share / .delta)     │
   │ Keep the return shape (MockUsage) identical and the components + chart     │
   │ need no changes. Until then it stays biased toward open + cheap models so  │
   │ the stack matches the "route the routine majority to open models" story.  │
   └──────────────────────────────────────────────────────────────────────────┘ */

import { type Model } from "@/lib/models-types";
import {
  providerFromId,
  isOpenSourceModel,
  modelDisplayName,
} from "@/lib/models-filter";

// Fixed daily window generated from a constant start date so it's deterministic
// across SSR/CSR (no Date.now → no hydration drift). One bar per day.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = 84; // 12 weeks, one bar per day
const START_MS = new Date(2026, 4, 12).getTime(); // May 12 2026 (fixed)
export const DAY_LABELS = Array.from({ length: DAYS }, (_, i) => {
  const d = new Date(START_MS + i * 86_400_000);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
});
export const WEEKS_SPAN = Math.round(DAYS / 7);

const TOP_N = 8;
// Cool single-family ramp anchored on the brand accent (violet → cyan) so the
// stack reads as one on-brand gradient, not a clashing rainbow; long tail
// collapses to muted gray.
const COLORS = [
  "#b57bf0", "#9b7cf2", "#7f83f2", "#6a90f0",
  "#5aa2ee", "#46b6ea", "#39c6e2", "#33d6cf",
];
const OTHER_COLOR = "#3d3f49";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngFor(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mock popularity weight: open + cheap models get the bulk of routed traffic.
function usageWeight(m: Model): number {
  const base = 0.3 + 0.7 * rngFor(hashStr(m.id))();
  const open = isOpenSourceModel(m) ? 2.3 : 0.85;
  const price = m.pricing.input || 0.1;
  const t = Math.min(1, Math.log(price + 1) / Math.log(80)); // 0 cheap → 1 pricey
  const cheap = 1.5 - t; // cheap → ~1.5, frontier → ~0.5
  return base * open * cheap;
}

export type UsageSeries = {
  key: string;
  id: string | null;
  label: string;
  provider: string | null;
  color: string;
  values: number[]; // one routed-call count per day
};
export type RankedRow = {
  rank: number;
  id: string;
  provider: string;
  label: string;
  share: number;
  delta: number;
  color: string;
};
export type MockUsage = {
  days: string[];
  series: UsageSeries[]; // base → top for stacking (rank 1 at base, "other" on top)
  ranked: RankedRow[];
  total: number;
};

function sumRange(a: number[], start: number, end: number): number {
  let s = 0;
  for (let i = start; i < end; i++) s += a[i];
  return s;
}

export function mockUsage(models: Model[]): MockUsage {
  const days = DAY_LABELS;
  const D = days.length;
  if (!models.length) return { days, series: [], ranked: [], total: 0 };

  const scored = models
    .map((m) => ({ m, w: usageWeight(m) }))
    .sort((a, b) => b.w - a.w);
  const top = scored.slice(0, TOP_N);
  const rest = scored.slice(TOP_N);

  const growth = (i: number) => 0.5 + 0.5 * (i / (D - 1)); // 0.5 → 1.0 over the window
  const wobble = (id: string, i: number) =>
    1 + (rngFor(hashStr(id + ":" + i))() - 0.5) * 0.5; // day-to-day jitter for texture
  // Skewed (Zipf-like) share by global rank so a couple of models dominate the
  // stack and the long tail stays a modest slice — the shape real routed
  // traffic takes, not an even spread.
  const shareByRank = (rank1: number) => 1 / Math.pow(rank1, 1.5);
  const valuesFor = (id: string, rank1: number) =>
    days.map((_, i) => shareByRank(rank1) * growth(i) * wobble(id, i) * 15000);

  const topSeries: UsageSeries[] = top.map(({ m }, i) => ({
    key: m.id,
    id: m.id,
    label: modelDisplayName(m),
    provider: providerFromId(m.id),
    color: COLORS[i] ?? COLORS[COLORS.length - 1],
    values: valuesFor(m.id, i + 1),
  }));

  const otherValues = days.map((_, i) =>
    rest.reduce(
      (s, { m }, j) => s + shareByRank(TOP_N + 1 + j) * growth(i) * wobble(m.id, i) * 15000,
      0,
    ),
  );
  const series: UsageSeries[] = [
    ...topSeries,
    { key: "other", id: null, label: "other", provider: null, color: OTHER_COLOR, values: otherValues },
  ];

  // Rank by share of the last 7 days; delta vs the prior 7 days.
  const lastWeekTotal = series.reduce((s, se) => s + sumRange(se.values, D - 7, D), 0);
  const prevWeekTotal = series.reduce((s, se) => s + sumRange(se.values, D - 14, D - 7), 0);
  const ranked: RankedRow[] = topSeries.map((se, i) => {
    const shareLast = (sumRange(se.values, D - 7, D) / lastWeekTotal) * 100;
    const sharePrev = (sumRange(se.values, D - 14, D - 7) / prevWeekTotal) * 100;
    return {
      rank: i + 1,
      id: se.id as string,
      provider: se.provider as string,
      label: se.label,
      share: shareLast,
      delta: shareLast - sharePrev,
      color: se.color,
    };
  });

  return { days, series, ranked, total: models.length };
}
