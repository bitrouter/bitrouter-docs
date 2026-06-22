"use client";

/* Providers registry — mono/dev redesign, unified with the Models page:
   global FilterSidebar (left) + mono content (animated status terminal, search,
   sort, dense mono table with expandable per-provider detail), plus the
   permissionless "ship a provider in one PR" CTA. */

import * as React from "react";
import "../landing/mono/mono.css";
import { Terminal, Ok, Dim, Faint, Warn } from "../landing/mono/terminal";
import { MonoFooter } from "../landing/mono/landing";
import { ProviderIcon } from "../models/provider-icon";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import type { Provider } from "@/lib/providers-types";
import {
  FilterSidebar,
  FilterSheetTrigger,
  clearFilterGroup,
  countActive,
  toggleFilterValue,
  type FilterGroupDef,
  type FilterState,
} from "@/components/ui/filter-sidebar";

const REGISTRY_NEW_PR_URL =
  "https://github.com/bitrouter/provider-registry/new/main/providers";

const FILTER_LABELS = {
  title: "Filters",
  filtersOn: "Clear group",
  clearAll: "Clear all",
};

function summarizeProtocols(p: Provider): string {
  const values = new Set(Object.values(p.apiProtocol));
  return values.size === 0 ? "—" : Array.from(values).join(" · ");
}
function providerProtocols(p: Provider): string[] {
  return Array.from(new Set(Object.values(p.apiProtocol)));
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
  const prices = p.models.map((m) => m.pricing.inputNoCache).filter((n) => n > 0);
  return prices.length === 0 ? null : Math.min(...prices);
}
const fromLabel = (p: Provider) => {
  const v = cheapestInput(p);
  return v == null ? "—" : formatCompactPricePerMillionTokens(v);
};

/* ── header terminal (demo status stream) ── */
function statusProgram() {
  return [
    [
      "type",
      "bitrouter providers status --watch",
      { prefix: "$", cps: 46, after: 420 },
    ],
    [
      "print",
      <span className="fnt">PROVIDER        STATUS     p50      UPTIME</span>,
      180,
    ],
    [
      "print",
      <span>
        <span className="lbl">anthropic</span> <Faint>      </Faint>
        <Ok>● ok</Ok> <Faint>   </Faint>
        <Dim>134ms    99.98%</Dim>
      </span>,
      90,
    ],
    [
      "print",
      <span>
        <span className="lbl">openai</span> <Faint>         </Faint>
        <Ok>● ok</Ok> <Faint>   </Faint>
        <Dim>312ms    99.95%</Dim>
      </span>,
      90,
    ],
    [
      "print",
      <span>
        <span className="lbl">google</span> <Faint>         </Faint>
        <Ok>● ok</Ok> <Faint>   </Faint>
        <Dim>287ms    99.97%</Dim>
      </span>,
      90,
    ],
    [
      "spin",
      "health-checking registry",
      1200,
      <span>
        <Warn>⊘</Warn> <span className="lbl">groq</span>{" "}
        <Dim>degraded → shedding to failover</Dim>
      </span>,
    ],
    [
      "print",
      <span>
        <Ok>✓</Ok> <Dim>all routes healthy · 1 shedding · permissionless</Dim>
      </span>,
      600,
    ],
    ["loop", 2200],
  ];
}

function registerProgram() {
  return [
    [
      "type",
      'gh pr create -t "add: my-provider"',
      { prefix: "$", cps: 44, after: 420 },
    ],
    ["print", <span className="fnt">+ providers/my-provider.yaml</span>, 220],
    [
      "print",
      <span>
        <Dim>name:</Dim> <span className="lbl">My Provider</span>
      </span>,
      120,
    ],
    [
      "print",
      <span>
        <Dim>base_url:</Dim> https://api.my.dev/v1
      </span>,
      120,
    ],
    [
      "print",
      <span>
        <Dim>models:</Dim> <span className="lbl">12</span>{" "}
        <Faint>·</Faint> <Dim>protocol:</Dim> openai
      </span>,
      320,
    ],
    [
      "spin",
      "CI · schema + smoke tests",
      1300,
      <span>
        <Ok>✓</Ok> <Dim>checks passed</Dim> <Faint>· merged, no review queue</Faint>
      </span>,
    ],
    [
      "print",
      <span>
        <Ok>✓</Ok> <span className="lbl">routing live</span>{" "}
        <Faint>· picked up on next refresh</Faint>
      </span>,
      600,
    ],
    ["loop", 2400],
  ];
}

