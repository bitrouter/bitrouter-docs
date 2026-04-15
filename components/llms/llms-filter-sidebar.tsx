"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FilterSidebar,
  FilterSection,
  type ViewMode,
} from "@/components/shared/filter-sidebar";

// ── Filter types ────────────────────────────────────────

export interface ModelFilters {
  providers: Set<string>;
  modalities: Set<string>;
  contextRange: string | null;
  priceRange: string | null;
}

export type { ViewMode };

export const EMPTY_FILTERS: ModelFilters = {
  providers: new Set(),
  modalities: new Set(),
  contextRange: null,
  priceRange: null,
};

// ── Constants ───────────────────────────────────────────

const CONTEXT_RANGES = [
  { value: "32k", label: "< 32k" },
  { value: "128k", label: "32k \u2013 128k" },
  { value: "1m", label: "128k \u2013 1M" },
  { value: "1m+", label: "1M+" },
] as const;

const PRICE_RANGES = [
  { value: "free", label: "Free" },
  { value: "1", label: "< $1" },
  { value: "10", label: "$1 \u2013 $10" },
  { value: "10+", label: "$10+" },
] as const;

// ── Pretty provider names ───────────────────────────────

const PROVIDER_LABELS: Record<string, string> = {
  "anthropic": "Anthropic",
  "openai": "OpenAI",
  "google": "Google",
  "meta-llama": "Meta",
  "mistralai": "Mistral",
  "deepseek": "DeepSeek",
  "x-ai": "xAI",
  "qwen": "Qwen",
  "nvidia": "NVIDIA",
  "bytedance-seed": "ByteDance",
  "baidu": "Baidu",
  "minimax": "MiniMax",
  "stepfun": "StepFun",
  "moonshotai": "Moonshot",
  "inception": "Inception",
  "kwaipilot": "Kwaipilot",
  "meituan": "Meituan",
  "xiaomi": "Xiaomi",
  "z-ai": "Z AI",
};

const MODALITY_LABELS: Record<string, string> = {
  text: "Text",
  image: "Vision",
  audio: "Audio",
  video: "Video",
  file: "File",
};

// ── Filter helpers ──────────────────────────────────────

export function applyFilters(
  models: Array<{
    id: string;
    providers: string[];
    modalities: string[];
    inputPrice: number | null;
    maxInputTokens: number;
  }>,
  filters: ModelFilters,
) {
  return models.filter((m) => {
    if (filters.providers.size > 0) {
      const matchesProvider = Array.from(filters.providers).some((p) =>
        m.id.startsWith(p),
      );
      const prefix = m.id.includes("/") ? m.id.split("/")[0] : m.id.split("-")[0];
      if (!matchesProvider && !filters.providers.has(prefix)) return false;
    }

    if (filters.modalities.size > 0) {
      const hasModality = Array.from(filters.modalities).some((mod) =>
        m.modalities.includes(mod),
      );
      if (!hasModality) return false;
    }

    if (filters.contextRange) {
      const ctx = m.maxInputTokens;
      switch (filters.contextRange) {
        case "32k":
          if (ctx >= 32_000) return false;
          break;
        case "128k":
          if (ctx < 32_000 || ctx > 128_000) return false;
          break;
        case "1m":
          if (ctx < 128_000 || ctx > 1_000_000) return false;
          break;
        case "1m+":
          if (ctx <= 1_000_000) return false;
          break;
      }
    }

    if (filters.priceRange) {
      const price = m.inputPrice;
      if (price === null) return false;
      switch (filters.priceRange) {
        case "free":
          if (price !== 0) return false;
          break;
        case "1":
          if (price >= 1) return false;
          break;
        case "10":
          if (price < 1 || price >= 10) return false;
          break;
        case "10+":
          if (price < 10) return false;
          break;
      }
    }

    return true;
  });
}

// ── Sidebar component ───────────────────────────────────

interface ModelsFilterSidebarProps {
  filters: ModelFilters;
  onChange: (filters: ModelFilters) => void;
  availableProviders: string[];
  availableModalities: string[];
  search: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  banner?: React.ReactNode;
}

export function ModelsFilterSidebar({
  filters,
  onChange,
  availableProviders,
  availableModalities,
  search,
  onSearchChange,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  banner,
}: ModelsFilterSidebarProps) {
  const sortedProviders = useMemo(
    () =>
      [...availableProviders].sort((a, b) => {
        const la = PROVIDER_LABELS[a] ?? a;
        const lb = PROVIDER_LABELS[b] ?? b;
        return la.localeCompare(lb);
      }),
    [availableProviders],
  );

  const toggleProvider = (provider: string) => {
    const next = new Set(filters.providers);
    if (next.has(provider)) next.delete(provider);
    else next.add(provider);
    onChange({ ...filters, providers: next });
  };

  const toggleModality = (modality: string) => {
    const next = new Set(filters.modalities);
    if (next.has(modality)) next.delete(modality);
    else next.add(modality);
    onChange({ ...filters, modalities: next });
  };

  const setContextRange = (value: string) => {
    onChange({
      ...filters,
      contextRange: filters.contextRange === value ? null : value,
    });
  };

  const setPriceRange = (value: string) => {
    onChange({
      ...filters,
      priceRange: filters.priceRange === value ? null : value,
    });
  };

  const hasActiveFilters =
    filters.providers.size > 0 ||
    filters.modalities.size > 0 ||
    filters.contextRange !== null ||
    filters.priceRange !== null;

  return (
    <FilterSidebar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search models..."
      totalCount={totalCount}
      filteredCount={filteredCount}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={() => onChange(EMPTY_FILTERS)}
      banner={banner}
    >
      {/* Provider filter */}
      <FilterSection title="Provider">
        <div className="space-y-2">
          {sortedProviders.map((provider) => (
            <label
              key={provider}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.providers.has(provider)}
                onCheckedChange={() => toggleProvider(provider)}
                className="size-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {PROVIDER_LABELS[provider] ?? provider}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Modality filter */}
      <FilterSection title="Modality">
        <div className="space-y-2">
          {availableModalities.map((modality) => (
            <label
              key={modality}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.modalities.has(modality)}
                onCheckedChange={() => toggleModality(modality)}
                className="size-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {MODALITY_LABELS[modality] ?? modality}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Context window filter */}
      <FilterSection title="Context Window">
        <div className="space-y-1">
          {CONTEXT_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setContextRange(range.value)}
              className={cn(
                "w-full text-left text-xs px-2 py-1 rounded transition-colors",
                filters.contextRange === range.value
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Price range filter */}
      <FilterSection title="Input Price / 1M tokens">
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setPriceRange(range.value)}
              className={cn(
                "w-full text-left text-xs px-2 py-1 rounded transition-colors",
                filters.priceRange === range.value
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </FilterSidebar>
  );
}
