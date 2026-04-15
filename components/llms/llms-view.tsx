"use client";

import { useState, useMemo, useEffect, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  ModelsFilterSidebar,
  EMPTY_FILTERS,
  applyFilters,
  type ModelFilters,
  type ViewMode,
} from "@/components/llms/llms-filter-sidebar";

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
import LongCat from "@lobehub/icons/es/LongCat";
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
  "meituan": LongCat,
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

type SortKey = "volume" | "pricing" | "model";
type SortDir = "asc" | "desc";

interface ModelEntry {
  id: string;
  model: string;
  name: string;
  providers: string[];
  inputPrice: number | null;
  outputPrice: number | null;
  maxInputTokens: number;
  maxOutputTokens: number;
  modalities: string[];
  color: string;
}

interface ApiModelResponse {
  id: string;
  name?: string;
  providers: string[];
  max_input_tokens: number;
  max_output_tokens: number;
  input_modalities?: string[];
  pricing: {
    input_tokens: { no_cache: number };
    output_tokens: { text: number };
  };
}

// ── Provider colors ──────────────────────────────────────

const PALETTE = [
  "#10b981", "#f97316", "#3b82f6", "#fb923c", "#8b5cf6",
  "#06b6d4", "#34d399", "#fdba74", "#60a5fa", "#ec4899",
  "#f43f5e", "#a78bfa", "#2dd4bf", "#fbbf24", "#e879f9",
];

function modelColor(_id: string, index: number): string {
  return PALETTE[index % PALETTE.length];
}

// ── Helpers ──────────────────────────────────────────────

