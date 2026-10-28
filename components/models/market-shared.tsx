import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { ProviderIcon } from "@/components/models/provider-icon";
import { MarketInfo } from "./market-info";
import { MARKET_AS_OF, MARKET_WINDOWS, type MarketAsset, type MarketWindow } from "@/lib/elastic-market";

export function MarketIdentity({ asset, link = true }: { asset: MarketAsset; link?: boolean }) {
  const content = <><span className="market-model-icon"><ProviderIcon provider={asset.icon} size={24} /></span><span className="market-model-name"><strong>{asset.name}</strong><span>{asset.developer}</span></span></>;
  return link ? <Link href={`/models/${asset.id}`} className="market-identity">{content}</Link> : <div className="market-identity">{content}</div>;
}

export function PriceChange({ value }: { value: number | null }) {
  if (value === null) return <span className="market-change market-change-empty">No history</span>;
  const Icon = value < 0 ? ArrowDownRight : value > 0 ? ArrowUpRight : Minus;
  return <span className={`market-change ${value < 0 ? "market-change-down" : value > 0 ? "market-change-up" : ""}`}><Icon size={14} aria-hidden="true" />{value > 0 ? "+" : ""}{value.toFixed(2)}%</span>;
}

export function WindowControl({ value, onChange }: { value: MarketWindow; onChange: (window: MarketWindow) => void }) {
  return <div className="market-segmented" role="group" aria-label="Market timeframe">{MARKET_WINDOWS.map(window => <button type="button" key={window} aria-pressed={value === window} onClick={() => onChange(window)}>{window}</button>)}</div>;
}

export function DemoNotice() {
  return <div className="market-status"><span className="market-demo-badge" title="Illustrative market data">Demo data</span><time dateTime={MARKET_AS_OF} className="market-snapshot">Oct 27 · 16:00 UTC</time><span className="sr-only">Fixed illustrative snapshot. No live market connection.</span></div>;
}

export function QuoteDetails({ showUnit = true }: { showUnit?: boolean }) {
  return <div className="market-quote-context">{showUnit && <span>USD / 1M tokens</span>}<MarketInfo title="Quote details">
    <dl><div><dt>Price basis</dt><dd>Per 1M total tokens · 3:1 input / output · No cache · Standard delivery</dd></div><div><dt>Buyer fee</dt><dd>5% included in bid, ask, and last trade</dd></div><div><dt>Global metrics</dt><dd>All four markets; supplier amounts exclude platform fees</dd></div></dl>
    <p>Each ask uses one complete supplier quote. Other request conditions can change the price.</p>
    <p>Change compares the ask at the selected window’s boundaries. Volume counts fulfilled input + output tokens for the actual model delivered. Last trade can differ from the current ask. No bids and historical gaps mean missing quotes.</p>
    <p>Elastic includes Cloud Auto Routing. Payment-processing charges are separate. <Link href="/pricing">Platform pricing</Link> · <Link href="/docs/overview/elastic-inference">Elastic Inference docs</Link></p>
  </MarketInfo></div>;
}