/* ── one provider row + expandable detail ── */
function ProviderRow({
  p,
  open,
  onToggle,
}: {
  p: Provider;
  open: boolean;
  onToggle: () => void;
}) {
  const isActive = p.status === "active";
  return (
    <div className={"mrow-wrap" + (open ? " open" : "")}>
      <button className="mrow" onClick={onToggle}>
        <span className="mrow-id">
          <span className="mrow-caret">{open ? "▾" : "▸"}</span>
          <ProviderIcon provider={p.slug} size={15} className="mrow-ico" />
          {p.name}
          <span className="pslug">· {p.slug}</span>
        </span>
        <span className={"pstat " + (isActive ? "on" : "off")}>
          <span className="pstat-dot" />
          {p.status}
        </span>
        <span className="pcell pcol-keep mrow-num">{p.models.length}</span>
        <span className="pcell">{summarizeProtocols(p)}</span>
        <span className="pcell">{summarizeRateLimit(p)}</span>
        <span className="pcell mrow-num">{fromLabel(p)}</span>
      </button>
      {open && (
        <div className="mrow-detail">
          <div className="mdetail-grid">
            <div>
              <span className="mdetail-k">registry</span>
              <span className="mdetail-v">providers/{p.slug}.yaml</span>
            </div>
            <div>
              <span className="mdetail-k">status</span>
              <span className="mdetail-v">{p.status}</span>
            </div>
            <div>
              <span className="mdetail-k">models</span>
              <span className="mdetail-v">{p.models.length} listed</span>
            </div>
            <div>
              <span className="mdetail-k">protocols</span>
              <span className="mdetail-v">{summarizeProtocols(p)}</span>
            </div>
            <div>
              <span className="mdetail-k">rate limit</span>
              <span className="mdetail-v">{summarizeRateLimit(p)}</span>
            </div>
            <div>
              <span className="mdetail-k">from</span>
              <span className="mdetail-v">{fromLabel(p)} / 1M</span>
            </div>
          </div>
          <Terminal
            title={"provider · " + p.slug}
            accentPrompt={false}
            className="mdetail-term"
            program={
              (() => [
                [
                  "type",
                  "bitrouter providers show " + p.slug,
                  { prefix: "$", cps: 60, after: 340 },
                ],
                [
                  "print",
                  <span>
                    <Dim>protocols</Dim>{" "}
                    <span className="lbl">{summarizeProtocols(p)}</span>
                  </span>,
                  200,
                ],
                [
                  "print",
                  <span>
                    <Dim>models</Dim>{" "}
                    <span className="lbl">{p.models.length}</span>{" "}
                    <Faint>· from {fromLabel(p)}</Faint>
                  </span>,
                  240,
                ],
                [
                  "spin",
                  "probe " + p.slug,
                  900,
                  <span>
                    <Ok>✓</Ok> <span className="lbl">{p.name}</span>{" "}
                    <Faint>· {isActive ? "operational" : p.status}</Faint>
                  </span>,
                ],
                ["loop", 1700],
              ]) as never
            }
          />
        </div>
      )}
    </div>
  );
}

const SORTS: [string, string][] = [
  ["models", "models"],
  ["from", "cheapest"],
  ["name", "name"],
];

