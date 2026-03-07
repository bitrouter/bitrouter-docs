"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { benchmarkData, type BenchmarkPoint } from "@/lib/data/landing/benchmarks";

function CustomDot(props: { cx?: number; cy?: number; payload?: BenchmarkPoint }) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;

  const size = payload.highlighted ? 10 : payload.dimmed ? 7 : 6;

  if (payload.marker === "star") {
    const fill = payload.highlighted ? "#f4f4f5" : "#71717a";
    const points = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 72 - 90) * (Math.PI / 180);
      const innerAngle = (i * 72 + 36 - 90) * (Math.PI / 180);
      points.push(`${cx + size * Math.cos(outerAngle)},${cy + size * Math.sin(outerAngle)}`);
      points.push(
        `${cx + size * 0.4 * Math.cos(innerAngle)},${cy + size * 0.4 * Math.sin(innerAngle)}`,
      );
    }
    return <polygon points={points.join(" ")} fill={fill} stroke={fill} strokeWidth={1} />;
  }

  if (payload.marker === "triangle") {
    const h = size * 1.2;
    return (
      <polygon
        points={`${cx},${cy - h} ${cx - h},${cy + h * 0.6} ${cx + h},${cy + h * 0.6}`}
        fill="#71717a"
        stroke="#71717a"
        strokeWidth={1}
      />
    );
  }

  if (payload.marker === "square") {
    return (
      <rect
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        fill="#a1a1aa"
        stroke="#a1a1aa"
        strokeWidth={1}
      />
    );
  }

  if (payload.marker === "diamond") {
    return (
      <polygon
        points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
        fill="#52525b"
        stroke="#52525b"
        strokeWidth={1}
      />
    );
  }

  // circle (default - All-Opus)
  return <circle cx={cx} cy={cy} r={size} fill="#a1a1aa" stroke="#a1a1aa" strokeWidth={1} />;
}

function CustomTooltip({
  active,
  payload,
  resolveRateLabel,
  costLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: BenchmarkPoint }>;
  resolveRateLabel: string;
  costLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="border border-border bg-background px-3 py-2 text-xs">
      <p className="font-medium text-foreground">{data.name}</p>
      <p className="text-muted-foreground">
        {resolveRateLabel}: <span className="text-foreground">{data.resolveRate}%</span>
      </p>
      <p className="text-muted-foreground">
        {costLabel}: <span className="text-foreground">${data.cost.toFixed(3)}</span>
      </p>
    </div>
  );
}

const legendItems = [
  {
    label: "BitRouter",
    render: () => {
      const size = 6;
      const cx = 8,
        cy = 8;
      const points = [];
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * (Math.PI / 180);
        const innerAngle = (i * 72 + 36 - 90) * (Math.PI / 180);
        points.push(`${cx + size * Math.cos(outerAngle)},${cy + size * Math.sin(outerAngle)}`);
        points.push(
          `${cx + size * 0.4 * Math.cos(innerAngle)},${cy + size * 0.4 * Math.sin(innerAngle)}`,
        );
      }
      return (
        <svg width="16" height="16" className="shrink-0">
          <polygon points={points.join(" ")} fill="#f4f4f5" />
        </svg>
      );
    },
  },
  {
    label: "All-Opus",
    render: () => (
      <svg width="16" height="16" className="shrink-0">
        <circle cx="8" cy="8" r="5" fill="#a1a1aa" />
      </svg>
    ),
  },
  {
    label: "All-Sonnet",
    render: () => (
      <svg width="16" height="16" className="shrink-0">
        <rect x="3" y="3" width="10" height="10" fill="#a1a1aa" />
      </svg>
    ),
  },
  {
    label: "All-Haiku",
    render: () => (
      <svg width="16" height="16" className="shrink-0">
        <polygon points="8,2 14,8 8,14 2,8" fill="#52525b" />
      </svg>
    ),
  },
  {
    label: "OpenRouter/auto",
    render: () => (
      <svg width="16" height="16" className="shrink-0">
        <polygon points="8,2 14,13 2,13" fill="#71717a" />
      </svg>
    ),
  },
];

export function Benchmarks() {
  const t = useTranslations("Benchmarks");

  return (
    <section id="benchmarks" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="mb-12 text-center text-2xl tracking-tight sm:text-3xl">{t("heading")}</h2>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        {/* Chart */}
        <div className="border border-border p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="cost"
                name="Cost"
                domain={[0, 0.22]}
                tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                label={{
                  value: t("xAxisLabel"),
                  position: "bottom",
                  offset: 0,
                  style: { fill: "var(--muted-foreground)", fontSize: 12 },
                }}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="resolveRate"
                name="Resolve Rate"
                domain={[45, 100]}
                tickFormatter={(v: number) => `${v}%`}
                label={{
                  value: t("yAxisLabel"),
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "var(--muted-foreground)", fontSize: 12 },
                }}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    resolveRateLabel={t("resolveRate")}
                    costLabel={t("costPerSession")}
                  />
                }
              />
              <Scatter
                data={benchmarkData}
                shape={(props: { cx?: number; cy?: number; payload?: BenchmarkPoint }) => (
                  <CustomDot {...props} />
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>

          {/* Accessible data table for crawlers and screen readers */}
          <table className="sr-only" aria-label={t("heading")}>
            <caption>{t("heading")}</caption>
            <thead>
              <tr>
                <th scope="col">Strategy</th>
                <th scope="col">{t("resolveRate")}</th>
                <th scope="col">{t("costPerSession")}</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkData.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{d.resolveRate}%</td>
                  <td>${d.cost.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SSR-visible summary for AI crawlers */}
          <p className="sr-only">
            BitRouter Balanced achieves a 93.2% SWE-bench resolve rate at just $0.078 per session — 42% of the cost of an All-Opus strategy ($0.186) while retaining 98% of its accuracy. BitRouter Cost Aggressive reaches 87.6% resolve rate at $0.052, outperforming both OpenRouter/auto (76.8% at $0.098) and All-Sonnet (78.4% at $0.067). Routing overhead is under 10 milliseconds.
          </p>

          {/* Chart legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
            {legendItems.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                {item.render()}
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Callout */}
        <div className="space-y-6">
          <div className="border border-border p-6">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {t("calloutLabel")}
            </p>
            <p className="mt-3 text-2xl font-bold leading-tight">{t("calloutHeadline")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("calloutSubtext")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border px-3 py-3">
              <div className="text-xl font-bold tabular-nums">&lt; 10ms</div>
              <div className="text-xs text-muted-foreground">{t("statOverhead")}</div>
            </div>
            <div className="border border-border px-3 py-3">
              <div className="text-xl font-bold tabular-nums">87%</div>
              <div className="text-xs text-muted-foreground">{t("statRecovery")}</div>
            </div>
          </div>

          <Link
            href="/blog/routing-methodology"
            className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("methodologyLink")} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
