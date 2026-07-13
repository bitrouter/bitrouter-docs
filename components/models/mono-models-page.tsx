"use client";

/* Models catalog — mono/dev redesign. Unified catalog shell: global
   FilterSidebar (left) + mono content (animated `models ls` terminal, search,
   sort, and a cards ⇄ table view of the live model data). Cards show each
   model's capability radar; the table shows the same axes as sortable columns.
   Rows/cards link to the per-model page (no inline expand). Shares its layout
   with the Providers page. */

import * as React from "react";
import Link from "next/link";
import "../landing/mono/mono.css";
import { primeModelsCache, useModels, type Model } from "@/lib/models-data";
import {
  CONTEXT_BUCKETS,
  PRICE_BUCKETS,
  modelMatchesFilters,
  providerFromId,
  isOpenSourceModel,
} from "@/lib/models-filter";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import {
  AXES,
  capabilityAxes,
  formatCtx,
  modTag,
  type Axis,
  type AxisSet,
} from "@/lib/model-capability";
import { mockUsage, WEEKS_SPAN } from "@/lib/model-usage";
import { ProviderIcon } from "./provider-icon";
import { ModelCard } from "./model-card";
import { UsageChart } from "./usage-chart";
import { RankList } from "./rank-list";
import {
  FilterSidebar,
  FilterSheetTrigger,
  clearFilterGroup,
  countActive,
  toggleFilterValue,
  type FilterGroupDef,
  type FilterState,
} from "@/components/ui/filter-sidebar";

const FILTER_LABELS = {
  title: "Filters",
  filtersOn: "Clear group",
  clearAll: "Clear all",
};

const PROV_LABEL: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  deepseek: "DeepSeek",
  meta: "Meta",
  mistral: "Mistral",
  xai: "xAI",
  qwen: "Qwen",
  cohere: "Cohere",
  moonshot: "Moonshot",
  minimax: "MiniMax",
  zhipu: "Zhipu",
  bytedance: "ByteDance",
  baidu: "Baidu",
  stepfun: "StepFun",
  zai: "01.AI",
  other: "Other",
};
const provLabel = (key: string) =>
  PROV_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1);

/* ── one table row (links to the model page) ── */
function CapRow({ m, axes }: { m: Model; axes: AxisSet }) {
  const prov = providerFromId(m.id);
  const oss = isOpenSourceModel(m);
  const fin = formatCompactPricePerMillionTokens(m.pricing.input);
  const fout = formatCompactPricePerMillionTokens(m.pricing.output);
  return (
    <Link href={`/models/${m.id}`} className="captable-row captable-rowlink">
      <span className="mrow-id">
        <ProviderIcon provider={prov} size={15} className="mrow-ico" />
        <span className="mrow-id-text">{m.id}</span>
        {oss && <span className="oss-badge">oss</span>}
      </span>
      <span className="captable-ctx">{formatCtx(m.maxInputTokens)}</span>
      <span className="captable-num">{fin}</span>
      <span className="captable-num">{fout}</span>
      <span className="captable-ax">{axes.intelligence}</span>
      <span className="captable-ax">{axes.coding}</span>
      <span className="captable-ax est">{axes.agentic}</span>
      <span className="captable-ax">{axes.speed}</span>
      <span className="captable-ax est">{axes.reliability}</span>
      <span className="captable-mod">
        {m.modalities.map((x) => (
          <i key={x} className="mtag">
            {modTag(x)}
          </i>
        ))}
      </span>
    </Link>
  );
}

const SORTS: [string, string][] = [
  ["in", "in $"],
  ["out", "out $"],
  ["intelligence", "int"],
  ["coding", "code"],
  ["agentic", "agentic"],
  ["speed", "speed"],
  ["reliability", "reliability"],
  ["id", "name"],
];
const AXIS_KEYS = new Set<string>(AXES);

type ViewMode = "cards" | "table";

