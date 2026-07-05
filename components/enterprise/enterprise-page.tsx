"use client";

/* Enterprise / outcome-based — mono/dev redesign. The budget-guarantee pitch:
   hero (the one-liner) → guarantee + per-run receipt → how it works (measure /
   route / bill) → free-audit CTA → production-ready reassurance → FAQ → footer.

   "Talk to the founders" books the Cal.com founder-call embed. */

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";
import "../landing/mono/mono.css";
import "./enterprise.css";

/* Cal.com founder-call CTA, styled as a mono button. */
function FounderCTA({
  className = "btn btn-primary",
  location,
  children,
}: {
  className?: string;
  location: string;
  children: React.ReactNode;
}) {
  return (
    <button
      data-cal-namespace="founder-call"
      data-cal-link="kelsenliu/founder-call"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      className={className}
      onClick={() => posthog.capture("founder_call_booked", { location })}
    >
      {children}
    </button>
  );
}

/* ---------------- hero ---------------- */
function Hero() {
  return (
    <section className="page-head">
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          <span className="idx">//</span> outcome-based · enterprise
        </div>
        <h1 className="h-display page-title" style={{ maxWidth: "17ch" }}>
          We only get paid when we cut your bill.
        </h1>
        <p className="page-lead">
          Run your full production loop through BitRouter. We guarantee it stays
          under the budget you set, and take 20% of what we save you against your
          measured baseline — only on runs that clear the quality bar you
          defined, and never more than we saved you.
        </p>
        <div className="ehero-actions">
          <FounderCTA location="enterprise_hero">
            Talk to the founders →
          </FounderCTA>
          <Link href="/pricing" className="btn btn-ghost">
            See all pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- guarantee + receipt ---------------- */
function Guarantee() {
  return (
    <section className="sec">
      <div className="wrap eguard">
        <div>
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> the guarantee
          </div>
          <h2 className="h-display sec-title">Guaranteed under budget.</h2>
          <p className="sec-lead">
            You set a monthly budget and a measurable quality floor. We hold your
            loop under budget — or credit you the difference. The budget is the
            hard promise; quality is the bar a run has to clear before we bill a
            cent. Every run is settled on an auditable receipt, so there&rsquo;s
            no reconciliation meeting — just the math, in the open.
          </p>
        </div>

        <figure className="receipt">
          <span className="receipt-legend">Fig. — run receipt · run_8x2k</span>
          <div className="receipt-row">
            <span className="receipt-k">baseline (measured)</span>
            <span className="receipt-v">$2.10</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-k">delivered (routed)</span>
            <span className="receipt-v">
              $0.38 <span className="receipt-note">✓ under $0.50 cap</span>
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-k">quality floor</span>
            <span className="receipt-v receipt-ok">✓ tests green</span>
          </div>
          <hr className="receipt-rule" />
          <div className="receipt-row">
            <span className="receipt-k">you saved</span>
            <span className="receipt-v">$1.72</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-k">our share (20%)</span>
            <span className="receipt-v">$0.34</span>
          </div>
          <div className="receipt-row receipt-total">
            <span className="receipt-k">you keep</span>
            <span className="receipt-v">$1.38</span>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */
const STEPS: { n: string; h: string; b: string }[] = [
  {
    n: "01",
    h: "Measure",
    b: "A free two-week audit runs your real traffic through BitRouter in passthrough — no markup — to measure your true cost-per-run and quality baseline. You pay nothing until we beat a number you watched us record.",
  },
  {
    n: "02",
    h: "Route",
    b: "We route every call to the cheapest model that clears your quality floor, keeping the loop under your budget. When quality can't be held cheaply, we fall back to protect it — on our dime, not yours.",
  },
  {
    n: "03",
    h: "Bill",
    b: "20% of the savings we actually delivered, only on runs that met your budget and quality bar — never more than we saved you. Each run's baseline, cost, and quality check are itemized on the receipt.",
  },
];

function HowItWorks() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--term-ok)" }}
          >
            <span className="idx">//</span> how it works
          </div>
          <h2 className="h-display sec-title">Measure. Route. Bill on results.</h2>
        </div>
        <div className="esteps">
          {STEPS.map((s) => (
            <div className="estep" key={s.n}>
              <span className="estep-n">{s.n}</span>
              <span className="estep-h">{s.h}</span>
              <p className="estep-b">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- free audit CTA ---------------- */
function AuditCta() {
  return (
    <section className="sec">
      <div className="wrap cta-wrap dotgrid" style={{ display: "block" }}>
        <div
          className="eyebrow sec-eyebrow"
          style={{ ["--sec-accent" as string]: "var(--accent)" }}
        >
          <span className="idx">//</span> start free
        </div>
        <h2 className="h-display cta-title" style={{ maxWidth: "20ch" }}>
          Start with a free audit of your real traffic.
        </h2>
        <p className="sec-lead" style={{ maxWidth: "52ch" }}>
          Two weeks, metadata-only, prompts never leave your infra. You get a
          hard number — what you&rsquo;re overpaying, and what we can give back —
          with no commitment to continue.
        </p>
        <div className="ehero-actions">
          <FounderCTA location="enterprise_audit">
            Book a founder call →
          </FounderCTA>
        </div>
      </div>
    </section>
  );
}

/* ---------------- self-serve vs enterprise ---------------- */
type Mark = "yes" | "no" | string;
type ERow = { feat: string; self: Mark; ent: Mark; hi?: boolean };

const EROWS: ERow[] = [
  { feat: "Pricing", self: "0% markup · subscription", ent: "Outcome-based" },
  { feat: "Budget guarantee", self: "no", ent: "yes" },
  { feat: "Volume discounts", self: "no", ent: "yes", hi: true },
  { feat: "Startup-program credits", self: "Apply", ent: "Included", hi: true },
  { feat: "Free workload audit", self: "no", ent: "yes" },
  { feat: "Forward-deployed onboarding", self: "no", ent: "yes" },
  { feat: "Private by default", self: "yes", ent: "yes" },
  { feat: "Self-host / your VPC", self: "yes", ent: "yes" },
  { feat: "SSO · SAML · OIDC", self: "no", ent: "yes" },
  { feat: "SIEM audit-log streaming", self: "no", ent: "yes" },
  { feat: "DPA", self: "no", ent: "yes" },
  { feat: "Support", self: "Community", ent: "Founders + SLA" },
];

function ECell({ v, accent }: { v: Mark; accent?: boolean }) {
  if (v === "yes")
    return <span className="compare-mark compare-mark-yes">✓</span>;
  if (v === "no") return <span className="compare-mark compare-mark-no">—</span>;
  return (
    <span style={accent ? { color: "var(--accent)" } : undefined}>{v}</span>
  );
}

function EnterpriseCompare() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> self-serve vs enterprise
          </div>
          <h2 className="h-display sec-title">What enterprise adds.</h2>
          <p className="sec-lead">
            Everything in self-serve, plus the budget guarantee, volume
            discounts, startup-program credits, and hands-on onboarding to run
            production loops at scale.
          </p>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-th compare-th-feat">Feature</th>
                <th className="compare-th compare-th-prod">Self-serve</th>
                <th className="compare-th compare-th-prod">
                  <span className="compare-th-brand">Enterprise</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {EROWS.map((r) => (
                <tr
                  className={"compare-row" + (r.hi ? " erow-hi" : "")}
                  key={r.feat}
                >
                  <th className="compare-feat">
                    {r.hi && <span className="erow-star">●</span>}
                    {r.feat}
                  </th>
                  <td className="compare-cell">
                    <ECell v={r.self} />
                  </td>
                  <td className="compare-cell br">
                    <ECell v={r.ent} accent={r.hi} />
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
    q: "How do you set the baseline you bill against?",
    a: "We measure it. During the free audit we run your real traffic through BitRouter in passthrough and record your actual cost-per-run and quality pass-rate — that measured number is the agreed baseline, adjusted for volume and re-indexed as model prices move. It's your own before, not a strawman.",
  },
  {
    q: "What happens if you can't hit my budget?",
    a: "The budget is a guarantee, not a hope. If we miss it over a billing window, we credit you the difference. And on any single run where we can't hold your quality floor cheaply, we fall back to protect quality and simply don't bill that run — the cost of that is ours.",
  },
  {
    q: "Do you store my prompts?",
    a: "No. Prompts and completions are not stored — logs are metadata-only and configurable per project. The audit and ongoing billing run on metadata, so your prompts never leave your infrastructure. SSO, SIEM streaming, and a DPA are available on request.",
  },
  {
    q: "Why do I have to run the whole loop through BitRouter?",
    a: "To guarantee a budget and measure real savings, we have to see the whole loop — every call, not a sample. That's also what lets failover, guardrails, and per-run receipts work end-to-end. You can self-host the data plane so traffic stays in your VPC.",
  },
];

function Faq() {
  const [open, setOpen] = React.useState<number>(0);
  return (
    <section className="sec faq">
      <div className="wrap faq-grid">
        <div className="faq-aside">
          <h2 className="h-display sec-title">Before you hand us the loop.</h2>
          <p className="sec-lead">
            The questions every team asks. If yours isn&rsquo;t here, put it to
            us on the call.
          </p>
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

/* ---------------- page ---------------- */
export function EnterprisePage() {
  React.useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "founder-call" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <div className="br-mono">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <Hero />
      <Guarantee />
      <HowItWorks />
      <AuditCta />
      <EnterpriseCompare />
      <Faq />
    </div>
  );
}
