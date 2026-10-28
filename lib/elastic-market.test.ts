import { describe, expect, it } from "vitest";
import { ELASTIC_MARKET_ASSETS, BUYER_FEE_RATE, marketStats, marketSeries, referenceBuyerPrice, volumeSeries } from "./elastic-market";

describe("Elastic market reference observations", () => {
  it("uses a complete supplier quote and includes the buyer fee exactly once", () => {
    expect(referenceBuyerPrice({ input: 1, output: 3 })).toBeCloseTo(1.5 * (1 + BUYER_FEE_RATE));
    for (const asset of ELASTIC_MARKET_ASSETS) {
      expect(marketStats(asset, "24H").ask).toBeCloseTo(referenceBuyerPrice(asset.supplierAsk));
    }
  });

  it("keeps the same current quote across windows and sums disjoint token buckets", () => {
    for (const asset of ELASTIC_MARKET_ASSETS) {
      for (const window of ["24H", "7D", "30D"] as const) {
        const stats = marketStats(asset, window);
        expect(stats.ask).toBe(marketStats(asset, "24H").ask);
        expect(volumeSeries(asset, window).reduce((sum, point) => sum + point.inputTokens + point.outputTokens, 0)).toBe(stats.volume);
      }
      expect(marketSeries(asset, "24H")).toHaveLength(25);
      expect(volumeSeries(asset, "7D")).toHaveLength(28);
      expect(volumeSeries(asset, "30D")).toHaveLength(30);
    }
  });

  it("preserves missing bids and historical gaps rather than zero prices", () => {
    expect(marketStats(ELASTIC_MARKET_ASSETS[1], "24H").bid).toBeNull();
    expect(marketStats(ELASTIC_MARKET_ASSETS[1], "24H").spread).toBeNull();
    expect(marketSeries(ELASTIC_MARKET_ASSETS[2], "24H").some(point => point.ask === null)).toBe(true);
    for (const asset of ELASTIC_MARKET_ASSETS) {
      for (const point of asset.history) {
        if (point.ask !== null && point.bid !== null) expect(point.bid).toBeLessThan(point.ask);
      }
    }
  });
});
