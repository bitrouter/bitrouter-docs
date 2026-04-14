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
  AGENT_CATEGORIES,
  PROVIDER_LABELS,
  LICENSE_OPTIONS,
  type AgentEntry,
} from "@/components/agents/agents-mock-data";

// ── Filter types ────────────────────────────────────────

export interface AgentFilters {
  categories: Set<string>;
  providers: Set<string>;
  license: string | null;
}

export type { ViewMode };

export const EMPTY_FILTERS: AgentFilters = {
  categories: new Set(),
  providers: new Set(),
  license: null,
};

// ── Filter logic ────────────────────────────────────────

export function applyAgentFilters(
  agents: AgentEntry[],
  filters: AgentFilters,
) {
  return agents.filter((a) => {
    if (filters.categories.size > 0) {
      const hasCategory = Array.from(filters.categories).some((c) =>
        a.categories.includes(c),
      );
      if (!hasCategory) return false;
    }

    if (filters.providers.size > 0) {
      if (!filters.providers.has(a.provider)) return false;
    }

    if (filters.license) {
      if (a.license !== filters.license) return false;
    }

    return true;
  });
}

// ── Sidebar component ───────────────────────────────────

interface AgentsFilterSidebarProps {
  filters: AgentFilters;
  onChange: (filters: AgentFilters) => void;
  availableProviders: string[];
  search: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function AgentsFilterSidebar({
  filters,
  onChange,
  availableProviders,
  search,
  onSearchChange,
  totalCount,
  filteredCount,
  collapsed,
  onToggleCollapse,
  viewMode,
  onViewModeChange,
}: AgentsFilterSidebarProps) {
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

  const setLicense = (value: string) => {
    onChange({
      ...filters,
      license: filters.license === value ? null : value,
    });
  };

  const hasActiveFilters =
    filters.categories.size > 0 ||
    filters.providers.size > 0 ||
    filters.license !== null;

  const sortedProviders = [...availableProviders].sort((a, b) => {
    const la = PROVIDER_LABELS[a] ?? a;
    const lb = PROVIDER_LABELS[b] ?? b;
    return la.localeCompare(lb);
  });

  return (
    <FilterSidebar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search agents..."
      totalCount={totalCount}
      filteredCount={filteredCount}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={() => onChange(EMPTY_FILTERS)}
    >
      {/* Category filter */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {AGENT_CATEGORIES.map((cat) => (
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

      {/* License filter */}
      <FilterSection title="License">
        <div className="space-y-1">
          {LICENSE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setLicense(option.value)}
              className={cn(
                "w-full text-left text-xs px-2 py-1 rounded transition-colors",
                filters.license === option.value
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
