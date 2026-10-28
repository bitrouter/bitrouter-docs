import {
  BUYER_FEE_RATE, MARKET_AS_OF, marketStats, referenceBuyerPrice,
  type MarketAsset, type MarketWindow, type SupplierRates,
} from "./elastic-market";
import { DEMO_LIQUIDITY, DEMO_SETTLEMENTS, LIQUIDITY_PROFILE, summarizeSettlements } from "./elastic-market-metrics";

const asOf = Date.parse(MARKET_AS_OF);
export const REFERENCE_TOKENS = LIQUIDITY_PROFILE.inputTokens + LIQUIDITY_PROFILE.outputTokens;

export function modelSettlementStats(assetId: string, window: MarketWindow) {
  return summarizeSettlements(DEMO_SETTLEMENTS.filter(cohort => cohort.assetId === assetId), window, asOf);
}

export interface MarketSupplier {
  id: string;
  name: string;
  rates: SupplierRates;
  referenceRequests: number;
  completionMinutes: number;
  expiresAt: number;
  ttftMs: number;
  outputTokensPerSecond: number;
  onTimePercent: number;
  samples: number;
}

/** Reuse the board's independent demo allocations, rather than inventing extra liquidity. */
export function marketSuppliers(asset: MarketAsset): MarketSupplier[] {
  const tiers = ["best", "near", "expensive", "slow"];
  return DEMO_LIQUIDITY.filter(offer => offer.assetId === asset.id && offer.readyNow && offer.quoteExpiresAt > asOf).map(offer => {
    const index = tiers.indexOf(offer.capacityId.split("/").at(-1)!);
    return {
      id: offer.capacityId,
      name: `Demo Supplier ${String.fromCharCode(65 + index)}`,
      rates: offer.rates,
      referenceRequests: offer.requests,
      completionMinutes: offer.completionMinutes,
      expiresAt: offer.quoteExpiresAt,
      ttftMs: [420, 310, 260, 780][index],
      outputTokensPerSecond: [68, 83, 96, 42][index],
      onTimePercent: [99.4, 99.7, 99.8, 98.6][index],
      samples: [1840, 1260, 920, 680][index],
    };
  });
}

export interface BookLevel {
  id: string;
  price: number;
  requests: number;
  cumulativeRequests: number;
  cumulativeUsd: number;
}

function accumulateLevels(rows: Omit<BookLevel, "cumulativeRequests" | "cumulativeUsd">[]): BookLevel[] {
  let requests = 0;
  let usd = 0;
  return rows.map(row => {
    requests += row.requests;
    usd += row.price * row.requests * REFERENCE_TOKENS / 1_000_000;
    return { ...row, cumulativeRequests: requests, cumulativeUsd: usd };
  });
}

export function marketOrderBook(asset: MarketAsset) {
  const asks = accumulateLevels(marketSuppliers(asset)
    .filter(supplier => supplier.completionMinutes <= LIQUIDITY_PROFILE.completionMinutes)
    .map(supplier => ({ id: supplier.id, price: referenceBuyerPrice(supplier.rates), requests: supplier.referenceRequests }))
    .sort((a, b) => a.price - b.price));
  const bid = marketStats(asset, "24H").bid;
  // Fixed-profile DEMO demand only. Never normalize arbitrary TotalCap orders
  // into bids or treat the developer as the supplier of inference.
  const bids = bid === null ? [] : accumulateLevels([1, 0.985, 0.96].map((factor, index) => ({
    id: `${asset.id}/demand-${index}`, price: bid * factor,
    requests: Math.round(asks[0].requests * [0.35, 0.55, 0.7][index]),
  })));
  return { asks, bids };
}

export interface QuoteRequest {
  inputTokens: number;
  estimatedOutputTokens: number;
  maxOutputTokens: number;
  budgetUsd: number;
  completionMinutes: number;
}

export function requestCost(rates: SupplierRates, input: number, output: number) {
  return (rates.input * input + rates.output * output) / 1_000_000;
}

export function previewBuyQuote(suppliers: readonly MarketSupplier[], request: QuoteRequest, supplierId = "best") {
  const quantities = [request.inputTokens, request.estimatedOutputTokens, request.maxOutputTokens];
  if (quantities.some(value => !Number.isSafeInteger(value) || value < 0) || request.inputTokens < 1 || request.maxOutputTokens < 1) {
    return { status: "invalid" as const, message: "Enter whole token quantities. Input and output limit must be positive." };
  }
  if (request.estimatedOutputTokens > request.maxOutputTokens) {
    return { status: "invalid" as const, message: "Expected output cannot exceed the output limit." };
  }
  if (!Number.isFinite(request.budgetUsd) || request.budgetUsd <= 0 || !Number.isFinite(request.completionMinutes) || request.completionMinutes <= 0) {
    return { status: "invalid" as const, message: "Enter a positive budget and completion time." };
  }
  const eligible = suppliers.filter(supplier =>
    (supplierId === "best" || supplier.id === supplierId) && supplier.referenceRequests > 0 &&
    supplier.expiresAt > asOf && supplier.completionMinutes <= request.completionMinutes,
  ).sort((a, b) => requestCost(a.rates, request.inputTokens, request.maxOutputTokens) - requestCost(b.rates, request.inputTokens, request.maxOutputTokens));
  const supplier = eligible[0];
  if (!supplier) return { status: "unavailable" as const, message: "No supplier quote matches this completion target." };
  const supplierEstimate = requestCost(supplier.rates, request.inputTokens, request.estimatedOutputTokens);
  const feeEstimate = supplierEstimate * BUYER_FEE_RATE;
  const estimatedTotal = supplierEstimate + feeEstimate;
  const ceilingTotal = requestCost(supplier.rates, request.inputTokens, request.maxOutputTokens) * (1 + BUYER_FEE_RATE);
  return {
    status: ceilingTotal <= request.budgetUsd + 1e-12 ? "ready" as const : "over-budget" as const,
    supplier, supplierEstimate, feeEstimate, estimatedTotal, ceilingTotal,
  };
}

export interface MarketTrade {
  id: string;
  time: number;
  supplier: string;
  status: "Settled" | "Accepted";
  buyerPrice: number;
  inputTokens: number | null;
  outputTokens: number | null;
  buyerTotal: number | null;
}

/** A small illustrative tape, not the full aggregate settlement ledger. */
export function recentMarketTrades(asset: MarketAsset): MarketTrade[] {
  return Array.from({ length: 12 }, (_, index) => {
    const accepted = index === 2 || index === 6;
    const inputTokens = 3_000 * (index % 3 + 1);
    const outputTokens = inputTokens / 3;
    const buyerPrice = index === 0 && asset.lastTrade ? asset.lastTrade.price : referenceBuyerPrice(asset.supplierAsk) * [0.989, 1.002, 0.995, 1.008][index % 4];
    return {
      id: `demo-${asset.id}-${index + 1}`,
      time: (asset.lastTrade?.time ?? asOf) - index * 7 * 60_000,
      supplier: `Demo Supplier ${["A", "B", "A", "C"][index % 4]}`,
      status: accepted ? "Accepted" : "Settled",
      buyerPrice,
      inputTokens: accepted ? null : inputTokens,
      outputTokens: accepted ? null : outputTokens,
      buyerTotal: accepted ? null : buyerPrice * (inputTokens + outputTokens) / 1_000_000,
    };
  });
}

export function formatQuoteUsd(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(value);
}

export function marketTimeUtc(time: number) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(time);
}
