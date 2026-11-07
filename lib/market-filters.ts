import { ELASTIC_MARKET_ASSETS, marketStats, type MarketAsset } from "./elastic-market";

export interface MarketFilters {
  developers: readonly string[];
  maxAsk: number | null;
  hasBids: boolean;
}

export interface MarketRow {
  asset: MarketAsset;
  stats: ReturnType<typeof marketStats>;
}

export const EMPTY_MARKET_FILTERS: MarketFilters = { developers: [], maxAsk: null, hasBids: false };
export const ASK_FILTER_CEILING = Math.ceil(Math.max(...ELASTIC_MARKET_ASSETS.map(asset => asset.history[asset.history.length - 1].ask ?? 0)) * 10) / 10;

export function activeMarketFilterCount(filters: MarketFilters): number {
  return filters.developers.length + Number(filters.maxAsk !== null) + Number(filters.hasBids);
}

export function filterMarketRows(rows: readonly MarketRow[], query: string, filters: MarketFilters): MarketRow[] {
  const search = query.trim().toLowerCase();
  return rows.filter(({ asset, stats }) =>
    (!search || `${asset.name} ${asset.id} ${asset.developer}`.toLowerCase().includes(search)) &&
    (!filters.developers.length || filters.developers.includes(asset.developer)) &&
    (filters.maxAsk === null || (stats.ask !== null && stats.ask <= filters.maxAsk)) &&
    (!filters.hasBids || stats.bid !== null),
  );
}