function ModelsCatalog() {
  const { models, isLoading, error } = useModels();
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState("in");
  const [filters, setFilters] = React.useState<FilterState>({});
  const [ossOnly, setOssOnly] = React.useState(false);
  const [view, setView] = React.useState<ViewMode>("cards");

  // View: URL (?view=) wins on load, else last localStorage choice, else cards.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("view");
    let ls: string | null = null;
    try {
      ls = localStorage.getItem("br-models-view");
    } catch {
      ls = null;
    }
    const pick =
      fromUrl === "table" || fromUrl === "cards"
        ? fromUrl
        : ls === "table" || ls === "cards"
          ? ls
          : "cards";
    setView(pick as ViewMode);
  }, []);

  const changeView = (v: ViewMode) => {
    setView(v);
    try {
      localStorage.setItem("br-models-view", v);
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams(window.location.search);
    params.set("view", v);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  // Deterministic capability shapes, memoized per model id.
  const caps = React.useMemo(() => {
    const map = new Map<string, AxisSet>();
    for (const m of models) map.set(m.id, capabilityAxes(m).axes);
    return map;
  }, [models]);

  // Mock "what the router routed to" usage series for the ranking hero.
  const usage = React.useMemo(() => mockUsage(models), [models]);

  const groups = React.useMemo<FilterGroupDef[]>(() => {
    const providerCounts = new Map<string, number>();
    for (const m of models) {
      const p = providerFromId(m.id);
      providerCounts.set(p, (providerCounts.get(p) ?? 0) + 1);
    }
    const providerOptions = Array.from(providerCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: provLabel(value), count }));
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
      { id: "provider", label: "Provider", options: providerOptions },
      { id: "imageInput", label: "Capabilities", options: [{ value: "image", label: "Image input", count: imageInputCount }] },
      { id: "context", label: "Context", options: contextOptions },
      { id: "price", label: "Price", options: priceOptions },
      { id: "cacheSupport", label: "Caching", options: [{ value: "cache", label: "Supports caching", count: cacheCount }] },
    ];
  }, [models]);

  const rows = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    const f = {
      providers: filters.provider ?? new Set<string>(),
      imageInput: filters.imageInput ?? new Set<string>(),
      contextBuckets: filters.context ?? new Set<string>(),
      priceBuckets: filters.price ?? new Set<string>(),
      cacheSupport: filters.cacheSupport ?? new Set<string>(),
    };
    const r = models.filter((m) => {
      if (ossOnly && !isOpenSourceModel(m)) return false;
      if (
        query &&
        !m.id.toLowerCase().includes(query) &&
        !m.name.toLowerCase().includes(query)
      )
        return false;
      return modelMatchesFilters(m, f);
    });

    if (AXIS_KEYS.has(sort)) {
      const ax = sort as Axis;
      // higher capability first
      return [...r].sort((a, b) => (caps.get(b.id)?.[ax] ?? 0) - (caps.get(a.id)?.[ax] ?? 0));
    }
    const cmp: Record<string, (a: Model, b: Model) => number> = {
      id: (a, b) => a.id.localeCompare(b.id),
      in: (a, b) => a.pricing.input - b.pricing.input,
      out: (a, b) => a.pricing.output - b.pricing.output,
    };
    return [...r].sort(cmp[sort] ?? cmp.in);
  }, [models, q, sort, filters, ossOnly, caps]);

  const activeCount = countActive(filters);
  const panelProps = {
    groups,
    selected: filters,
    onToggle: (g: string, v: string) =>
      setFilters((s) => toggleFilterValue(s, g, v)),
    onClearGroup: (g: string) => setFilters((s) => clearFilterGroup(s, g)),
    onResetAll: () => setFilters({}),
    labels: FILTER_LABELS,
  };

  return (
    <>
      <section className="page-head wrap">
        <div className="rank-topbar">
          <div className="rank-intro">
            <div className="eyebrow">
              <span className="idx">//</span> Top models
            </div>
            <h1 className="h-display page-title">Top models.</h1>
            <p className="page-lead">
              What the router actually picked — share of routed calls across
              BitRouter.<span className="rank-sample">sample data</span>
            </p>
          </div>
        </div>
        <div className="rank-grid">
          <div className="rank-panel">
            <div className="rank-panel-h">
              routed calls / day
              <span className="rank-panel-rt">last {WEEKS_SPAN} weeks</span>
            </div>
            <UsageChart days={usage.days} series={usage.series} />
          </div>
          <div className="rank-panel">
            <div className="rank-panel-h">
              ranked · this week
              <span className="rank-panel-rt">share ▲▼ wk</span>
            </div>
            <RankList ranked={usage.ranked} total={models.length} />
          </div>
        </div>
      </section>

      <section className="wrap mcat">
        <div className="eyebrow mcat-eyebrow">
          <span className="idx">//</span> All models
        </div>
        <div className="catalog-row">
          <FilterSidebar {...panelProps} />
          <div className="catalog-body">
            <div className="toolbar">
              <div className="search">
                <span className="search-ic">⌕</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="filter models…  e.g. claude, gemini, gpt"
                />
                {q && (
                  <button className="search-clear" onClick={() => setQ("")}>
                    esc
                  </button>
                )}
              </div>
              <button
                className={"sortsel-opt oss-toggle" + (ossOnly ? " on" : "")}
                onClick={() => setOssOnly((v) => !v)}
              >
                open-source only
              </button>
              <FilterSheetTrigger
                {...panelProps}
                activeCount={activeCount}
                triggerLabel="Filters"
              />
              <div className="viewsw" role="group" aria-label="View mode">
                <button
                  className={"viewsw-opt" + (view === "cards" ? " on" : "")}
                  aria-pressed={view === "cards"}
                  onClick={() => changeView("cards")}
                >
                  ▦ cards
                </button>
                <button
                  className={"viewsw-opt" + (view === "table" ? " on" : "")}
                  aria-pressed={view === "table"}
                  onClick={() => changeView("table")}
                >
                  ▤ table
                </button>
              </div>
              <div className="sortsel">
                <span className="sortsel-lbl">sort</span>
                {SORTS.map(([k, l]) => (
                  <button
                    key={k}
                    className={"sortsel-opt" + (sort === k ? " on" : "")}
                    onClick={() => setSort(k)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="mtable">
                <div className="mempty">failed to load models — {error}</div>
              </div>
            ) : isLoading && models.length === 0 ? (
              <div className="mtable">
                <div className="mempty">loading models…</div>
              </div>
            ) : rows.length === 0 ? (
              <div className="mtable">
                <div className="mempty">no models match “{q}”</div>
              </div>
            ) : view === "cards" ? (
              <div className="mcards">
                {rows.map((m) => (
                  <ModelCard key={m.id} m={m} />
                ))}
              </div>
            ) : (
              <div className="mtable-scroll">
                <div className="mtable captable">
                  <div className="captable-head captable-row">
                    <span>model</span>
                    <span>ctx</span>
                    <span className="ar">in /1M</span>
                    <span className="ar">out /1M</span>
                    <span className="ar">int</span>
                    <span className="ar">code</span>
                    <span className="ar">agnt</span>
                    <span className="ar">spd</span>
                    <span className="ar">rel</span>
                    <span>modality</span>
                  </div>
                  <div className="captable-body">
                    {rows.map((m) => (
                      <CapRow key={m.id} m={m} axes={caps.get(m.id)!} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mcat-foot">
              {rows.length} of {models.length} shown · axes 0–100 · agentic +
              reliability estimated · zero markup on every model
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ModelsMonoPage({
  initialModels = [],
}: {
  initialModels?: Model[];
}) {
  primeModelsCache(initialModels);
  return (
    <div className="br-mono">
      <ModelsCatalog />
    </div>
  );
}
