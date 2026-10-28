"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, LayoutGrid, List, Search, X } from "lucide-react";
import { MarketCharts } from "./market-charts";
import { MarketSummary } from "./market-summary";
import { MarketFilterDialog, MarketFilterSidebar } from "./market-filters";
import { DemoNotice, MarketIdentity, QuoteDetails, PriceChange, WindowControl } from "./market-shared";
import { ELASTIC_MARKET_ASSETS, REFERENCE_PROFILE, formatMarketPrice, formatMarketTokens, marketStats, type MarketAsset, type MarketLayout, type MarketWindow } from "@/lib/elastic-market";
import { EMPTY_MARKET_FILTERS, activeMarketFilterCount, filterMarketRows, type MarketFilters } from "@/lib/market-filters";
import "./market.css";

const LAYOUT_KEY = "bitrouter-market-layout:v1";
function subscribeMobile(onChange: () => void) {
  const media = globalThis.window.matchMedia("(max-width:767px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function getMobileSnapshot() { return globalThis.window.matchMedia("(max-width:767px)").matches; }
function getServerMobileSnapshot() { return false; }
function subscribeHydration() { return () => {}; }
function getClientSnapshot() { return true; }
function getServerSnapshot() { return false; }

function AssetCard({ asset, window, showCharts }: { asset: MarketAsset; window: MarketWindow; showCharts: boolean }) {
  const stats = marketStats(asset, window);
  return <article className="market-asset-card">
    <MarketIdentity asset={asset} />
    <div className="market-card-price"><div><span className="market-label">Best ask</span><strong>{formatMarketPrice(stats.ask)}</strong></div><div><PriceChange value={stats.change} /><span className="market-label">Ask change · {window.toLowerCase()}</span></div></div>
    {showCharts ? <MarketCharts asset={asset} window={window} /> : <div className="market-chart-placeholder" aria-hidden="true" />}
    <dl className="market-card-stats"><div><dt>Best bid</dt><dd>{stats.bid === null ? <span className="market-no-bids">No bids</span> : formatMarketPrice(stats.bid)}</dd></div><div><dt>Tokens · {window.toLowerCase()}</dt><dd>{formatMarketTokens(stats.volume)}</dd></div></dl>
    <Link className="market-card-link" href={`/models/${asset.id}`}>Market details <ArrowUpRight size={16} aria-hidden="true" /></Link>
  </article>;
}

export function ElasticMarket() {
  const [window, setWindow] = useState<MarketWindow>("24H");
  const [layout, setLayout] = useState<MarketLayout | "auto">("auto");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("listed");
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_MARKET_FILTERS);
  const mobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerMobileSnapshot);
  const resolvedLayout = layout === "auto" ? mobile ? "cards" : "table" : layout;
  const hydrated = useSyncExternalStore(subscribeHydration, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_KEY);
      if (saved === "table" || saved === "cards") setLayout(saved);
    } catch { /* Storage is optional; responsive defaults still work. */ }
  }, []);

  function chooseLayout(value: MarketLayout) {
    setLayout(value);
    try { localStorage.setItem(LAYOUT_KEY, value); } catch { /* Keep this session's choice. */ }
  }

  const allRows = ELASTIC_MARKET_ASSETS.map(asset => ({ asset, stats: marketStats(asset, window) }));
  const rows = filterMarketRows(allRows, query, filters);
  if (sort === "ask") rows.sort((a, b) => (a.stats.ask ?? Infinity) - (b.stats.ask ?? Infinity));
  if (sort === "volume") rows.sort((a, b) => b.stats.volume - a.stats.volume);
  const developers = [...new Set(ELASTIC_MARKET_ASSETS.map(asset => asset.developer))].map(name => ({
    name,
    icon: ELASTIC_MARKET_ASSETS.find(asset => asset.developer === name)!.icon,
    count: filterMarketRows(allRows, query, { ...filters, developers: [name] }).length,
  }));
  const bidCount = filterMarketRows(allRows, query, { ...filters, hasBids: true }).length;
  const resetFilters = () => setFilters(EMPTY_MARKET_FILTERS);
  const filterProps = { value: filters, onChange: setFilters, onReset: resetFilters, developers, bidCount };
  const filterCount = activeMarketFilterCount(filters);

  return <main id="main" className="market-page market-board">
    <div className="market-wrap">
      <div className="market-board-bar"><h1>Models</h1><DemoNotice /></div>
      <MarketSummary window={window} />
      <div className="market-workspace">
      <MarketFilterSidebar {...filterProps} />
      <section className="market-listing" aria-label="Listed Elastic Inference models" data-layout={layout}>
        <div className="market-toolbar">
          <label className="market-search"><Search size={16} aria-hidden="true" /><input aria-label="Search market models" placeholder="Search models…" value={query} onChange={event => setQuery(event.target.value)} /></label>
          <div className="market-toolbar-actions"><MarketFilterDialog {...filterProps} resultCount={rows.length} /><WindowControl value={window} onChange={setWindow} /><div className="market-layout-control" role="group" aria-label="Market layout"><button type="button" className="market-table-button" aria-label="Table layout" aria-pressed={resolvedLayout === "table"} onClick={() => chooseLayout("table")}><List size={17} aria-hidden="true" /></button><button type="button" className="market-cards-button" aria-label="Cards layout" aria-pressed={resolvedLayout === "cards"} onClick={() => chooseLayout("cards")}><LayoutGrid size={16} aria-hidden="true" /></button></div></div>
        </div>
        {filterCount > 0 && <div className="market-active-filters" aria-label="Active model filters">
          {filters.developers.map(name => <button type="button" key={name} aria-label={`Remove ${name} filter`} onClick={() => setFilters(current => ({ ...current, developers: current.developers.filter(item => item !== name) }))}>{name}<X size={11} aria-hidden="true" /></button>)}
          {filters.maxAsk !== null && <button type="button" aria-label="Remove price filter" onClick={() => setFilters(current => ({ ...current, maxAsk: null }))}>Ask ≤ {formatMarketPrice(filters.maxAsk)}<X size={11} aria-hidden="true" /></button>}
          {filters.hasBids && <button type="button" aria-label="Remove Has bids filter" onClick={() => setFilters(current => ({ ...current, hasBids: false }))}>Has bids<X size={11} aria-hidden="true" /></button>}
        </div>}
        <div className="market-results"><div className="market-results-meta"><span role="status">{rows.length === ELASTIC_MARKET_ASSETS.length ? `${rows.length} models` : `${rows.length} / ${ELASTIC_MARKET_ASSETS.length} models`}</span><QuoteDetails /></div><label>Sort by <select aria-label="Sort market models" value={sort} onChange={event => setSort(event.target.value)}><option value="listed">Listing order</option><option value="ask">Lowest ask</option><option value="volume">Token volume</option></select></label></div>
        {rows.length === 0 ? <div className="market-empty"><Search size={24} aria-hidden="true" /><h2>No models found</h2><p>Try another search or adjust your filters.</p><button type="button" onClick={() => { setQuery(""); resetFilters(); }}>Clear search &amp; filters</button></div> : <>
          <div className="market-table-scroll"><table className="market-table"><caption className="sr-only">Demo Elastic Inference quotes. {REFERENCE_PROFILE.label}. Buyer prices include 5%. All trends and changes use {window}.</caption><thead><tr><th scope="col">Model</th><th scope="col">Best bid</th><th scope="col">Best ask</th><th scope="col">Ask change <span>{window.toLowerCase()}</span></th><th scope="col">Tokens <span>{window.toLowerCase()}</span></th><th scope="col">Ask trend <span>{window.toLowerCase()}</span></th><th scope="col"><span className="sr-only">Market details</span></th></tr></thead><tbody>{rows.map(({ asset, stats }) => <tr key={asset.id}><th scope="row"><MarketIdentity asset={asset} /></th><td>{stats.bid === null ? <span className="market-no-bids">No bids</span> : formatMarketPrice(stats.bid)}</td><td className="market-ask-cell">{formatMarketPrice(stats.ask)}</td><td><PriceChange value={stats.change} /></td><td>{formatMarketTokens(stats.volume)}</td><td>{hydrated && resolvedLayout === "table" ? <MarketCharts asset={asset} window={window} size="sparkline" /> : <div className="market-sparkline-placeholder" aria-hidden="true" />}</td><td><Link href={`/models/${asset.id}`} className="market-row-link" aria-label={`View ${asset.name} market`}><ArrowUpRight size={18} aria-hidden="true" /></Link></td></tr>)}</tbody></table></div>
          <div className="market-card-grid">{rows.map(({ asset }) => <AssetCard key={asset.id} asset={asset} window={window} showCharts={hydrated && resolvedLayout === "cards"} />)}</div>
        </>}
      </section>
      </div>
    </div>
  </main>;
}
