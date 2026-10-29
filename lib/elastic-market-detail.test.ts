import { describe, expect, it } from "vitest";
import { ELASTIC_MARKET_ASSETS, MARKET_AS_OF, marketStats } from "./elastic-market";
import { CLOUD_PRICING } from "./commercial-pricing";
import { DEMO_LIQUIDITY, availableLiquidity, globalMarketStats } from "./elastic-market-metrics";
import { marketOrderBook, marketSuppliers, modelSettlementStats, previewBuyQuote, recentMarketTrades, requestCost, type QuoteRequest } from "./elastic-market-detail";

const asset = ELASTIC_MARKET_ASSETS[0];
const request: QuoteRequest = { inputTokens: 3000, estimatedOutputTokens: 1000, maxOutputTokens: 1000, budgetUsd: 0.01, completionMinutes: 5 };

describe("model trading workspace", () => {
  it("reconciles per-model settled USD with market-wide totals and fulfilled tokens", () => {
    for (const window of ["24H", "7D", "30D"] as const) {
      const stats = ELASTIC_MARKET_ASSETS.map(asset => modelSettlementStats(asset.id, window));
      expect(stats.reduce((sum, item) => sum + item.volumeUsd, 0)).toBeCloseTo(globalMarketStats(window).volumeUsd);
      ELASTIC_MARKET_ASSETS.forEach((asset, index) => expect(stats[index].deliveredTokens).toBe(marketStats(asset, window).volume));
    }
  });
  it("reconciles in-band book supply with the board without double-counting or including slow/expired offers", () => {
    for (const asset of ELASTIC_MARKET_ASSETS) {
      const { asks, bids } = marketOrderBook(asset);
      expect(asks).toHaveLength(3);
      expect(new Set(asks.map(row => row.id)).size).toBe(asks.length);
      expect(asks[0].price).toBeCloseTo(marketStats(asset, "24H").ask!);
      const fee = CLOUD_PRICING.usdPerMillionTokens;
      const inBand = asks.filter(row => row.price - fee <= (asks[0].price - fee) * 1.05 + 1e-12);
      const supplierUsd = inBand.reduce((sum, row) => sum + (row.price - fee) * row.requests * 0.004, 0);
      expect(supplierUsd).toBeCloseTo(availableLiquidity(DEMO_LIQUIDITY.filter(offer => offer.assetId === asset.id), Date.parse(MARKET_AS_OF))!);
      expect(asks.at(-1)!.cumulativeRequests).toBe(asks.reduce((sum, row) => sum + row.requests, 0));
      expect(bids[0]?.price ?? null).toBe(marketStats(asset, "24H").bid);
    }
  });

  it("preserves an empty demand side rather than fabricating bids", () => {
    expect(marketOrderBook(ELASTIC_MARKET_ASSETS[1]).bids).toEqual([]);
    expect(marketOrderBook(ELASTIC_MARKET_ASSETS[1]).asks.length).toBeGreaterThan(0);
  });

  it("checks the output ceiling including fees, even when the expected cost fits the budget", () => {
    const quote = previewBuyQuote(marketSuppliers(asset), { ...request, estimatedOutputTokens: 100, budgetUsd: 0.004 });
    expect(quote.status).toBe("over-budget");
    if (quote.status !== "over-budget") throw new Error("Expected over-budget quote");
    expect(quote.estimatedTotal).toBeLessThan(0.004);
    expect(quote.ceilingTotal).toBeGreaterThan(0.004);
    expect(quote.feeEstimate).toBeCloseTo(0.000031, 10); // 3,000 input + 100 expected output.
    expect(quote.estimatedTotal).toBeCloseTo(quote.supplierEstimate + 0.000031, 10);
    const exact = previewBuyQuote(marketSuppliers(asset), { ...request, budgetUsd: quote.ceilingTotal });
    expect(exact.status).toBe("ready");
  });

  it("charges the same token-based fee for differently priced suppliers, once per request", () => {
    const suppliers = marketSuppliers(asset);
    const quotes = suppliers.slice(0, 3).map(supplier => previewBuyQuote(suppliers, request, supplier.id));
    for (const quote of quotes) {
      if (quote.status !== "ready") throw new Error("Expected ready quote");
      expect(quote.feeEstimate).toBeCloseTo(0.00004, 10);
      expect(quote.estimatedTotal - quote.supplierEstimate).toBeCloseTo(0.00004, 10);
    }
    expect(quotes[0].supplierEstimate).not.toBe(quotes[1].supplierEstimate);
  });

  it("reserves the platform fee for the full output limit even with free supplier inference", () => {
    const suppliers = marketSuppliers(asset).map(supplier => ({ ...supplier, rates: { input: 0, output: 0 } }));
    const quote = previewBuyQuote(suppliers, { ...request, estimatedOutputTokens: 100, budgetUsd: 0.000035 });
    expect(quote.status).toBe("over-budget");
    if (quote.status !== "over-budget") throw new Error("Expected over-budget quote");
    expect(quote.estimatedTotal).toBeCloseTo(0.000031, 10);
    expect(quote.ceilingTotal).toBeCloseTo(0.00004, 10);
  });

  it("filters completion and selected supplier independently of price", () => {
    const suppliers = marketSuppliers(asset);
    const slow = suppliers.find(supplier => supplier.completionMinutes === 8)!;
    expect(previewBuyQuote(suppliers, request, slow.id).status).toBe("unavailable");
    const relaxed = previewBuyQuote(suppliers, { ...request, completionMinutes: 10 });
    expect(relaxed.supplier?.id).toBe(slow.id);
    const fast = previewBuyQuote(suppliers, { ...request, completionMinutes: 3 });
    expect(fast.supplier?.completionMinutes).toBeLessThanOrEqual(3);
    expect(previewBuyQuote(suppliers, { ...request, completionMinutes: 1 }).status).toBe("unavailable");
    expect(previewBuyQuote(suppliers, request, "unknown-source").status).toBe("unavailable");
  });

  it("rejects missing, fractional, negative, and inverted token quantities", () => {
    for (const change of [{ inputTokens: NaN }, { inputTokens: 0 }, { inputTokens: 1.5 }, { estimatedOutputTokens: -1 }, { estimatedOutputTokens: 1001 }, { maxOutputTokens: Infinity }, { budgetUsd: 0 }]) {
      expect(previewBuyQuote(marketSuppliers(asset), { ...request, ...change }).status).toBe("invalid");
    }
    expect(previewBuyQuote(marketSuppliers(asset), { ...request, estimatedOutputTokens: 0 }).status).toBe("ready");
  });

  it("keeps previews read-only and derives actual input and output charges separately", () => {
    const suppliers = marketSuppliers(asset);
    const before = JSON.stringify(suppliers);
    const quote = previewBuyQuote(suppliers, { ...request, inputTokens: 9000, estimatedOutputTokens: 500, maxOutputTokens: 600, budgetUsd: 1 });
    expect(quote.supplierEstimate).toBeCloseTo(requestCost(suppliers[0].rates, 9000, 500));
    expect(JSON.stringify(suppliers)).toBe(before);
  });

  it("does not report accepted contracts as settled usage and keeps the last trade consistent", () => {
    for (const asset of ELASTIC_MARKET_ASSETS) {
      const tape = recentMarketTrades(asset);
      expect(tape[0].buyerPrice).toBe(asset.lastTrade!.price);
      expect(tape[0].time).toBe(asset.lastTrade!.time);
      expect(tape).toEqual(recentMarketTrades(asset));
      for (const trade of tape) {
        if (trade.status === "Accepted") {
          expect(trade.inputTokens).toBeNull();
          expect(trade.outputTokens).toBeNull();
          expect(trade.buyerTotal).toBeNull();
        } else {
          expect(trade.buyerTotal).toBeCloseTo(trade.buyerPrice * (trade.inputTokens! + trade.outputTokens!) / 1_000_000);
        }
      }
    }
  });
});
