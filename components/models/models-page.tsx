"use client";

import { Suspense, useMemo, useState } from "react";
import { ArrowUpRight, Cpu, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
import {
  primeModelsCache,
  useModels,
  type Model,
} from "@/lib/models-data";
import {
  CONTEXT_BUCKETS,
  PRICE_BUCKETS,
  modelMatchesFilters,
  providerFromId,
} from "@/lib/models-filter";
import { ModelList, ModelTable, ModelTableSkeleton } from "./model-table";

const API_BASE_URL = "https://api.bitrouter.ai/v1";

export function ModelsPage({
  initialModels = [],
}: {
  initialModels?: Model[];
}) {
  primeModelsCache(initialModels);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ModelsPageInner />
    </Suspense>
  );
}

function ModelsPageInner() {
  const t = useTranslations("Models");
  const { models, isLoading, error } = useModels();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [view, setView] = useState<ViewMode>("table");

  const modelCount = models.length;
  const providerCount = useMemo(
    () => new Set(models.map((m) => providerFromId(m.id))).size,
    [models],
  );

  const groups = useMemo<FilterGroupDef[]>(() => {
    const providerCounts = new Map<string, number>();
    for (const m of models) {
      const p = providerFromId(m.id);
      providerCounts.set(p, (providerCounts.get(p) ?? 0) + 1);
    }
    const providerOptions = Array.from(providerCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: value, count }));
    const imageInputCount = models.filter((m) => m.modalities.includes("image")).length;
    const cacheCount = models.filter((m) => m.pricing.cacheRead !== undefined).length;
    const contextOptions = CONTEXT_BUCKETS.map((b) => ({
      value: b.key,
      label: b.label,
      count: models.reduce((n, m) => (b.test(m.maxInputTokens) ? n + 1 : n), 0),
    }));
    const priceOptions = PRICE_BUCKETS.map((b) => ({
      value: b.key,
      label: b.label,
      count: models.reduce((n, m) => (b.test(m.pricing.input) ? n + 1 : n), 0),
    }));

    return [
      { id: "provider", label: t("filterProvider"), options: providerOptions },
      { id: "imageInput", label: t("filterCapabilities"), options: [{ value: "image", label: "Image input", count: imageInputCount }] },
      { id: "context", label: t("filterContext"), options: contextOptions },
      { id: "price", label: t("filterPrice"), options: priceOptions },
      { id: "cacheSupport", label: t("filterCache"), options: [{ value: "cache", label: "Supports caching", count: cacheCount }] },
    ];
  }, [models, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const f = {
      providers: filters.provider ?? new Set<string>(),
      imageInput: filters.imageInput ?? new Set<string>(),
      contextBuckets: filters.context ?? new Set<string>(),
      priceBuckets: filters.price ?? new Set<string>(),
      cacheSupport: filters.cacheSupport ?? new Set<string>(),
    };
    return models.filter((m) => {
      if (q && !m.id.toLowerCase().includes(q) && !m.name.toLowerCase().includes(q)) {
        return false;
      }
      return modelMatchesFilters(m, f);
    });
  }, [models, query, filters]);

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
        <CompactHeader modelCount={modelCount} providerCount={providerCount} />

        <DataTableToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={t("searchPlaceholder")}
          filteredCount={filtered.length}
          totalCount={models.length}
          countLabel={(f, total) => t("modelsCount", { filtered: f, total })}
          resetLabel={t("reset")}
          onReset={onResetAll}
          loadingLabel={t("loading")}
          isLoading={isLoading}
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

        {error ? (
          <ErrorState message={error} />
        ) : isLoading ? (
          <ModelTableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : view === "list" ? (
          <ModelList models={filtered} />
        ) : (
          <ModelTable models={filtered} />
        )}
      </div>
    </div>
  );
}

function CompactHeader({
  modelCount,
  providerCount,
}: {
  modelCount: number;
  providerCount: number;
}) {
  const t = useTranslations("Models");
  return (
    <header className="border-b border-border">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-hud tabular-nums text-amber">
            ░ {t("counterLabel")}
          </span>
          <h1 className="truncate text-sm font-medium tracking-tight">
            {t("headlineLead")}{" "}
            <span className="text-muted-foreground">{t("headlineTrail")}</span>
          </h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          <InlineStat
            value={modelCount > 0 ? `${modelCount}` : "—"}
            label={t("statModels")}
          />
          <InlineStat
            value={providerCount > 0 ? `${providerCount}` : "—"}
            label={t("statProviders")}
          />
          <code className="hidden font-mono text-[11px] text-muted-foreground lg:inline">
            {API_BASE_URL}
          </code>
          <div className="flex items-center gap-2">
            <a
              href="https://cloud.bitrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm">
                {t("ctaApiKey")} <ArrowUpRight className="ml-1 size-3" />
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

function EmptyState() {
  const t = useTranslations("Models");
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-t border-border bg-background py-16 text-center">
      <Cpu className="size-6 text-muted-foreground/60" />
      <div>
        <p className="text-sm font-medium text-foreground">{t("emptyTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("emptyBody")}</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const t = useTranslations("Models");
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-t border-border bg-background py-16 text-center">
      <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
