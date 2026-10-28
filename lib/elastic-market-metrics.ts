import {
  BUYER_FEE_RATE, ELASTIC_MARKET_ASSETS, MARKET_AS_OF,
  referenceBuyerPrice, windowHours, type MarketWindow, type SupplierRates,
} from "./elastic-market";

export const LIQUIDITY_PROFILE = {
  inputTokens: 3_000,
  outputTokens: 1_000,
  completionMinutes: 5,
  maxAskPremium: 0.05,
} as const;

// These are aggregate DEMO settlement cohorts, not individual backend records.
// Every purchase in a cohort has the same proportional price deviation. Both
// costs use its actual token quantities, so output-length changes are not slippage.
export interface SettlementCohort {
  assetId: string;
  settledAt: number;
  supplierUsd: number;
  platformFeesUsd: number;
  deliveredTokens: number;
  purchases: number;
  referenceUsd: number | null;
}

export interface LiquidityAllocation {
  // An exclusive capacity allocation. Shared capacity must be allocated before
  // arriving here; conflicting allocations cannot safely produce a global total.
  capacityId: string;
  assetId: string;
  requests: number;
  rates: SupplierRates;
  readyNow: boolean;
  completionMinutes: number;
  quoteExpiresAt: number;
}

export type GlobalMarketMetric = "volume" | "liquidity" | "slippage" | "fees";
export interface GlobalMetricPoint {
  start: number;
  time: number;
  value: number | null;
}

const asOf = Date.parse(MARKET_AS_OF);

function supplierCost(rates: SupplierRates, input: number, output: number) {
  return (rates.input * input + rates.output * output) / 1_000_000;
}

export const DEMO_SETTLEMENTS: SettlementCohort[] = ELASTIC_MARKET_ASSETS.flatMap((asset, assetIndex) =>
  asset.history.slice(1).flatMap((point, hourIndex) => {
    const count = Math.max(3, Math.round((point.inputTokens + point.outputTokens) / 4_000));
    const counts = [Math.floor(count * 0.5), Math.floor(count * 0.35)];
    counts.push(count - counts[0] - counts[1]);
    const factor = point.ask === null ? 1 : point.ask / referenceBuyerPrice(asset.supplierAsk);
    const rates = { input: asset.supplierAsk.input * factor, output: asset.supplierAsk.output * factor };
    let remainingInput = point.inputTokens;
    let remainingOutput = point.outputTokens;
    return counts.map((purchases, cohortIndex) => {
      const input = cohortIndex === 2 ? remainingInput : Math.round(point.inputTokens * purchases / count);
      const output = cohortIndex === 2 ? remainingOutput : Math.round(point.outputTokens * purchases / count);
      remainingInput -= input;
      remainingOutput -= output;
      const supplierUsd = supplierCost(rates, input, output);
      const bps = [-5, 0, 15][cohortIndex] + assetIndex * 2 + [-2, 0, 3, 1, -1][hourIndex % 5];
      const hasBenchmark = point.ask !== null && (hourIndex + assetIndex + cohortIndex) % 17 !== 0;
      return {
        assetId: asset.id,
        settledAt: point.time,
        supplierUsd,
        platformFeesUsd: supplierUsd * BUYER_FEE_RATE,
        deliveredTokens: input + output,
        purchases,
        referenceUsd: hasBenchmark ? supplierUsd / (1 + bps / 10_000) : null,
      };
    });
  }),
);

// Independent demo allocations for the four assumed listings. The out-of-band,
// slow, and expired offers are retained to exercise the displayed eligibility rule.
export const DEMO_LIQUIDITY: LiquidityAllocation[] = ELASTIC_MARKET_ASSETS.flatMap((asset, index) => {
  const capacity = [800, 700, 4_000, 6_000][index];
  return [
    { tier: "best", premium: 1, requests: capacity, minutes: 3, expires: asOf + 120_000 },
    { tier: "near", premium: 1.03, requests: Math.round(capacity * 0.5), minutes: 4, expires: asOf + 180_000 },
    { tier: "expensive", premium: 1.08, requests: capacity, minutes: 3, expires: asOf + 120_000 },
    { tier: "slow", premium: 0.98, requests: capacity, minutes: 8, expires: asOf + 120_000 },
    { tier: "expired", premium: 0.97, requests: capacity, minutes: 3, expires: asOf - 1 },
  ].map(offer => ({
    capacityId: `${asset.id}/${offer.tier}`,
    assetId: asset.id,
    requests: offer.requests,
    rates: { input: asset.supplierAsk.input * offer.premium, output: asset.supplierAsk.output * offer.premium },
    readyNow: true,
    completionMinutes: offer.minutes,
    quoteExpiresAt: offer.expires,
  }));
});

