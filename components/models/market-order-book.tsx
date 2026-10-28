"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatMarketPrice, formatMarketTokens, marketStats, type MarketAsset } from "@/lib/elastic-market";
import { marketOrderBook, type BookLevel } from "@/lib/elastic-market-detail";
import { MarketInfo } from "./market-info";

const depthConfig = {
  supply: { label: "Supply", color: "var(--market-ask)" },
  demand: { label: "Demand", color: "var(--market-bid)" },
} satisfies ChartConfig;

function BookRows({ rows, side, selected, onSelect }: { rows: BookLevel[]; side: "ask" | "bid"; selected: string; onSelect: (id: string) => void }) {
  const max = rows.at(-1)?.cumulativeRequests ?? 1;
  return <div className={`market-book-side market-book-${side}`}>
    <div className="market-book-side-label">{side === "ask" ? "Asks" : "Bids"}</div>
    {rows.length ? rows.map(row => <div className="market-book-row" key={row.id}>
      <span className="market-book-bar" style={{ width: `${row.cumulativeRequests / max * 100}%` }} aria-hidden="true" />
      <span>{side === "ask" ? <button type="button" onClick={() => onSelect(row.id)} aria-label={`Preview ask at ${formatMarketPrice(row.price)}`} aria-pressed={selected === row.id}>{formatMarketPrice(row.price)}</button> : formatMarketPrice(row.price)}</span>
      <span>{formatMarketTokens(row.requests)}</span><span>{formatMarketTokens(row.cumulativeRequests)}</span>
    </div>) : <div className="market-book-empty">No matching bids</div>}
  </div>;
}

export function MarketOrderBook({ asset, selected, onSelect }: { asset: MarketAsset; selected: string; onSelect: (id: string) => void }) {
  const [view, setView] = useState<"book" | "depth">("book");
  const { asks, bids } = marketOrderBook(asset);
  const stats = marketStats(asset, "24H");
  const depth = [
    ...[...bids].reverse().map(row => ({ price: row.price, demand: row.cumulativeRequests, supply: null })),
    ...asks.map(row => ({ price: row.price, supply: row.cumulativeRequests, demand: null })),
  ];

  return <section className="market-terminal-panel market-book" aria-labelledby="order-book-heading">
    <div className="market-panel-heading"><h2 id="order-book-heading">Order book</h2><MarketInfo title="Order book">
      <p>Fixed-profile demo orders: 3,000 input and 1,000 output tokens, no cache, accepted now and completed within five minutes. Prices include the 5% buyer fee.</p>
      <p>Size and cumulative depth count complete reference requests. Each supplier capacity allocation appears once. A displayed quote does not reserve capacity.</p>
      <p>Bids are illustrative demand for this exact profile, not arbitrary buyer budgets converted into token prices. Click an ask to select its supplier in Quote Preview.</p>
    </MarketInfo></div>
    <div className="market-book-tabs" role="group" aria-label="Order book display"><button type="button" aria-pressed={view === "book"} onClick={() => setView("book")}>Book</button><button type="button" aria-pressed={view === "depth"} onClick={() => setView("depth")}>Depth</button></div>
    {view === "book" ? <>
      <div className="market-book-columns"><span>Price / 1M</span><span>Requests</span><span>Total</span></div>
      <BookRows rows={asks} side="ask" selected={selected} onSelect={onSelect} />
      <div className="market-book-spread"><span>Spread</span><strong>{formatMarketPrice(stats.spread)}</strong><span>{stats.bid !== null && stats.ask !== null ? `${((stats.ask - stats.bid) / stats.ask * 100).toFixed(2)}%` : "No bids"}</span></div>
      <BookRows rows={bids} side="bid" selected={selected} onSelect={onSelect} />
    </> : <div className="market-depth-view">
      <div className="market-depth-legend"><span>Demand</span><span>Supply</span></div>
      <ChartContainer config={depthConfig} className="market-depth-chart" aria-label={`${asset.name} cumulative depth in reference requests`} role="img">
        <AreaChart data={depth} accessibilityLayer margin={{ top: 12, right: 6, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis dataKey="price" type="number" domain={["dataMin", "dataMax"]} tickFormatter={formatMarketPrice} axisLine={false} tickLine={false} minTickGap={30} />
          <YAxis width={34} tickFormatter={formatMarketTokens} axisLine={false} tickLine={false} tickCount={4} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={value => `${formatMarketPrice(Number(value))} / 1M tokens`} formatter={(value, name) => <div className="market-tooltip-row"><span>{name === "supply" ? "Supply" : "Demand"}</span><strong>{formatMarketTokens(Number(value))} requests</strong></div>} />} />
          <Area type="stepAfter" dataKey="demand" stroke="var(--color-demand)" fill="var(--color-demand)" fillOpacity={0.13} connectNulls={false} isAnimationActive={false} />
          <Area type="stepAfter" dataKey="supply" stroke="var(--color-supply)" fill="var(--color-supply)" fillOpacity={0.13} connectNulls={false} isAnimationActive={false} />
        </AreaChart>
      </ChartContainer>
      {!bids.length && <p className="market-panel-note">No matching bids</p>}
    </div>}
    <div className="market-book-foot"><span>Reference requests</span><span>5-min completion</span></div>
  </section>;
}
