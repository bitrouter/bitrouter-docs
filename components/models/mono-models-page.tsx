"use client";

/* Models catalog — mono/dev redesign. Unified catalog shell: global
   FilterSidebar (left) + mono content (animated `models ls` terminal, search,
   sort, dense mono table with expandable per-model call terminal), on the live
   model data. Shares its layout with the Providers page. */

import * as React from "react";
import "../landing/mono/mono.css";
import { Terminal, Ok, Dim, Faint } from "../landing/mono/terminal";
import { MonoFooter } from "../landing/mono/landing";
import { primeModelsCache, useModels, type Model } from "@/lib/models-data";
import {
  CONTEXT_BUCKETS,
  PRICE_BUCKETS,
  modelMatchesFilters,
  providerFromId,
  isOpenSourceModel,
} from "@/lib/models-filter";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import { ProviderIcon } from "./provider-icon";
import {
  FilterSidebar,
  FilterSheetTrigger,
  clearFilterGroup,
  countActive,
  toggleFilterValue,
  type FilterGroupDef,
  type FilterState,
} from "@/components/ui/filter-sidebar";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";

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

const MOD_TAG: Record<string, string> = {
  text: "TXT",
  image: "IMG",
  audio: "AUD",
  video: "VID",
  embedding: "EMB",
  "function-calling": "FN",
  tools: "FN",
};
const modTag = (m: string) =>
  MOD_TAG[m.toLowerCase()] ?? m.slice(0, 3).toUpperCase();

const TIERS: Record<string, string> = {
  frontier: "frontier",
  balanced: "balanced",
  fast: "fast",
  reasoning: "reasoning",
};

function tierOf(m: Model): keyof typeof TIERS {
  const id = m.id.toLowerCase();
  if (/(^|\/)(o1|o3|o4)|r1|reason|think|qwq/.test(id)) return "reasoning";
  const intel = m.benchmarks?.intelligenceIndex;
  if (intel != null) {
    if (intel >= 55) return "frontier";
    if (intel >= 40) return "balanced";
    return "fast";
  }
  const p = m.pricing.input;
  if (p >= 10) return "frontier";
  if (p >= 2) return "balanced";
  return "fast";
}

function formatCtx(tokens: number): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

function ttftMs(m: Model): number | null {
  const t = m.benchmarks?.timeToFirstToken;
  return t != null ? Math.round(t * 1000) : null;
}
const formatP50 = (m: Model) => {
  const v = ttftMs(m);
  return v != null ? `${v}ms` : "—";
};

/* ── header terminal (demo program from the design) ── */
function modelsLsProgram() {
  return [
    [
      "type",
      "bitrouter models ls --filter oss --sort price",
      { prefix: "$", cps: 50, after: 420 },
    ],
    [
      "print",
      <span className="fnt">MODEL                          IN/1M   OUT/1M</span>,
      180,
    ],
    [
      "print",
      <span>
        <span className="lbl">qwen/qwen-3.7</span>{" "}
        <Faint>                </Faint>
        <Dim>$0.07    $0.28</Dim>
      </span>,
      90,
    ],
    [
      "print",
      <span>
        <span className="lbl">deepseek/deepseek-v4-pro</span>{" "}
        <Faint>     </Faint>
        <Dim>$0.20    $0.80</Dim>
      </span>,
      90,
    ],
    [
      "print",
      <span>
        <span className="lbl">moonshot/kimi-k2.6</span>{" "}
        <Faint>          </Faint>
        <Dim>$0.15    $2.50</Dim>
      </span>,
      90,
    ],
    [
      "print",
      <span>
        <span className="lbl">anthropic/claude-opus-4.8</span>{" "}
        <Faint>    </Faint>
        <Dim>$15.0   $75.0</Dim>
      </span>,
      90,
    ],
    [
      "print",
      <span>
        <Faint>… 180+ open-source · zero markup</Faint>
      </span>,
      360,
    ],
    [
      "spin",
      "resolving alias code/balanced",
      1100,
      <span>
        <Ok>✓</Ok> <Dim>alias →</Dim>{" "}
        <span className="lbl">deepseek/deepseek-v4-pro</span>{" "}
        <Faint>· 287ms</Faint>
      </span>,
    ],
    ["loop", 2200],
  ];
}

