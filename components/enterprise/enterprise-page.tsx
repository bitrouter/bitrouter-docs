"use client";

/* Enterprise — FinOps token-cost governance, on the Zed design system.
   hero → tokenmaxxing trap (cited failure band) → what we govern → guarantee +
   run receipt → how it works → free-audit CTA → self-serve vs enterprise → FAQ.
   "Talk to the founders" books the Cal.com founder-call embed. */

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";
import "@/components/landing/zed/zed.css";
import { Kicker, CornerTicks } from "@/components/landing/zed/primitives";

const WRAP: React.CSSProperties = { padding: "88px 34px" };
const H2: React.CSSProperties = { fontSize: "clamp(30px,4.5vw,46px)", lineHeight: 1.06, margin: "16px 0 0" };
const LEAD: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 14.5, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "18px 0 0", maxWidth: "64ch",
};

function FounderCTA({ className, location, children }: { className: string; location: string; children: React.ReactNode }) {
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

function SecHead({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <div style={{ maxWidth: 720, marginBottom: 40 }}>
      <Kicker>// {kicker}</Kicker>
      <h2 className="zed-display" style={H2}>{title}</h2>
      {lead && <p style={LEAD}>{lead}</p>}
    </div>
  );
}

// ── hero ──
function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div className="zed-glow" />
      <CornerTicks />
      <div className="zed-wrap" style={{ padding: "64px 34px 40px" }}>
        <Kicker>// finops · enterprise</Kicker>
        <h1 className="zed-display" style={{ fontSize: "clamp(40px,7vw,68px)", lineHeight: 1.0, margin: "18px 0 0", maxWidth: "18ch" }}>
          Govern token spend across the org.
        </h1>
        <p style={{ ...LEAD, fontSize: 16 }}>
          FinOps for AI. BitRouter puts every team&rsquo;s token spend under one budget &mdash; real-time
          attribution, showback and chargeback, and quota governance &mdash; behind a router that holds each
          workload under the cap. We tie our fee to what we save you, so governance pays for itself.
        </p>
        <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
          <FounderCTA className="zed-btn zed-btn-primary" location="enterprise_hero">Talk to the founders →</FounderCTA>
          <Link href="/pricing" className="zed-btn zed-btn-ghost">See all pricing</Link>
        </div>
      </div>
    </section>
  );
}

// ── the tokenmaxxing trap ──
const FAILS = [
  { n: "15×", b: "Multi-agent systems burn roughly 15× the tokens of a plain chat — and in one eval, token volume alone explained 80% of performance.", src: "Anthropic Engineering, 2025", href: "https://www.anthropic.com/engineering/multi-agent-research-system" },
  { n: "$8.4B", b: "Enterprise model-API spend more than doubled in six months — even as the per-token price kept falling. Usage, not price, is the cost driver.", src: "Menlo Ventures, 2025", href: "https://menlovc.com/perspective/2025-mid-year-llm-market-update/" },
  { n: "~95%", b: "of enterprise GenAI pilots show no measurable P&L return — spend that never converts into governed, attributable value.", src: "MIT NANDA, 2025", href: "https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/" },
  { n: "$37B", b: "Enterprise GenAI spend in 2025, up from $1.7B in 2023 — growing ~3× a year, faster than any team can forecast off last quarter's run rate.", src: "FinOps Foundation, 2026", href: "https://www.finops.org/insights/token-economics-the-atomic-unit-of-ai-value/" },
];
function FailureBand() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="the tokenmaxxing trap" title="Token spend scales faster than anyone forecasts."
          lead="Agentic loops re-send their whole context every turn, so cost compounds with the task — not the price list. Roll that across every team and the bill outruns the budget before finance sees it." />
        <div className="zed-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1px solid var(--z-rule)" }}>
          {FAILS.map((f, i) => (
            <div key={f.src} style={{ padding: "26px 22px", borderRight: i === FAILS.length - 1 ? "none" : "1px solid var(--z-rule)" }}>
              <div className="zed-display" style={{ fontSize: 40, lineHeight: 1, color: "var(--z-blue)" }}>{f.n}</div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "14px 0 14px" }}>{f.b}</p>
              <a href={f.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)" }}>{f.src}</a>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, lineHeight: 1.7, color: "var(--z-ink-4)", margin: "26px 0 0", maxWidth: "82ch" }}>
          And the deeper problem: a provider invoice shows spend by API key — <strong style={{ color: "var(--z-ink-2)" }}>never</strong> by
          team, feature, or customer. You can&rsquo;t govern what you can&rsquo;t attribute, and that instrumentation layer doesn&rsquo;t
          exist unless someone builds it. That&rsquo;s the layer we are.
        </p>
      </div>
    </section>
  );
}

