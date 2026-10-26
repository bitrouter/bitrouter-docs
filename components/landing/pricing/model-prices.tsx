"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { BrandIcon } from "../zed/brand-icon";
import { formatCatalogPrice, sortPriceModels, type PriceModel } from "@/lib/pricing-catalog";

function formatContext(tokens: number | null) {
  if (!tokens) return "—";
  if (tokens >= 1000000) return `${Number((tokens / 1000000).toFixed(2))}M`;
  return `${Math.round(tokens / 1000)}K`;
}

function ModelIdentity({ model }: { model: PriceModel }) {
  return <div className="price-model-identity"><BrandIcon name={model.provider} size={21} /><div>
    <Link href={`/models/${model.id}`} className="price-model-name">{model.name}</Link>
    <span className="price-model-id">{model.id}</span>
  </div></div>;
}

const rates = [["Input", "input"], ["Output", "output"], ["Cache read", "cacheRead"], ["Cache write", "cacheWrite"]] as const;

export function ModelPrices({ models }: { models: PriceModel[] }) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState<"name" | "input" | "output">("name");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [license, setLicense] = useState("all");
  const [context, setContext] = useState("all");
  const [modality, setModality] = useState("all");
  const [inputMax, setInputMax] = useState("all");
  const providers = useMemo(() => [...new Set(models.map(model => model.provider))].sort(), [models]);
  const active = Boolean(query || provider !== "all" || license !== "all" || context !== "all" || modality !== "all" || inputMax !== "all");
  const rows = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sortPriceModels(models.filter(model =>
      (!search || `${model.id} ${model.name} ${model.provider}`.toLowerCase().includes(search)) &&
      (provider === "all" || model.provider === provider) &&
      (license === "all" || model.openWeights === (license === "open")) &&
      (context === "all" || (model.context !== null && model.context >= Number(context))) &&
      (modality === "all" || model.modalities.includes(modality)) &&
      (inputMax === "all" || (model.input !== null && model.input <= Number(inputMax))),
    ), sort);
  }, [models, query, provider, license, context, modality, inputMax, sort]);
  function reset() { setQuery(""); setProvider("all"); setLicense("all"); setContext("all"); setModality("all"); setInputMax("all"); }

  return <section className="price-catalog" id="models" aria-labelledby="model-prices-title">
    <div className="price-catalog-heading"><h2 id="model-prices-title">Supplier model prices</h2><span>{models.length} models</span></div>
    <p className="price-catalog-note">Supplier rates · USD per 1M tokens, before the 5% Flex transaction fee. Cloud BYOK provider inference is billed separately from Cloud Auto Routing usage.</p>
    <div className="price-toolbar">
      <label className="price-search"><Search size={16} aria-hidden="true" /><input aria-label="Search models" placeholder="Search models…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="price-select price-provider"><span className="sr-only">Provider</span><select aria-label="Provider" value={provider} onChange={event => setProvider(event.target.value)}><option value="all">All providers</option>{providers.map(name => <option key={name}>{name}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></label>
      <label className="price-select price-sort"><span className="sr-only">Sort models</span><select aria-label="Sort models" value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="name">Provider / name</option><option value="input">Input: low to high</option><option value="output">Output: low to high</option></select><ChevronDown size={14} aria-hidden="true" /></label>
      <button type="button" className="price-filter-button" aria-expanded={filtersOpen} aria-controls="price-filters" onClick={() => setFiltersOpen(open => !open)}><SlidersHorizontal size={15} aria-hidden="true" />Filters</button>
    </div>
    {filtersOpen && <div className="price-filters" id="price-filters">
      <label>License<select value={license} onChange={event => setLicense(event.target.value)}><option value="all">Any license</option><option value="open">Open-weight</option><option value="proprietary">Proprietary</option></select></label>
      <label>Context<select value={context} onChange={event => setContext(event.target.value)}><option value="all">Any context</option><option value="128000">128K or more</option><option value="256000">256K or more</option><option value="1000000">1M or more</option></select></label>
      <label>Input modality<select value={modality} onChange={event => setModality(event.target.value)}><option value="all">Any modality</option><option value="text">Text</option><option value="image">Image</option><option value="audio">Audio</option></select></label>
      <label>Input price / 1M<select value={inputMax} onChange={event => setInputMax(event.target.value)}><option value="all">Any price</option><option value="0.2">Up to $0.20</option><option value="1">Up to $1.00</option><option value="5">Up to $5.00</option></select></label>
    </div>}
    <div className="price-results" role="status">{rows.length} of {models.length} models{active && <button type="button" onClick={reset}>Clear filters</button>}</div>
    {rows.length === 0 ? <div className="price-empty"><p>No models match your filters.</p><button type="button" onClick={reset}>Show all models</button></div> : <>
      <table className="price-table"><caption className="sr-only">Supplier model rates in USD per million tokens, excluding the Flex transaction fee</caption><thead><tr><th scope="col">Model</th>{rates.map(([label, key]) => <th scope="col" key={key}>{label}</th>)}<th scope="col">Context</th></tr></thead><tbody>
        {rows.map(model => <tr key={model.id}><th scope="row"><ModelIdentity model={model} /></th>{rates.map(([label, key]) => <td key={key} aria-label={`${label}: ${formatCatalogPrice(model[key])}`}>{formatCatalogPrice(model[key])}</td>)}<td>{formatContext(model.context)}</td></tr>)}
      </tbody></table>
      <div className="price-mobile-list">{rows.map(model => <article key={model.id} className="price-mobile-model"><ModelIdentity model={model} /><dl>{rates.map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{formatCatalogPrice(model[key])}</dd></div>)}<div><dt>Context</dt><dd>{formatContext(model.context)}</dd></div></dl></article>)}</div>
    </>}
    <p className="price-rate-note">Flex adds 5% to the supplier’s actual settled charge and includes Cloud Auto Routing without a separate fee. — means no rate is listed. View a model for capabilities and setup.</p>
  </section>;
}