function ProvidersCatalog({ providers }: { providers: Provider[] }) {
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState("models");
  const [filters, setFilters] = React.useState<FilterState>({});
  const [open, setOpen] = React.useState<string | null>(null);

  const totalModels = React.useMemo(
    () => providers.reduce((n, p) => n + p.models.length, 0),
    [providers],
  );

  const groups = React.useMemo<FilterGroupDef[]>(() => {
    const statusCounts = new Map<string, number>();
    const protocolCounts = new Map<string, number>();
    for (const p of providers) {
      statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
      for (const proto of providerProtocols(p))
        protocolCounts.set(proto, (protocolCounts.get(proto) ?? 0) + 1);
    }
    const toOpts = (m: Map<string, number>) =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([value, count]) => ({ value, label: value, count }));
    return [
      { id: "status", label: "Status", options: toOpts(statusCounts) },
      { id: "protocol", label: "Protocol", options: toOpts(protocolCounts) },
    ];
  }, [providers]);

  const rows = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    const statusSel = filters.status;
    const protocolSel = filters.protocol;
    const r = providers.filter((p) => {
      if (
        query &&
        !p.name.toLowerCase().includes(query) &&
        !p.slug.toLowerCase().includes(query)
      )
        return false;
      if (statusSel && statusSel.size > 0 && !statusSel.has(p.status))
        return false;
      if (protocolSel && protocolSel.size > 0) {
        if (!providerProtocols(p).some((proto) => protocolSel.has(proto)))
          return false;
      }
      return true;
    });
    const cmp: Record<string, (a: Provider, b: Provider) => number> = {
      models: (a, b) => b.models.length - a.models.length,
      from: (a, b) =>
        (cheapestInput(a) ?? Infinity) - (cheapestInput(b) ?? Infinity),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...r].sort(cmp[sort]);
  }, [providers, q, sort, filters]);

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
            <h1 className="h-display page-title">Providers.</h1>
            <p className="page-lead">
              {providers.length > 0 ? providers.length : "Open"} providers
              serving {totalModels > 0 ? totalModels : "200+"} model listings —
              a permissionless registry. Anyone can publish a provider via PR,
              no review queue.
            </p>
            <div className="hero-actions">
              <a
                href={REGISTRY_NEW_PR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                List a provider →
              </a>
            </div>
          </div>
          <Terminal
            title="bitrouter — providers"
            accentPrompt={false}
            className="page-term"
            program={statusProgram as never}
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
                  placeholder="filter providers…  e.g. anthropic, openai"
                />
                {q && (
                  <button className="search-clear" onClick={() => setQ("")}>
                    esc
                  </button>
                )}
              </div>
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

            <div className="mtable provtable">
              <div className="mhead">
                <span>provider</span>
                <span>status</span>
                <span className="ar">models</span>
                <span>protocols</span>
                <span>rate /min</span>
                <span className="ar">from /1M</span>
              </div>
              {providers.length === 0 ? (
                <div className="mempty">
                  registry is empty — be the first to ship a provider.
                </div>
              ) : (
                rows.map((p) => (
                  <ProviderRow
                    key={p.slug}
                    p={p}
                    open={open === p.slug}
                    onToggle={() => setOpen(open === p.slug ? null : p.slug)}
                  />
                ))
              )}
              {providers.length > 0 && rows.length === 0 && (
                <div className="mempty">no providers match “{q}”</div>
              )}
            </div>
            <div className="mcat-foot">
              {rows.length} of {providers.length} shown · open registry, no
              gatekeeper
            </div>
          </div>
        </div>
      </section>

      <section className="wrap register">
        <div className="register-grid">
          <div>
            <div className="eyebrow">
              <span className="idx">//</span> Permissionless
            </div>
            <h2 className="h-display sec-title">Ship a provider in one PR.</h2>
            <p className="sec-lead">
              Open a PR against the registry with a YAML listing your name, base
              URL, models, prices, and routing weight. CI runs schema checks;
              once green, BitRouter routes agent traffic to you on the next
              refresh.
            </p>
            <ul className="register-list">
              <li>
                <span className="prob-dot">└</span>No application, no gatekeeper
              </li>
              <li>
                <span className="prob-dot">└</span>Schema-validated in CI
              </li>
              <li>
                <span className="prob-dot">└</span>Live on the next registry
                refresh
              </li>
            </ul>
            <div className="hero-actions" style={{ marginTop: 26 }}>
              <a
                href={REGISTRY_NEW_PR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open a registry PR →
              </a>
            </div>
          </div>
          <Terminal
            title="provider-registry — pr"
            accentPrompt={false}
            className="register-term"
            program={registerProgram as never}
          />
        </div>
      </section>
    </>
  );
}

export function ProvidersMonoPage({
  providers = [],
}: {
  providers?: Provider[];
}) {
  return (
    <div className="br-mono">
      <ProvidersCatalog providers={providers} />
      <MonoFooter />
    </div>
  );
}
