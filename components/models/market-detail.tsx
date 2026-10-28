"use client";

import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CopyIdButton } from "./copy-id-button";
import { MarketCharts } from "./market-charts";
import { MarketActivity } from "./market-activity";
import { MarketOrderBook } from "./market-order-book";
import { MarketQuoteTicket } from "./market-quote-ticket";
import { MarketInfo } from "./market-info";
import { DemoNotice, MarketIdentity, QuoteDetails, PriceChange, WindowControl } from "./market-shared";
import { MARKET_AS_OF, findMarketAsset, formatMarketPrice, formatMarketTokens, marketStats, type MarketWindow } from "@/lib/elastic-market";
import { marketSuppliers, marketTimeUtc, modelSettlementStats } from "@/lib/elastic-market-detail";
import { availableLiquidity, DEMO_LIQUIDITY, formatMarketAmount } from "@/lib/elastic-market-metrics";
import "./market.css";
import "./market-terminal.css";

const DetailCharts = memo(MarketCharts);

export function MarketDetail({ assetId }: { assetId: string }) {
  const [window, setWindow] = useState<MarketWindow>("24H");
  const [selected, setSelected] = useState("best");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const asset = findMarketAsset(assetId);
  const suppliers = useMemo(() => asset ? marketSuppliers(asset) : [], [asset]);
  const settlements = useMemo(() => modelSettlementStats(assetId, window), [assetId, window]);
  if (!asset) return null;
  const stats = marketStats(asset, window);
  const liquidity = availableLiquidity(DEMO_LIQUIDITY.filter(offer => offer.assetId === assetId), Date.parse(MARKET_AS_OF));
  function selectQuote(id: string) {
    setSelected(id);
    setSide("buy");
    const ticket = document.getElementById("quote-preview");
    ticket?.focus({ preventScroll: true });
    ticket?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }

  return <main id="main" className="market-page market-detail market-terminal"><div className="market-wrap">
    <div className="market-terminal-top"><Link href="/models" className="market-back"><ArrowLeft size={14} aria-hidden="true" />All markets</Link><DemoNotice /></div>
    <header className="market-terminal-heading"><div className="market-terminal-identity"><MarketIdentity asset={asset} link={false} /><div><h1>{asset.name}</h1><div className="market-asset-id"><span className="market-asset-developer">{asset.developer}</span><code>{asset.id}</code><CopyIdButton id={asset.id} /></div></div></div>
      <dl className="market-terminal-ticker"><div className="market-ticker-primary"><dt>Best ask <QuoteDetails showUnit={false} /></dt><dd>{formatMarketPrice(stats.ask)}</dd><dd className="market-ticker-change"><PriceChange value={stats.change} /></dd></div><div><dt>Best bid</dt><dd>{stats.bid === null ? "No bids" : formatMarketPrice(stats.bid)}</dd></div><div><dt>Spread</dt><dd>{formatMarketPrice(stats.spread)}</dd></div><div><dt>Volume · {window.toLowerCase()} <MarketInfo title="Model trading volume"><p>Actual settled supplier USD for this model over the selected period, excluding the buyer transaction fee. Fulfilled input and output tokens appear below the amount.</p></MarketInfo></dt><dd className="market-ticker-volume">{formatMarketAmount(settlements.volumeUsd)}<small>{formatMarketTokens(stats.volume)} tokens</small></dd></div><div><dt>Liquidity <MarketInfo title="Model liquidity"><p>Current supplier USD for this model, before buyer fees. Counts independent supply completing the reference request within five minutes, priced within 5% above the lowest eligible ask.</p><p>The order book also shows more expensive supply. Custom requests require a new quote and admission check.</p></MarketInfo></dt><dd>{formatMarketAmount(liquidity)}</dd></div></dl>
    </header>
    <div className="market-reference-strip"><span className="market-reference-label">Reference profile</span><span>3K input / 1K output</span><span>No cache</span><span>≤ 5-min completion</span><span className="market-reference-unit">USD / 1M tokens · buyer fee included</span></div>
    <div className="market-terminal-grid">
      <section className="market-terminal-panel market-terminal-chart" aria-labelledby="price-history-heading"><div className="market-panel-heading"><h2 id="price-history-heading">Price & Volume</h2><WindowControl value={window} onChange={setWindow} /></div><DetailCharts asset={asset} window={window} size="detail" /><div className="market-chart-bottom"><span>Ask high <strong>{formatMarketPrice(stats.high)}</strong></span><span>Ask low <strong>{formatMarketPrice(stats.low)}</strong></span><span>Last trade <strong>{formatMarketPrice(asset.lastTrade?.price ?? null)}</strong>{asset.lastTrade && <time dateTime={new Date(asset.lastTrade.time).toISOString()}>{marketTimeUtc(asset.lastTrade.time)} UTC</time>}</span></div></section>
      <MarketOrderBook asset={asset} selected={selected} onSelect={selectQuote} />
      <MarketQuoteTicket key={asset.id} asset={asset} suppliers={suppliers} selected={selected} onSelect={setSelected} side={side} onSideChange={setSide} />
      <MarketActivity asset={asset} suppliers={suppliers} selected={selected} onSelect={selectQuote} />
    </div>
  </div></main>;
}