export function availableLiquidity(allocations: readonly LiquidityAllocation[], now: number): number | null {
  const eligible = allocations.filter(offer => offer.readyNow && offer.quoteExpiresAt > now && offer.completionMinutes <= LIQUIDITY_PROFILE.completionMinutes && offer.requests > 0);
  // A shared pool has no unique global valuation until its allocation is resolved.
  if (new Set(eligible.map(offer => offer.capacityId)).size !== eligible.length) return null;
  const best = new Map<string, number>();
  for (const offer of eligible) {
    const cost = supplierCost(offer.rates, LIQUIDITY_PROFILE.inputTokens, LIQUIDITY_PROFILE.outputTokens);
    best.set(offer.assetId, Math.min(best.get(offer.assetId) ?? Infinity, cost));
  }
  return eligible.reduce((sum, offer) => {
    const cost = supplierCost(offer.rates, LIQUIDITY_PROFILE.inputTokens, LIQUIDITY_PROFILE.outputTokens);
    return cost <= best.get(offer.assetId)! * (1 + LIQUIDITY_PROFILE.maxAskPremium) + 1e-12 ? sum + cost * offer.requests : sum;
  }, 0);
}

// Fixed historical DEMO observations, not a timer or a simulated live feed.
// Preserve offer-expiry offsets and the same admission/profile/price-band rules
// at every historical snapshot. Missing source quotes leave an unknown total.
const capacityLevels = [0.82, 0.78, 0.85, 0.88, 0.84, 0.91, 0.94, 0.87, 0.92, 0.98, 0.93, 0.96, 0.89, 0.95, 1.02, 0.97, 1.04, 1.08, 1.0, 0.96, 1.03, 0.98, 1.02, 1.0];
const assetIndices = new Map(ELASTIC_MARKET_ASSETS.map((asset, index) => [asset.id, index]));
const liquidityHistory = ELASTIC_MARKET_ASSETS[0].history.map((point, index) => {
  if (point.time === asOf) return { time: asOf, value: availableLiquidity(DEMO_LIQUIDITY, asOf) };
  if (ELASTIC_MARKET_ASSETS.some(asset => asset.history[index].ask === null)) return { time: point.time, value: null };
  const capacityFactor = capacityLevels[index % capacityLevels.length] * (1 - Math.floor((asOf - point.time) / 86_400_000) * 0.005);
  const allocations = DEMO_LIQUIDITY.map(offer => {
    const asset = ELASTIC_MARKET_ASSETS[assetIndices.get(offer.assetId)!];
    const priceFactor = asset.history[index].ask! / referenceBuyerPrice(asset.supplierAsk);
    return {
      ...offer,
      requests: Math.floor(offer.requests * capacityFactor),
      rates: { input: offer.rates.input * priceFactor, output: offer.rates.output * priceFactor },
      quoteExpiresAt: point.time + offer.quoteExpiresAt - asOf,
    };
  });
  return { time: point.time, value: availableLiquidity(allocations, point.time) };
});

export function metricBucketHours(window: MarketWindow): number {
  return window === "24H" ? 1 : window === "7D" ? 6 : 24;
}

