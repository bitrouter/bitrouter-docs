"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight, BookOpen, ChevronRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DataTableToolbar,
  type ViewMode,
} from "@/components/ui/data-table-toolbar";
import {
  FilterSidebar,
  FilterSheetTrigger,
  clearFilterGroup,
  countActive,
  toggleFilterValue,
  type FilterGroupDef,
  type FilterState,
} from "@/components/ui/filter-sidebar";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import type { Provider } from "@/lib/providers-types";

const REGISTRY_URL = "https://github.com/bitrouter/provider-registry";
const REGISTRY_NEW_PR_URL =
  "https://github.com/bitrouter/provider-registry/new/main/providers";
const PROVIDER_DOCS_URL = "/docs/guides/register-as-a-provider";

function summarizeProtocols(p: Provider): string {
  const values = new Set(Object.values(p.apiProtocol));
  if (values.size === 0) return "—";
  return Array.from(values).join(" · ");
}

function summarizeRateLimit(p: Provider): string {
  if (p.rateLimits.length === 0) return "—";
  const wild = p.rateLimits.find((r) => r.scope === "*") ?? p.rateLimits[0];
  const parts: string[] = [];
  if (wild.requestsPerMinute !== null) parts.push(`${wild.requestsPerMinute} rpm`);
  if (wild.tokensPerMinute !== null) parts.push(`${wild.tokensPerMinute} tpm`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function cheapestInput(p: Provider): number | null {
  const prices = p.models
    .map((m) => m.pricing.inputNoCache)
    .filter((n) => n > 0);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

function providerProtocols(p: Provider): string[] {
  return Array.from(new Set(Object.values(p.apiProtocol)));
}

export function ProvidersTable({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const t = useTranslations("Providers");
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({});
  const [view, setView] = React.useState<ViewMode>("table");

  const totalModels = React.useMemo(
    () => providers.reduce((n, p) => n + p.models.length, 0),
    [providers],
  );
  const totalProtocols = React.useMemo(
    () => new Set(providers.flatMap((p) => Object.values(p.apiProtocol))).size,
    [providers],
  );

  const groups = React.useMemo<FilterGroupDef[]>(() => {
    const statusCounts = new Map<string, number>();
    const protocolCounts = new Map<string, number>();
    for (const p of providers) {
      statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
      for (const proto of providerProtocols(p)) {
        protocolCounts.set(proto, (protocolCounts.get(proto) ?? 0) + 1);
      }
    }
    const statusOptions = Array.from(statusCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: value, count }));
    const protocolOptions = Array.from(protocolCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: value, count }));

    return [
      { id: "status", label: t("filterStatus"), options: statusOptions },
      { id: "protocol", label: t("filterProtocol"), options: protocolOptions },
    ];
  }, [providers, t]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const statusSel = filters.status;
    const protocolSel = filters.protocol;
    return providers.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) {
        return false;
      }
      if (statusSel && statusSel.size > 0 && !statusSel.has(p.status)) {
        return false;
      }
      if (protocolSel && protocolSel.size > 0) {
        const hasProto = providerProtocols(p).some((proto) =>
          protocolSel.has(proto),
        );
        if (!hasProto) return false;
      }
      return true;
    });
  }, [providers, query, filters]);

  const columns = React.useMemo<ColumnDef<Provider>[]>(
    () => [
      {
        id: "provider",
        accessorFn: (p) => p.name,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderProvider")}
          />
        ),
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/providers/${p.slug}`}
                  className="truncate text-sm font-medium tracking-tight text-foreground outline-none focus-visible:underline"
                >
                  {p.name}
                </Link>
                <StatusDot status={p.status} />
              </div>
              <code className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
                providers/{p.slug}.yaml
              </code>
            </div>
          );
        },
        sortingFn: "alphanumeric",
      },
      {
        id: "models",
        accessorFn: (p) => p.models.length,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("rowModels")} />
        ),
        cell: ({ getValue }) => getValue<number>(),
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName:
            "hidden font-mono text-xs tabular-nums text-muted-foreground md:table-cell",
        },
      },
      {
        id: "protocols",
        accessorFn: (p) => summarizeProtocols(p),
        enableSorting: false,
        header: () => <span>{t("rowProtocols")}</span>,
        cell: ({ getValue }) => getValue<string>(),
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName:
            "hidden font-mono text-[12px] text-muted-foreground md:table-cell",
        },
      },
      {
        id: "rate",
        accessorFn: (p) => summarizeRateLimit(p),
        enableSorting: false,
        header: () => <span>{t("rowRate")}</span>,
        cell: ({ getValue }) => getValue<string>(),
        meta: {
          headerClassName: "hidden lg:table-cell",
          cellClassName:
            "hidden font-mono text-[12px] text-muted-foreground lg:table-cell",
        },
      },
      {
        id: "from",
        // Missing prices sort as +Infinity: end of asc, top of desc — same
        // convention as spreadsheets ("missing = biggest"). Custom sortingFn
        // can't do "always nulls last" cleanly in TanStack v8 because the
        // framework negates the comparator result for desc sort.
        accessorFn: (p) => cheapestInput(p) ?? Number.POSITIVE_INFINITY,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("rowFrom")}
            align="end"
          />
        ),
        cell: ({ getValue }) => {
          const v = getValue<number>();
          const hasPrice = Number.isFinite(v);
          return (
            <span className="inline-flex flex-col items-end">
              <span>
                {hasPrice ? formatCompactPricePerMillionTokens(v) : "—"}
              </span>
              {hasPrice && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  {t("rowFromHint")}
                </span>
              )}
            </span>
          );
        },
        meta: {
          headerClassName: "text-right",
          cellClassName:
            "text-right font-mono text-xs tabular-nums text-muted-foreground",
        },
      },
      {
        id: "chevron",
        enableSorting: false,
        header: () => <span className="sr-only">go to provider</span>,
        cell: () => (
          <ChevronRight className="size-4 text-muted-foreground/40" />
        ),
        meta: {
          headerClassName: "w-8",
          cellClassName: "w-8 text-center text-muted-foreground",
        },
      },
    ],
    [t],
  );

  const filterLabels = {
    title: t("filtersTitle"),
    filtersOn: t("filtersClearGroup"),
    clearAll: t("filtersClearAll"),
  };
  const activeCount = countActive(filters);
  const filterPanelProps = {
    groups,
    selected: filters,
    onToggle: (groupId: string, value: string) =>
      setFilters((s) => toggleFilterValue(s, groupId, value)),
    onClearGroup: (groupId: string) =>
      setFilters((s) => clearFilterGroup(s, groupId)),
    onResetAll: () => setFilters({}),
    labels: filterLabels,
  };

  const onResetAll = () => {
    setQuery("");
    setFilters({});
  };

  return (
    <div className="flex">
      <FilterSidebar {...filterPanelProps} />

      <div className="min-w-0 flex-1 md:border-l md:border-border">
        <CompactHeader
          providerCount={providers.length}
          totalModels={totalModels}
          totalProtocols={totalProtocols}
        />

        <DataTableToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={t("searchPlaceholder")}
          filteredCount={filtered.length}
          totalCount={providers.length}
          countLabel={(f, total) =>
            t("providersCount", { filtered: f, total })
          }
          resetLabel={t("reset")}
          onReset={onResetAll}
          hasActiveFilters={query.length > 0 || activeCount > 0}
          view={view}
          onViewChange={setView}
          viewLabels={{
            label: t("viewLabel"),
            table: t("viewTable"),
            list: t("viewList"),
          }}
          mobileSlot={
            <FilterSheetTrigger
              {...filterPanelProps}
              activeCount={activeCount}
              triggerLabel={t("filtersTrigger")}
            />
          }
        />

        {providers.length === 0 ? (
          <EmptyRegistry />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 border-t border-border bg-background py-16 text-center">
            <p className="text-sm font-medium text-foreground">
              {t("noMatchTitle")}
            </p>
            <p className="text-xs text-muted-foreground">{t("noMatchBody")}</p>
          </div>
        ) : view === "list" ? (
          <ProvidersList providers={filtered} />
        ) : (
          <DataTable<Provider, unknown>
            columns={columns}
            data={filtered}
            initialSorting={[{ id: "provider", desc: false }]}
            onRowClick={(p) => router.push(`/providers/${p.slug}`)}
            rowAriaLabel={(p) => `View details for ${p.name}`}
            rowKey={(p) => p.slug}
          />
        )}
      </div>
    </div>
  );
}

function CompactHeader({
  providerCount,
  totalModels,
  totalProtocols,
}: {
  providerCount: number;
  totalModels: number;
  totalProtocols: number;
}) {
  const t = useTranslations("Providers");
  return (
    <header className="border-b border-border">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-hud tabular-nums text-amber">
            ░ {t("counterLabel")}
          </span>
          <h1 className="truncate text-sm font-medium tracking-tight">
            {t("heroHeadlineLead")}{" "}
            <span className="text-muted-foreground">
              {t("heroHeadlineTrail")}
            </span>
          </h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          <InlineStat
            value={providerCount > 0 ? `${providerCount}` : "—"}
            label={t("heroStatProviders")}
          />
          <InlineStat
            value={totalModels > 0 ? `${totalModels}` : "—"}
            label={t("heroStatListings")}
          />
          <InlineStat
            value={totalProtocols > 0 ? `${totalProtocols}` : "—"}
            label={t("heroStatProtocols")}
          />
          <div className="flex items-center gap-2">
            <a href={PROVIDER_DOCS_URL}>
              <Button variant="ghost" size="sm">
                <BookOpen className="mr-1 size-3" />
                {t("ctaDocs")}
              </Button>
            </a>
            <a
              href={REGISTRY_NEW_PR_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm">
                {t("ctaListProvider")} <ArrowUpRight className="ml-1 size-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function InlineStat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-sm font-medium tabular-nums">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </span>
  );
}

function EmptyRegistry() {
  const t = useTranslations("Providers");
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-t border-border bg-background py-16 text-center">
      <p className="text-sm font-medium text-foreground">{t("emptyTitle")}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t("emptyBody")}</p>
      <a href={REGISTRY_URL} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm">
          <GitHubIcon className="mr-1 size-3" />
          {t("emptyCta")}
        </Button>
      </a>
    </div>
  );
}

/**
 * List view — one full-width row per provider with metadata inline beneath
 * the name, instead of in columns. No cards, matching the table aesthetic.
 */
function ProvidersList({ providers }: { providers: Provider[] }) {
  const t = useTranslations("Providers");
  return (
    <ul className="divide-y divide-border border-t border-border">
      {providers.map((p) => {
        const from = cheapestInput(p);
        return (
          <li
            key={p.slug}
            className="transition-colors hover:bg-foreground/[0.015]"
          >
            <Link
              href={`/providers/${p.slug}`}
              className="block px-4 py-3 outline-none focus-visible:bg-foreground/[0.03]"
            >
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium tracking-tight text-foreground">
                  {p.name}
                </span>
                <StatusDot status={p.status} />
                <code className="truncate font-mono text-[11px] text-muted-foreground">
                  providers/{p.slug}.yaml
                </code>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <MetaItem label={t("rowModels")}>{p.models.length}</MetaItem>
                <MetaItem label={t("rowProtocols")}>
                  {summarizeProtocols(p)}
                </MetaItem>
                <MetaItem label={t("rowRate")}>
                  {summarizeRateLimit(p)}
                </MetaItem>
                {from !== null && (
                  <MetaItem label={t("rowFrom")}>
                    {formatCompactPricePerMillionTokens(from)}
                  </MetaItem>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <span className="uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
      <span className="text-foreground/80">{children}</span>
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      title={status}
      className={`inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
        isActive
          ? "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400"
          : "border-border bg-muted/30 text-muted-foreground"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-muted-foreground"
        }`}
      />
      {status}
    </span>
  );
}
