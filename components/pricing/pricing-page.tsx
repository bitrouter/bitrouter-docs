"use client";

/* Pricing — mono/dev redesign. Ported to the `.br-mono` design language so it
   sits alongside the landing/models/providers surfaces. Structure:
   compact header + three pricing columns (passthrough / subscription w/ tier
   tabs / outcome) → cost calculator (closed→open savings) → startup-credits
   band → trimmed compare matrix → FAQ.

   The outcome (enterprise) column is summarized here and hands off to
   /enterprise for the full budget-guarantee pitch. */

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import "../landing/mono/mono.css";
import "./pricing.css";
import { CostCalculator } from "./cost-calculator";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";

/* ---------------- pricing columns (page header) ---------------- */
type Feat = string;

const PAYG_FEATS: Feat[] = [
  "100+ models on one key",
  "Exactly the upstream price",
  "Failover + guardrails",
  "Per-run observability",
];

const SUB_TIERS: { price: string; feats: Feat[] }[] = [
  {
    price: "$20",
    feats: ["20 req / min", "1M tokens / day", "All open-source models", "Frontier via passthrough"],
  },
  {
    price: "$100",
    feats: ["60 req / min", "6M tokens / day", "All open-source models", "Frontier via passthrough"],
  },
  {
    price: "$200",
    feats: ["150 req / min", "20M tokens / day", "All open-source models", "Priority routing"],
  },
];

const OUTCOME_FEATS: Feat[] = [
  "Budget guarantee",
  "20% of savings — only on success",
  "Never more than we save you",
  "Founders + SLA",
];

function FeatList({ items }: { items: Feat[] }) {
  return (
    <ul className="pcol-feats">
      {items.map((f) => (
        <li key={f}>
          <span className="pcol-dot">▸</span> {f}
        </li>
      ))}
    </ul>
  );
}

function SubscriptionCol() {
  const [t, setT] = React.useState(0);
  const tier = SUB_TIERS[t];
  return (
    <div className="pcol">
      <span className="pcol-tier">override</span>
      <span className="pcol-name">Subscription</span>
      <div className="subtabs">
        {SUB_TIERS.map((s, i) => (
          <button
            key={s.price}
            type="button"
            className={"subtab" + (i === t ? " on" : "")}
            onClick={() => {
              setT(i);
              posthog.capture("subscription_tier_viewed", { tier: s.price });
            }}
          >
            {s.price}
          </button>
        ))}
      </div>
      <div className="pcol-price">
        {tier.price} <small>/ mo</small>
      </div>
      <p className="pcol-desc">
        A flat monthly rate for the open-source models that hold the routine 90%.
        Frontier still runs at passthrough on the same key.
      </p>
      <FeatList items={tier.feats} />
      <a
        href={SIGN_IN_URL}
        className="pcol-cta"
        onClick={() => posthog.capture("pricing_layer_cta_clicked", { tier: "subscription" })}
      >
        Subscribe
      </a>
    </div>
  );
}

