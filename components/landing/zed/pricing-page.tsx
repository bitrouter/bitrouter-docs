import "./zed.css";
import { Kicker } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { ZED_LINKS } from "./primitives";
import { BrandIcon } from "./brand-icon";

const BUNDLE_DOTS = ["#9aa2af", "#5bbf6a", "#a78bfa", "#7f8894", "#e0a955", "#e0805b", "#5b8def", "#6b9bff"];

type Feat = { txt: string; soon?: boolean };
type Tier = {
  kicker: string;
  name: string;
  price: string;
  unit: string;
  priceColor: string;
  variant: "primary" | "ghost";
  cta: string;
  ctaHref?: string;
  disabled?: boolean;
  bestFor: string;
  blurb: string;
  bundle?: boolean;
  bundleCount?: string;
  features: Feat[];
};

const TIERS: Tier[] = [
  {
    kicker: "substrate",
    name: "Pay-as-you-go",
    price: "0%",
    unit: "markup",
    priceColor: "var(--z-blue)",
    variant: "primary",
    cta: "Get API key →",
    ctaHref: ZED_LINKS.apiKey,
    bestFor: "Spiky or exploratory usage — pay exactly what you use, no commitment.",
    blurb: "Every model on one key. We charge exactly what the provider charges underneath — no token markup, no routing fee.",
    features: [
      { txt: "100+ models on one key" },
      { txt: "Exactly the upstream price" },
      { txt: "Failover + guardrails" },
      { txt: "Per-run observability" },
    ],
  },
  {
    kicker: "override",
    name: "Subscription",
    price: "$20",
    unit: "/ mo",
    priceColor: "var(--z-ink)",
    variant: "ghost",
    cta: "Coming soon",
    disabled: true,
    bestFor: "Adding open-weight models on top of your Claude Code or Codex plan — try them on routine work without changing your setup.",
    blurb: "One flat rate for every flagship open-weight model, bundled — the routine 90% at a fraction of frontier cost, no per-token metering.",
    bundle: true,
    bundleCount: "8 flagship open-weight models",
    features: [
      { txt: "20 req / min" },
      { txt: "1M tokens / day" },
      { txt: "Flat rate — no per-token metering" },
      { txt: "Frontier via passthrough", soon: true },
    ],
  },
  {
    kicker: "override",
    name: "Scale",
    price: "$100",
    unit: "/ mo",
    priceColor: "var(--z-ink)",
    variant: "ghost",
    cta: "Coming soon",
    disabled: true,
    bestFor: "Replacing proprietary models with open-weight end to end, when you're ready — the full switch at team throughput.",
    blurb: "The full open-weight bundle at team scale — higher throughput, seats and shared spend controls.",
    bundle: true,
    bundleCount: "8 flagship open-weight models",
    features: [
      { txt: "100 req / min" },
      { txt: "10M tokens / day" },
      { txt: "5 team seats" },
      { txt: "Priority routing capacity" },
    ],
  },
  {
    kicker: "layer",
    name: "Outcome-based",
    price: "Custom",
    unit: "on savings",
    priceColor: "var(--z-ink)",
    variant: "ghost",
    cta: "Talk to the founders →",
    ctaHref: "mailto:contact@bitrouter.ai",
    bestFor: "Teams running full production loops at scale who want spend tied to measured savings.",
    blurb: "Run your full production loop through BitRouter. We guarantee it stays under the budget you set, and bill only on runs that clear your quality bar — at a custom rate scoped to your workload.",
    features: [
      { txt: "Budget guarantee" },
      { txt: "Priced on savings — only on success" },
      { txt: "Never more than we save you" },
      { txt: "Founders + SLA" },
    ],
  },
];

const BUNDLE = [
  { name: "Kimi-k3", lab: "Moonshot AI", dot: "#9aa2af" },
  { name: "GLM-5.2", lab: "Z.ai", dot: "#5bbf6a" },
  { name: "Qwen-3.8", lab: "Alibaba", dot: "#a78bfa" },
  { name: "Stepfun-3.7", lab: "StepFun", dot: "#7f8894" },
  { name: "MiniMax M3", lab: "MiniMax", dot: "#e0a955" },
  { name: "MiMo-V2.5", lab: "Xiaomi", dot: "#e0805b" },
  { name: "DeepSeek-V4", lab: "DeepSeek", dot: "#5b8def" },
  { name: "Hy3", lab: "Tencent Hunyuan", dot: "#6b9bff" },
];

