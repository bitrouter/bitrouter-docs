"use client";

import { useState, useMemo, useEffect, type ComponentType, type SVGProps } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Provider icons ───────────────────────────────────────
import Ai21 from "@lobehub/icons/es/Ai21";
import Alibaba from "@lobehub/icons/es/Alibaba";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Arcee from "@lobehub/icons/es/Arcee";
import Baidu from "@lobehub/icons/es/Baidu";
import ByteDance from "@lobehub/icons/es/ByteDance";
import Cohere from "@lobehub/icons/es/Cohere";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import EssentialAI from "@lobehub/icons/es/EssentialAI";
import Google from "@lobehub/icons/es/Google";
import Inception from "@lobehub/icons/es/Inception";
import Kwaipilot from "@lobehub/icons/es/Kwaipilot";
import Meta from "@lobehub/icons/es/Meta";
import Minimax from "@lobehub/icons/es/Minimax";
import Mistral from "@lobehub/icons/es/Mistral";
import Moonshot from "@lobehub/icons/es/Moonshot";
import Nova from "@lobehub/icons/es/Nova";
import Nvidia from "@lobehub/icons/es/Nvidia";
import OpenAI from "@lobehub/icons/es/OpenAI";
import Qwen from "@lobehub/icons/es/Qwen";
import Relace from "@lobehub/icons/es/Relace";
import Stepfun from "@lobehub/icons/es/Stepfun";
import Upstage from "@lobehub/icons/es/Upstage";
import XAI from "@lobehub/icons/es/XAI";
import XiaomiMiMo from "@lobehub/icons/es/XiaomiMiMo";
import ZAI from "@lobehub/icons/es/ZAI";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

const PROVIDER_ICONS: Record<string, SvgIcon> = {
  "ai21": Ai21,
  "alibaba": Alibaba,
  "anthropic": Anthropic,
  "arcee-ai": Arcee,
  "baidu": Baidu,
  "bytedance-seed": ByteDance,
  "cohere": Cohere,
  "deepseek": DeepSeek,
  "essentialai": EssentialAI,
  "google": Google,
  "inception": Inception,
  "kwaipilot": Kwaipilot,
  "meta-llama": Meta,
  "minimax": Minimax,
  "mistralai": Mistral,
  "moonshotai": Moonshot,
  "amazon": Nova,
  "nvidia": Nvidia,
  "openai": OpenAI,
  "qwen": Qwen,
  "relace": Relace,
  "stepfun": Stepfun,
  "upstage": Upstage,
  "x-ai": XAI,
  "xiaomi": XiaomiMiMo,
  "z-ai": ZAI,
};

function getProviderPrefix(modelId: string): string {
  return modelId.includes("/") ? modelId.split("/")[0] : modelId.split("-")[0];
}

// ── Types ────────────────────────────────────────────────

type ApiTab = "models" | "tools" | "agents";
// type TimeRange = "4w" | "12w" | "6m" | "1y";
type SortKey = "volume" | "pricing" | "model";
type SortDir = "asc" | "desc";

interface ModelEntry {
  id: string;
  model: string;
  providers: string[];
  inputPrice: number | null;
  outputPrice: number | null;
  maxInputTokens: number;
  maxOutputTokens: number;
  modalities: string[];
  color: string;
}

// interface VolumeTimeseries {
//   timestamp: string;
//   volume_usdc: number;
// }

// interface VolumeData {
//   summary: { total_volume_usdc: number };
//   timeseries: VolumeTimeseries[];
// }

interface ApiModelResponse {
  id: string;
  providers: string[];
  max_input_tokens: number;
  max_output_tokens: number;
  input_modalities?: string[];
  pricing: {
    input_tokens: { no_cache: number };
    output_tokens: { text: number };
  };
}

// ── Provider colors (deterministic by model name) ────────

const PALETTE = [
  "#10b981", "#f97316", "#3b82f6", "#fb923c", "#8b5cf6",
  "#06b6d4", "#34d399", "#fdba74", "#60a5fa", "#ec4899",
  "#f43f5e", "#a78bfa", "#2dd4bf", "#fbbf24", "#e879f9",
];

function modelColor(id: string, index: number): string {
  return PALETTE[index % PALETTE.length];
}

