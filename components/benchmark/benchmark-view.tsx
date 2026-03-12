"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LiveTasks } from "./live-tasks";

// ── Types ────────────────────────────────────────────────

type SortKey = "cost" | "performance" | "safety";

interface SafetyBreakdown {
  vuln: number;
  destructive: number;
  scope: number;
}

interface BenchmarkEntry {
  runtime: string;
  model: string;
  cost: number;
  performance: number;
  safety: number;
  safetyBreakdown: SafetyBreakdown;
  isBitrouter: boolean;
}

// ── Mock data ────────────────────────────────────────────

const MOCK_DATA: BenchmarkEntry[] = [
  {
    runtime: "openclaw",
    model: "bitrouter/auto",
    cost: 4.2,
    performance: 91,
    safety: 96,
    safetyBreakdown: { vuln: 98, destructive: 96, scope: 94 },
    isBitrouter: true,
  },
  {
    runtime: "openclaw",
    model: "sonnet 4",
    cost: 6.8,
    performance: 89,
    safety: 92,
    safetyBreakdown: { vuln: 94, destructive: 92, scope: 90 },
    isBitrouter: false,
  },
  {
    runtime: "claude-code",
    model: "opus 4",
    cost: 11.2,
    performance: 94,
    safety: 95,
    safetyBreakdown: { vuln: 95, destructive: 94, scope: 91 },
    isBitrouter: false,
  },
  {
    runtime: "cursor",
    model: "gpt-4o",
    cost: 7.1,
    performance: 85,
    safety: 81,
    safetyBreakdown: { vuln: 84, destructive: 78, scope: 72 },
    isBitrouter: false,
  },
  {
    runtime: "opencode",
    model: "sonnet 4",
    cost: 6.5,
    performance: 88,
    safety: 90,
    safetyBreakdown: { vuln: 92, destructive: 88, scope: 85 },
    isBitrouter: false,
  },
  {
    runtime: "aider",
    model: "deepseek-r1",
    cost: 2.1,
    performance: 74,
    safety: 68,
    safetyBreakdown: { vuln: 72, destructive: 65, scope: 62 },
    isBitrouter: false,
  },
];

async function fetchBenchmarkData(): Promise<BenchmarkEntry[]> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
  return MOCK_DATA.map((entry) => ({
    ...entry,
    cost: +(entry.cost + (Math.random() - 0.5) * 0.1).toFixed(2),
    performance: Math.min(
      100,
      Math.max(0, entry.performance + Math.round((Math.random() - 0.5) * 2)),
    ),
    safety: Math.min(
      100,
      Math.max(0, entry.safety + Math.round((Math.random() - 0.5) * 1)),
    ),
  }));
}

// ── Scatter plot constants ───────────────────────────────

const CHART = {
  // Axis ranges
  cost: { min: 0, max: 14 },
  perf: { min: 65, max: 100 },
  // Bubble size range (px diameter)
  bubble: { min: 16, max: 44 },
  // Safety score range for sizing
  safety: { min: 60, max: 100 },
} as const;

function costToX(cost: number): number {
  return ((cost - CHART.cost.min) / (CHART.cost.max - CHART.cost.min)) * 100;
}

function perfToY(perf: number): number {
  // Invert: high perf = top of chart = low CSS top%
  return ((CHART.perf.max - perf) / (CHART.perf.max - CHART.perf.min)) * 100;
}

function safetyToSize(safety: number): number {
  const t = Math.max(
    0,
    Math.min(
      1,
      (safety - CHART.safety.min) / (CHART.safety.max - CHART.safety.min),
    ),
  );
  return CHART.bubble.min + t * (CHART.bubble.max - CHART.bubble.min);
}

// ── Sorting ──────────────────────────────────────────────

function sortEntries(
  entries: BenchmarkEntry[],
  key: SortKey,
): BenchmarkEntry[] {
  return [...entries].sort((a, b) => {
    if (key === "cost") return a.cost - b.cost;
    if (key === "performance") return b.performance - a.performance;
    return b.safety - a.safety;
  });
}

// ── Component ────────────────────────────────────────────

const POLL_INTERVAL = 30_000;

// Y-axis tick values
const Y_TICKS = [100, 95, 90, 85, 80, 75, 70];
// X-axis tick values
const X_TICKS = [2, 4, 6, 8, 10, 12];

