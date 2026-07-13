"use client";

/* CapabilityRadar — a model's six-axis shape, on the shadcn Chart (Recharts
   RadarChart) so it matches the usage chart and gets hover tooltips. Rendered
   both in the cards grid (many instances) and on the model page (one large
   instance); kept lightweight — no animation, no dots. */

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AXES, AXIS_META, type AxisSet } from "@/lib/model-capability";

const chartConfig = {
  value: { label: "score", color: "var(--accent)" },
} satisfies ChartConfig;

export function CapabilityRadar({
  values,
  size = 120,
  showLabels = false,
  title,
  className = "",
}: {
  values: AxisSet;
  size?: number;
  showLabels?: boolean;
  title?: string;
  className?: string;
}) {
  const data = AXES.map((ax) => ({
    axis: AXIS_META[ax].short,
    value: values[ax],
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className={"caprad-chart " + className}
      style={{ width: size, height: size }}
      aria-label={title ?? "capability radar"}
    >
      <RadarChart data={data} outerRadius={showLabels ? "68%" : "88%"}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarGrid />
        {showLabels && <PolarAngleAxis dataKey="axis" />}
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.2}
          stroke="var(--color-value)"
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      </RadarChart>
    </ChartContainer>
  );
}
