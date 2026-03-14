"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

type ApiTab = "models" | "tools" | "agents";
type TimeRange = "4w" | "12w" | "6m" | "1y";
type SortKey = "volume" | "pricing" | "model";
type SortDir = "asc" | "desc";
interface ModelEntry {
  id: string;
  model: string;
  provider: string;
  category: string;
  volume7d: number;
  latencyP50: string;
  inputPrice: number | null;
  outputPrice: number | null;
  status: "live" | "beta";
  color: string;
}

interface WeeklyDataPoint {
  week: string;
  [model: string]: number | string;
}

// ── Provider colors ──────────────────────────────────────

const MODEL_COLORS: Record<string, string> = {
  "gpt-4o": "#10b981",
  "claude-sonnet-4": "#f97316",
  "gemini-2.5-pro": "#3b82f6",
  "claude-opus-4": "#fb923c",
  "deepseek-r1": "#8b5cf6",
  "llama-4-maverick": "#06b6d4",
  "gpt-4o-mini": "#34d399",
  "claude-haiku-3.5": "#fdba74",
  "gemini-2.5-flash": "#60a5fa",
  "imagen-3": "#2563eb",
  "kling-v2": "#ec4899",
  Others: "#525252",
};

// ── Mock: model entries ──────────────────────────────────

const MODELS: ModelEntry[] = [
  {
    id: "gpt-4o",
    model: "gpt-4o",
    provider: "OpenAI",
    category: "Chat",
    volume7d: 847231,
    latencyP50: "320ms",
    inputPrice: 2.5,
    outputPrice: 10.0,
    status: "live",
    color: MODEL_COLORS["gpt-4o"],
  },
  {
    id: "claude-sonnet-4",
    model: "claude-sonnet-4",
    provider: "Anthropic",
    category: "Chat",
    volume7d: 612089,
    latencyP50: "410ms",
    inputPrice: 3.0,
    outputPrice: 15.0,
    status: "live",
    color: MODEL_COLORS["claude-sonnet-4"],
  },
  {
    id: "gemini-2.5-pro",
    model: "gemini-2.5-pro",
    provider: "Google",
    category: "Chat",
    volume7d: 389412,
    latencyP50: "280ms",
    inputPrice: 1.25,
    outputPrice: 10.0,
    status: "live",
    color: MODEL_COLORS["gemini-2.5-pro"],
  },
  {
    id: "claude-opus-4",
    model: "claude-opus-4",
    provider: "Anthropic",
    category: "Chat",
    volume7d: 241567,
    latencyP50: "890ms",
    inputPrice: 15.0,
    outputPrice: 75.0,
    status: "live",
    color: MODEL_COLORS["claude-opus-4"],
  },
  {
    id: "deepseek-r1",
    model: "deepseek-r1",
    provider: "DeepSeek",
    category: "Chat",
    volume7d: 178903,
    latencyP50: "520ms",
    inputPrice: 0.55,
    outputPrice: 2.19,
    status: "live",
    color: MODEL_COLORS["deepseek-r1"],
  },
  {
    id: "llama-4-maverick",
    model: "llama-4-maverick",
    provider: "Meta",
    category: "Chat",
    volume7d: 134221,
    latencyP50: "190ms",
    inputPrice: 0.2,
    outputPrice: 0.6,
    status: "live",
    color: MODEL_COLORS["llama-4-maverick"],
  },
  {
    id: "gpt-4o-mini",
    model: "gpt-4o-mini",
    provider: "OpenAI",
    category: "Chat",
    volume7d: 87654,
    latencyP50: "180ms",
    inputPrice: 0.15,
    outputPrice: 0.6,
    status: "live",
    color: MODEL_COLORS["gpt-4o-mini"],
  },
  {
    id: "claude-haiku-3.5",
    model: "claude-haiku-3.5",
    provider: "Anthropic",
    category: "Chat",
    volume7d: 38901,
    latencyP50: "140ms",
    inputPrice: 0.8,
    outputPrice: 4.0,
    status: "live",
    color: MODEL_COLORS["claude-haiku-3.5"],
  },
  {
    id: "gemini-2.5-flash",
    model: "gemini-2.5-flash",
    provider: "Google",
    category: "Chat",
    volume7d: 64210,
    latencyP50: "150ms",
    inputPrice: 0.15,
    outputPrice: 0.6,
    status: "live",
    color: MODEL_COLORS["gemini-2.5-flash"],
  },
  {
    id: "imagen-3",
    model: "imagen-3",
    provider: "Google",
    category: "Image",
    volume7d: 98412,
    latencyP50: "2.1s",
    inputPrice: null,
    outputPrice: null,
    status: "beta",
    color: MODEL_COLORS["imagen-3"],
  },
  {
    id: "kling-v2",
    model: "kling-v2",
    provider: "Kuaishou",
    category: "Video",
    volume7d: 45210,
    latencyP50: "~3min",
    inputPrice: null,
    outputPrice: null,
    status: "beta",
    color: MODEL_COLORS["kling-v2"],
  },
];