const TIER_NAMES = ["Pay-as-you-go", "Subscription", "Scale", "Outcome-based"];
type CmpVal = string | boolean;
const COMPARE: { label: string; row: CmpVal[] }[] = [
  { label: "Token markup", row: ["0%", "0%", "0%", "0%"] },
  { label: "Models", row: ["100+ · all", "Open-source", "Open-source", "All"] },
  { label: "Frontier access", row: ["Passthrough", "Passthrough", "Passthrough", true] },
  { label: "Requests / min", row: ["Metered", "20", "100", "Custom"] },
  { label: "Daily tokens", row: ["Metered", "1M", "10M", "Custom"] },
  { label: "Team seats", row: [false, "1", "5", "Custom"] },
  { label: "Multi-provider failover", row: [true, true, true, true] },
  { label: "Per-run observability", row: [true, true, true, true] },
  { label: "Router guardrails", row: [true, true, true, true] },
  { label: "Budget guarantee", row: [false, false, false, true] },
  { label: "Priced on outcomes", row: [false, false, false, "Custom"] },
  { label: "Self-host (Apache-2.0)", row: [true, true, true, true] },
  { label: "SSO · SIEM · DPA", row: [false, false, false, true] },
  { label: "Support", row: ["Community", "Community", "Priority", "Founders + SLA"] },
];

function cmpCell(v: CmpVal): { val: string; color: string } {
  if (v === true) return { val: "✓", color: "var(--z-blue)" };
  if (v === false) return { val: "—", color: "var(--z-ink-8)" };
  return { val: v, color: "var(--z-ink-2)" };
}

