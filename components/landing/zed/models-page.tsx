"use client";

import "./zed.css";
import { useMemo, useState } from "react";
import { BrandIcon } from "./brand-icon";
import {
  MODELS, PDOT, MODC, PROVIDERS, maxIn, maxOut, barW, pColor, fmtUsd, ctxNum,
  CHART_USE, CHART_TOTALS, CHART_JIT, CHART_MAX, CHART_H, CHART_STACK,
  CHART_YTICKS, CHART_OPEN_PCT, CHART_FRONTIER_PCT,
  type Modality, type ModelRow,
} from "./models-data";

type SortKey = "input" | "output" | "latency" | "name";
type View = "table" | "cards";

const optStyle = (on: boolean) =>
  on ? { background: "#12161d", color: "#8fb4ff" } : { color: "var(--z-ink-4)" };
const segStyle = (on: boolean) =>
  on ? { background: "#12161d", color: "#8fb4ff" } : { background: "transparent", color: "var(--z-ink-5)" };

function decorate(m: ModelRow) {
  return {
    ...m,
    p50txt: m.p50 + "ms",
    dot: PDOT[m.p] ?? "#7f8894",
    inTxt: fmtUsd(m.in),
    outTxt: fmtUsd(m.out),
    inW: barW(m.in, maxIn),
    outW: barW(m.out, maxOut),
    inColor: pColor(m.in, maxIn),
    outColor: pColor(m.out, maxOut),
    tag: m.oss ? "-25%" : "proprietary",
    tagColor: m.oss ? "#6b9bff" : "#e0a955",
    tagBorder: m.oss ? "#2a3550" : "#3d3320",
  };
}

// Pre-compute the stacked token-usage bars (deterministic; no randomness).
const CHART_BARS = CHART_TOTALS.map((tot, di) => ({
  title: tot.toFixed(1) + "M tokens",
  segs: CHART_STACK.map((k, si) => {
    const m = CHART_USE.find((u) => u.key === k)!;
    const sh = m.share + (m.frontier ? CHART_JIT[di] * 0.008 : -CHART_JIT[di] * 0.004);
    const hpx = Math.max(m.frontier ? 1.5 : 3, (tot * sh) / CHART_MAX * CHART_H);
    return { color: m.color, hpx: hpx.toFixed(1) + "px", top: si === 0 };
  }),
}));
const CHART_TOTAL_TXT = CHART_TOTALS.reduce((a, b) => a + b, 0).toFixed(1) + "M tokens";

