"use client";

import { memo } from "react";
import { Bar, BarChart, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatMarketAmount, formatSlippageBps, metricBucketHours, type GlobalMarketMetric, type GlobalMetricPoint } from "@/lib/elastic-market-metrics";
import type { MarketWindow } from "@/lib/elastic-market";

const labels = { volume: "Trading Volume", liquidity: "Available Liquidity", slippage: "Avg. Slippage", fees: "Platform Fees" };
const colors = { volume: "var(--market-volume)", liquidity: "var(--market-ask)", slippage: "var(--market-bid)", fees: "var(--chart-4)" };
const initialDimension = { width: 48, height: 48 };
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

export const MarketMetricChart = memo(function MarketMetricChart({ metric, data, window }: {
  metric: GlobalMarketMetric;
  data: GlobalMetricPoint[];
  window: MarketWindow;
}) {
  const bars = metric === "volume" || metric === "fees";
  const rightColumn = metric === "liquidity" || metric === "fees";
  const hours = metricBucketHours(window);
  const values = data.flatMap(point => point.value === null ? [] : [point.value]);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const domain = metric === "slippage" && min === max ? [-1, 1] : [min, max];
  const tooltip = <ChartTooltip
    allowEscapeViewBox={{ x: rightColumn, y: true }}
    reverseDirection={{ x: rightColumn }}
    wrapperStyle={{ zIndex: 20 }}
    cursor={false}
    content={<ChartTooltipContent className="market-global-tooltip" labelFormatter={(_label, payload) => {
      const point = payload[0]?.payload as GlobalMetricPoint | undefined;
      return point ? `${dateFormat.format(point.time)} UTC${metric === "liquidity" ? " · Snapshot" : ` · ${hours}h interval end`}` : "";
    }} formatter={value => <div className="market-global-tooltip-row"><span>{metric === "liquidity" ? "Supply" : metric === "slippage" ? "Slippage" : metric === "fees" ? "Fees" : "Volume"}</span><strong>{metric === "slippage" ? `${formatSlippageBps(Number(value))} bps` : formatMarketAmount(Number(value))}</strong></div>} />}
  />;

  return <ChartContainer
    config={{ value: { label: labels[metric], color: colors[metric] } }}
    className="market-global-chart"
    initialDimension={initialDimension}
    role="img"
    aria-label={`${labels[metric]} ${window} history, ${metric === "liquidity" ? "supply snapshots in USD" : metric === "slippage" ? "weighted basis points with zero baseline" : `${hours}-hour settled USD buckets`}`}
  >
    {bars ? <BarChart data={data} accessibilityLayer margin={{ top: 5, right: 0, bottom: 2, left: 0 }} barCategoryGap="28%">
      <XAxis dataKey="time" hide />
      <YAxis domain={[0, "dataMax"]} hide />
      {tooltip}
      <Bar dataKey="value" fill="var(--color-value)" radius={[1, 1, 0, 0]} maxBarSize={6} isAnimationActive={false} />
    </BarChart> : <LineChart data={data} accessibilityLayer margin={{ top: 5, right: 1, bottom: 3, left: 1 }}>
      <XAxis dataKey="time" hide />
      <YAxis domain={domain} hide />
      {metric === "slippage" && <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />}
      {tooltip}
      <Line dataKey="value" type={metric === "liquidity" ? "stepAfter" : "linear"} stroke="var(--color-value)" strokeWidth={1.5} dot={false} activeDot={{ r: 2 }} connectNulls={false} isAnimationActive={false} />
    </LineChart>}
  </ChartContainer>;
});