// ── what we govern ──
const CONTROLS = [
  { k: "Org-wide token budgets", v: "Hard caps per team, app, and environment, with alerts that fire before you blow through them — not at month-end." },
  { k: "Showback & chargeback", v: "Every token attributed to a team, feature, and customer — the breakdown your provider invoice never gives finance." },
  { k: "Rate & quota governance", v: "Per-key and per-team quotas that stop a runaway loop before it becomes a line item." },
  { k: "Anomaly detection", v: "Spend spikes and looping agents flagged in real time, so a single bad deploy can’t quietly 10× the bill." },
  { k: "Unit economics", v: "Cost per request, per user, per workflow, per outcome — the numbers that tell you whether a feature pays for itself." },
  { k: "Optimizing router", v: "Every call routed to the cheapest model that clears your quality bar, holding each workload under its budget automatically." },
];
function Govern() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="what we govern" title="The controls a token bill needs." />
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "26px 40px" }}>
          {CONTROLS.map((c) => (
            <div key={c.k}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--z-ink)" }}>
                <span style={{ color: "var(--z-blue)", fontSize: 9 }}>●</span> {c.k}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.55, color: "var(--z-ink-5)", marginTop: 6 }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── guarantee + receipt ──
function Guarantee() {
  const row = (k: string, v: React.ReactNode, opts: { ok?: boolean; total?: boolean } = {}) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: opts.total ? "12px 0 0" : "7px 0", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
      <span style={{ color: "var(--z-ink-5)" }}>{k}</span>
      <span style={{ color: opts.ok ? "var(--z-green)" : opts.total ? "var(--z-ink)" : "var(--z-ink-2)", fontWeight: opts.total ? 600 : 400 }}>{v}</span>
    </div>
  );
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={WRAP}>
        <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 56, alignItems: "center" }}>
          <div>
            <Kicker>// the guarantee</Kicker>
            <h2 className="zed-display" style={H2}>Guaranteed under budget.</h2>
            <p style={LEAD}>
              You set a monthly budget and a measurable quality floor. We hold your loop under budget — or credit
              you the difference. The budget is the hard promise; quality is the bar a run has to clear before we
              bill a cent. Every run is settled on an auditable receipt, so there&rsquo;s no reconciliation meeting
              — just the math, in the open.
            </p>
          </div>
          <div className="zed-term" style={{ padding: 0 }}>
            <div className="zed-term-head"><span>run receipt · run_8x2k</span></div>
            <div style={{ padding: "16px 20px" }}>
              {row("baseline (measured)", "$2.10")}
              {row("delivered (routed)", <>$0.38 <span style={{ color: "var(--z-green)", fontSize: 11 }}>✓ under $0.50 cap</span></>)}
              {row("quality floor", "✓ tests green", { ok: true })}
              <hr style={{ border: "none", borderTop: "1px solid var(--z-rule)", margin: "10px 0 2px" }} />
              {row("you saved", "$1.72")}
              {row("our share", "$0.34")}
              {row("you keep", "$1.38", { total: true })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── how it works ──
const STEPS = [
  { n: "01", h: "Measure", b: "A free two-week audit runs your real traffic through BitRouter in passthrough — no markup — to measure your true cost-per-run, quality baseline, and where spend is really going. You pay nothing until we beat a number you watched us record." },
  { n: "02", h: "Route", b: "We route every call to the cheapest model that clears your quality floor, keeping each workload under its budget. When quality can't be held cheaply, we fall back to protect it — on our dime, not yours." },
  { n: "03", h: "Bill", b: "A custom share of the savings we actually delivered, only on runs that met your budget and quality bar — never more than we saved you. Each run's baseline, cost, and quality check are itemized on the receipt." },
];
function HowItWorks() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="how it works" title="Measure. Route. Bill on results." />
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ border: "1px solid var(--z-rule)", borderRadius: 9, padding: "24px 22px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-blue)" }}>{s.n}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 24, color: "var(--z-ink)", margin: "10px 0 10px" }}>{s.h}</h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.65, color: "var(--z-ink-4)" }}>{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── free audit CTA ──
function AuditCta() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "80px 34px" }}>
        <div style={{ position: "relative", border: "1px solid var(--z-rule)", borderRadius: 14, overflow: "hidden", padding: "60px 34px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(60% 70% at 50% 0%, rgba(107,155,255,0.08), transparent 60%)" }} />
          <CornerTicks />
          <div style={{ position: "relative" }}>
            <Kicker>// start free</Kicker>
            <h2 className="zed-display" style={{ fontSize: "clamp(30px,4.5vw,44px)", lineHeight: 1.04, margin: "16px auto 0", maxWidth: "20ch", color: "var(--z-blue)" }}>
              Start with a free audit of your real traffic.
            </h2>
            <p style={{ ...LEAD, margin: "18px auto 0", maxWidth: "52ch", textAlign: "left" }}>
              Two weeks, metadata-only, prompts never leave your infra. You get a hard number — what you&rsquo;re
              overpaying, where it&rsquo;s going, and what we can give back — with no commitment to continue.
            </p>
            <div style={{ marginTop: 28 }}>
              <FounderCTA className="zed-btn zed-btn-primary" location="enterprise_audit">Book a founder call →</FounderCTA>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── self-serve vs enterprise ──
