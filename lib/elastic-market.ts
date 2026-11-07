// A deterministic design fixture, deliberately separate from the supplier catalog
// and any future market API. None of these observations are live market data.
import { CLOUD_PRICING } from "./commercial-pricing";

export const MARKET_AS_OF = "2026-10-27T16:00:00Z";
export const MARKET_WINDOWS = ["24H", "7D", "30D"] as const;
export type MarketWindow = (typeof MARKET_WINDOWS)[number];
export type MarketLayout = "table" | "cards";

export const REFERENCE_PROFILE = {
  inputShare: 0.75,
  outputShare: 0.25,
  label: "3:1 input / output · No cache · Standard delivery",
} as const;

export interface SupplierRates {
  input: number;
  output: number;
}

export interface MarketPoint {
  time: number;
  ask: number | null;
  bid: number | null;
  inputTokens: number;
  outputTokens: number;
}

export interface MarketAsset {
  id: string;
  name: string;
  developer: string;
  icon: string;
  supplierAsk: SupplierRates;
  history: MarketPoint[];
  lastTrade: { price: number; time: number } | null;
}

export function referenceSupplierPrice(rates: SupplierRates): number {
  return rates.input * REFERENCE_PROFILE.inputShare + rates.output * REFERENCE_PROFILE.outputShare;
}

/** One million total tokens incurs the same Cloud fee regardless of model price. */
export function referenceBuyerPrice(rates: SupplierRates): number {
  return referenceSupplierPrice(rates) + CLOUD_PRICING.usdPerMillionTokens;
}

const HOUR = 3_600_000;
const end = Date.parse(MARKET_AS_OF);
// Fixed daily and intraday observations. Repeated values are intentional quote steps.
const daily = [1.12, 1.1, 1.11, 1.08, 1.07, 1.09, 1.06, 1.05, 1.08, 1.04, 1.02, 1.04, 1.03, 1.01, 1.02, 1.0, 1.03, 1.01, 1.0, 1.02, 1.01, 1.0, 1.01, 1.04, 1.02, 1.03, 1.01, 1.02, 1.0, 1.02, 1.0];
const intraday = [1.024, 1.024, 1.02, 1.02, 1.016, 1.018, 1.018, 1.012, 1.012, 1.01, 1.014, 1.014, 1.008, 1.008, 1.006, 1.009, 1.009, 1.004, 1.004, 1.006, 1.002, 1.002, 1.0, 1.0];
const activity = [8, 7, 6, 5, 7, 9, 11, 14, 12, 16, 18, 15, 13, 17, 20, 23, 21, 19, 24, 28, 25, 22, 27, 30];

function makeAsset(
  id: string, name: string, developer: string, icon: string,
  supplierAsk: SupplierRates, volumeScale: number, trend: number, index: number,
): MarketAsset {
  const supplierPrice = referenceSupplierPrice(supplierAsk);
  const history: MarketPoint[] = Array.from({ length: 721 }, (_, i) => {
    const hoursAgo = 720 - i;
    const day = Math.floor(i / 24);
    const hour = i % 24;
    const factor = hoursAgo < 24 ? intraday[23 - hoursAgo] : daily[day] + (intraday[hour] - 1) * 0.5;
    const price = supplierPrice * (1 + (factor - 1) * trend);
    // A real gap and absent current bids exercise honest missing-data rendering.
    const quoteGap = index === 2 && hoursAgo >= 11 && hoursAgo <= 13;
    const noBids = index === 1 && hoursAgo <= 3;
    const inputTokens = i === 0 ? 0 : activity[(i + index * 3) % 24] * volumeScale;
    return {
      time: end - hoursAgo * HOUR,
      ask: quoteGap ? null : price + CLOUD_PRICING.usdPerMillionTokens,
      bid: quoteGap || noBids ? null : price * (0.945 + index * 0.005) + CLOUD_PRICING.usdPerMillionTokens,
      inputTokens,
      outputTokens: Math.round(inputTokens / 3),
    };
  });
  return {
    id, name, developer, icon, supplierAsk, history,
    lastTrade: { price: supplierPrice * 0.983 + CLOUD_PRICING.usdPerMillionTokens, time: end - (index + 1) * 17 * 60_000 },
  };
}

export const ELASTIC_MARKET_ASSETS: MarketAsset[] = [
  makeAsset("glm-5.3", "GLM-5.3", "Z.ai", "z-ai", { input: 0.9, output: 2.7 }, 48_000, 1, 0),
  makeAsset("kimi-k3", "Kimi K3", "Moonshot AI", "moonshot", { input: 0.65, output: 2.1 }, 36_000, -1.3, 1),
  makeAsset("glm-5.3-flash", "GLM-5.3 Flash", "Z.ai", "z-ai", { input: 0.12, output: 0.36 }, 95_000, 1.6, 2),
  makeAsset("deepseek-v4.1-flash", "DeepSeek V4.1 Flash", "DeepSeek", "deepseek", { input: 0.11, output: 0.22 }, 128_000, -0.7, 3),
];

export function findMarketAsset(id: string): MarketAsset | undefined {
  return ELASTIC_MARKET_ASSETS.find(asset => asset.id === id);
}

export function windowHours(window: MarketWindow): number {
  return window === "24H" ? 24 : window === "7D" ? 168 : 720;
}

export function marketSeries(asset: MarketAsset, window: MarketWindow): MarketPoint[] {
  const cutoff = end - windowHours(window) * HOUR;
  return asset.history.filter(point => point.time >= cutoff);
}

export function marketStats(asset: MarketAsset, window: MarketWindow) {
  const series = marketSeries(asset, window);
  const first = series[0];
  const current = series[series.length - 1];
  const prices = series.flatMap(point => point.ask === null ? [] : [point.ask]);
  return {
    ask: current.ask,
    bid: current.bid,
    change: first.ask !== null && first.ask > 0 && current.ask !== null ? (current.ask / first.ask - 1) * 100 : null,
    // The first point is the boundary quote; its preceding volume is outside the window.
    volume: series.slice(1).reduce((sum, point) => sum + point.inputTokens + point.outputTokens, 0),
    low: prices.length ? Math.min(...prices) : null,
    high: prices.length ? Math.max(...prices) : null,
    spread: current.ask !== null && current.bid !== null ? current.ask - current.bid : null,
  };
}

/** Aggregate fulfilled-token buckets without turning a quote gap into a price. */
export function volumeSeries(asset: MarketAsset, window: MarketWindow) {
  const points = marketSeries(asset, window).slice(1);
  const bucketSize = window === "24H" ? 1 : window === "7D" ? 6 : 24;
  const buckets: MarketPoint[] = [];
  for (let i = 0; i < points.length; i += bucketSize) {
    const bucket = points.slice(i, i + bucketSize);
    buckets.push({
      ...bucket[bucket.length - 1],
      inputTokens: bucket.reduce((sum, point) => sum + point.inputTokens, 0),
      outputTokens: bucket.reduce((sum, point) => sum + point.outputTokens, 0),
    });
  }
  return buckets;
}

export function formatMarketPrice(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 4 : 3 }).format(value);
}

export function formatMarketTokens(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatMarketTime(value: number, window: MarketWindow): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...(window === "24H" ? { hour: "2-digit", minute: "2-digit", hour12: false } as const : { month: "short", day: "numeric" } as const) }).format(value);
}