// ── Mock: weekly usage data ──────────────────────────────

const TOP_CHART_MODELS = [
  "gpt-4o",
  "claude-sonnet-4",
  "gemini-2.5-pro",
  "claude-opus-4",
  "deepseek-r1",
  "llama-4-maverick",
  "Others",
];

const TOTAL_WEEKS = 52; // 1 year of data

function generateWeeklyData(): WeeklyDataPoint[] {
  const weeks: WeeklyDataPoint[] = [];
  const now = new Date();
  const baseDate = new Date(now);
  baseDate.setDate(baseDate.getDate() - TOTAL_WEEKS * 7);

  const baseVolumes: Record<string, number> = {
    "gpt-4o": 220000,
    "claude-sonnet-4": 120000,
    "gemini-2.5-pro": 60000,
    "claude-opus-4": 35000,
    "deepseek-r1": 20000,
    "llama-4-maverick": 12000,
    Others: 40000,
  };

  const growthRates: Record<string, number> = {
    "gpt-4o": 1.028,
    "claude-sonnet-4": 1.035,
    "gemini-2.5-pro": 1.04,
    "claude-opus-4": 1.038,
    "deepseek-r1": 1.05,
    "llama-4-maverick": 1.045,
    Others: 1.03,
  };

  for (let i = 0; i < TOTAL_WEEKS; i++) {
    const weekDate = new Date(baseDate);
    weekDate.setDate(weekDate.getDate() + i * 7);
    const label = weekDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const point: WeeklyDataPoint = { week: label };
    for (const model of TOP_CHART_MODELS) {
      const jitter = 0.92 + Math.random() * 0.16;
      point[model] = Math.round(
        baseVolumes[model] * Math.pow(growthRates[model], i) * jitter,
      );
    }
    weeks.push(point);
  }

  return weeks;
}

const WEEKLY_DATA = generateWeeklyData();

const TIME_RANGES: { value: TimeRange; label: string; weeks: number }[] = [
  { value: "4w", label: "4W", weeks: 4 },
  { value: "12w", label: "12W", weeks: 12 },
  { value: "6m", label: "6M", weeks: 26 },
  { value: "1y", label: "1Y", weeks: 52 },
];

// ── Helpers ──────────────────────────────────────────────

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

