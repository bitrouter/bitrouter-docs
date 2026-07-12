"use client";

/* Benchmark section — Terminal-Bench 2.1.
   Base-model field is the vals.ai leaderboard (Terminus 2 harness, pass@1):
   https://www.vals.ai/benchmarks/terminal-bench-2-1 — accuracy, cost/test, latency.

   The optimization point "GPT-5.5 + BitRouter" applies our measured Terminal-Bench
   run (r2: −32.8% cost, −1.14pp score, run codex-full-a4ce879-c3) to the vals.ai
   GPT-5.5 baseline, so every point shares one cost/test axis. It is PROJECTED —
   BitRouter was not re-run on Terminus 2 — and is labeled as such (‡).

   The arrow from GPT-5.5 → the optimized point shows the cost reduction. */

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BenchTable, type BenchRow } from "./benchmark-table";

type Pt = {
  name: string;
  prov: string;
  harness: string;
  score: number; // % tasks solved → Y
  cost: number; // $ / test → X (log)
  latency: number | null; // s
  kind: "base" | "bitrouter";
  projected?: boolean;
  // label placement: ax = -1 left / 0 center / 1 right, dy = -1 up / 0 side / 1 down
  ax: number;
  dy: number;
};

/* vals.ai · Terminus 2 · pass@1 (fetched 2026-07) */
const BASES: Pt[] = [
  { name: "GPT-5.6 Sol", prov: "openai", harness: "Terminus 2", score: 85.77, cost: 1.02, latency: 372.82, kind: "base", ax: 0, dy: -1 },
  { name: "Claude Fable 5", prov: "anthropic", harness: "Terminus 2", score: 80.52, cost: 1.43, latency: 504.54, kind: "base", ax: -1, dy: -1 },
  { name: "GPT-5.5", prov: "openai", harness: "Terminus 2", score: 76.4, cost: 0.74, latency: 427.41, kind: "base", ax: 1, dy: -1 },
  { name: "Claude Sonnet 5", prov: "anthropic", harness: "Terminus 2", score: 74.53, cost: 0.8, latency: 635.04, kind: "base", ax: 1, dy: 1 },
  { name: "Claude Opus 4.8", prov: "anthropic", harness: "Terminus 2", score: 71.91, cost: 2.41, latency: 929.9, kind: "base", ax: -1, dy: 0 },
];

/* measured BitRouter optimization on our run (applied to the GPT-5.5 baseline) */
const OPT_BASE = "GPT-5.5";
const R2 = { costPct: -32.8, scorePP: -1.14 };
const baseForOpt = BASES.find((b) => b.name === OPT_BASE)!;
const BIT: Pt = {
  name: "GPT-5.5 + BitRouter",
  prov: "bitrouter",
  harness: "bitrouter · adaptive",
  score: +(baseForOpt.score + R2.scorePP).toFixed(2),
  cost: +(baseForOpt.cost * (1 + R2.costPct / 100)).toFixed(4),
  latency: null,
  kind: "bitrouter",
  projected: true,
  ax: 1,
  dy: 1,
};
const POINTS: Pt[] = [...BASES, BIT];

type MetricId = "cost" | "accuracy" | "latency";
const METRICS: { id: MetricId; label: string; status: "live" | "pending" }[] = [
  { id: "cost", label: "cost", status: "live" },
  { id: "accuracy", label: "accuracy", status: "pending" },
  { id: "latency", label: "latency", status: "pending" },
];
const METRIC_CFG: Record<
  MetricId,
  { field: keyof Pt; title: string; log: boolean; lowerBetter: boolean; fmt: (v: number) => string }
> = {
  cost: { field: "cost", title: "COST · $ / TEST", log: true, lowerBetter: true, fmt: (v) => `$${v.toFixed(2)}` },
  accuracy: { field: "score", title: "ACCURACY · %", log: false, lowerBetter: false, fmt: (v) => `${v.toFixed(0)}%` },
  latency: { field: "latency", title: "LATENCY · s", log: false, lowerBetter: true, fmt: (v) => `${Math.round(v)}s` },
};

const PLOT = { x0: 104, x1: 596, y0: 42, y1: 300 };
const pad = (lo: number, hi: number, p: number) => {
  const span = hi - lo || 1;
  return [lo - span * p, hi + span * p] as const;
};