function PricingColumns() {
  return (
    <section className="page-head" style={{ paddingBottom: 72 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          <span className="idx">//</span> pricing
        </div>
        <h1
          className="h-display page-title"
          style={{ maxWidth: "18ch", marginBottom: 44 }}
        >
          Zero markup — or pay only on savings.
        </h1>

        <div className="pcols">
          {/* substrate */}
          <div className="pcol">
            <span className="pcol-tier">substrate</span>
            <span className="pcol-name">Pay-as-you-go</span>
            <div className="pcol-price">
              <span className="free">0%</span> <small>markup</small>
            </div>
            <p className="pcol-desc">
              Every model on one key. We charge exactly what the provider charges
              underneath — no token markup, no routing fee.
            </p>
            <FeatList items={PAYG_FEATS} />
            <a
              href={SIGN_IN_URL}
              className="pcol-cta primary"
              onClick={() => posthog.capture("pricing_layer_cta_clicked", { tier: "payg" })}
            >
              Get API key →
            </a>
          </div>

          {/* override */}
          <SubscriptionCol />

          {/* layer */}
          <div className="pcol on">
            <span className="pcol-tier">
              <span className="lyr">layer</span>
            </span>
            <span className="pcol-name">Outcome-based</span>
            <div className="pcol-price">
              20% <small>of savings</small>
            </div>
            <p className="pcol-desc">
              Run your full production loop through BitRouter. We guarantee it
              stays under the budget you set, and bill only on runs that clear
              your quality bar.
            </p>
            <FeatList items={OUTCOME_FEATS} />
            <Link
              href="/enterprise"
              className="pcol-cta"
              onClick={() => posthog.capture("pricing_layer_cta_clicked", { tier: "outcome" })}
            >
              Talk to the founders →
            </Link>
          </div>
        </div>

        <p className="pstack-note">
          <b>Composable, not exclusive</b> — passthrough is the floor under
          everything; subscription overrides it for open models; outcome sits on
          top for teams running production loops at scale. Self-hosting is always
          free and Apache-2.0.
        </p>
      </div>
    </section>
  );
}

/* ---------------- calculator ---------------- */
function CalculatorSection() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--term-ok)" }}
          >
            <span className="idx">//</span> what you&rsquo;d save
          </div>
          <h2 className="h-display sec-title">
            Swap a frontier model for an open one.
          </h2>
          <p className="sec-lead">
            The routine majority of an agent&rsquo;s calls don&rsquo;t need
            frontier prices. Here&rsquo;s the gap at official list prices — same
            key, zero markup.
          </p>
        </div>
        <CostCalculator />
      </div>
    </section>
  );
}