function TierCard({ t, last }: { t: Tier; last: boolean }) {
  return (
    <div
      style={{
        padding: "28px 24px",
        borderRight: last ? "none" : "1px solid var(--z-rule)",
        background: t.variant === "primary" ? "#0e1220" : "transparent",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-7)" }}>
          {t.kicker}
        </span>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "var(--z-ink)" }}>{t.name}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 38, lineHeight: 1, color: t.priceColor }}>
          {t.price}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--z-ink-6)" }}>{t.unit}</div>
      </div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "14px 0 16px", minHeight: 66 }}>
        {t.blurb}
      </p>
      <div style={{ borderTop: "1px solid var(--z-rule)", paddingTop: 14, marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-blue)", marginBottom: 7 }}>
          best for
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.55, color: "var(--z-ink-2)", minHeight: 74 }}>{t.bestFor}</div>
      </div>
      {t.bundle && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
            {BUNDLE_DOTS.map((d, i) => (
              <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: d }} />
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-2)" }}>{t.bundleCount}</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 22 }}>
        {t.features.map((f) => (
          <div key={f.txt} style={{ display: "flex", gap: 9, fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.5, color: "var(--z-ink-3)" }}>
            <span style={{ color: "var(--z-blue)" }}>▸</span>
            <span>
              {f.txt}
              {f.soon && (
                <span style={{ marginLeft: 6, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--z-amber)", border: "1px solid #3d3320", borderRadius: 4, padding: "1px 5px" }}>
                  soon
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <a
        href={t.disabled ? undefined : t.ctaHref}
        aria-disabled={t.disabled}
        style={{
          marginTop: "auto",
          display: "block",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          padding: "10px 14px",
          borderRadius: 7,
          cursor: t.disabled ? "default" : "pointer",
          ...(t.variant === "primary"
            ? { background: "var(--z-cta)", color: "#fff", fontWeight: 500 }
            : { color: t.disabled ? "var(--z-ink-6)" : "var(--z-ink)", border: "1px solid var(--z-rule-2)" }),
        }}
      >
        {t.cta}
      </a>
    </div>
  );
}

export function ZedPricingPage() {
  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 1180 }}>
          {/* header */}
          <div style={{ padding: "56px 0 34px", textAlign: "center" }}>
            <Kicker>// pricing</Kicker>
            <h1 className="zed-display" style={{ fontSize: "clamp(38px, 6vw, 56px)", lineHeight: 1.0, margin: "16px auto 0", maxWidth: "20ch" }}>
              Open-weight SOTA, <span style={{ color: "var(--z-blue)" }}>one low flat rate.</span>
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "16px auto 0", maxWidth: "58ch" }}>
              The flagship open model from eight frontier labs, bundled into a single subscription — a
              fraction of frontier cost, with zero markup on every token.
            </p>
          </div>

          {/* tiers */}
          <div className="zed-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1px solid var(--z-rule)" }}>
            {TIERS.map((t, i) => (
              <TierCard key={t.name} t={t} last={i === TIERS.length - 1} />
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.65, color: "var(--z-ink-5)", margin: "18px 0 0", maxWidth: "82ch" }}>
            <strong style={{ color: "var(--z-ink-2)", fontWeight: 600 }}>Composable, not exclusive</strong> —
            passthrough is the floor under everything; subscription overrides it for open models; outcome
            sits on top for teams running production loops at scale. Self-hosting is always free and Apache-2.0.
          </p>

          {/* subscription bundle */}
          <div style={{ marginTop: 40, border: "1px solid var(--z-rule)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "18px 22px", borderBottom: "1px solid var(--z-rule)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "var(--z-ink)" }}>What&apos;s in the Subscription bundle</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-4)", marginTop: 4 }}>
                  Eight frontier labs&apos; flagship open-weight models — one flat rate, no per-token metering.
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "var(--z-blue)" }}>$20</span>
                <span style={{ color: "var(--z-ink-6)" }}>/ mo · 20 req/min · 1M tok/day</span>
              </div>
            </div>
            <div className="zed-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
              {BUNDLE.map((m, i) => (
                <div
                  key={m.name}
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                    borderRight: i % 4 !== 3 ? "1px solid var(--z-rule)" : "none",
                    borderBottom: i < 4 ? "1px solid var(--z-rule)" : "none",
                  }}
                >
                  <div style={{ width: 32, height: 32, flex: "0 0 auto", border: "1px solid var(--z-rule)", borderRadius: 8, background: "var(--z-inset)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BrandIcon name={m.lab} size={18} color={m.dot} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--z-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)", marginTop: 3 }}>{m.lab}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "13px 22px", borderTop: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)" }}>
              Hit a limit and BitRouter falls back to pay-as-you-go automatically · frontier models stay one alias away at passthrough.
            </div>
          </div>

          {/* savings calculator (static illustration) */}
          <div style={{ marginTop: 72, borderTop: "1px solid var(--z-rule)", paddingTop: 44 }}>
            <Kicker>// what you&apos;d save</Kicker>
            <h2 className="zed-display" style={{ fontSize: 38, lineHeight: 1.06, margin: "14px 0 0", maxWidth: "24ch" }}>
              Swap a frontier model for an open one.
            </h2>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "14px 0 26px", maxWidth: "64ch" }}>
              The routine majority of an agent&apos;s calls don&apos;t need frontier prices. Here&apos;s the gap at official list prices — same key, zero markup.
            </p>
            <div className="zed-term">
              <div style={{ display: "flex", alignItems: "center", padding: "10px 15px", background: "var(--z-panel-header)", borderBottom: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)" }}>
                cost-calculator — closed vs open
                <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>official list prices</span>
              </div>
              <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "22px 24px", borderRight: "1px solid var(--z-rule)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)" }}>You&apos;re running</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--z-amber)", marginTop: 8 }}>Claude Opus 4.8 · $30/Mtok</div>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44, color: "var(--z-ink-2)", lineHeight: 1, marginTop: 18 }}>
                    $3,000
                    <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal", fontSize: 12, color: "var(--z-ink-6)" }}> / mo</span>
                  </div>
                </div>
                <div style={{ padding: "22px 24px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)" }}>Switch to (open-source)</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--z-green)", marginTop: 8 }}>Qwen 3.7 · $0.6/Mtok</div>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44, color: "var(--z-blue)", lineHeight: 1, marginTop: 18 }}>
                    $60
                    <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal", fontSize: 12, color: "var(--z-ink-6)" }}> / mo</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", background: "var(--z-panel-header)", borderTop: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--z-ink-4)", flexWrap: "wrap" }}>
                <span style={{ color: "var(--z-ink-6)" }}>100M tokens / mo · list $30 → $0.6 / Mtok</span>
                <span style={{ marginLeft: "auto", color: "var(--z-ink-2)" }}>
                  you save / mo <b style={{ color: "var(--z-green)", fontSize: 16 }}>$2,940</b>
                </span>
                <span style={{ color: "var(--z-blue)", fontWeight: 500 }}>−98%</span>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.6, color: "var(--z-ink-6)", margin: "14px 0 0", maxWidth: "78ch" }}>
              Illustrative, at official list prices. BitRouter routes each call to the cheapest model that holds quality — 0% markup on every token.
            </p>
          </div>

          {/* startup program */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24, border: "1px solid var(--z-rule)", borderRadius: 12, padding: "26px 30px", marginTop: 32 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "var(--z-ink)", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--z-green-dot)", fontSize: 11 }}>●</span> Startup program
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, color: "var(--z-ink-4)" }}>
              Building production agents pre-seed to Series B? Get free and discounted credits on every open-source model — on top of zero markup — to switch your loop over today.
            </div>
            <a href="/startup" style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--z-ink)", padding: "9px 16px", borderRadius: 7, border: "1px solid var(--z-rule-2)", whiteSpace: "nowrap" }}>
              Apply for credits →
            </a>
          </div>

          {/* comparison table */}
          <div style={{ marginTop: 72, borderTop: "1px solid var(--z-rule)", paddingTop: 44, overflowX: "auto" }}>
            <Kicker>// compare</Kicker>
            <h2 className="zed-display" style={{ fontSize: 38, lineHeight: 1.06, margin: "14px 0 26px" }}>
              Every plan, side by side.
            </h2>
            <div style={{ minWidth: 720, border: "1px solid var(--z-rule)", borderRadius: 11, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)" }}>
                <div style={{ padding: "13px 18px" }} />
                {TIER_NAMES.map((n) => (
                  <div key={n} style={{ padding: "13px 14px", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--z-ink-2)" }}>{n}</div>
                ))}
              </div>
              {COMPARE.map((r) => (
                <div key={r.label} style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", borderBottom: "1px solid var(--z-rule-faint)" }}>
                  <div style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-4)" }}>{r.label}</div>
                  {r.row.map((v, i) => {
                    const c = cmpCell(v);
                    return (
                      <div key={i} style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: c.color }}>{c.val}</div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <PricingFaq />
          <div style={{ height: 76 }} />
        </div>
      </section>
    </div>
  );
}
