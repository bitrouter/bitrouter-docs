"use client";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen, LayoutList, Table } from "lucide-react";

export type ViewMode = "table" | "list";

interface FilterSidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  totalCount: number;
  filteredCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  children: React.ReactNode;
}

export function FilterSidebar({
  search,
  onSearchChange,
  searchPlaceholder,
  totalCount,
  filteredCount,
  collapsed,
  onToggleCollapse,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  children,
}: FilterSidebarProps) {
  if (collapsed) {
    return (
      <div className="shrink-0 border-r border-border flex flex-col items-center py-3 px-1.5 gap-3">
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Show filters"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 shrink-0 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Filters</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {filteredCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onToggleCollapse}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            title="Hide filters"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        </div>
      </div>
      <Separator />

      {/* Search + View toggle */}
      <div className="px-4 py-3 space-y-3">
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-7 text-xs"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewModeChange("table")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-colors",
              viewMode === "table"
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Table className="size-3" />
            Table
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-colors",
              viewMode === "list"
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <LayoutList className="size-3" />
            List
          </button>
        </div>
      </div>
      <Separator />

      {/* Filter sections */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-5">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}