// ── Time ranges ──────────────────────────────────────────

// const TIME_RANGES: { value: TimeRange; label: string; weeks: number }[] = [
//   { value: "4w", label: "4W", weeks: 4 },
//   { value: "12w", label: "12W", weeks: 12 },
//   { value: "6m", label: "6M", weeks: 26 },
//   { value: "1y", label: "1Y", weeks: 52 },
// ];

// ── Helpers ──────────────────────────────────────────────

// function formatVolume(n: number): string {
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
//   return n.toString();
// }

function formatPrice(n: number): string {
  if (n === 0) return "free";
  return `$${n.toFixed(2)}`;
}

// ── Custom tooltip ───────────────────────────────────────

// function ChartTooltip(props: TooltipProps<number, string>) {
//   const { active, payload, label } = props as {
//     active?: boolean;
//     payload?: Array<{ dataKey?: string; value?: number; color?: string }>;
//     label?: string;
//   };
//   if (!active || !payload?.length) return null;
//
//   const total = payload.reduce(
//     (sum: number, p) => sum + (Number(p.value) || 0),
//     0,
//   );
//
//   return (
//     <div className="bg-background border border-border px-4 py-3 shadow-md min-w-[200px]">
//       <div className="text-xs font-medium mb-2.5 text-foreground">{label}</div>
//       <div className="space-y-1.5">
//         {[...payload].reverse().map((entry) => (
//           <div
//             key={entry.dataKey}
//             className="flex items-center justify-between gap-6 text-[11px]"
//           >
//             <span className="flex items-center gap-2 text-muted-foreground">
//               <span
//                 className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
//                 style={{ backgroundColor: entry.color }}
//               />
//               {entry.dataKey}
//             </span>
//             <span className="tabular-nums text-foreground font-medium">
//               {formatVolume(Number(entry.value))}
//             </span>
//           </div>
//         ))}
//       </div>
//       <div className="border-t border-border mt-2.5 pt-2 flex items-center justify-between text-[11px]">
//         <span className="text-muted-foreground">Total</span>
//         <span className="tabular-nums text-foreground font-medium">
//           {formatVolume(total)}
//         </span>
//       </div>
//     </div>
//   );
// }

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
        // No volume data yet — maintain original order
        cmp = 0;
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

// ── Data fetching hooks ──────────────────────────────────

function useModels() {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bitrouter/models")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { data: ApiModelResponse[] }) => {
        const entries: ModelEntry[] = data.data.map((m, i) => ({
          id: m.id,
          model: m.id,
          providers: m.providers ?? [],
          inputPrice: m.pricing?.input_tokens?.no_cache ?? null,
          outputPrice: m.pricing?.output_tokens?.text ?? null,
          maxInputTokens: m.max_input_tokens ?? 0,
          maxOutputTokens: m.max_output_tokens ?? 0,
          modalities: m.input_modalities ?? ["text"],
          color: modelColor(m.id, i),
        }));
        setModels(entries);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { models, loading, error };
}

// function useVolume() {
//   const [volume, setVolume] = useState<VolumeData | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     fetch("/api/bitrouter/volume")
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         return res.json();
//       })
//       .then((data: VolumeData) => setVolume(data))
//       .catch(() => setVolume(null))
//       .finally(() => setLoading(false));
//   }, []);
//
//   return { volume, loading };
// }

// ── Component ────────────────────────────────────────────

