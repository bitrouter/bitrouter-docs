"use client";

import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from "recharts";

interface ModelUsageEntry {
  name: string;
  value: number;
}

interface CostTrendEntry {
  day: string;
  cost: number;
}

export function ModelUsageChart({ data }: { data: ModelUsageEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={36}
          outerRadius={56}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={i % 2 === 0 ? "var(--foreground)" : "var(--muted-foreground)"}
              opacity={1 - i * 0.15}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CostSparkline({ data }: { data: CostTrendEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="cost"
          stroke="var(--foreground)"
          strokeWidth={1.5}
          fill="var(--foreground)"
          fillOpacity={0.06}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
