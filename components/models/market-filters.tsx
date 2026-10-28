"use client";

import { useEffect, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { ProviderIcon } from "./provider-icon";
import { formatMarketPrice } from "@/lib/flex-market";
import { ASK_FILTER_CEILING, activeMarketFilterCount, type MarketFilters } from "@/lib/market-filters";

export interface DeveloperFilterOption {
  name: string;
  icon: string;
  count: number;
}

interface FilterProps {
  value: MarketFilters;
  onChange: (filters: MarketFilters) => void;
  onReset: () => void;
  developers: DeveloperFilterOption[];
  bidCount: number;
}

function FilterFields({ value, onChange, developers, bidCount }: FilterProps) {
  function toggleDeveloper(name: string) {
    onChange({ ...value, developers: value.developers.includes(name) ? value.developers.filter(item => item !== name) : [...value.developers, name] });
  }

  return <div className="market-filter-fields">
    <details className="market-filter-group" open>
      <summary>Developer<ChevronDown size={14} aria-hidden="true" /></summary>
      <fieldset><legend className="sr-only">Model developer</legend>{developers.map(developer => <label className="market-filter-check" key={developer.name}>
        <input type="checkbox" checked={value.developers.includes(developer.name)} onChange={() => toggleDeveloper(developer.name)} />
        <ProviderIcon provider={developer.icon} size={15} /><span>{developer.name}</span><span className="market-filter-count" aria-hidden="true">{developer.count}</span>
      </label>)}</fieldset>
    </details>
    <details className="market-filter-group" open>
      <summary>Best ask<ChevronDown size={14} aria-hidden="true" /></summary>
      <div className="market-filter-price">
        <div><span>Maximum</span><output>{value.maxAsk === null ? "Any" : formatMarketPrice(value.maxAsk)}</output></div>
        <input type="range" aria-label="Maximum best ask" aria-valuetext={value.maxAsk === null ? "Any price" : `${formatMarketPrice(value.maxAsk)} per million tokens, including buyer fee`} min={0} max={ASK_FILTER_CEILING} step={0.01} value={value.maxAsk ?? ASK_FILTER_CEILING} onChange={event => { const maxAsk = Number(event.target.value); onChange({ ...value, maxAsk: maxAsk >= ASK_FILTER_CEILING ? null : maxAsk }); }} />
        <div className="market-filter-scale"><span>$0</span><span>{formatMarketPrice(ASK_FILTER_CEILING)}+</span></div>
        <span className="market-filter-unit">USD / 1M tokens · fee included</span>
      </div>
    </details>
    <details className="market-filter-group" open>
      <summary>Order book<ChevronDown size={14} aria-hidden="true" /></summary>
      <label className="market-filter-check"><input type="checkbox" checked={value.hasBids} onChange={event => onChange({ ...value, hasBids: event.target.checked })} /><span>Has bids</span><span className="market-filter-count" aria-hidden="true">{bidCount}</span></label>
    </details>
  </div>;
}

export function MarketFilterSidebar(props: FilterProps) {
  const active = activeMarketFilterCount(props.value);
  return <aside className="market-filter-sidebar" aria-label="Model filters">
    <div className="market-filter-heading"><h2><SlidersHorizontal size={14} aria-hidden="true" />Filters</h2>{active > 0 && <button type="button" className="market-filter-reset" onClick={props.onReset}>Reset</button>}</div>
    <FilterFields {...props} />
  </aside>;
}

export function MarketFilterDialog({ resultCount, ...props }: FilterProps & { resultCount: number }) {
  const [open, setOpen] = useState(false);
  const active = activeMarketFilterCount(props.value);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width:1100px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><button type="button" className="market-filter-trigger" aria-label="Filters"><SlidersHorizontal size={15} aria-hidden="true" /><span className="market-filter-trigger-label">Filters</span>{active > 0 && <span className="market-filter-badge" aria-hidden="true">{active}</span>}</button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="market-filter-overlay" />
      <Dialog.Content className="market-filter-drawer">
        <div className="market-filter-drawer-heading"><Dialog.Title>Filters</Dialog.Title><Dialog.Close className="market-filter-close" aria-label="Close filters"><X size={18} aria-hidden="true" /></Dialog.Close></div>
        <Dialog.Description className="sr-only">Filter models by developer, maximum buyer ask price, and bid availability. Results update immediately.</Dialog.Description>
        <div className="market-filter-drawer-body">{active > 0 && <button type="button" className="market-filter-reset" onClick={props.onReset}>Reset filters</button>}<FilterFields {...props} /></div>
        <Dialog.Close asChild><button type="button" className="market-filter-show">Show {resultCount} {resultCount === 1 ? "model" : "models"}</button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