type Mark = "yes" | "no" | string;
const EROWS: { feat: string; self: Mark; ent: Mark; hi?: boolean }[] = [
  { feat: "Pricing", self: "0% markup · subscription", ent: "Outcome-based" },
  { feat: "Budget guarantee", self: "no", ent: "yes" },
  { feat: "Org budgets & alerts", self: "no", ent: "yes", hi: true },
  { feat: "Showback / chargeback", self: "no", ent: "yes", hi: true },
  { feat: "Volume discounts", self: "no", ent: "yes" },
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
  if (v === "yes") return <span style={{ color: "var(--z-blue)" }}>✓</span>;
  if (v === "no") return <span style={{ color: "var(--z-ink-8)" }}>—</span>;
  return <span style={{ color: accent ? "var(--z-blue)" : "var(--z-ink-2)" }}>{v}</span>;
}
function EnterpriseCompare() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="self-serve vs enterprise" title="What enterprise adds."
          lead="Everything in self-serve, plus the budget guarantee, org-wide budgets and chargeback, volume discounts, and hands-on onboarding to run production loops at scale." />
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 620, border: "1px solid var(--z-rule)", borderRadius: 11, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
              <div style={{ padding: "13px 18px", color: "var(--z-ink-6)" }}>Feature</div>
              <div style={{ padding: "13px 14px", color: "var(--z-ink-2)" }}>Self-serve</div>
              <div style={{ padding: "13px 14px", color: "var(--z-blue)" }}>Enterprise</div>
            </div>
            {EROWS.map((r) => (
              <div key={r.feat} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", borderBottom: "1px solid var(--z-rule-faint)", background: r.hi ? "rgba(107,155,255,0.04)" : "transparent" }}>
                <div style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-4)" }}>
                  {r.hi && <span style={{ color: "var(--z-blue)", fontSize: 8, marginRight: 6 }}>●</span>}{r.feat}
                </div>
                <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5 }}><ECell v={r.self} /></div>
                <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5, borderLeft: "1px solid var(--z-rule-faint)" }}><ECell v={r.ent} accent={r.hi} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──
const FAQS = [
  { q: "Can you attribute spend to specific teams or customers?", a: "Yes — that's the point. Every call is tagged and rolled up into showback or chargeback by team, app, feature, and customer, so finance can bill it back internally. Your provider invoice only shows spend by API key; we rebuild the breakdown it's missing." },
  { q: "How do you set the baseline you bill against?", a: "We measure it. During the free audit we run your real traffic through BitRouter in passthrough and record your actual cost-per-run and quality pass-rate — that measured number is the agreed baseline, adjusted for volume and re-indexed as model prices move. It's your own before, not a strawman." },
  { q: "What happens if you can't hit my budget?", a: "The budget is a guarantee, not a hope. If we miss it over a billing window, we credit you the difference. And on any single run where we can't hold your quality floor cheaply, we fall back to protect quality and simply don't bill that run — the cost of that is ours." },
  { q: "Do you store my prompts?", a: "No. Prompts and completions are not stored — logs are metadata-only and configurable per project. The audit and ongoing billing run on metadata, so your prompts never leave your infrastructure. SSO, SIEM streaming, and a DPA are available on request." },
  { q: "Why do I have to run the whole loop through BitRouter?", a: "To guarantee a budget and measure real savings, we have to see the whole loop — every call, not a sample. That's also what lets failover, guardrails, and per-run receipts work end-to-end. You can self-host the data plane so traffic stays in your VPC." },
];
function Faq() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={WRAP}>
        <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 88 }}>
            <Kicker>// faq</Kicker>
            <h2 className="zed-display" style={{ fontSize: 38, lineHeight: 1.06, margin: "16px 0 0" }}>Before you hand us the loop.</h2>
            <p style={LEAD}>The questions every team asks. If yours isn&rsquo;t here, put it to us on the call.</p>
          </div>
          <div style={{ borderTop: "1px solid var(--z-rule)" }}>
            {FAQS.map((f, i) => {
              const isOpen = i === open;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid var(--z-rule)" }}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ display: "flex", gap: 14, width: "100%", background: "none", border: "none", textAlign: "left", padding: "22px 0", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 15, color: isOpen ? "var(--z-ink)" : "var(--z-ink-2)" }}>
                    <span style={{ color: "var(--z-blue)", width: 12, flex: "0 0 auto" }}>{isOpen ? "−" : "+"}</span>{f.q}
                  </button>
                  <div className={`zed-faq-ans${isOpen ? " open" : ""}`}>
                    <div><div style={{ padding: "0 0 22px 26px", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7, color: "var(--z-ink-4)" }}>{f.a}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export function EnterprisePage() {
  React.useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "founder-call" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <div className="zed-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <Hero />
      <FailureBand />
      <Govern />
      <Guarantee />
      <HowItWorks />
      <AuditCta />
      <EnterpriseCompare />
      <Faq />
    </div>
  );
}