export function ZedModelsPage() {
  const [license, setLicense] = useState<"all" | "open" | "prop">("all");
  const [ctxMin, setCtxMin] = useState("all");
  const [inMax, setInMax] = useState("all");
  const [outMax, setOutMax] = useState("all");
  const [mods, setMods] = useState<Modality[]>([]);
  const [provider, setProvider] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("input");
  const [view, setView] = useState<View>("table");

  const cnt = (fn: (m: ModelRow) => boolean) => MODELS.filter(fn).length;

  const rows = useMemo(() => {
    let ml = MODELS.filter(
      (m) =>
        (license === "all" || (license === "open" ? m.oss : !m.oss)) &&
        (ctxMin === "all" || ctxNum(m.ctx) >= Number(ctxMin)) &&
        (inMax === "all" || m.in <= Number(inMax)) &&
        (outMax === "all" || m.out <= Number(outMax)) &&
        (!mods.length || mods.every((x) => m.mods.includes(x))) &&
        (provider === "All" || m.p === provider),
    );
    const q = search.trim().toLowerCase();
    if (q) ml = ml.filter((m) => m.id.toLowerCase().includes(q) || m.p.toLowerCase().includes(q));
    ml = [...ml].sort((a, b) =>
      sort === "name" ? a.id.localeCompare(b.id) : sort === "output" ? a.out - b.out : sort === "latency" ? a.p50 - b.p50 : a.in - b.in,
    );
    return ml.map(decorate);
  }, [license, ctxMin, inMax, outMax, mods, provider, search, sort]);

  const filtersActive =
    license !== "all" || ctxMin !== "all" || inMax !== "all" || outMax !== "all" || mods.length > 0 || provider !== "All" || search;

  const reset = () => {
    setLicense("all"); setCtxMin("all"); setInMax("all"); setOutMax("all");
    setMods([]); setProvider("All"); setSearch("");
  };

  const licenseOpts = [
    { k: "all", l: "All", c: MODELS.length },
    { k: "open", l: "Open-weight", c: cnt((m) => m.oss) },
    { k: "prop", l: "Proprietary", c: cnt((m) => !m.oss) },
  ] as const;
  const ctxOpts = [
    { k: "all", l: "Any" }, { k: "128", l: "≥ 128K" }, { k: "256", l: "≥ 256K" }, { k: "1000", l: "1M context" },
  ];
  const inOpts = [
    { k: "all", l: "Any" }, { k: "0.2", l: "≤ $0.20" }, { k: "0.5", l: "≤ $0.50" }, { k: "1", l: "≤ $1.00" }, { k: "5", l: "≤ $5.00" },
  ];
  const outOpts = [
    { k: "all", l: "Any" }, { k: "1", l: "≤ $1.00" }, { k: "3", l: "≤ $3.00" }, { k: "10", l: "≤ $10.0" }, { k: "30", l: "≤ $30.0" },
  ];
  const modOpts: { k: Modality; l: string }[] = [
    { k: "TXT", l: "Text" }, { k: "IMG", l: "Image" }, { k: "AUD", l: "Audio" },
  ];

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 1180 }}>
          <div style={{ height: 44 }} />

          <div style={{ border: "1px solid var(--z-rule)" }}>
            {/* ── token-usage chart ── */}
            <div style={{ background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "16px 20px", borderBottom: "1px solid var(--z-rule)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-6)" }}>
                  token usage · last 14 days
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginLeft: "auto" }}>
                  {CHART_USE.map((g) => (
                    <div key={g.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--z-ink-4)" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: g.color }} />
                      {g.name}
                      {g.frontier && <span style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e0a955" }}>proprietary</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "22px 20px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "50px 1fr" }}>
                  <div style={{ height: CHART_H, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingRight: 12, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--z-ink-7)" }}>
                    {CHART_YTICKS.map((y) => <span key={y}>{y}</span>)}
                  </div>
                  <div style={{ position: "relative", height: CHART_H, borderLeft: "1px solid var(--z-rule)", borderBottom: "1px solid var(--z-rule)" }}>
                    {[0, 33.33, 66.66].map((t) => (
                      <div key={t} style={{ position: "absolute", left: 0, right: 0, top: `${t}%`, height: 1, background: "#181c22" }} />
                    ))}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 7, padding: "0 6px" }}>
                      {CHART_BARS.map((b, i) => (
                        <div key={i} title={b.title} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                          {b.segs.map((s, si) => (
                            <div key={si} style={{ height: s.hpx, background: s.color, borderRadius: s.top ? "3px 3px 0 0" : undefined }} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "50px 1fr" }}>
                  <div />
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 6px 0", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--z-ink-7)" }}>
                    <span>14 days ago</span><span>7 days</span><span>today</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-4)", flexWrap: "wrap" }}>
                  <span><b style={{ color: "var(--z-blue)" }}>{CHART_OPEN_PCT}</b> open-weight</span>
                  <span style={{ color: "var(--z-ink-7)" }}>·</span>
                  <span><b style={{ color: "#e0a955" }}>{CHART_FRONTIER_PCT}</b> proprietary</span>
                  <span style={{ marginLeft: "auto", color: "var(--z-ink-6)" }}>{CHART_TOTAL_TXT} routed</span>
                </div>
              </div>
            </div>

            {/* ── registry: rail + main ── */}
            <div style={{ display: "grid", gridTemplateColumns: "212px minmax(0,1fr)" }} className="zed-models-body">
              {/* filter rail */}
              <aside style={{ borderRight: "1px solid var(--z-rule)", padding: "18px 14px" }} className="zed-hide-sm">
                <div style={{ display: "flex", alignItems: "center", margin: "0 8px 16px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-7)" }}>filters</span>
                  <button onClick={reset} disabled={!filtersActive} style={{ marginLeft: "auto", cursor: filtersActive ? "pointer" : "default", background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: 11, color: filtersActive ? "#8fb4ff" : "var(--z-ink-8)" }}>clear</button>
                </div>

                <FilterGroup title="license">
                  {licenseOpts.map((o) => (
                    <FilterBtn key={o.k} label={o.l} count={String(o.c)} active={license === o.k} onClick={() => setLicense(o.k)} />
                  ))}
                </FilterGroup>
                <FilterGroup title="context window">
                  {ctxOpts.map((o) => (
                    <FilterBtn key={o.k} label={o.l} count={o.k === "all" ? undefined : String(cnt((m) => ctxNum(m.ctx) >= Number(o.k)))} active={ctxMin === o.k} onClick={() => setCtxMin(o.k)} />
                  ))}
                </FilterGroup>
                <FilterGroup title="input $ / 1M">
                  {inOpts.map((o) => (
                    <FilterBtn key={o.k} label={o.l} count={o.k === "all" ? undefined : String(cnt((m) => m.in <= Number(o.k)))} active={inMax === o.k} onClick={() => setInMax(o.k)} />
                  ))}
                </FilterGroup>
                <FilterGroup title="output $ / 1M">
                  {outOpts.map((o) => (
                    <FilterBtn key={o.k} label={o.l} count={o.k === "all" ? undefined : String(cnt((m) => m.out <= Number(o.k)))} active={outMax === o.k} onClick={() => setOutMax(o.k)} />
                  ))}
                </FilterGroup>
                <FilterGroup title="modality">
                  {modOpts.map((o) => {
                    const on = mods.includes(o.k);
                    return (
                      <FilterBtn key={o.k} label={o.l} check={on ? "☑" : "☐"} count={String(cnt((m) => m.mods.includes(o.k)))} active={on}
                        onClick={() => setMods((s) => (on ? s.filter((x) => x !== o.k) : [...s, o.k]))} />
                    );
                  })}
                </FilterGroup>
                <FilterGroup title="provider">
                  <FilterBtn label="All" dot="#6b9bff" count={String(MODELS.length)} active={provider === "All"} onClick={() => setProvider("All")} />
                  {PROVIDERS.map((p) => (
                    <FilterBtn key={p} label={p} icon={p} dot={PDOT[p]} count={String(cnt((m) => m.p === p))} active={provider === p} onClick={() => setProvider(p)} />
                  ))}
                </FilterGroup>
              </aside>

              {/* main */}
              <div style={{ minWidth: 0 }}>
                {/* toolbar */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "14px 16px", borderBottom: "1px solid var(--z-rule)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--z-inset)", border: "1px solid var(--z-rule)", borderRadius: 7, padding: "7px 11px", flex: 1, minWidth: 180 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b727e" strokeWidth="2" style={{ flex: "0 0 auto" }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink)", minWidth: 0 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-7)" }}>sort</span>
                    <div style={{ display: "flex", border: "1px solid var(--z-rule)", borderRadius: 7, overflow: "hidden" }}>
                      {([["input", "input $"], ["output", "output $"], ["latency", "latency"], ["name", "name"]] as [SortKey, string][]).map(([k, l]) => (
                        <button key={k} onClick={() => setSort(k)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11.5, padding: "6px 11px", border: "none", ...segStyle(sort === k) }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", border: "1px solid var(--z-rule)", borderRadius: 7, overflow: "hidden" }}>
                    <button onClick={() => setView("table")} title="Table" style={{ cursor: "pointer", display: "flex", padding: "6px 10px", border: "none", ...segStyle(view === "table") }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 10h18M9 4v16" /></svg>
                    </button>
                    <button onClick={() => setView("cards")} title="Cards" style={{ cursor: "pointer", display: "flex", padding: "6px 10px", border: "none", borderLeft: "1px solid var(--z-rule)", ...segStyle(view === "cards") }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>
                    </button>
                  </div>
                </div>

                {view === "table" ? <TableView rows={rows} /> : <CardView rows={rows} />}

                <div style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)", borderTop: "1px solid var(--z-rule)" }}>
                  {rows.length} of {MODELS.length} shown · open-source: 25% off, zero markup · frontier: zero markup
                </div>
              </div>
            </div>
          </div>
          <div style={{ height: 76 }} />
        </div>
      </section>
    </div>
  );
}

// ── sub-components ──────────────────────────────────────────────────────
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-7)", padding: "0 8px 8px" }}>{title}</div>
      {children}
    </div>
  );
}

function FilterBtn({ label, count, dot, icon, check, active, onClick }: { label: string; count?: string; dot?: string; icon?: string; check?: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "6px 8px", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12.5, ...optStyle(active) }}>
      {icon ? <BrandIcon name={icon} size={14} color={dot} /> : dot && <span style={{ width: 7, height: 7, borderRadius: 2, background: dot, flex: "0 0 auto" }} />}
      {check && <span style={{ width: 12, flex: "0 0 auto", color: "#6b9bff" }}>{check}</span>}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {count && <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>{count}</span>}
    </button>
  );
}

