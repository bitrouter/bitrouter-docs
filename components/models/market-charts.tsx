"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatMarketPrice, formatMarketTime, formatMarketTokens, marketSeries, volumeSeries, type MarketAsset, type MarketWindow } from "@/lib/elastic-market";

const config = {
  ask: { label: "Best ask", color: "var(--market-ask)" },
  bid: { label: "Best bid", color: "var(--market-bid)" },
  inputTokens: { label: "Input tokens", color: "var(--market-volume)" },
  outputTokens: { label: "Output tokens", color: "var(--market-volume-light)" },
} satisfies ChartConfig;

function tooltipDate(time: unknown) {
  return new Date(Number(time)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }) + " UTC";
}

export function MarketCharts({ asset, window, size = "card" }: {
  asset: MarketAsset;
  window: MarketWindow;
  size?: "sparkline" | "card" | "detail";
}) {
  const syncId = useId();
  const series = marketSeries(asset, window);
  const volume = volumeSeries(asset, window);
  const compact = size === "sparkline";
  const detailed = size === "detail";
  const start = series[0].time;
  const end = series[series.length - 1].time;
  const ticks = [start, start + (end - start) / 3, start + (end - start) * 2 / 3, end];
  const axisWidth = detailed ? 54 : 0;

  return <div className={`market-charts market-charts-${size}`}>
    {!compact && <div className="market-chart-caption"><span><i className="market-key market-key-ask" />Ask<i className="market-key market-key-bid" />Bid</span><span>USD / 1M tokens</span></div>}
    <ChartContainer config={config} className="market-price-chart" role="img" aria-label={`${asset.name} ${window} bid and ask history. Missing quotes are gaps.`}>
      <LineChart data={series} accessibilityLayer={!compact} syncId={syncId} syncMethod="value" margin={{ top: 8, right: compact ? 2 : 12, bottom: 2, left: 0 }}>
        {!compact && <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />}
        <XAxis dataKey="time" type="number" scale="time" domain={[start, end]} ticks={ticks} hide={!detailed} tickFormatter={time => formatMarketTime(time, window)} axisLine={false} tickLine={false} minTickGap={30} tickMargin={10} />
        <YAxis hide={!detailed} width={axisWidth} domain={["auto", "auto"]} tickFormatter={formatMarketPrice} axisLine={false} tickLine={false} tickMargin={8} tickCount={4} />
        {!compact && <ChartTooltip content={<ChartTooltipContent labelFormatter={(_label, payload) => tooltipDate(payload[0]?.payload?.time)} formatter={(value, name) => <div className="market-tooltip-row"><span>{name === "ask" ? "Best ask" : "Best bid"}</span><strong>{formatMarketPrice(typeof value === "number" ? value : null)}</strong></div>} />} />}
        {!compact && <Line dataKey="bid" type="stepAfter" stroke="var(--color-bid)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls={false} isAnimationActive={false} />}
        <Line dataKey="ask" type="stepAfter" stroke="var(--color-ask)" strokeWidth={compact ? 1.6 : 2} dot={false} connectNulls={false} isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
    {!compact && <>
      <div className="market-volume-caption"><span>Fulfilled tokens</span><span>{window === "24H" ? "Hourly" : window === "7D" ? "6-hour buckets" : "Daily"}</span></div>
      <ChartContainer config={config} className="market-volume-chart" role="img" aria-label={`${asset.name} fulfilled input and output token volume for ${window}`}>
        <BarChart data={volume} accessibilityLayer syncId={syncId} syncMethod="value" margin={{ top: 3, right: 12, bottom: 2, left: 0 }} barCategoryGap="25%">
          <XAxis dataKey="time" type="number" scale="time" domain={[start, end]} ticks={ticks} tickFormatter={time => formatMarketTime(time, window)} axisLine={false} tickLine={false} minTickGap={35} tickMargin={9} />
          <YAxis hide={!detailed} width={axisWidth} tickFormatter={formatMarketTokens} tickCount={3} axisLine={false} tickLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(_label, payload) => tooltipDate(payload[0]?.payload?.time)} formatter={(value, name) => <div className="market-tooltip-row"><span>{name === "inputTokens" ? "Input tokens" : "Output tokens"}</span><strong>{formatMarketTokens(Number(value))}</strong></div>} />} />
          <Bar dataKey="inputTokens" stackId="tokens" fill="var(--color-inputTokens)" isAnimationActive={false} />
          <Bar dataKey="outputTokens" stackId="tokens" fill="var(--color-outputTokens)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
      {detailed && <div className="market-volume-legend"><span><i className="market-key market-key-input" />Input</span><span><i className="market-key market-key-output" />Output</span><span>UTC</span></div>}
    </>}
  </div>;
}