export function BenchmarkView() {
  const [data, setData] = useState<BenchmarkEntry[]>(MOCK_DATA);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [expandSafety, setExpandSafety] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await fetchBenchmarkData();
      setData(fresh);
      setLastUpdated(new Date());
      setSecondsAgo(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  const entryKey = (e: BenchmarkEntry) => `${e.runtime}-${e.model}`;
  const sorted = sortEntries(data, sortKey);

  return (
    <div className="flex flex-col gap-4 md:h-full md:min-h-0 md:flex-row md:gap-0">
      {/* Left: Chart + Table */}
      <Card className="gap-0 rounded-lg py-0 overflow-hidden md:min-h-0 md:flex-1 md:flex md:flex-col md:rounded-r-none md:border-r-0">
        <CardContent className="p-0 md:min-h-0 md:flex-1 md:overflow-y-auto">
          {/* Chart header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs text-muted-foreground">
              Cost per task vs Performance — bubble size = safety score
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-75",
                    isLoading
                      ? "animate-ping bg-foreground/60"
                      : "bg-foreground/40",
                  )}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/60" />
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                updated {secondsAgo}s ago
              </span>
            </div>
          </div>

          {/* Chart area */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex">
              {/* Y-axis label */}
              <div className="flex flex-col items-end justify-between pr-2 pb-8 pt-0">
                {Y_TICKS.map((tick) => (
                  <span
                    key={tick}
                    className="text-[10px] text-muted-foreground tabular-nums leading-none"
                  >
                    {tick}%
                  </span>
                ))}
              </div>

              {/* Plot area */}
              <div className="flex-1 flex flex-col">
                <div
                  ref={chartRef}
                  className="relative border-l border-b border-border h-[320px] md:h-[260px]"
                >
                  {/* Horizontal grid lines */}
                  {Y_TICKS.map((tick) => (
                    <div
                      key={tick}
                      className="absolute left-0 right-0 border-t border-border/30"
                      style={{ top: `${perfToY(tick)}%` }}
                    />
                  ))}

                  {/* Vertical grid lines */}
                  {X_TICKS.map((tick) => (
                    <div
                      key={tick}
                      className="absolute top-0 bottom-0 border-l border-border/30"
                      style={{ left: `${costToX(tick)}%` }}
                    />
                  ))}

                  {/* "Sweet spot" quadrant hint — top-left region */}
                  <div
                    className="absolute bg-foreground/[0.02]"
                    style={{
                      left: 0,
                      top: 0,
                      width: `${costToX(6)}%`,
                      height: `${perfToY(88)}%`,
                    }}
                  />

                  {/* Data points */}
                  {data.map((entry) => {
                    const key = entryKey(entry);
                    const x = costToX(entry.cost);
                    const y = perfToY(entry.performance);
                    const size = safetyToSize(entry.safety);
                    const isHovered = hoveredEntry === key;

                    return (
                      <div
                        key={key}
                        className="absolute transition-all duration-500 ease-out"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: `translate(-50%, -50%)`,
                          zIndex: entry.isBitrouter ? 20 : isHovered ? 15 : 10,
                        }}
                        onMouseEnter={() => setHoveredEntry(key)}
                        onMouseLeave={() => setHoveredEntry(null)}
                      >
                        {/* Bubble */}
                        <div
                          className={cn(
                            "rounded-full border transition-all duration-200 cursor-default",
                            entry.isBitrouter
                              ? "bg-foreground/90 border-foreground"
                              : "bg-foreground/15 border-foreground/30",
                            isHovered && "ring-2 ring-foreground/20",
                          )}
                          style={{ width: size, height: size }}
                        />

                        {/* Label */}
                        <div
                          className={cn(
                            "absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-150",
                            isHovered || entry.isBitrouter
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                          style={{ top: size / 2 + 6 }}
                        >
                          <span
                            className={cn(
                              "text-[11px] px-1.5 py-0.5 bg-background/90 border border-border",
                              entry.isBitrouter
                                ? "text-foreground font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {entry.runtime} + {entry.model}
                          </span>
                        </div>

                        {/* Tooltip on hover */}
                        {isHovered && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 bg-background border border-border px-3 py-2 shadow-sm whitespace-nowrap"
                            style={{ bottom: size / 2 + 8 }}
                          >
                            <div className="text-xs font-medium mb-1">
                              {entry.runtime} + {entry.model}
                            </div>
                            <div className="grid grid-cols-3 gap-x-4 text-[11px] tabular-nums">
                              <div>
                                <span className="text-muted-foreground">
                                  Cost{" "}
                                </span>
                                ${entry.cost.toFixed(2)}
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Perf{" "}
                                </span>
                                {entry.performance}%
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Safe{" "}
                                </span>
                                {entry.safety}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-axis ticks */}
                <div className="relative h-6 border-l border-transparent">
                  {X_TICKS.map((tick) => (
                    <span
                      key={tick}
                      className="absolute -translate-x-1/2 text-[10px] text-muted-foreground tabular-nums pt-1.5"
                      style={{ left: `${costToX(tick)}%` }}
                    >
                      ${tick}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Axis labels + legend */}
            <div className="flex items-center justify-between mt-1 pl-8">
              <span className="text-[11px] text-muted-foreground">
                ← lower cost &nbsp;&nbsp; Cost per task (USD) &nbsp;&nbsp;
                higher cost →
              </span>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-foreground/90 border border-foreground" />
                  bitrouter/auto
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-foreground/15 border border-foreground/30" />
                  others
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-foreground/15 border border-foreground/30" />
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-foreground/15 border border-foreground/30" />
                  safety
                </span>
              </div>
            </div>
          </div>

          {/* Divider between chart and table */}
          <div className="border-t border-border" />

          {/* Data table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium w-8">#</th>
                  <th className="px-4 py-2.5 font-medium">Runtime + Model</th>
                  <SortableHeader
                    label="Cost"
                    sortKey="cost"
                    activeSortKey={sortKey}
                    onSort={setSortKey}
                  />
                  <SortableHeader
                    label="Perf"
                    sortKey="performance"
                    activeSortKey={sortKey}
                    onSort={setSortKey}
                  />
                  {expandSafety ? (
                    <>
                      <th
                        className="px-4 py-2.5 font-medium text-right text-foreground cursor-pointer hover:text-foreground/80 select-none"
                        onClick={() => setExpandSafety(false)}
                      >
                        Vuln ←
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right text-foreground">
                        Destr
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right text-foreground">
                        Scope
                      </th>
                    </>
                  ) : (
                    <th
                      className={cn(
                        "px-4 py-2.5 font-medium text-right cursor-pointer select-none transition-colors hover:text-foreground",
                        sortKey === "safety"
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                      onClick={() => {
                        if (sortKey === "safety") {
                          setExpandSafety(true);
                        } else {
                          setSortKey("safety");
                        }
                      }}
                    >
                      Safety →
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => {
                  const key = entryKey(entry);
                  const isHovered = hoveredEntry === key;

                  return (
                    <tr
                      key={key}
                      className={cn(
                        "border-b border-border/30 transition-colors",
                        entry.isBitrouter && "bg-foreground/[0.03]",
                        entry.isBitrouter && "border-l-2 border-l-foreground",
                        isHovered && "bg-muted/20",
                        !isHovered && "hover:bg-muted/10",
                      )}
                      onMouseEnter={() => setHoveredEntry(key)}
                      onMouseLeave={() => setHoveredEntry(null)}
                    >
                      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          {/* Bubble indicator matching chart */}
                          <span
                            className={cn(
                              "inline-block shrink-0 rounded-full",
                              entry.isBitrouter
                                ? "bg-foreground/90 border border-foreground"
                                : "bg-foreground/15 border border-foreground/30",
                            )}
                            style={{
                              width: 8,
                              height: 8,
                            }}
                          />
                          <span
                            className={cn(entry.isBitrouter && "font-medium")}
                          >
                            {entry.runtime}
                            <span className="text-muted-foreground"> + </span>
                            {entry.model}
                          </span>
                          {entry.isBitrouter && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-normal border-foreground/30"
                            >
                              auto
                            </Badge>
                          )}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums",
                          sortKey === "cost" && "font-medium",
                        )}
                      >
                        ${entry.cost.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums",
                          sortKey === "performance" && "font-medium",
                        )}
                      >
                        {entry.performance}%
                      </td>
                      {expandSafety ? (
                        <>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {entry.safetyBreakdown.vuln}%
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {entry.safetyBreakdown.destructive}%
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {entry.safetyBreakdown.scope}%
                          </td>
                        </>
                      ) : (
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right tabular-nums",
                            sortKey === "safety" && "font-medium",
                          )}
                        >
                          {entry.safety}%
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="text-[11px] text-muted-foreground">
              Sorted by {sortKey} · {sorted.length} configurations
            </span>
            <span className="text-[11px] text-muted-foreground">
              {expandSafety
                ? "Vuln = zero CVEs · Destr = no unauthorized ops · Scope = only requested files"
                : "Click Safety → to expand sub-scores"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Right: Live Tasks */}
      <Card className="gap-0 rounded-lg py-0 overflow-hidden md:w-[320px] md:shrink-0 md:min-h-0 md:flex md:flex-col md:rounded-l-none">
        <CardContent className="p-0 md:min-h-0 md:flex-1 md:flex md:flex-col">
          <LiveTasks />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sortable table header ────────────────────────────────

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === activeSortKey;
  return (
    <th
      className={cn(
        "px-4 py-2.5 font-medium text-right cursor-pointer select-none transition-colors hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive && (
        <span className="ml-0.5 text-[10px]">
          {sortKey === "cost" ? " ↑" : " ↓"}
        </span>
      )}
    </th>
  );
}
