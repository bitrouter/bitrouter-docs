"use client";

import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const BENCHMARK_REPORT =
  "https://huggingface.co/datasets/BitRouterAI/benchmarks/blob/main/terminal-bench-2.1/router-random-study/README.md";

const benchmarkData = [
  {
    id: "baseline",
    name: "Fixed baseline",
    cost: 0.830123,
    success: 81.56,
    costLabel: "$0.830",
    successLabel: "81.56%",
  },
  {
    id: "bitrouter",
    name: "BitRouter",
    cost: 0.490317,
    success: 81.25,
    costLabel: "$0.490",
    successLabel: "81.25%",
  },
  {
    // Pooled R1-R5 aggregate from study-comparison/common-valid-comparison.md.
    id: "random",
    name: "Random",
    cost: 0.55267,
    success: 76.5,
    costLabel: "$0.553",
    successLabel: "76.50%",
  },
];

const chartConfig = {
  success: { label: "Task success", color: "var(--foreground)" },
} satisfies ChartConfig;

type PointShapeProps = {
  cx?: number;
  cy?: number;
  payload?: (typeof benchmarkData)[number];
};

function BenchmarkPoint({ cx = 0, cy = 0, payload }: PointShapeProps) {
  if (!payload) return <g />;

  const isBaseline = payload.id === "baseline";
  const isBitRouter = payload.id === "bitrouter";
  const isRandom = payload.id === "random";
  const labelX = isBitRouter ? cx - 10 : cx;
  const labelY = isBitRouter ? cy + 27 : isRandom ? cy + 62 : cy - 32;
  const textAnchor = isBitRouter || isBaseline ? "end" : "middle";
  const fill = isBitRouter
    ? "var(--foreground)"
    : isRandom
      ? "color-mix(in oklch, var(--foreground) 45%, var(--background))"
      : "var(--muted-foreground)";

  return (
    <g>
      <title>{`${payload.name}: nominal API cost ${payload.costLabel} per trial, task success ${payload.successLabel}`}</title>
      {isBitRouter ? (
        <rect fill={fill} height={12} rx={2} width={12} x={cx - 6} y={cy - 6} />
      ) : isRandom ? (
        <path d={`M ${cx} ${cy - 7} L ${cx + 7} ${cy} L ${cx} ${cy + 7} L ${cx - 7} ${cy} Z`} fill={fill} />
      ) : (
        <circle cx={cx} cy={cy} fill={fill} r={6} />
      )}
      {isRandom ? (
        <path
          d={`M ${cx} ${cy + 9} L ${cx} ${cy + 44}`}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth={1}
        />
      ) : null}
      <text
        fill="var(--foreground)"
        fontSize={12}
        fontWeight={600}
        textAnchor={textAnchor}
        x={labelX}
        y={labelY}
      >
        {payload.name}
      </text>
      <text
        fill="var(--muted-foreground)"
        fontFamily="var(--font-mono)"
        fontSize={11}
        textAnchor={textAnchor}
        x={labelX}
        y={labelY + 15}
      >
        {`${payload.costLabel} · ${payload.successLabel}`}
      </text>
    </g>
  );
}

/** One landing-page finding; the linked report owns the full comparison. */
export function Benchmark() {
  return (
    <section className="zed-wrap zed-sec" id="benchmark">
      <div className="border-y border-border py-16 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span>Terminal-Bench 2.1</span>
              <span>80 common-valid tasks</span>
            </div>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Cost × task success
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
            Left is lower nominal cost. Up is higher measured task success.
          </p>
        </div>

        <ChartContainer
          aria-label="Nominal API cost per trial by task success: fixed baseline 0.830123 dollars and 81.56 percent success; BitRouter 0.490317 dollars and 81.25 percent; random routing 0.552670 dollars and 76.50 percent."
          className="mt-9 h-[360px] w-full aspect-auto sm:h-[430px]"
          config={chartConfig}
          initialDimension={{ width: 960, height: 430 }}
          role="img"
        >
          <ScatterChart margin={{ top: 34, right: 18, bottom: 38, left: 12 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="cost"
              domain={[0, 0.9]}
              label={{
                value: "Nominal API cost ($ / trial)",
                position: "insideBottom",
                offset: -24,
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              ticks={[0, 0.3, 0.6, 0.9]}
              tickLine={false}
              type="number"
            />
            <YAxis
              dataKey="success"
              domain={[0, 100]}
              label={{
                value: "Task success (%)",
                angle: -90,
                position: "insideLeft",
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              type="number"
              width={50}
            />
            <Scatter
              data={benchmarkData}
              isAnimationActive={false}
              shape={(props: unknown) => <BenchmarkPoint {...(props as PointShapeProps)} />}
            />
          </ScatterChart>
        </ChartContainer>

        <div className="mt-5 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Frozen-price nominal API cost per accepted valid-path trial, not provider billing.
            Research artifact; not an official Terminal-Bench submission.
          </p>
          <a
            className="shrink-0 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            href={BENCHMARK_REPORT}
          >
            Methodology &amp; data
          </a>
        </div>
      </div>
    </section>
  );
}
