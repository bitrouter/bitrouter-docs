"use client";

import * as React from "react";
import { List, Search, Table, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "list";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  filteredCount: number;
  totalCount: number;
  countLabel: (filtered: number, total: number) => string;
  resetLabel: string;
  onReset: () => void;
  loadingLabel?: string;
  isLoading?: boolean;
  /** Defaults to `query.length > 0`. Pass when other state (filters) also counts. */
  hasActiveFilters?: boolean;
  /** Rendered before the count, e.g. a mobile Filters sheet trigger. */
  mobileSlot?: React.ReactNode;
  /** When provided, renders a table/list view toggle. */
  view?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  viewLabels?: { label: string; table: string; list: string };
}

export function DataTableToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  filteredCount,
  totalCount,
  countLabel,
  resetLabel,
  onReset,
  loadingLabel,
  isLoading,
  hasActiveFilters,
  mobileSlot,
  view,
  onViewChange,
  viewLabels,
}: Props) {
  const hasActive = hasActiveFilters ?? query.length > 0;

  return (
    <div className="sticky top-12 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8 font-mono text-sm"
          />
        </div>

        {mobileSlot}

        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest tabular-nums text-muted-foreground">
            {isLoading && loadingLabel
              ? loadingLabel
              : countLabel(filteredCount, totalCount)}
          </span>
          {view && onViewChange && (
            <div
              role="group"
              aria-label={viewLabels?.label}
              className="hidden divide-x divide-border border border-border sm:inline-flex"
            >
              <ViewButton
                active={view === "table"}
                onClick={() => onViewChange("table")}
                title={viewLabels?.table}
              >
                <Table className="size-3.5" />
              </ViewButton>
              <ViewButton
                active={view === "list"}
                onClick={() => onViewChange("list")}
                title={viewLabels?.list}
              >
                <List className="size-3.5" />
              </ViewButton>
            </div>
          )}
          {hasActive && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3" />
              {resetLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "inline-flex size-9 items-center justify-center transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
