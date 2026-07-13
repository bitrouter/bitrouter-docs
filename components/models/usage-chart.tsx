"use client";

/* UsageChart — one thin stacked bar per day of routed-call volume, one segment
   per top model + a muted "other" tail. Built on the shadcn Chart (Recharts)
   for hover tooltips. Series keys are sanitized (s0…s7, other) so the
   `--color-*` CSS vars are valid; the tooltip label maps back to the real id.
   X-axis shows a label every 7 days (weekly) over the daily bars. */

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { type UsageSeries } from "@/lib/model-usage";

export function UsageChart({
  days,
  series,
}: {
  days: string[];
  series: UsageSeries[];
}) {
  if (!days.length || !series.length) {
    return <div className="usage-empty">no routed traffic yet</div>;
  }

  const keyed = series.map((se, i) => ({
    ...se,
    ck: se.id === null ? "other" : `s${i}`,
  }));

  const config: ChartConfig = {};
  for (const se of keyed) {
    config[se.ck] = { label: se.id ?? "other", color: se.color };
  }

  const data = days.map((d, di) => {
    const row: Record<string, string | number> = { day: d };
    for (const se of keyed) row[se.ck] = Math.round(se.values[di]);
    return row;
  });

  return (
    <ChartContainer config={config} className="usage-chart">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }} barCategoryGap={1}>
        <CartesianGrid vertical={false} strokeDasharray="2 4" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          interval={6}
        />
        <ChartTooltip
          cursor={{ fillOpacity: 0.08 }}
          content={<ChartTooltipContent indicator="dot" />}
        />
        {keyed.map((se, i) => (
          <Bar
            key={se.ck}
            dataKey={se.ck}
            stackId="a"
            fill={`var(--color-${se.ck})`}
            isAnimationActive={false}
            // round the top of the column (its topmost "other" segment) to match
            // the rounded tracks/pills used elsewhere on the page
            radius={i === keyed.length - 1 ? [2, 2, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
