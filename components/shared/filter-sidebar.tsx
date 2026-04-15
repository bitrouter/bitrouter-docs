"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LayoutList, Table } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export type ViewMode = "table" | "list";

interface FilterSidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  totalCount: number;
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** Optional content rendered inside the sidebar header (e.g., type tabs) */
  banner?: React.ReactNode;
  children: React.ReactNode;
}

export function FilterSidebar({
  search,
  onSearchChange,
  searchPlaceholder,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  banner,
  children,
}: FilterSidebarProps) {
  return (
    <Sidebar collapsible="none">
      {/* Banner (e.g., type tabs) */}
      {banner && (
        <SidebarHeader className="p-0">
          {banner}
        </SidebarHeader>
      )}

      {/* Filter header */}
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-sidebar-foreground">Filters</span>
          <span className="text-[10px] text-sidebar-foreground/50 tabular-nums">
            {filteredCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-[10px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <SidebarTrigger className="size-6" />
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />

      {/* Search + View toggle */}
      <SidebarGroup className="px-4 py-3">
        <div className="space-y-3">
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
                "flex items-center gap-1.5 px-2 py-1 text-[11px] transition-colors",
                viewMode === "table"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Table className="size-3" />
              Table
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[11px] transition-colors",
                viewMode === "list"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <LayoutList className="size-3" />
              List
            </button>
          </div>
        </div>
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />

      {/* Filter sections */}
      <SidebarContent>
        <SidebarGroup className="px-4 py-3">
          <SidebarGroupContent className="space-y-5">
            {children}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
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
      <h4 className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}