export function ApisView() {
  const [activeTab] = useState<ApiTab>("models");
  // const [timeRange, setTimeRange] = useState<TimeRange>("12w");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("model");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { models, loading: modelsLoading, error: modelsError } = useModels();
  // const { volume, loading: volumeLoading } = useVolume();

  // const hasVolumeData =
  //   volume !== null &&
  //   volume.timeseries.length > 0 &&
  //   volume.summary.total_volume_usdc > 0;

  // const chartData = useMemo(() => {
  //   if (!hasVolumeData || !volume) return [];
  //   const weeks = TIME_RANGES.find((r) => r.value === timeRange)!.weeks;
  //   return volume.timeseries.slice(-weeks);
  // }, [timeRange, volume, hasVolumeData]);

  const filtered = useMemo(() => {
    let list = models;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.providers.some((p) => p.toLowerCase().includes(q)),
      );
    }
    return sortModels(list, sortKey, sortDir);
  }, [models, search, sortKey, sortDir]);

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
                placeholder="Search models or providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/30 w-full sm:w-56 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {models.length} models
              </span>
              {/* {hasVolumeData && (
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
              )} */}
            </div>
          </div>

          {/* Chart — only shown when volume data exists */}
          {/* {hasVolumeData && (
            <>
              <div className="shrink-0 px-2 pt-4 pb-2 sm:px-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                    barCategoryGap="16%"
                  >
                    <XAxis
                      dataKey="timestamp"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--muted-foreground)",
                      }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--muted-foreground)",
                      }}
                      tickFormatter={formatVolume}
                      width={48}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    />
                    <Bar
                      dataKey="volume_usdc"
                      fill={PALETTE[0]}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2.5">
                <span className="text-[11px] text-muted-foreground">
                  Network volume (USDC)
                </span>
              </div>
            </>
          )} */}

          {/* No volume data placeholder */}
          {/* {!volumeLoading && !hasVolumeData && (
            <div className="shrink-0 flex items-center justify-center border-b border-border px-4 py-8">
              <span className="text-xs text-muted-foreground/60">
                Volume data will appear here once network traffic is recorded
              </span>
            </div>
          )} */}

          {/* Loading state */}
          {modelsLoading && (
            <div className="flex-1 flex items-center justify-center py-16">
              <span className="text-xs text-muted-foreground animate-pulse">
                Loading models...
              </span>
            </div>
          )}

          {/* Error state */}
          {modelsError && !modelsLoading && (
            <div className="flex-1 flex items-center justify-center py-16">
              <span className="text-xs text-red-400">
                Failed to load models: {modelsError}
              </span>
            </div>
          )}

          {/* Table */}
          {!modelsLoading && !modelsError && (
            <div className="overflow-x-auto md:flex-1 md:min-h-0 md:overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="md:sticky md:top-0 md:z-10 bg-card">
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium w-8">#</th>
                    <SortableHeader
                      label="Model"
                      sortKey="model"
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                      align="left"
                    />
                    {/* <th className="px-4 py-2.5 font-medium text-left">
                      Providers
                    </th> */}
                    <th className="px-4 py-2.5 font-medium text-left">
                      Endpoint
                    </th>
                    <SortableHeader
                      label="Input / Output"
                      sortKey="pricing"
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <th className="px-4 py-2.5 font-medium text-right">
                      Context
                    </th>
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
                          {(() => {
                            const prefix = getProviderPrefix(entry.id);
                            const Icon = PROVIDER_ICONS[prefix];
                            return Icon ? (
                              <Icon className="shrink-0 w-4 h-4 text-muted-foreground" />
                            ) : (
                              <span
                                className="inline-block shrink-0 w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                            );
                          })()}
                          <span className="font-medium">{entry.model}</span>
                          {entry.modalities.includes("image") && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 font-normal border-border"
                            >
                              vision
                            </Badge>
                          )}
                        </span>
                      </td>
                      {/* <td className="px-4 py-2.5">
                        <span className="flex flex-wrap gap-1">
                          {entry.providers.slice(0, 3).map((p) => (
                            <span
                              key={p}
                              className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                            >
                              {p}
                            </span>
                          ))}
                          {entry.providers.length > 3 && (
                            <span className="text-[10px] text-muted-foreground/60">
                              +{entry.providers.length - 3}
                            </span>
                          )}
                        </span>
                      </td> */}
                      <td className="px-4 py-2.5">
                        <EndpointCell model={entry.model} />
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums whitespace-nowrap",
                          sortKey === "pricing" &&
                            "font-medium text-foreground",
                        )}
                      >
                        {entry.inputPrice !== null &&
                        entry.outputPrice !== null
                          ? `${formatPrice(entry.inputPrice)} / ${formatPrice(entry.outputPrice)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap text-muted-foreground">
                        {entry.maxInputTokens > 0
                          ? `${(entry.maxInputTokens / 1000).toFixed(0)}k`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground text-xs"
                      >
                        No models found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer */}
          <div className="shrink-0 flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} of {models.length} models
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
        !active &&
          !disabled &&
          "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </span>
  );
}