function makeScales(pts: Pt[], cfg: (typeof METRIC_CFG)[MetricId]) {
  const [sLo, sHi] = pad(Math.min(...pts.map((d) => d.score)), Math.max(...pts.map((d) => d.score)), 0.16);
  const y = (s: number) => PLOT.y1 - ((s - sLo) / (sHi - sLo)) * (PLOT.y1 - PLOT.y0);
  const xs = pts.map((d) => d[cfg.field] as number);
  const [lo, hi] = cfg.log
    ? pad(Math.min(...xs.map(Math.log10)), Math.max(...xs.map(Math.log10)), 0.16)
    : pad(Math.min(...xs), Math.max(...xs), 0.14);
  const x = (v: number) => PLOT.x0 + (((cfg.log ? Math.log10(v) : v) - lo) / (hi - lo)) * (PLOT.x1 - PLOT.x0);
  const xLo = cfg.log ? Math.pow(10, lo) : lo;
  const xHi = cfg.log ? Math.pow(10, hi) : hi;
  return { x, y, sLo, sHi, xLo, xHi };
}

function Scatter({ metric }: { metric: MetricId }) {
  const cfg = METRIC_CFG[metric];
  const s = makeScales(POINTS, cfg);
  const w = PLOT.x1 - PLOT.x0;
  const h = PLOT.y1 - PLOT.y0;
  const cx = (PLOT.x0 + PLOT.x1) / 2;
  const cy = (PLOT.y0 + PLOT.y1) / 2;
  const xv = (d: Pt) => d[cfg.field] as number;

  const bx = s.x(xv(BIT));
  const by = s.y(BIT.score);
  const gx = s.x(xv(baseForOpt));
  const gy = s.y(baseForOpt.score);

  const label = (p: Pt, px: number, py: number, brand?: boolean) => {
    const lx = px + p.ax * 11;
    const anchor = p.ax < 0 ? "end" : p.ax > 0 ? "start" : "middle";
    const ly = py + (p.dy < 0 ? -9 : p.dy > 0 ? 17 : 4);
    return (
      <text x={lx} y={ly} textAnchor={anchor} className={"bench-lbl-name" + (brand ? " brand" : "")}>
        {p.name}
        {p.projected ? " ‡" : ""}
      </text>
    );
  };

  return (
    <div className="bench-chart">
      <svg
        className="bench-svg"
        viewBox="0 0 640 360"
        role="img"
        aria-label="Terminal-Bench 2.1 accuracy versus cost per test: BitRouter cuts GPT-5.5's cost by a third at the same accuracy band."
      >
        <defs>
          <pattern id="benchdots" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" className="bench-grid-dot" />
          </pattern>
          <marker id="benchArrow" markerWidth="8" markerHeight="8" refX="5.5" refY="3.2" orient="auto">
            <path d="M0,0 L6.5,3.2 L0,6.4 z" fill="var(--accent)" />
          </marker>
        </defs>

        <rect x={PLOT.x0} y={PLOT.y0} width={w} height={h} fill="url(#benchdots)" />
        <line x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x0} y2={PLOT.y1} stroke="var(--line-2)" strokeWidth="1.25" />
        <line x1={PLOT.x0} y1={PLOT.y1} x2={PLOT.x1} y2={PLOT.y1} stroke="var(--line-2)" strokeWidth="1.25" />

        <text className="bench-axis-title" x={30} y={cy} textAnchor="middle" transform={`rotate(-90 30 ${cy})`}>
          TERMINAL-BENCH-2.1 · %
        </text>
        <text className="bench-axis-title" x={cx} y={PLOT.y1 + 44} textAnchor="middle">
          {cfg.title}
        </text>

        <text className="bench-tick" x={PLOT.x0 - 9} y={PLOT.y0 + 4} textAnchor="end">{s.sHi.toFixed(0)}%</text>
        <text className="bench-tick" x={PLOT.x0 - 9} y={PLOT.y1} textAnchor="end">{s.sLo.toFixed(0)}%</text>
        <text className="bench-tick" x={PLOT.x0} y={PLOT.y1 + 18} textAnchor="middle">{cfg.fmt(s.xLo)}</text>
        <text className="bench-tick" x={PLOT.x1} y={PLOT.y1 + 18} textAnchor="middle">{cfg.fmt(s.xHi)}</text>

        <text className="bench-hint" x={PLOT.x0 + 8} y={PLOT.y0 + 14}>↖ better</text>

        {/* base models — hollow dots */}
        {BASES.map((p) => {
          const px = s.x(xv(p));
          const py = s.y(p.score);
          return (
            <g key={p.name}>
              <circle className="bench-dot" cx={px} cy={py} r="4.5" />
              {label(p, px, py)}
            </g>
          );
        })}

        {/* optimization arrow: GPT-5.5 → GPT-5.5 + BitRouter */}
        <line className="bench-opt-arrow" x1={gx} y1={gy} x2={bx + (bx < gx ? 8 : -8)} y2={by} markerEnd="url(#benchArrow)" />
        <text className="bench-opt-lbl" x={(gx + bx) / 2} y={Math.min(gy, by) - 8} textAnchor="middle">
          −33% cost
        </text>

        {/* the optimized point — purple square, haloed */}
        <rect className="bench-halo" x={bx - 10} y={by - 10} width="20" height="20" rx="3" />
        <rect className="bench-square" x={bx - 5.5} y={by - 5.5} width="11" height="11" rx="1.5" />
        {label(BIT, bx, by, true)}
      </svg>

      <div className="bench-figfoot">
        <div className="bench-legend">
          <span className="k"><span className="bench-key-square" /> gpt-5.5 + bitrouter</span>
          <span className="k"><span className="bench-key-dot" /> base model · vals.ai</span>
        </div>
        <span className="bench-note">Terminus 2 · pass@1 · cost/test · log scale</span>
      </div>
      <p className="bench-caveat">
        ‡ <b>GPT-5.5 + BitRouter</b> applies our measured Terminal-Bench result (−32.8% cost, −1.14pp;
        run codex-full-a4ce879-c3) to the vals.ai GPT-5.5 baseline. BitRouter was not re-run on Terminus 2.
      </p>
    </div>
  );
}