function formatPrice(n: number): string {
  if (n === 0) return "free";
  return `$${n.toFixed(2)}`;
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

// ── Data fetching ────────────────────────────────────────

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
          name: m.name ?? m.id,
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

// ── Component ────────────────────────────────────────────

export function LlmsView({ banner }: { banner?: React.ReactNode } = {}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("model");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<ModelFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const { models, loading: modelsLoading, error: modelsError } = useModels();

  const availableProviders = useMemo(() => {
    const set = new Set<string>();
    for (const m of models) {
      for (const key of Object.keys(PROVIDER_ICONS)) {
        if (m.id.startsWith(key)) {
          set.add(key);
          break;
        }
      }
      const prefix = getProviderPrefix(m.id);
      set.add(prefix);
    }
    return Array.from(set);
  }, [models]);

  const availableModalities = useMemo(() => {
    const set = new Set<string>();
    for (const m of models) {
      for (const mod of m.modalities) set.add(mod);
    }
    return Array.from(set);
  }, [models]);

  const filteredModels = useMemo(() => {
    let list = applyFilters(models, filters);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.providers.some((p) => p.toLowerCase().includes(q)),
      );
    }
    return sortModels(list, sortKey, sortDir);
  }, [models, search, sortKey, sortDir, filters]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "model" ? "asc" : "desc");
    }
  };

  return (
    <SidebarProvider className="min-h-0 h-full">
      {/* Sidebar */}
      <ModelsFilterSidebar
        filters={filters}
        onChange={setFilters}
        availableProviders={availableProviders}
        availableModalities={availableModalities}
        search={search}
        onSearchChange={setSearch}
        totalCount={models.length}
        filteredCount={filteredModels.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        banner={banner}
      />

      {/* Main content */}
      <SidebarInset className="flex flex-col">
        {/* Hero */}
        <div className="shrink-0 border-b border-border px-6 py-5">
          <h2 className="text-sm font-semibold mb-1">Curated LLMs for Agent Harnesses</h2>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            We curate and test LLMs specifically for agent harness use cases. Try them in the console or route via CLI + agent skills.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <a
              href="https://console.bitrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:bg-foreground/90 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Open Console
            </a>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
              <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <code className="text-[11px] text-muted-foreground font-mono">
                bitrouter config set default-provider openai
              </code>
            </div>
          </div>
        </div>

        {/* Loading */}
        {modelsLoading && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-muted-foreground animate-pulse">
              Loading models...
            </span>
          </div>
        )}

        {/* Error */}
        {modelsError && !modelsLoading && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-red-400">
              Failed to load models: {modelsError}
            </span>
          </div>
        )}

        {/* Content */}
        {!modelsLoading && !modelsError && (
          <>
            {viewMode === "table" ? (
              <ModelsTable
                models={filteredModels}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
            ) : (
              <ModelsList models={filteredModels} />
            )}

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between border-t border-border px-4 py-2">
              <span className="text-[11px] text-muted-foreground">
                {`${filteredModels.length} of ${models.length} models`}
                {search && ` · matching "${search}"`}
              </span>
              {viewMode === "table" && (
                <span className="text-[11px] text-muted-foreground">
                  Sorted by {sortKey} {sortDir === "desc" ? "↓" : "↑"}
                </span>
              )}
            </div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Table view ───────────────────────────────────────────

function ModelsTable({
  models,
  sortKey,
  sortDir,
  onSort,
}: {
  models: ModelEntry[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-background">
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium w-8">#</th>
            <SortableHeader
              label="Model"
              sortKey="model"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              align="left"
            />
            <th className="px-4 py-2.5 font-medium text-left">Endpoint</th>
            <SortableHeader
              label="Input / Output"
              sortKey="pricing"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <th className="px-4 py-2.5 font-medium text-right">Context</th>
          </tr>
        </thead>
        <tbody>
          {models.map((entry, i) => (
            <tr
              key={entry.id}
              className="border-b border-border/30 transition-colors hover:bg-muted/10"
            >
              <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                {i + 1}
              </td>
              <td className="px-4 py-2.5">
                <ModelName entry={entry} />
              </td>
              <td className="px-4 py-2.5">
                <EndpointCell model={entry.model} />
              </td>
              <td
                className={cn(
                  "px-4 py-2.5 text-right tabular-nums whitespace-nowrap",
                  sortKey === "pricing" && "font-medium text-foreground",
                )}
              >
                {entry.inputPrice !== null && entry.outputPrice !== null
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
          {models.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-muted-foreground text-xs"
              >
                No models match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── List view ────────────────────────────────────────────

function ModelsList({ models }: { models: ModelEntry[] }) {
  if (models.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          No models match the current filters.
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="divide-y divide-border/30">
        {models.map((entry) => {
          const modalityList = entry.modalities
            .map((m) =>
              m === "image" ? "Vision" : m.charAt(0).toUpperCase() + m.slice(1),
            )
            .join(", ");
          const contextLabel =
            entry.maxInputTokens > 0
              ? `${(entry.maxInputTokens / 1000).toFixed(0)}k context`
              : "";
          const description = [modalityList, contextLabel]
            .filter(Boolean)
            .join(" · ");
          const endpoint = `v1/chat/completions?model=${entry.model}`;

          return (
            <Link
              key={entry.id}
              href={`/llms/${encodeURIComponent(entry.model)}`}
              className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/10 group"
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {(() => {
                  const prefix = getProviderPrefix(entry.id);
                  const Icon = PROVIDER_ICONS[prefix];
                  return Icon ? (
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <span
                      className="inline-block w-3 h-3 rounded-full mt-1"
                      style={{ backgroundColor: entry.color }}
                    />
                  );
                })()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium group-hover:text-foreground/80 transition-colors truncate">
                    {entry.name}
                  </span>
                  {entry.modalities.includes("image") && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 font-normal border-border shrink-0"
                    >
                      vision
                    </Badge>
                  )}
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
                    {entry.inputPrice !== null && entry.outputPrice !== null
                      ? `${formatPrice(entry.inputPrice)} / ${formatPrice(entry.outputPrice)}`
                      : "—"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>

                {/* Endpoint */}
                <code className="text-[11px] text-muted-foreground/60 mt-1.5 block truncate">
                  {endpoint}
                </code>
              </div>

              {/* Arrow */}
              <svg
                className="shrink-0 w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────

function ModelName({ entry }: { entry: ModelEntry }) {
  const prefix = getProviderPrefix(entry.id);
  const Icon = PROVIDER_ICONS[prefix];

  return (
    <span className="flex items-center gap-2">
      {Icon ? (
        <Icon className="shrink-0 w-4 h-4 text-muted-foreground" />
      ) : (
        <span
          className="inline-block shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
      )}
      <Link
        href={`/llms/${encodeURIComponent(entry.model)}`}
        className="font-medium hover:text-foreground/80 transition-colors"
      >
        {entry.model}
      </Link>
      {entry.modalities.includes("image") && (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 font-normal border-border"
        >
          vision
        </Badge>
      )}
    </span>
  );
}

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
