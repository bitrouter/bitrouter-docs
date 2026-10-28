"use client";

import Link from "next/link";
import { useState } from "react";
import { Tabs } from "radix-ui";
import { ArrowUpRight, ListOrdered } from "lucide-react";
import { formatMarketPrice, formatMarketTokens, referenceBuyerPrice, type MarketAsset } from "@/lib/elastic-market";
import { formatQuoteUsd, marketTimeUtc, recentMarketTrades, type MarketSupplier } from "@/lib/elastic-market-detail";
import { MarketInfo } from "./market-info";

function RecentTrades({ asset }: { asset: MarketAsset }) {
  const [filter, setFilter] = useState<"all" | "Settled" | "Accepted">("all");
  const trades = recentMarketTrades(asset).filter(trade => filter === "all" || trade.status === filter);
  return <>
    <div className="market-activity-toolbar"><div className="market-book-tabs" role="group" aria-label="Trade status">{(["all", "Settled", "Accepted"] as const).map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "All activity" : value}</button>)}</div><span>Latest 12 · UTC</span><MarketInfo title="Recent trades"><p>A small illustrative activity sample, not the complete volume ledger. Accepted contracts are separate from delivered usage and final settlement.</p><p>Settled rows show actual input/output usage and buyer totals including the 5% fee. Accepted rows have no settled usage or amount yet. Price is the reference-equivalent contract rate for a 3:1 no-cache profile.</p></MarketInfo></div>
    <div className="market-data-scroll" role="region" aria-label="Recent trades table" tabIndex={0}><table className="market-data-table"><thead><tr><th>Time</th><th>Status</th><th>Supplier</th><th>Price / 1M</th><th>Input</th><th>Output</th><th>Buyer total</th></tr></thead><tbody>{trades.map(trade => <tr key={trade.id}><td><time dateTime={new Date(trade.time).toISOString()}>{marketTimeUtc(trade.time)}</time></td><td><span className={`market-trade-status ${trade.status === "Settled" ? "market-trade-settled" : ""}`}>{trade.status}</span></td><td>{trade.supplier}</td><td>{formatMarketPrice(trade.buyerPrice)}</td><td>{trade.inputTokens === null ? "—" : formatMarketTokens(trade.inputTokens)}</td><td>{trade.outputTokens === null ? "—" : formatMarketTokens(trade.outputTokens)}</td><td>{formatQuoteUsd(trade.buyerTotal)}</td></tr>)}</tbody></table></div>
  </>;
}

function SupplierTable({ suppliers, selected, onSelect }: { suppliers: MarketSupplier[]; selected: string; onSelect: (id: string) => void }) {
  return <>
    <div className="market-activity-toolbar"><span>Supplier rates · USD / 1M tokens</span><span>Observed performance · 24h</span><MarketInfo title="Suppliers"><p>Supplier input and output rates exclude the buyer fee. Buyer ask includes 5%. Capacity counts complete 3K-input / 1K-output requests with no cache, and is not a reservation.</p><p>TTFT, output speed, on-time rates, and samples are fixed demo observations over the last 24 hours. Completion is the offered service condition. Suppliers are illustrative and are separate from the model developer.</p><p>Version, precision, protocol, and cache discounts have not been verified for these assumed listings.</p></MarketInfo></div>
    <div className="market-data-scroll" role="region" aria-label="Supplier comparison table" tabIndex={0}><table className="market-data-table market-supplier-table"><thead><tr><th>Supplier</th><th>Input</th><th>Output</th><th>Buyer ask</th><th>Capacity · req</th><th>Completion</th><th>TTFT · p50</th><th>Output · tok/s · p50</th><th>On-time</th><th>Samples</th><th><span className="sr-only">Preview quote</span></th></tr></thead><tbody>{suppliers.map(supplier => <tr key={supplier.id} data-selected={selected === supplier.id}><td><span className="market-supplier-name">{supplier.name}</span></td><td>{formatMarketPrice(supplier.rates.input)}</td><td>{formatMarketPrice(supplier.rates.output)}</td><td>{formatMarketPrice(referenceBuyerPrice(supplier.rates))}</td><td>{formatMarketTokens(supplier.referenceRequests)}</td><td>≤ {supplier.completionMinutes} min</td><td>{supplier.ttftMs} ms</td><td>{supplier.outputTokensPerSecond}</td><td>{supplier.onTimePercent.toFixed(1)}%</td><td>{supplier.samples.toLocaleString("en-US")}</td><td><button type="button" className="market-supplier-quote" onClick={() => onSelect(supplier.id)} aria-label={`Preview ${supplier.name}`} aria-pressed={selected === supplier.id}>Quote <ArrowUpRight size={12} aria-hidden="true" /></button></td></tr>)}</tbody></table></div>
  </>;
}

function ModelSpecifications({ asset }: { asset: MarketAsset }) {
  return <div className="market-specifications"><dl>
    <div><dt>Model ID</dt><dd><code>{asset.id}</code></dd></div><div><dt>Developer</dt><dd>{asset.developer}</dd></div><div><dt>Market</dt><dd>Elastic Inference · Demo listing</dd></div><div><dt>Quote currency</dt><dd>USD</dd></div><div><dt>Reference request</dt><dd>3K input / 1K output · No cache</dd></div><div><dt>Completion target</dt><dd>Within 5 minutes after acceptance</dd></div><div><dt>Buyer fee</dt><dd>5% of the supplier’s actual settled charge</dd></div><div><dt>Cloud Auto Routing</dt><dd>Included</dd></div><div><dt>Version / precision</dt><dd className="market-unverified">Not verified</dd></div><div><dt>Context / capabilities</dt><dd className="market-unverified">Not verified</dd></div>
  </dl><div className="market-spec-links"><Link href="/docs/overview/elastic-inference">Elastic Inference <ArrowUpRight size={13} aria-hidden="true" /></Link><Link href="/docs/market/market-data">Market Data <ArrowUpRight size={13} aria-hidden="true" /></Link></div></div>;
}

export function MarketActivity({ asset, suppliers, selected, onSelect }: { asset: MarketAsset; suppliers: MarketSupplier[]; selected: string; onSelect: (id: string) => void }) {
  return <Tabs.Root defaultValue="trades" className="market-terminal-panel market-activity">
    <Tabs.List className="market-activity-tabs" aria-label="Market details"><Tabs.Trigger value="trades">Recent Trades</Tabs.Trigger><Tabs.Trigger value="suppliers">Suppliers <span>{suppliers.length}</span></Tabs.Trigger><Tabs.Trigger value="specifications">Specifications</Tabs.Trigger><Tabs.Trigger value="orders">My Orders</Tabs.Trigger></Tabs.List>
    <Tabs.Content value="trades"><RecentTrades asset={asset} /></Tabs.Content>
    <Tabs.Content value="suppliers"><SupplierTable suppliers={suppliers} selected={selected} onSelect={onSelect} /></Tabs.Content>
    <Tabs.Content value="specifications"><ModelSpecifications asset={asset} /></Tabs.Content>
    <Tabs.Content value="orders"><div className="market-account-empty"><ListOrdered size={23} strokeWidth={1.4} aria-hidden="true" /><strong>No account connected</strong><p>Your open orders, execution status, and settlements will appear here.</p><span>Account integration coming soon</span></div></Tabs.Content>
  </Tabs.Root>;
}