const TAB_LIST = "h-auto gap-1 rounded-lg border p-1 bg-[var(--panel)] border-[var(--line-2)]";
const TAB_TRIGGER =
  "rounded-md border border-transparent px-3 py-1.5 text-[12.5px] font-mono shadow-none " +
  "text-[var(--muted)] data-[state=active]:text-[var(--fg)] data-[state=active]:shadow-none " +
  "data-[state=active]:bg-[var(--panel-3)] dark:data-[state=active]:bg-[var(--panel-3)] " +
  "data-[state=active]:border-[var(--line-bright)] dark:data-[state=active]:border-[var(--line-bright)] " +
  "dark:data-[state=active]:text-[var(--fg)]";

const SOON: React.CSSProperties = {
  fontSize: "8.5px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--faint)",
  border: "1px solid var(--line-2)",
  borderRadius: "4px",
  padding: "1px 4px",
  marginLeft: "6px",
};

function buildRows(): BenchRow[] {
  return POINTS.map((p) => ({
    name: p.name,
    prov: p.prov,
    harness: p.harness,
    score: p.score,
    cost: p.cost,
    latency: p.latency,
    kind: p.kind,
    projected: p.projected,
  }));
}

export function Benchmark() {
  const [metric, setMetric] = React.useState<MetricId>("cost");
  const rows = React.useMemo(buildRows, []);

  return (
    <section className="sec bench" id="benchmarks">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow sec-eyebrow" style={{ ["--sec-accent" as string]: "var(--accent)" }}>
            <span className="idx">//</span> measured, not modeled
          </div>
          <h2 className="h-display sec-title">Same tasks solved. A fraction of the bill.</h2>
          <p className="sec-lead">
            On Terminal-Bench 2.1, BitRouter routed GPT-5.5&rsquo;s calls and cut cost ~33% at the same
            solve rate. Plotted against the vals.ai leaderboard field, the optimized point slides left —
            same accuracy band, a third cheaper.
          </p>
        </div>

        <div className="bench-toolbar">
          <div className="bench-toolbar-group">
            <span className="bench-toolbar-label">metric</span>
            <Tabs value={metric} onValueChange={(v) => setMetric(v as MetricId)}>
              <TabsList className={TAB_LIST}>
                {METRICS.map((m) => (
                  <TabsTrigger key={m.id} value={m.id} className={TAB_TRIGGER} disabled={m.status === "pending"}>
                    {m.label}
                    {m.status === "pending" && <span style={SOON}>soon</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <a className="bench-bench-name" href="https://www.vals.ai/benchmarks/terminal-bench-2-1" target="_blank" rel="noopener noreferrer">
            terminal-bench-2.1 <span className="bench-ext">↗</span>
            <span className="bench-bench-n"> · vals.ai</span>
          </a>
        </div>

        <div className="bench-grid">
          <Scatter metric={metric} />
          <BenchTable rows={rows} />
        </div>
      </div>
    </section>
  );
}
