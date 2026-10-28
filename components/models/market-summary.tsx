"use client";

import { useMemo } from "react";
import { MarketInfo as MetricInfo } from "./market-info";
import { MarketMetricChart } from "./market-metric-chart";
import { formatMarketTokens, MARKET_AS_OF, type MarketWindow } from "@/lib/elastic-market";
import { formatMarketAmount, formatSlippageBps, globalMarketStats, globalMarketSeries, LIQUIDITY_PROFILE_LABEL } from "@/lib/elastic-market-metrics";

export function MarketSummary({ window }: { window: MarketWindow }) {
  const stats = useMemo(() => globalMarketStats(window), [window]);
  const series = useMemo(() => globalMarketSeries(window), [window]);
  const period = window.toLowerCase();
  const coverage = stats.coverage === null ? "—" : `${(stats.coverage * 100).toFixed(1)}%`;
  return <section className="market-summary" aria-label="Global demo market metrics">
      <div className="market-metric" data-metric="volume">
        <div className="market-metric-heading"><span className="market-label">Trading Volume</span><MetricInfo title="Trading Volume"><p>Supplier inference charges settled in the selected period, in USD. Platform fees, open-order budgets, reserved funds, and unsettled amounts are excluded. Bars show amounts per interval; the headline is the period total.</p><dl><div><dt>Period</dt><dd>Trailing {period} · by settlement time</dd></div><div><dt>Delivered tokens</dt><dd>{formatMarketTokens(stats.deliveredTokens)}</dd></div><div><dt>Settled purchases</dt><dd>{stats.purchases.toLocaleString("en-US")}</dd></div></dl></MetricInfo></div>
        <div className="market-metric-value"><strong>{formatMarketAmount(stats.volumeUsd)}</strong><MarketMetricChart metric="volume" data={series.volume} window={window} /></div><span className="market-metric-caption">Settled · {period}</span>
      </div>
      <div className="market-metric" data-metric="liquidity">
        <div className="market-metric-heading"><span className="market-label">Available Liquidity</span><MetricInfo title="Available Liquidity"><p>Estimated executable seller supply at the current snapshot, valued at supplier rates in USD. The headline is the latest snapshot; the chart shows historical snapshots over the selected timeframe.</p><dl><div><dt>Reference request</dt><dd>{LIQUIDITY_PROFILE_LABEL}</dd></div><div><dt>Acceptance</dt><dd>Available now</dd></div><div><dt>Completion</dt><dd>Within 5 minutes</dd></div><div><dt>Price band</dt><dd>Up to 5% above each model’s lowest eligible ask</dd></div><div><dt>Value basis</dt><dd>Supplier prices · platform fees excluded</dd></div><div><dt>Snapshot</dt><dd>{MARKET_AS_OF.replace("T", " ").replace(":00Z", " UTC")}</dd></div></dl><p>Only valid, ready offers with finite capacity qualify. This demo assumes independent supply for each model. Shared supply must count once. Offer expiry and the completion deadline are separate.</p></MetricInfo></div>
        <div className="market-metric-value"><strong>{formatMarketAmount(stats.liquidityUsd)}</strong><MarketMetricChart metric="liquidity" data={series.liquidity} window={window} /></div><span className="market-metric-caption">Available now · 5-min horizon</span>
      </div>
      <div className="market-metric" data-metric="slippage">
        <div className="market-metric-heading"><span className="market-label">Avg. Slippage</span><MetricInfo title="Avg. Slippage"><p>Average price change between the supplier quote selected for purchase and the accepted contract, weighted by the quoted cost of each purchase. Both costs use the same actual token quantities, excluding platform fees. Each chart point is recomputed for its own interval.</p><p>Positive means a higher buyer cost; negative means price improvement. Budget headroom, output-length changes, and intentional waiting before the purchase decision are excluded.</p><dl><div><dt>Period</dt><dd>Trailing {period} · by settlement time</dd></div><div><dt>Comparable purchases</dt><dd>{stats.comparablePurchases.toLocaleString("en-US")} / {stats.purchases.toLocaleString("en-US")}</dd></div><div><dt>Benchmark coverage</dt><dd>{coverage}</dd></div><div><dt>P95 adverse deviation</dt><dd>{stats.adverseP95Bps === null ? "—" : `${stats.adverseP95Bps.toFixed(1)} bps`}</dd></div></dl><p>1 bp = 0.01%. P95 includes zero for improvements. Missing benchmarks are excluded with coverage disclosed; no comparable data displays —, while a measured zero displays 0 bps.</p></MetricInfo></div>
        <div className="market-metric-value"><strong>{formatSlippageBps(stats.slippageBps)}{stats.slippageBps !== null && <span>bps</span>}</strong><MarketMetricChart metric="slippage" data={series.slippage} window={window} /></div><span className="market-metric-caption">Quote to execution · {period}</span>
      </div>
      <div className="market-metric" data-metric="fees">
        <div className="market-metric-heading"><span className="market-label">Platform Fees</span><MetricInfo title="Platform Fees"><p>Recorded Elastic transaction fees for the same settlements as Trading Volume. Current terms charge 5% of the supplier’s actual settled inference charge.</p><p>Supplier inference charges, payment-processing charges, and BYOK Cloud Auto Routing fees are separate. Elastic has no separate Cloud Auto Routing fee.</p><dl><div><dt>Period</dt><dd>Trailing {period} · by settlement time</dd></div><div><dt>Elastic transaction fee</dt><dd>5% of supplier charge</dd></div></dl></MetricInfo></div>
        <div className="market-metric-value"><strong>{formatMarketAmount(stats.feesUsd)}</strong><MarketMetricChart metric="fees" data={series.fees} window={window} /></div><span className="market-metric-caption">Elastic transaction fees · {period}</span>
      </div>
    </section>;
}