export function settlementChartSeries(cohorts: readonly SettlementCohort[], window: MarketWindow, now: number) {
  const bucketMs = metricBucketHours(window) * 3_600_000;
  const cutoff = now - windowHours(window) * 3_600_000;
  const buckets = Array.from({ length: windowHours(window) / metricBucketHours(window) }, (_, index) => ({
    start: cutoff + index * bucketMs,
    time: cutoff + (index + 1) * bucketMs,
    volume: 0, fees: 0, reference: 0, difference: 0,
  }));
  for (const cohort of cohorts) {
    if (cohort.settledAt <= cutoff || cohort.settledAt > now) continue;
    const bucket = buckets[Math.ceil((cohort.settledAt - cutoff) / bucketMs) - 1];
    bucket.volume += cohort.supplierUsd;
    bucket.fees += cohort.platformFeesUsd;
    if (cohort.referenceUsd !== null && cohort.referenceUsd > 0) {
      bucket.reference += cohort.referenceUsd;
      bucket.difference += cohort.supplierUsd - cohort.referenceUsd;
    }
  }
  return {
    volume: buckets.map(bucket => ({ start: bucket.start, time: bucket.time, value: bucket.volume })),
    fees: buckets.map(bucket => ({ start: bucket.start, time: bucket.time, value: bucket.fees })),
    slippage: buckets.map(bucket => ({ start: bucket.start, time: bucket.time, value: bucket.reference > 0 ? bucket.difference / bucket.reference * 10_000 : null })),
  };
}

export function globalMarketSeries(window: MarketWindow): Record<GlobalMarketMetric, GlobalMetricPoint[]> {
  const bucketMs = metricBucketHours(window) * 3_600_000;
  const cutoff = asOf - windowHours(window) * 3_600_000;
  const snapshots = new Map(liquidityHistory.map(point => [point.time, point.value]));
  return {
    ...settlementChartSeries(DEMO_SETTLEMENTS, window, asOf),
    liquidity: Array.from({ length: windowHours(window) / metricBucketHours(window) + 1 }, (_, index) => {
      const time = cutoff + index * bucketMs;
      return { start: time, time, value: snapshots.get(time) ?? null };
    }),
  };
}

export function summarizeSettlements(cohorts: readonly SettlementCohort[], window: MarketWindow, now: number) {
  const cutoff = now - windowHours(window) * 3_600_000;
  // Cohorts are stamped at settlement/bucket end: (cutoff, now].
  const selected = cohorts.filter(item => item.settledAt > cutoff && item.settledAt <= now);
  const comparable = selected.filter((item): item is SettlementCohort & { referenceUsd: number } => item.referenceUsd !== null && item.referenceUsd > 0);
  const referenceUsd = comparable.reduce((sum, item) => sum + item.referenceUsd, 0);
  const purchases = selected.reduce((sum, item) => sum + item.purchases, 0);
  const comparablePurchases = comparable.reduce((sum, item) => sum + item.purchases, 0);
  const adverse = comparable.map(item => ({ bps: Math.max(0, (item.supplierUsd / item.referenceUsd - 1) * 10_000), purchases: item.purchases })).sort((a, b) => a.bps - b.bps);
  let cumulative = 0;
  let adverseP95Bps: number | null = null;
  for (const item of adverse) {
    cumulative += item.purchases;
    if (cumulative >= Math.ceil(comparablePurchases * 0.95)) { adverseP95Bps = item.bps; break; }
  }
  return {
    volumeUsd: selected.reduce((sum, item) => sum + item.supplierUsd, 0),
    feesUsd: selected.reduce((sum, item) => sum + item.platformFeesUsd, 0),
    deliveredTokens: selected.reduce((sum, item) => sum + item.deliveredTokens, 0),
    purchases,
    comparablePurchases,
    coverage: purchases ? comparablePurchases / purchases : null,
    slippageBps: referenceUsd > 0 ? comparable.reduce((sum, item) => sum + item.supplierUsd - item.referenceUsd, 0) / referenceUsd * 10_000 : null,
    adverseP95Bps,
  };
}

export function globalMarketStats(window: MarketWindow) {
  return {
    ...summarizeSettlements(DEMO_SETTLEMENTS, window, asOf),
    liquidityUsd: availableLiquidity(DEMO_LIQUIDITY, asOf),
  };
}

export function formatMarketAmount(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", ...(value >= 1_000 ? { notation: "compact", maximumFractionDigits: 2 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }).format(value);
}

export function formatSlippageBps(value: number | null): string {
  if (value === null) return "—";
  if (Math.abs(value) < 0.05) return "0";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

export const LIQUIDITY_PROFILE_LABEL = `${(LIQUIDITY_PROFILE.inputTokens / 1_000).toFixed(0)}K input / ${(LIQUIDITY_PROFILE.outputTokens / 1_000).toFixed(0)}K output · No cache`;
