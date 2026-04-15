"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AgentsFilterSidebar,
  EMPTY_FILTERS,
  applyAgentFilters,
  type AgentFilters,
  type ViewMode,
} from "@/components/agents/agents-filter-sidebar";
import {
  MOCK_AGENTS,
  AGENT_CATEGORIES,
  PROVIDER_LABELS,
  type AgentEntry,
} from "@/components/agents/agents-mock-data";

// ── Sort logic ──────────────────────────────────────────

type SortKey = "name" | "provider" | "license";
type SortDir = "asc" | "desc";

function sortAgents(
  entries: AgentEntry[],
  key: SortKey,
  dir: SortDir,
): AgentEntry[] {
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "provider":
        cmp = a.provider.localeCompare(b.provider);
        break;
      case "license":
        cmp = a.license.localeCompare(b.license);
        break;
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

// ── Category helpers ────────────────────────────────────

const CATEGORY_LABEL_MAP = Object.fromEntries(
  AGENT_CATEGORIES.map((c) => [c.value, c.label]),
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

function LicenseBadge({ license }: { license: string }) {
  return (
    <span
      className={cn(
        "text-xs capitalize",
        license === "open-source" && "text-emerald-500",
        license === "proprietary" && "text-amber-500",
      )}
    >
      {license === "open-source" ? "Open Source" : "Proprietary"}
    </span>
  );
}


// ── Component ───────────────────────────────────────────

export function AgentsView() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<AgentFilters>(EMPTY_FILTERS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const agents = MOCK_AGENTS;

  const availableProviders = useMemo(() => {
    const set = new Set<string>();
    for (const a of agents) set.add(a.provider);
    return Array.from(set);
  }, [agents]);

  const filteredAgents = useMemo(() => {
    let list = applyAgentFilters(agents, filters);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.provider.toLowerCase().includes(q) ||
          a.categories.some((c) => c.toLowerCase().includes(q)),
      );
    }
    return sortAgents(list, sortKey, sortDir);
  }, [agents, search, sortKey, sortDir, filters]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <AgentsFilterSidebar
        filters={filters}
        onChange={setFilters}
        availableProviders={availableProviders}
        search={search}
        onSearchChange={setSearch}
        totalCount={agents.length}
        filteredCount={filteredAgents.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Hero */}
        <div className="shrink-0 border-b border-border px-6 py-5">
          <h2 className="text-sm font-semibold mb-1">Spawn Any Trending Agent Harness Locally</h2>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Spin up agent harnesses on your machine with <span className="font-medium text-foreground/80">bitrouter-proxy</span> built in. Cloud spawn coming soon.
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
                bitrouter agents spawn claude-code
              </code>
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <AgentsTable
            agents={filteredAgents}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ) : (
          <AgentsList agents={filteredAgents} />
        )}

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-[11px] text-muted-foreground">
            {`${filteredAgents.length} of ${agents.length} agents`}
            {search && ` · matching "${search}"`}
          </span>
          {viewMode === "table" && (
            <span className="text-[11px] text-muted-foreground">
              Sorted by {sortKey} {sortDir === "desc" ? "\u2193" : "\u2191"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Table view ──────────────────────────────────────────

function AgentsTable({
  agents,
  sortKey,
  sortDir,
  onSort,
}: {
  agents: AgentEntry[];
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
              label="Agent"
              sortKey="name"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              align="left"
            />
            <th className="px-4 py-2.5 font-medium text-left">Description</th>
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
              label="License"
              sortKey="license"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {agents.map((entry, i) => (
            <tr
              key={entry.id}
              className="border-b border-border/30 transition-colors hover:bg-muted/10"
            >
              <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                {i + 1}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  href={`/agents/${encodeURIComponent(entry.id)}`}
                  className="font-medium hover:text-foreground/80 transition-colors"
                >
                  {entry.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-xs truncate">
                {entry.description}
              </td>
              <td className="px-4 py-2.5">
                <CategoryBadges categories={entry.categories} />
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {PROVIDER_LABELS[entry.provider] ?? entry.provider}
              </td>
              <td className="px-4 py-2.5 text-right">
                <LicenseBadge license={entry.license} />
              </td>
            </tr>
          ))}
          {agents.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-muted-foreground text-xs"
              >
                No agents match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── List view ───────────────────────────────────────────

function AgentsList({ agents }: { agents: AgentEntry[] }) {
  if (agents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          No agents match the current filters.
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="divide-y divide-border/30">
        {agents.map((entry) => (
          <Link
            key={entry.id}
            href={`/agents/${encodeURIComponent(entry.id)}`}
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
                  <LicenseBadge license={entry.license} />
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
