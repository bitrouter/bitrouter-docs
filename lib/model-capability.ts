/* Capability model — the shared vocabulary behind the Models radar, the cards,
   the table columns, and the per-model page.

   Six axes reflect BitRouter's moat rather than mirror Artificial Analysis's
   benchmark breakdown: three capability (intelligence / coding / agentic) and
   three operational (cost / speed / reliability).

   ┌──────────────────────────────────────────────────────────────────────────┐
   │ SWITCH TO REAL DATA BEFORE MERGE.                                          │
   │ `capabilityAxes` and `routerUsage` are deterministic MOCKS (shapes seeded  │
   │ by model id; every axis flagged `~ estimated` in the UI except `cost`,     │
   │ which is real, derived from the model's input price). Wire real sources:   │
   │   • intelligence / coding → Artificial Analysis (or your evals)            │
   │   • agentic / reliability → BitRouter routing telemetry                    │
   │   • routerUsage policy mix / role / share → routing telemetry              │
   │ Keep the return shapes identical; the components need no changes. */

import { type Model } from "@/lib/models-types";

export const AXES = [
  "intelligence",
  "coding",
  "agentic",
  "cost",
  "speed",
  "reliability",
] as const;
export type Axis = (typeof AXES)[number];
export type AxisSet = Record<Axis, number>; // each 0..100
export type SourceSet = Record<Axis, "real" | "mock">;

export const AXIS_META: Record<Axis, { label: string; short: string }> = {
  intelligence: { label: "intelligence", short: "int" },
  coding: { label: "coding", short: "code" },
  agentic: { label: "agentic", short: "agnt" },
  cost: { label: "cost", short: "cost" },
  speed: { label: "speed", short: "spd" },
  reliability: { label: "reliability", short: "rel" },
};

/* ---- deterministic RNG so a model's mock shape is stable across renders ---- */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Input price ($/1M) mapped to a 0..1 quality proxy (pricier → more capable)
   and to affordability (cheaper → higher). Fixed log bounds keep the scale
   stable as the catalog changes. */
const P_MIN = 0.05;
const P_MAX = 75;
function priceT(price: number): number {
  if (!price || price <= 0) return 0.3;
  const p = Math.min(P_MAX, Math.max(P_MIN, price));
  return (Math.log(p) - Math.log(P_MIN)) / (Math.log(P_MAX) - Math.log(P_MIN));
}
export function affordability(price: number): number {
  if (!price || price <= 0) return 100;
  return Math.round((1 - priceT(price)) * 100);
}

export function capabilityAxes(m: Model): { axes: AxisSet; sources: SourceSet } {
  const rnd = mulberry32(hashStr(m.id));
  const q = priceT(m.pricing.input); // 0..1, pricier → more capable
  const j = () => (rnd() - 0.5) * 0.16; // deterministic per-axis jitter
  const clamp = (x: number) => Math.max(8, Math.min(99, Math.round(x)));

  const axes: AxisSet = {
    intelligence: clamp(100 * (0.4 + 0.55 * q + j())),
    coding: clamp(100 * (0.42 + 0.52 * q + j())),
    agentic: clamp(100 * (0.38 + 0.55 * q + j())),
    cost: affordability(m.pricing.input),
    speed: clamp(100 * (0.5 + 0.42 * (1 - q) + j())),
    reliability: clamp(100 * (0.74 + 0.22 * rnd())),
  };
  const sources: SourceSet = {
    intelligence: "mock",
    coding: "mock",
    agentic: "mock",
    cost: "real",
    speed: "mock",
    reliability: "mock",
  };
  return { axes, sources };
}

/* ---- coarse tier from price (used for labels + router-usage archetype) ---- */
export type Tier = "frontier" | "balanced" | "fast" | "reasoning";
export function modelTier(m: Model): Tier {
  const id = m.id.toLowerCase();
  if (/(^|\/)(o1|o3|o4)|r1|reason|think|qwq/.test(id)) return "reasoning";
  const p = m.pricing.input;
  if (p >= 10) return "frontier";
  if (p >= 2) return "balanced";
  return "fast";
}

/* ---- "how the router uses this model" — fully mock, keyed by tier ---- */
export type PolicyKey = "cost" | "accuracy" | "latency" | "balance";
export const POLICY_META: Record<PolicyKey, { label: string; mark: string }> = {
  cost: { label: "cost", mark: "●" },
  accuracy: { label: "accuracy", mark: "◆" },
  latency: { label: "latency", mark: "◇" },
  balance: { label: "balance", mark: "▲" },
};

const POLICY_ORDER: PolicyKey[] = ["cost", "accuracy", "latency", "balance"];

type Archetype = {
  w: Record<PolicyKey, number>;
  notes: Record<PolicyKey, string>;
  role: string;
};

function archetype(tier: Tier): Archetype {
  switch (tier) {
    case "frontier":
      return {
        w: { cost: 0.12, accuracy: 0.9, latency: 0.28, balance: 0.46 },
        notes: {
          cost: "rarely — too costly",
          accuracy: "hard reasoning",
          latency: "only if pinned",
          balance: "high-stakes paths",
        },
        role: "reasoning · hard edits · verification",
      };
    case "reasoning":
      return {
        w: { cost: 0.3, accuracy: 0.8, latency: 0.22, balance: 0.5 },
        notes: {
          cost: "budget reasoning",
          accuracy: "multi-step",
          latency: "non-interactive",
          balance: "planning",
        },
        role: "multi-step reasoning · planning",
      };
    case "balanced":
      return {
        w: { cost: 0.55, accuracy: 0.5, latency: 0.52, balance: 0.82 },
        notes: {
          cost: "mid-complexity",
          accuracy: "when the floor rises",
          latency: "tool calls",
          balance: "default workhorse",
        },
        role: "medium calls · retrieval · tools",
      };
    default:
      return {
        w: { cost: 0.9, accuracy: 0.12, latency: 0.82, balance: 0.62 },
        notes: {
          cost: "default open pool",
          accuracy: "rarely",
          latency: "fast tier",
          balance: "under 0.6 complexity",
        },
        role: "reads · edits · format · classify",
      };
  }
}

export function routerUsage(m: Model): {
  policies: { key: PolicyKey; label: string; mark: string; weight: number; note: string }[];
  role: string;
  dominant: PolicyKey;
  shareNote: string;
} {
  const a = archetype(modelTier(m));
  const policies = POLICY_ORDER.map((key) => ({
    key,
    label: POLICY_META[key].label,
    mark: POLICY_META[key].mark,
    weight: a.w[key],
    note: a.notes[key],
  }));
  const dominant = POLICY_ORDER.reduce((best, k) => (a.w[k] > a.w[best] ? k : best), POLICY_ORDER[0]);
  const share = Math.round(a.w[dominant] * 85);
  return { policies, role: a.role, dominant, shareNote: `~${share}% of ${dominant}-policy calls` };
}

/* ---- small display helpers shared by cards / table / page ---- */
export function formatCtx(tokens: number): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

const MOD_TAG: Record<string, string> = {
  text: "TXT",
  image: "IMG",
  audio: "AUD",
  video: "VID",
  embedding: "EMB",
  "function-calling": "FN",
  tools: "FN",
};
export function modTag(mod: string): string {
  return MOD_TAG[mod.toLowerCase()] ?? mod.slice(0, 3).toUpperCase();
}
