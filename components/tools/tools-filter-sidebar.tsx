"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FilterSidebar,
  FilterSection,
  type ViewMode,
} from "@/components/shared/filter-sidebar";
import {
  TOOL_CATEGORIES,
  PROVIDER_LABELS,
  type ToolEntry,
} from "@/components/tools/tools-mock-data";

// ── Filter types ────────────────────────────────────────

export interface ToolFilters {
  categories: Set<string>;
  providers: Set<string>;
  pricing: string | null;
}

export type { ViewMode };

export const EMPTY_FILTERS: ToolFilters = {
  categories: new Set(),
  providers: new Set(),
  pricing: null,
};

const PRICING_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
] as const;

// ── Filter logic ────────────────────────────────────────

export function applyToolFilters(
  tools: ToolEntry[],
  filters: ToolFilters,
) {
  return tools.filter((t) => {
    if (filters.categories.size > 0) {
      const hasCategory = Array.from(filters.categories).some((c) =>
        t.categories.includes(c),
      );
      if (!hasCategory) return false;
    }

    if (filters.providers.size > 0) {
      if (!filters.providers.has(t.provider)) return false;
    }

    if (filters.pricing) {
      if (t.pricing !== filters.pricing) return false;
    }

    return true;
  });
}

// ── Sidebar component ───────────────────────────────────

interface ToolsFilterSidebarProps {
  filters: ToolFilters;
  onChange: (filters: ToolFilters) => void;
  availableProviders: string[];
  banner?: React.ReactNode;
}

export function ToolsFilterSidebar({
  filters,
  onChange,
  availableProviders,
  banner,
}: ToolsFilterSidebarProps) {
  const toggleCategory = (category: string) => {
    const next = new Set(filters.categories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    onChange({ ...filters, categories: next });
  };

  const toggleProvider = (provider: string) => {
    const next = new Set(filters.providers);
    if (next.has(provider)) next.delete(provider);
    else next.add(provider);
    onChange({ ...filters, providers: next });
  };

  const setPricing = (value: string) => {
    onChange({
      ...filters,
      pricing: filters.pricing === value ? null : value,
    });
  };

  const hasActiveFilters =
    filters.categories.size > 0 ||
    filters.providers.size > 0 ||
    filters.pricing !== null;

  const sortedProviders = [...availableProviders].sort((a, b) => {
    const la = PROVIDER_LABELS[a] ?? a;
    const lb = PROVIDER_LABELS[b] ?? b;
    return la.localeCompare(lb);
  });

  return (
    <FilterSidebar
      banner={banner}
    >
      {/* Category filter */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {TOOL_CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.categories.has(cat.value)}
                onCheckedChange={() => toggleCategory(cat.value)}
                className="size-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

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

      {/* Pricing filter */}
      <FilterSection title="Pricing">
        <div className="space-y-1">
          {PRICING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPricing(option.value)}
              className={cn(
                "w-full text-left text-xs px-2 py-1 rounded transition-colors",
                filters.pricing === option.value
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </FilterSidebar>
  );
}