/* ── one table row + expandable detail ── */
function ModelRow({
  m,
  open,
  onToggle,
}: {
  m: Model;
  open: boolean;
  onToggle: () => void;
}) {
  const tier = tierOf(m);
  const prov = providerFromId(m.id);
  const oss = isOpenSourceModel(m);
  const fin = formatCompactPricePerMillionTokens(m.pricing.input);
  const fout = formatCompactPricePerMillionTokens(m.pricing.output);
  return (
    <div className={"mrow-wrap" + (open ? " open" : "")}>
      <button className="mrow" onClick={onToggle}>
        <span className="mrow-id">
          <span className="mrow-caret">{open ? "▾" : "▸"}</span>
          <ProviderIcon provider={prov} size={15} className="mrow-ico" />
          <span className="mrow-id-text">{m.id}</span>
          {oss && <span className="oss-badge">oss</span>}
        </span>
        <span className="mrow-ctx">{formatCtx(m.maxInputTokens)}</span>
        <span className="mrow-num">{fin}</span>
        <span className="mrow-num">{fout}</span>
        <span className="mrow-mod">
          {m.modalities.map((x) => (
            <i key={x} className="mtag">
              {modTag(x)}
            </i>
          ))}
        </span>
      </button>
      {open && (
        <div className="mrow-detail">
          <div className="mdetail-grid">
            <div>
              <span className="mdetail-k">provider</span>
              <span className="mdetail-v mdetail-prov">
                <ProviderIcon provider={prov} size={14} className="mrow-ico" />
                {provLabel(prov)}
              </span>
            </div>
            <div>
              <span className="mdetail-k">context</span>
              <span className="mdetail-v">
                {formatCtx(m.maxInputTokens)} tokens
              </span>
            </div>
            <div>
              <span className="mdetail-k">input</span>
              <span className="mdetail-v">{fin} / 1M</span>
            </div>
            <div>
              <span className="mdetail-k">output</span>
              <span className="mdetail-v">{fout} / 1M</span>
            </div>
            <div>
              <span className="mdetail-k">modality</span>
              <span className="mdetail-v">
                {m.modalities.map(modTag).join(" · ") || "—"}
              </span>
            </div>
            <div>
              <span className="mdetail-k">p50 ttft</span>
              <span className="mdetail-v">{formatP50(m)}</span>
            </div>
          </div>
          <Terminal
            title={"call · " + m.id}
            accentPrompt={false}
            className="mdetail-term"
            program={
              (() => [
                [
                  "type",
                  "bitrouter chat --model " + m.id,
                  { prefix: "$", cps: 60, after: 360 },
                ],
                [
                  "print",
                  <span>
                    <Dim>POST</Dim> api.bitrouter.ai/v1/chat{" "}
                    <Faint>· 1 key</Faint>
                  </span>,
                  220,
                ],
                [
                  "spin",
                  "routing → " + prov,
                  950,
                  <span>
                    <Ok>✓</Ok> <span className="lbl">{m.id}</span>{" "}
                    <Faint>
                      · {formatP50(m)} · {fin}/{fout}
                    </Faint>
                  </span>,
                ],
                [
                  "print",
                  <span>
                    <Dim>stream</Dim> <span className="caret accent" />
                  </span>,
                  600,
                ],
                ["loop", 1800],
              ]) as never
            }
          />
        </div>
      )}
    </div>
  );
}

const SORTS: [string, string][] = [
  ["in", "input $"],
  ["out", "output $"],
  ["p50", "latency"],
  ["id", "name"],
];

function ModelsCatalog() {
  const { models, isLoading, error } = useModels();
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState("in");
  const [filters, setFilters] = React.useState<FilterState>({});
  const [ossOnly, setOssOnly] = React.useState(false);
  const [open, setOpen] = React.useState<string | null>(null);

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
    const cmp: Record<string, (a: Model, b: Model) => number> = {
      id: (a, b) => a.id.localeCompare(b.id),
      in: (a, b) => a.pricing.input - b.pricing.input,
      out: (a, b) => a.pricing.output - b.pricing.output,
      p50: (a, b) => (ttftMs(a) ?? 1e9) - (ttftMs(b) ?? 1e9),
    };
    return [...r].sort(cmp[sort]);
  }, [models, q, sort, filters, ossOnly]);

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
        <div className="page-head-grid">
          <div>
            <div className="eyebrow">
              <span className="idx">//</span> Registry
            </div>
            <h1 className="h-display page-title">Models.</h1>
            <p className="page-lead">
              {models.length > 0 ? models.length : "200+"} models behind one
              key. Open-source models at a fraction of frontier prices — zero
              markup — pair with your Claude Code or Codex subscription to cut
              costs on every run without changing a line of code.
            </p>
            <div className="hero-actions">
              <a href={SIGN_IN_URL} className="btn btn-primary">
                Get API key →
              </a>
            </div>
            <p className="page-reg-cta">
              To register as a model or harness provider,{" "}
              <a
                href="https://github.com/bitrouter/provider-registry"
                target="_blank"
                rel="noopener noreferrer"
              >
                open a PR at github.com/bitrouter/provider-registry
              </a>
            </p>
          </div>
          <Terminal
            title="bitrouter — models"
            accentPrompt={false}
            className="page-term"
            program={modelsLsProgram as never}
          />
        </div>
      </section>

      <section className="wrap mcat">
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

            <div className="mtable">
              <div className="mhead">
                <span>model</span>
                <span>ctx</span>
                <span className="ar">in /1M</span>
                <span className="ar">out /1M</span>
                <span>modality</span>
              </div>
              {error ? (
                <div className="mempty">failed to load models — {error}</div>
              ) : isLoading && models.length === 0 ? (
                <div className="mempty">loading models…</div>
              ) : (
                rows.map((m) => (
                  <ModelRow
                    key={m.id}
                    m={m}
                    open={open === m.id}
                    onToggle={() => setOpen(open === m.id ? null : m.id)}
                  />
                ))
              )}
              {!isLoading && !error && rows.length === 0 && (
                <div className="mempty">no models match “{q}”</div>
              )}
            </div>
            <div className="mcat-foot">
              {rows.length} of {models.length} shown · zero markup on every model
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
      <MonoFooter />
    </div>
  );
}