/* ---------------- startup credits ---------------- */
function StartupCredits() {
  return (
    <section className="sec" id="startups" style={{ scrollMarginTop: 64 }}>
      <div className="wrap">
        <div className="credits">
          <div className="credits-copy">
            <span className="chip">
              <span style={{ color: "var(--term-ok)" }}>●</span> Startup program
            </span>
            <span className="credits-h">Credits for early-stage teams.</span>
            <p className="credits-p">
              Building production agents pre-seed to Series&nbsp;B? Get free and
              discounted credits on every open-source model — on top of zero
              markup — to switch your loop over today.
            </p>
          </div>
          <Link
            href="/enterprise"
            className="btn btn-primary"
            onClick={() => posthog.capture("startup_credits_cta_clicked")}
          >
            Apply for credits →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- compare matrix ---------------- */
type Mark = "yes" | "no" | string;
type Row = { feat: string; payg: Mark; sub: Mark; outcome: Mark; accent?: boolean };

const ROWS: Row[] = [
  { feat: "Token markup", payg: "0%", sub: "0%", outcome: "0%" },
  { feat: "Models", payg: "100+ · all", sub: "Open-source", outcome: "All" },
  { feat: "Frontier access", payg: "Passthrough", sub: "Passthrough", outcome: "yes" },
  { feat: "Multi-provider failover", payg: "yes", sub: "yes", outcome: "yes" },
  { feat: "Per-run observability", payg: "yes", sub: "yes", outcome: "yes" },
  { feat: "Router guardrails", payg: "yes", sub: "yes", outcome: "yes" },
  { feat: "Budget guarantee", payg: "no", sub: "no", outcome: "yes", accent: true },
  { feat: "Priced on outcomes", payg: "no", sub: "no", outcome: "20% of savings", accent: true },
  { feat: "Self-host (Apache-2.0)", payg: "yes", sub: "yes", outcome: "yes" },
  { feat: "SSO · SIEM · DPA", payg: "no", sub: "no", outcome: "yes" },
  { feat: "Support", payg: "Community", sub: "Community", outcome: "Founders + SLA" },
];

function Cell({ v, accent }: { v: Mark; accent?: boolean }) {
  if (v === "yes")
    return <span className="compare-mark compare-mark-yes">✓</span>;
  if (v === "no") return <span className="compare-mark compare-mark-no">—</span>;
  return (
    <span style={accent ? { color: "var(--accent)" } : undefined}>{v}</span>
  );
}

function Compare() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow sec-eyebrow">
            <span className="idx">//</span> compare plans
          </div>
          <h2 className="h-display sec-title">What each layer gives you.</h2>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-th compare-th-feat">Feature</th>
                <th className="compare-th compare-th-prod">Pay-as-you-go</th>
                <th className="compare-th compare-th-prod">Subscription</th>
                <th className="compare-th compare-th-prod">
                  <span className="compare-th-brand">Outcome</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr className="compare-row" key={r.feat}>
                  <th className="compare-feat">{r.feat}</th>
                  <td className="compare-cell">
                    <Cell v={r.payg} />
                  </td>
                  <td className="compare-cell">
                    <Cell v={r.sub} />
                  </td>
                  <td className="compare-cell br">
                    <Cell v={r.outcome} accent={r.accent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does BitRouter make money if pay-as-you-go is 0% markup?",
    a: "Pay-as-you-go is genuinely passthrough — you pay the exact upstream provider rate, no token markup, no routing fee. BitRouter earns on the flat-rate Subscription and on the outcome-based tier, where we take a share of the spend we actually save you. Routing your usage never carries a BitRouter fee.",
  },
  {
    q: "How does outcome-based pricing work?",
    a: "You run your full production loop through BitRouter. You set a budget and a measurable quality floor. We guarantee the loop stays under your budget, and we bill 20% of what we save you against your measured baseline — only on runs that clear your quality bar, and never more than we saved you. It's enterprise-only for now; talk to the founders to scope it.",
  },
  {
    q: "Do the three plans stack?",
    a: "Yes. Passthrough (0% markup) is the substrate under everything. Subscription overrides it with a flat rate for open-source models — frontier calls still run at passthrough. Outcome-based sits on top as an engagement layer for teams routing production loops at scale. You're not picking one wall; you're stacking layers.",
  },
  {
    q: "What's included in the Subscription tiers?",
    a: "$20, $100, and $200 per month buy progressively higher rate limits and throughput on the leading open-source models — Kimi, GLM, DeepSeek, Qwen, MiniMax, and more. Frontier models stay one alias away at passthrough. If you hit your subscription's limits, BitRouter falls back to pay-as-you-go so your workloads keep running.",
  },
  {
    q: "Can I self-host for free?",
    a: "Yes. The full stack is Apache-2.0. Self-host on your own infrastructure with no platform fee, no minimums, and no token markup — you pay only your upstream provider costs. Same routing engine, guardrails, and observability as the hosted edge.",
  },
];

function Faq() {
  const [open, setOpen] = React.useState<number>(0);
  return (
    <section className="sec faq">
      <div className="wrap faq-grid">
        <div className="faq-aside">
          <h2 className="h-display sec-title">Questions before you switch.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={"faq-item" + (i === open ? " open" : "")} key={f.q}>
              <button
                className="faq-q"
                onClick={() => setOpen(i === open ? -1 : i)}
              >
                <span className="faq-q-mark">{i === open ? "−" : "+"}</span>
                <span>{f.q}</span>
              </button>
              <div className="faq-a-wrap">
                <div className="faq-a">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- structured data (SEO / GEO) ---------------- */
const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: String(f.a) },
  })),
};

const PRODUCT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BitRouter",
  description:
    "Open-source LLM router with 0% markup, flat-rate open-source subscriptions, and outcome-based pricing.",
  brand: { "@type": "Brand", name: "BitRouter" },
  offers: [
    { "@type": "Offer", name: "Pay-as-you-go", price: "0", priceCurrency: "USD", description: "0% markup — the exact upstream provider price on every model." },
    { "@type": "Offer", name: "Subscription — Starter", price: "20", priceCurrency: "USD", description: "Flat monthly rate for open-source models." },
    { "@type": "Offer", name: "Subscription — Growth", price: "100", priceCurrency: "USD", description: "Higher rate limits and throughput." },
    { "@type": "Offer", name: "Subscription — Scale", price: "200", priceCurrency: "USD", description: "Highest rate limits and priority routing." },
  ],
};

/* ---------------- page ---------------- */
export function PricingPage() {
  return (
    <div className="br-mono">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSONLD) }}
      />
      <PricingColumns />
      <CalculatorSection />
      <StartupCredits />
      <Compare />
      <Faq />
    </div>
  );
}
