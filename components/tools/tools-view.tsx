"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { LayoutList, Table } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  ToolsFilterSidebar,
  EMPTY_FILTERS,
  applyToolFilters,
  type ToolFilters,
  type ViewMode,
} from "@/components/tools/tools-filter-sidebar";
import {
  MOCK_TOOLS,
  TOOL_CATEGORIES,
  PROVIDER_LABELS,
  type ToolEntry,
} from "@/components/tools/tools-mock-data";

// ── Sort logic ──────────────────────────────────────────

type SortKey = "name" | "provider" | "pricing";
type SortDir = "asc" | "desc";

function sortTools(
  entries: ToolEntry[],
  key: SortKey,
  dir: SortDir,
): ToolEntry[] {
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "provider":
        cmp = a.provider.localeCompare(b.provider);
        break;
      case "pricing": {
        const order = { free: 0, freemium: 1, paid: 2 };
        cmp = order[a.pricing] - order[b.pricing];
        break;
      }
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

// ── Category helpers ────────────────────────────────────

const CATEGORY_LABEL_MAP = Object.fromEntries(
  TOOL_CATEGORIES.map((c) => [c.value, c.label]),
);

function CategoryBadges({ categories }: { categories: string[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {categories.map((cat) => (
        <Badge
          key={cat}
          variant="outline"
          className="text-[9px] px-1.5 py-0 font-normal border-border"
        >
          {CATEGORY_LABEL_MAP[cat] ?? cat}
        </Badge>
      ))}
    </span>
  );
}

function PricingBadge({ pricing }: { pricing: string }) {
  return (
    <span
      className={cn(
        "text-xs capitalize",
        pricing === "free" && "text-emerald-500",
        pricing === "paid" && "text-amber-500",
        pricing === "freemium" && "text-blue-500",
      )}
    >
      {pricing}
    </span>
  );
}

// ── Endpoint cell with copy ────────────────────────────

function EndpointCell({ toolId }: { toolId: string }) {
  const [copied, setCopied] = useState(false);
  const endpoint = `v1/tools/${toolId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span className="group/ep flex items-center gap-2">
      <code className="text-[11px] text-muted-foreground">{endpoint}</code>
      <button
        onClick={(e) => { e.preventDefault(); handleCopy(); }}
        className="shrink-0 opacity-0 group-hover/ep:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
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

// ── Component ───────────────────────────────────────────

export function ToolsView({ banner }: { banner?: React.ReactNode } = {}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<ToolFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const tools = MOCK_TOOLS;

  const availableProviders = useMemo(() => {
    const set = new Set<string>();
    for (const t of tools) set.add(t.provider);
    return Array.from(set);
  }, [tools]);

  const filteredTools = useMemo(() => {
    let list = applyToolFilters(tools, filters);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.provider.toLowerCase().includes(q) ||
          t.categories.some((c) => c.toLowerCase().includes(q)),
      );
    }
    return sortTools(list, sortKey, sortDir);
  }, [tools, search, sortKey, sortDir, filters]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  return (
    <SidebarProvider className="min-h-0 h-full">
      {/* Sidebar */}
      <ToolsFilterSidebar
        filters={filters}
        onChange={setFilters}
        availableProviders={availableProviders}
        banner={banner}
      />

      {/* Main content */}
      <SidebarInset className="flex flex-col">
        {/* Hero */}
        <div className="shrink-0 border-b border-border px-6 py-5">
          <h2 className="text-sm font-semibold mb-1">Curated Tools for Agent Harnesses</h2>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            We curate and test tools specifically for agent harness use cases. Try them in the console or integrate via CLI + agent skills.
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
                bitrouter tools list --category agent-skill
              </code>
            </div>
          </div>
        </div>

        {/* Search + View toggle */}
        <div className="shrink-0 flex items-center gap-3 border-b border-border px-6 py-2">
          <Input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 max-w-xs text-xs"
          />
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[11px] transition-colors",
                viewMode === "table"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Table className="size-3" />
              Table
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[11px] transition-colors",
                viewMode === "list"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <LayoutList className="size-3" />
              List
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
          <ToolsTable
            tools={filteredTools}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ) : (
          <ToolsList tools={filteredTools} />
        )}

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-[11px] text-muted-foreground">
            {`${filteredTools.length} of ${tools.length} tools`}
            {search && ` · matching "${search}"`}
          </span>
          {viewMode === "table" && (
            <span className="text-[11px] text-muted-foreground">
              Sorted by {sortKey} {sortDir === "desc" ? "\u2193" : "\u2191"}
            </span>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Table view ──────────────────────────────────────────

function ToolsTable({
  tools,
  sortKey,
  sortDir,
  onSort,
}: {
  tools: ToolEntry[];
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
              label="Tool"
              sortKey="name"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              align="left"
            />
            <th className="px-4 py-2.5 font-medium text-left">Endpoint</th>
            <th className="px-4 py-2.5 font-medium text-left">Categories</th>
            <SortableHeader
              label="Provider"
              sortKey="provider"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              align="left"
            />
            <SortableHeader
              label="Pricing"
              sortKey="pricing"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {tools.map((entry, i) => (
            <tr
              key={entry.id}
              className="border-b border-border/30 transition-colors hover:bg-muted/10"
            >
              <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                {i + 1}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  href={`/tools/${encodeURIComponent(entry.id)}`}
                  className="font-medium hover:text-foreground/80 transition-colors"
                >
                  {entry.name}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <EndpointCell toolId={entry.id} />
              </td>
              <td className="px-4 py-2.5">
                <CategoryBadges categories={entry.categories} />
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {PROVIDER_LABELS[entry.provider] ?? entry.provider}
              </td>
              <td className="px-4 py-2.5 text-right">
                <PricingBadge pricing={entry.pricing} />
              </td>
            </tr>
          ))}
          {tools.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-muted-foreground text-xs"
              >
                No tools match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── List view ───────────────────────────────────────────

function ToolsList({ tools }: { tools: ToolEntry[] }) {
  if (tools.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          No tools match the current filters.
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="divide-y divide-border/30">
        {tools.map((entry) => (
          <Link
            key={entry.id}
            href={`/tools/${encodeURIComponent(entry.id)}`}
            className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/10 group"
          >
            {/* Icon placeholder */}
            <div className="shrink-0 mt-0.5 w-5 h-5 rounded bg-muted flex items-center justify-center">
              <span className="text-[10px] font-semibold text-muted-foreground">
                {entry.name.charAt(0)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium group-hover:text-foreground/80 transition-colors truncate">
                  {entry.name}
                </span>
                <span className="ml-auto shrink-0">
                  <PricingBadge pricing={entry.pricing} />
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {entry.description}
              </p>

              {/* Categories + Provider */}
              <div className="flex items-center gap-2 mt-2">
                <CategoryBadges categories={entry.categories} />
                <span className="text-[10px] text-muted-foreground/60">
                  {PROVIDER_LABELS[entry.provider] ?? entry.provider}
                </span>
              </div>

              {/* Endpoint */}
              <code className="text-[11px] text-muted-foreground/60 mt-1.5 block truncate">
                v1/tools/{entry.id}
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
        ))}
      </div>
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────

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
          {sortDir === "desc" ? " \u2193" : " \u2191"}
        </span>
      )}
    </th>
  );
}
