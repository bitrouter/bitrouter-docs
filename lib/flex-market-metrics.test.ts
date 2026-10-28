import { describe, expect, it } from "vitest";
import { BUYER_FEE_RATE, FLEX_MARKET_ASSETS, MARKET_AS_OF, REFERENCE_PROFILE, marketStats } from "./flex-market";
import { availableLiquidity, globalMarketStats, globalMarketSeries, settlementChartSeries, LIQUIDITY_PROFILE, summarizeSettlements, formatSlippageBps, type LiquidityAllocation, type SettlementCohort } from "./flex-market-metrics";

const now = Date.parse(MARKET_AS_OF);
function cohort(overrides: Partial<SettlementCohort>): SettlementCohort {
  return { assetId: "model-a", settledAt: now, supplierUsd: 100, platformFeesUsd: 5, deliveredTokens: 4_000, purchases: 1, referenceUsd: 100, ...overrides };
}
function allocation(overrides: Partial<LiquidityAllocation>): LiquidityAllocation {
  return { capacityId: "pool-a", assetId: "model-a", requests: 10, rates: { input: 1, output: 1 }, readyNow: true, completionMinutes: 3, quoteExpiresAt: now + 1, ...overrides };
}

describe("global market metrics", () => {
  it("weights slippage by reference spend, preserving improvements and missing benchmarks", () => {
    const stats = summarizeSettlements([
      cohort({ supplierUsd: 101, referenceUsd: 100 }),
      cohort({ supplierUsd: 899.1, referenceUsd: 900 }),
      cohort({ supplierUsd: 1_000, referenceUsd: null }),
    ], "24H", now);
    expect(stats.slippageBps).toBeCloseTo(1); // (1 - .9) / 1000, not an average of percentages.
    expect(stats.coverage).toBeCloseTo(2 / 3);
    expect(stats.purchases).toBe(3);
    expect(stats.adverseP95Bps).toBeCloseTo(100);
    expect(summarizeSettlements([cohort({ referenceUsd: null })], "24H", now).slippageBps).toBeNull();
    expect(formatSlippageBps(null)).toBe("—");
    expect(formatSlippageBps(0)).toBe("0");
  });

  it("uses settlement time and sums recorded fees separately from supplier volume", () => {
    const stats = summarizeSettlements([
      cohort({ settledAt: now - 24 * 3_600_000, supplierUsd: 900 }),
      cohort({ supplierUsd: 100, platformFeesUsd: 4 }),
      cohort({ settledAt: now + 1, supplierUsd: 800 }),
    ], "24H", now);
    expect(stats.volumeUsd).toBe(100);
    expect(stats.feesUsd).toBe(4); // Read the fee record; do not infer it from volume.
  });

  it("counts only current, ready, in-band liquidity that meets the completion window", () => {
    const value = availableLiquidity([
      allocation({}),
      allocation({ capacityId: "near", rates: { input: 1.05, output: 1.05 } }),
      allocation({ capacityId: "expensive", rates: { input: 1.051, output: 1.051 } }),
      allocation({ capacityId: "slow", completionMinutes: 6, rates: { input: 0.1, output: 0.1 } }),
      allocation({ capacityId: "expired", quoteExpiresAt: now }),
      allocation({ capacityId: "not-ready", readyNow: false }),
      allocation({ capacityId: "empty", requests: 0 }),
    ], now);
    expect(value).toBeCloseTo(0.082);
    // A quote can expire before the completion deadline: acceptance and delivery differ.
    expect(availableLiquidity([allocation({ quoteExpiresAt: now + 1 })], now)).toBeCloseTo(0.04);
    expect(availableLiquidity([allocation({}), allocation({ assetId: "model-b" })], now)).toBeNull();
  });

  it("keeps current liquidity fixed while windowed settlements and token activity agree", () => {
    for (const window of ["24H", "7D", "30D"] as const) {
      const stats = globalMarketStats(window);
      expect(stats.deliveredTokens).toBe(FLEX_MARKET_ASSETS.reduce((sum, asset) => sum + marketStats(asset, window).volume, 0));
      expect(stats.feesUsd).toBeCloseTo(stats.volumeUsd * BUYER_FEE_RATE);
      expect(stats.liquidityUsd).toBe(globalMarketStats("24H").liquidityUsd);
      expect(stats.comparablePurchases).toBeLessThan(stats.purchases);
    }
    expect(globalMarketStats("7D").volumeUsd).toBeGreaterThan(globalMarketStats("24H").volumeUsd);
    expect(LIQUIDITY_PROFILE.inputTokens / (LIQUIDITY_PROFILE.inputTokens + LIQUIDITY_PROFILE.outputTokens)).toBe(REFERENCE_PROFILE.inputShare);
  });

  it("reconciles chart bucket amounts with headline totals across timeframes", () => {
    for (const [window, buckets] of [["24H", 24], ["7D", 28], ["30D", 30]] as const) {
      const series = globalMarketSeries(window);
      const stats = globalMarketStats(window);
      expect(series.volume).toHaveLength(buckets);
      expect(series.volume.reduce((sum, point) => sum + point.value!, 0)).toBeCloseTo(stats.volumeUsd);
      expect(series.fees.reduce((sum, point) => sum + point.value!, 0)).toBeCloseTo(stats.feesUsd);
      expect(series.liquidity).toHaveLength(buckets + 1);
      expect(series.liquidity[series.liquidity.length - 1]).toEqual({ start: now, time: now, value: stats.liquidityUsd });
    }
  });

  it("recomputes weighted interval slippage and preserves absent benchmarks and snapshot gaps", () => {
    const series = settlementChartSeries([
      cohort({ supplierUsd: 101, referenceUsd: 100 }),
      cohort({ supplierUsd: 899.1, referenceUsd: 900 }),
      cohort({ supplierUsd: 1_000, referenceUsd: null }),
    ], "24H", now);
    expect(series.slippage[23].value).toBeCloseTo(1);
    expect(series.volume[23].value).toBeCloseTo(2_000.1);
    expect(series.slippage[0].value).toBeNull();
    expect(globalMarketSeries("24H").liquidity.some(point => point.value === null)).toBe(true);
  });
});