const TABLE_COLS = "minmax(0,2.4fr) 0.75fr 1fr 1fr 0.7fr 0.9fr";
type DecoratedRow = ReturnType<typeof decorate>;

function TableView({ rows }: { rows: DecoratedRow[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: TABLE_COLS, background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--z-ink-7)" }}>
          <div style={{ padding: "11px 16px" }}>model</div><div style={{ padding: "11px 10px" }}>ctx</div><div style={{ padding: "11px 10px" }}>in /1M</div><div style={{ padding: "11px 10px" }}>out /1M</div><div style={{ padding: "11px 10px" }}>p50</div><div style={{ padding: "11px 10px" }}>modality</div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="zed-row-hover" style={{ display: "grid", gridTemplateColumns: TABLE_COLS, alignItems: "center", borderBottom: "1px solid var(--z-rule-faint)" }}>
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <BrandIcon name={r.p} size={15} color={r.dot} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.id}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: r.tagColor, border: `1px solid ${r.tagBorder}`, borderRadius: 4, padding: "2px 5px", flex: "0 0 auto" }}>{r.tag}</span>
            </div>
            <div style={{ padding: "12px 10px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-5)" }}>{r.ctx}</div>
            <PriceCell txt={r.inTxt} w={r.inW} color={r.inColor} />
            <PriceCell txt={r.outTxt} w={r.outW} color={r.outColor} />
            <div style={{ padding: "12px 10px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-5)" }}>{r.p50txt}</div>
            <div style={{ padding: "12px 10px", display: "flex", gap: 5, flexWrap: "wrap" }}>
              {r.mods.map((m) => <ModTag key={m} m={m} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceCell({ txt, w, color }: { txt: string; w: string; color: string }) {
  return (
    <div style={{ padding: "12px 10px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-2)" }}>{txt}</div>
      <div style={{ height: 3, background: "#1a1e24", marginTop: 5, marginRight: 12 }}>
        <span style={{ display: "block", height: "100%", width: w, background: color }} />
      </div>
    </div>
  );
}

function ModTag({ m }: { m: Modality }) {
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.05em", color: MODC[m], border: "1px solid var(--z-rule)", borderRadius: 3, padding: "1px 4px" }}>{m}</span>;
}

function CardView({ rows }: { rows: DecoratedRow[] }) {
  return (
    <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", padding: 16, gap: 14 }}>
      {rows.map((r) => (
        <div key={r.id} className="zed-row-hover" style={{ border: "1px solid var(--z-rule)", borderRadius: 9, padding: "18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <BrandIcon name={r.p} size={16} color={r.dot} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--z-ink-5)" }}>{r.p}</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: r.tagColor, border: `1px solid ${r.tagBorder}`, borderRadius: 4, padding: "2px 6px" }}>{r.tag}</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--z-ink)", marginTop: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.id}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
            {([["in /1M", r.inTxt, r.inW, r.inColor], ["out /1M", r.outTxt, r.outW, r.outColor]] as [string, string, string, string][]).map(([lab, txt, w, color]) => (
              <div key={lab}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--z-ink-7)" }}>{lab}</div>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "var(--z-ink-2)", marginTop: 2 }}>{txt}</div>
                <div style={{ height: 3, background: "#1a1e24", marginTop: 6 }}><span style={{ display: "block", height: "100%", width: w, background: color }} /></div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--z-ink-6)" }}>
            <span>ctx {r.ctx}</span><span>·</span><span>p50 {r.p50txt}</span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>{r.mods.map((m) => <ModTag key={m} m={m} />)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