function formatVolumeTable(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Custom tooltip ───────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);

  return (
    <div className="bg-background border border-border px-4 py-3 shadow-md min-w-[200px]">
      <div className="text-xs font-medium mb-2.5 text-foreground">{label}</div>
      <div className="space-y-1.5">
        {[...payload].reverse().map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-6 text-[11px]"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.dataKey}
            </span>
            <span className="tabular-nums text-foreground font-medium">
              {formatVolume(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-2.5 pt-2 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Total</span>
        <span className="tabular-nums text-foreground font-medium">
          {formatVolume(total)}
        </span>
      </div>
    </div>
  );
}

// ── Sort logic ───────────────────────────────────────────

function sortModels(
  entries: ModelEntry[],
  key: SortKey,
  dir: SortDir,
): ModelEntry[] {
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "volume":
        cmp = a.volume7d - b.volume7d;
        break;
      case "pricing":
        cmp = (a.inputPrice ?? 0) - (b.inputPrice ?? 0);
        break;
      case "model":
        cmp = a.model.localeCompare(b.model);
        break;
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

// ── Component ────────────────────────────────────────────

export function ApisView() {
  const [activeTab] = useState<ApiTab>("models");
  const [timeRange, setTimeRange] = useState<TimeRange>("12w");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const chartData = useMemo(() => {
    const weeks = TIME_RANGES.find((r) => r.value === timeRange)!.weeks;
    return WEEKLY_DATA.slice(-weeks);
  }, [timeRange]);

  const totalVolume = useMemo(
    () => MODELS.reduce((sum, m) => sum + m.volume7d, 0),
    [],
  );

  const filtered = useMemo(() => {
    let list = MODELS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q),
      );
    }
    return sortModels(list, sortKey, sortDir);
  }, [search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "model" ? "asc" : "desc");
    }
  };

  return (
    <div className="md:h-full md:min-h-0">
      <Card className="gap-0 rounded-lg py-0 overflow-hidden md:h-full md:flex md:flex-col">
        <CardContent className="p-0 md:min-h-0 md:flex-1 md:flex md:flex-col">
          {/* Header: toggle + search + time filter */}
          <div className="flex flex-col gap-2 border-b border-border px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex border border-border rounded-md overflow-hidden">
                <TabButton active={activeTab === "models"} disabled={false}>
                  Models
                </TabButton>
                <TabButton active={false} disabled>
                  Tools
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 font-normal border-border ml-1.5"
                  >
                    soon
                  </Badge>
                </TabButton>
                <TabButton active={false} disabled>
                  Agents
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 font-normal border-border ml-1.5"
                  >
                    soon
                  </Badge>
                </TabButton>
              </div>
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/30 w-full sm:w-56 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {formatVolume(totalVolume)} total (7d)
              </span>
              <div className="inline-flex border border-border rounded-md overflow-hidden">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setTimeRange(r.value)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] border-r border-border last:border-r-0 transition-colors select-none",
                      timeRange === r.value
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="shrink-0 px-2 pt-4 pb-2 sm:px-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                barCategoryGap="16%"
              >
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={formatVolume}
                  width={48}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                />
                {TOP_CHART_MODELS.map((model) => (
                  <Bar
                    key={model}
                    dataKey={model}
                    stackId="usage"
                    fill={MODEL_COLORS[model]}
                    radius={
                      model === TOP_CHART_MODELS[TOP_CHART_MODELS.length - 1]
                        ? [2, 2, 0, 0]
                        : [0, 0, 0, 0]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2.5">
            {TOP_CHART_MODELS.map((model) => (
              <span
                key={model}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
                  style={{ backgroundColor: MODEL_COLORS[model] }}
                />
                {model}
              </span>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto md:flex-1 md:min-h-0 md:overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="md:sticky md:top-0 md:z-10 bg-card">
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium w-8">#</th>
                  <SortableHeader
                    label="Name"
                    sortKey="model"
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="left"
                  />
                  <th className="px-4 py-2.5 font-medium text-left">Endpoint</th>
                  <SortableHeader
                    label="Volume (7d)"
                    sortKey="volume"
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Pricing"
                    sortKey="pricing"
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border/30 transition-colors hover:bg-muted/10"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block shrink-0 w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-medium">{entry.model}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <EndpointCell model={entry.model} />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        sortKey === "volume" && "font-medium text-foreground",
                      )}
                    >
                      {formatVolumeTable(entry.volume7d)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        sortKey === "pricing" && "font-medium text-foreground",
                      )}
                    >
                      {entry.inputPrice !== null && entry.outputPrice !== null
                        ? `$${entry.inputPrice.toFixed(2)} / $${entry.outputPrice.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-full",
                          entry.status === "live"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-violet-500/10 text-violet-400",
                        )}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground text-xs"
                    >
                      No models found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="shrink-0 flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} of {MODELS.length} models
              {search && ` · matching "${search}"`}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Sorted by {sortKey} {sortDir === "desc" ? "↓" : "↑"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab button ───────────────────────────────────────────

function TabButton({
  active,
  disabled,
  children,
}: {
  active: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "flex items-center px-4 py-2 text-xs border-r border-border last:border-r-0 transition-colors select-none",
        active && "bg-muted text-foreground font-medium",
        !active && !disabled && "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        disabled && "text-muted-foreground/40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

// ── Sortable table header ────────────────────────────────

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
  align = "right",
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = sortKey === activeSortKey;
  return (
    <th
      className={cn(
        "px-4 py-2.5 font-medium cursor-pointer select-none transition-colors hover:text-foreground whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive && (
        <span className="ml-0.5 text-[10px]">
          {sortDir === "desc" ? " ↓" : " ↑"}
        </span>
      )}
    </th>
  );
}

// ── Endpoint cell with copy ──────────────────────────────

const BASE_URL = "v1/chat/completions";

function EndpointCell({ model }: { model: string }) {
  const [copied, setCopied] = useState(false);
  const endpoint = `${BASE_URL}?model=${model}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span className="group flex items-center gap-2">
      <code className="text-[11px] text-muted-foreground">{endpoint}</code>
      <button
        onClick={handleCopy}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        title="Copy endpoint"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </span>
  );
}
