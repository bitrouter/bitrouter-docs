"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, X, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// ── Types ────────────────────────────────────────────────

interface LlmEntry {
  id: string;
  name: string;
  providers: string[];
  inputPrice: number | null;
  outputPrice: number | null;
  maxInputTokens: number;
  modalities: string[];
}

interface ApiModelResponse {
  id: string;
  name?: string;
  providers: string[];
  max_input_tokens: number;
  max_output_tokens: number;
  input_modalities?: string[];
  pricing: {
    input_tokens: { no_cache: number };
    output_tokens: { text: number };
  };
}

// ── Labels ───────────────────────────────────────────────

const LLM_PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  "meta-llama": "Meta",
  mistralai: "Mistral",
  deepseek: "DeepSeek",
  "x-ai": "xAI",
  qwen: "Qwen",
  nvidia: "NVIDIA",
  "bytedance-seed": "ByteDance",
  baidu: "Baidu",
  minimax: "MiniMax",
  moonshotai: "Moonshot",
};

const MODALITY_LABELS: Record<string, string> = {
  text: "Text",
  image: "Vision",
  audio: "Audio",
  video: "Video",
  file: "File",
};

// ── Data hooks ───────────────────────────────────────────

function useLlms() {
  const [models, setModels] = useState<LlmEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bitrouter/models")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data: { data: ApiModelResponse[] }) => {
        setModels(
          (data.data ?? []).map((m) => ({
            id: m.id,
            name: m.name ?? m.id,
            providers: m.providers ?? [],
            inputPrice: m.pricing?.input_tokens?.no_cache ?? null,
            outputPrice: m.pricing?.output_tokens?.text ?? null,
            maxInputTokens: m.max_input_tokens ?? 0,
            modalities: m.input_modalities ?? ["text"],
          })),
        );
      })
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  return { models, loading };
}

function getProviderPrefix(id: string): string {
  return id.includes("/") ? id.split("/")[0] : id.split("-")[0];
}

function formatCtx(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

// ── Component ────────────────────────────────────────────

export function CloudCatalog() {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<Set<string>>(new Set());
  const [modalityFilter, setModalityFilter] = useState<Set<string>>(new Set());

  const { models, loading: llmLoading } = useLlms();

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="h-7 pl-7 text-xs"
          />
        </div>
        <FilterDropdown
          label="Provider"
          values={providerFilter}
          onChange={setProviderFilter}
          options={Object.entries(LLM_PROVIDER_LABELS).map(([v, l]) => ({
            value: v,
            label: l,
          }))}
        />
        <FilterDropdown
          label="Modality"
          values={modalityFilter}
          onChange={setModalityFilter}
          options={Object.entries(MODALITY_LABELS).map(([v, l]) => ({
            value: v,
            label: l,
          }))}
        />

        {(providerFilter.size > 0 || modalityFilter.size > 0 || search) && (
          <button
            onClick={() => {
              setProviderFilter(new Set());
              setModalityFilter(new Set());
              setSearch("");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Clear
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {(providerFilter.size > 0 || modalityFilter.size > 0) && (
        <div className="flex flex-wrap gap-1.5 border-b border-border/60 bg-muted/20 px-3 py-2">
          {[...providerFilter].map((v) => (
            <FilterChip
              key={`p-${v}`}
              label={v}
              onRemove={() => {
                const next = new Set(providerFilter);
                next.delete(v);
                setProviderFilter(next);
              }}
            />
          ))}
          {[...modalityFilter].map((v) => (
            <FilterChip
              key={`s-${v}`}
              label={v}
              onRemove={() => {
                const next = new Set(modalityFilter);
                next.delete(v);
                setModalityFilter(next);
              }}
            />
          ))}
        </div>
      )}

      {/* Table body — flows with page */}
      <div>
        <LlmTable
          models={models}
          loading={llmLoading}
          search={search}
          providerFilter={providerFilter}
          modalityFilter={modalityFilter}
        />
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Curated models for agent runtimes
        </span>
        <Link
          href="/llms"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-foreground hover:opacity-70"
        >
          Browse full catalog <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Filter dropdown ──────────────────────────────────────

function FilterDropdown({
  label,
  values,
  onChange,
  options,
}: {
  label: string;
  values: Set<string>;
  onChange: (next: Set<string>) => void;
  options: { value: string; label: string }[];
}) {
  const toggle = (v: string) => {
    const next = new Set(values);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(next);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 border border-border px-2.5 h-7 font-mono text-[11px] uppercase tracking-widest transition-colors",
            values.size > 0
              ? "border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
          {values.size > 0 && (
            <span className="rounded-sm bg-foreground px-1 text-background tabular-nums">
              {values.size}
            </span>
          )}
          <ChevronRight className="size-3 rotate-90" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 px-1.5 py-1 text-xs hover:bg-muted/50"
            >
              <Checkbox
                checked={values.has(o.value)}
                onCheckedChange={() => toggle(o.value)}
                className="size-3.5"
              />
              {o.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-foreground"
    >
      {label}
      <X className="size-2.5" />
    </button>
  );
}

// ── LLM table ────────────────────────────────────────────

function LlmTable({
  models,
  loading,
  search,
  providerFilter,
  modalityFilter,
}: {
  models: LlmEntry[];
  loading: boolean;
  search: string;
  providerFilter: Set<string>;
  modalityFilter: Set<string>;
}) {
  const filtered = useMemo(() => {
    let list = models;
    if (providerFilter.size > 0) {
      list = list.filter((m) => {
        const prefix = getProviderPrefix(m.id);
        return providerFilter.has(prefix);
      });
    }
    if (modalityFilter.size > 0) {
      list = list.filter((m) =>
        [...modalityFilter].some((mod) => m.modalities.includes(mod)),
      );
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.id.toLowerCase().includes(q));
    }
    return list;
  }, [models, search, providerFilter, modalityFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-xs text-muted-foreground">
        Loading models…
      </div>
    );
  }
  if (filtered.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-xs text-muted-foreground">
        No models match your filters.
      </div>
    );
  }

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-12 z-10 bg-background">
        <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <th className="px-3 py-2 font-medium">Model</th>
          <th className="px-3 py-2 font-medium">Provider</th>
          <th className="px-3 py-2 font-medium hidden sm:table-cell">Context</th>
          <th className="px-3 py-2 font-medium hidden md:table-cell">Modalities</th>
          <th className="px-3 py-2 font-medium text-right">$/1M in</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((m) => {
          const prefix = getProviderPrefix(m.id);
          const providerLabel = LLM_PROVIDER_LABELS[prefix] ?? prefix;
          return (
            <tr
              key={m.id}
              className="border-b border-border/40"
            >
              <td className="px-3 py-2 font-mono text-foreground">{m.id}</td>
              <td className="px-3 py-2 text-muted-foreground">{providerLabel}</td>
              <td className="px-3 py-2 hidden sm:table-cell font-mono tabular-nums text-muted-foreground">
                {formatCtx(m.maxInputTokens)}
              </td>
              <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">
                {m.modalities.map((mod) => MODALITY_LABELS[mod] ?? mod).join(", ")}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {m.inputPrice === null ? "—" : `$${m.inputPrice.toFixed(2)}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}



