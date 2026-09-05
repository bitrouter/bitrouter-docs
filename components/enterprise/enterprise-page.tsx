/* Enterprise — FinOps token-cost governance, on the Zed design system.
   hero → tokenmaxxing trap → what we govern → guarantee + run receipt →
   how it works (the free audit is step 01) → what enterprise adds → FAQ → CTA.

   Server component: the only interactive parts are the Cal.com boot, the
   founder-call buttons and the FAQ accordion, each a client leaf. */

import type * as React from "react";
import Link from "next/link";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";
import { Faq } from "@/components/landing/zed/faq";
import { CalBoot, FounderCallButton } from "@/components/landing/zed/founder-call";

// v3 pads only the top, so consecutive sections sit one --z-sec apart rather
// than stacking two paddings, and no section carries a hairline.
const WRAP: React.CSSProperties = { padding: "var(--z-sec) var(--z-gutter) 0" };
const H2: React.CSSProperties = { fontSize: 40, lineHeight: 1.08, margin: "20px 0 0" };

function SecHead({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <div style={{ maxWidth: 720, marginBottom: 44 }}>
      <Kicker>{kicker}</Kicker>
      <h2 className="zed-display" style={H2}>{title}</h2>
      {lead && <p className="zed-lead">{lead}</p>}
    </div>
  );
}

// ── hero ──
function Hero() {
  return (
    <section>
      <div className="zed-wrap" style={{ padding: "72px var(--z-gutter) 0" }}>
        <Kicker>finops · enterprise</Kicker>
        <h1 className="zed-display" style={{ fontSize: "clamp(38px,6.4vw,68px)", lineHeight: 1.04, margin: "30px 0 0", maxWidth: "18ch" }}>
          Govern token spend across the org.
        </h1>
        <p className="zed-lead" style={{ fontSize: 16, lineHeight: 1.65 }}>
          FinOps for AI. BitRouter puts every team&rsquo;s token spend under one budget &mdash; real-time
          attribution, showback and chargeback, and quota governance &mdash; behind a router that holds each
          workload under the cap. We tie our fee to what we save you, so governance pays for itself.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 40, flexWrap: "wrap" }}>
          <FounderCallButton className="zed-btn zed-btn-primary" location="enterprise_hero">
            Talk to the founders
          </FounderCallButton>
          <Link href="/pricing" className="zed-btn-underline">See all pricing</Link>
        </div>
      </div>
    </section>
  );
}

// ── the tokenmaxxing trap ──
// Two citations, not four: the Anthropic and Menlo figures carry the argument
// (loops burn tokens superlinearly; usage, not price, drives the bill). The
// MIT and FinOps numbers restated "the spend is large" a third and fourth time.
const FAILS = [
  { n: "15×", b: "Multi-agent systems burn roughly 15× the tokens of a plain chat — and in one eval, token volume alone explained 80% of performance.", src: "Anthropic Engineering, 2025", href: "https://www.anthropic.com/engineering/multi-agent-research-system" },
  { n: "$8.4B", b: "Enterprise model-API spend more than doubled in six months — even as the per-token price kept falling. Usage, not price, is the cost driver.", src: "Menlo Ventures, 2025", href: "https://menlovc.com/perspective/2025-mid-year-llm-market-update/" },
];
function FailureBand() {
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <SecHead
          kicker="the tokenmaxxing trap"
          title="Token spend scales faster than anyone forecasts."
          lead="Agentic loops re-send their whole context every turn, so cost compounds with the task — not the price list. Roll that across every team and the bill outruns the budget before finance sees it."
        />
        <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "26px 40px" }}>
          {FAILS.map((f) => (
            <div key={f.src} style={{ borderTop: "1px solid var(--z-rule)", paddingTop: 20 }}>
              <div className="zed-display" style={{ fontSize: 38, lineHeight: 1 }}>{f.n}</div>
              <p className="zed-body" style={{ margin: "14px 0 0", color: "var(--z-ink-4)" }}>{f.b}</p>
              <a href={f.href} target="_blank" rel="noopener noreferrer" className="zed-cardlabel" style={{ display: "inline-block", marginTop: 12 }}>
                {f.src}
              </a>
            </div>
          ))}
        </div>
        <p className="zed-lead" style={{ marginTop: 40 }}>
          And the deeper problem: a provider invoice shows spend by API key &mdash; never by team, feature, or
          customer. You can&rsquo;t govern what you can&rsquo;t attribute, and that instrumentation layer
          doesn&rsquo;t exist unless someone builds it. That&rsquo;s the layer we are.
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
    <section>
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="what we govern" title="The controls a token bill needs." />
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "26px 40px" }}>
          {CONTROLS.map((c) => (
            <div key={c.k}>
              <div className="zed-cardlabel">{c.k}</div>
              <div className="zed-body" style={{ marginTop: 12 }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── guarantee + receipt ──
function ReceiptRow({ k, v, ok, total }: { k: string; v: React.ReactNode; ok?: boolean; total?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: total ? "12px 0 0" : "7px 0", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
      <span style={{ color: "var(--z-ink-5)" }}>{k}</span>
      <span style={{ color: ok ? "var(--z-green)" : total ? "var(--z-ink)" : "var(--z-ink-2)", fontWeight: total ? 600 : 400 }}>{v}</span>
    </div>
  );
}
function Guarantee() {
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 56, alignItems: "center" }}>
          <div>
            <Kicker>the guarantee</Kicker>
            <h2 className="zed-display" style={H2}>Guaranteed under budget.</h2>
            <p className="zed-lead">
              You set a monthly budget and a measurable quality floor. We hold your loop under budget — or credit
              you the difference. The budget is the hard promise; quality is the bar a run has to clear before we
              bill a cent. Every run is settled on an auditable receipt, so there&rsquo;s no reconciliation meeting
              — just the math, in the open.
            </p>
          </div>
          <div className="zed-term" style={{ padding: 0 }}>
            <div className="zed-term-head"><span>run receipt · run_8x2k</span></div>
            <div style={{ padding: "16px 20px" }}>
              <ReceiptRow k="baseline (measured)" v="$2.10" />
              <ReceiptRow k="delivered (routed)" v={<>$0.38 <span style={{ color: "var(--z-green)", fontSize: 11 }}>✓ under $0.50 cap</span></>} />
              <ReceiptRow k="quality floor" v="✓ tests green" ok />
              <hr style={{ border: "none", borderTop: "1px solid var(--z-rule)", margin: "10px 0 2px" }} />
              <ReceiptRow k="you saved" v="$1.72" />
              <ReceiptRow k="our share" v="$0.34" />
              <ReceiptRow k="you keep" v="$1.38" total />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── how it works ──
// Step 01 is where the free audit is explained; it used to be repeated verbatim
// in a standalone CTA section further down.
const STEPS = [
  { n: "01", h: "Measure", b: "A free two-week audit runs your real traffic through BitRouter in passthrough — no markup — to measure your true cost-per-run, quality baseline, and where spend is really going. Metadata only: prompts never leave your infra, and you pay nothing until we beat a number you watched us record." },
  { n: "02", h: "Route", b: "We route every call to the cheapest model that clears your quality floor, keeping each workload under its budget. When quality can't be held cheaply, we fall back to protect it — on our dime, not yours." },
  { n: "03", h: "Bill", b: "A custom share of the savings we actually delivered, only on runs that met your budget and quality bar — never more than we saved you. Each run's baseline, cost, and quality check are itemized on the receipt." },
];
function HowItWorks() {
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="how it works" title="Measure. Route. Bill on results." />
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ borderTop: "1px solid var(--z-rule)", paddingTop: 20 }}>
              <div className="zed-cardlabel">{s.n}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 24, color: "var(--z-ink)", margin: "10px 0" }}>{s.h}</h3>
              <p className="zed-body" style={{ color: "var(--z-ink-4)", lineHeight: 1.65 }}>{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── what enterprise adds ──
// Trimmed from 13 rows: the two ✓/✓ rows said nothing about enterprise, the
// pricing row lives on /pricing's outcome card, and SSO/SIEM/DPA collapse into
// one compliance line that card already spells out.
const EROWS: { feat: string; self: string; ent: string; hi?: boolean }[] = [
  { feat: "Budget guarantee", self: "no", ent: "yes" },
  { feat: "Org budgets & alerts", self: "no", ent: "yes", hi: true },
  { feat: "Showback / chargeback", self: "no", ent: "yes", hi: true },
  { feat: "Volume discounts", self: "no", ent: "yes" },
  { feat: "Free workload audit", self: "no", ent: "yes" },
  { feat: "Forward-deployed onboarding", self: "no", ent: "yes" },
  { feat: "SSO · SIEM streaming · DPA", self: "no", ent: "yes" },
  { feat: "Support", self: "Community", ent: "Founders + SLA" },
];
function ECell({ v, accent }: { v: string; accent?: boolean }) {
  if (v === "yes") return <span style={{ color: "var(--z-ink)" }}>✓</span>;
  if (v === "no") return <span style={{ color: "var(--z-ink-8)" }}>—</span>;
  return <span style={{ color: accent ? "var(--z-ink-2)" : "var(--z-ink-5)" }}>{v}</span>;
}
const ECOLS = "1.6fr 1fr 1fr";
function EnterpriseCompare() {
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <SecHead
          kicker="self-serve vs enterprise"
          title="What enterprise adds."
          lead="Everything in self-serve — 0% markup, self-host, private by default — plus the budget guarantee, org-wide budgets and chargeback, and hands-on onboarding to run production loops at scale."
        />
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 620, borderTop: "1px solid var(--z-ink)" }}>
            <div style={{ display: "grid", gridTemplateColumns: ECOLS, borderBottom: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <div style={{ padding: "13px 18px", color: "var(--z-ink-6)" }}>Feature</div>
              <div style={{ padding: "13px 14px", color: "var(--z-ink-2)" }}>Self-serve</div>
              <div style={{ padding: "13px 14px 13px 0", color: "var(--z-ink)" }}>Enterprise</div>
            </div>
            {EROWS.map((r) => (
              <div key={r.feat} style={{ display: "grid", gridTemplateColumns: ECOLS, borderBottom: "1px solid var(--z-rule-faint)", background: r.hi ? "rgba(107,155,255,0.04)" : "transparent" }}>
                <div style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-4)" }}>{r.feat}</div>
                <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5 }}><ECell v={r.self} /></div>
                <div style={{ padding: "12px 14px 12px 0", fontFamily: "var(--font-mono)", fontSize: 12.5, borderLeft: "1px solid var(--z-rule-faint)" }}><ECell v={r.ent} accent={r.hi} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──
// "How do you set the baseline you bill against?" retired — step 01 above
// already answers it, and /pricing covers outcome-based billing in full.
const FAQS = [
  { q: "Can you attribute spend to specific teams or customers?", a: "Yes — that's the point. Every call is tagged and rolled up into showback or chargeback by team, app, feature, and customer, so finance can bill it back internally. Your provider invoice only shows spend by API key; we rebuild the breakdown it's missing." },
  { q: "What happens if you can't hit my budget?", a: "The budget is a guarantee, not a hope. If we miss it over a billing window, we credit you the difference. And on any single run where we can't hold your quality floor cheaply, we fall back to protect quality and simply don't bill that run — the cost of that is ours." },
  { q: "Do you store my prompts?", a: "No. Prompts and completions are not stored — logs are metadata-only and configurable per project. The audit and ongoing billing run on metadata, so your prompts never leave your infrastructure. SSO, SIEM streaming, and a DPA are available on request." },
  { q: "Why do I have to run the whole loop through BitRouter?", a: "To guarantee a budget and measure real savings, we have to see the whole loop — every call, not a sample. That's also what lets failover, guardrails, and per-run receipts work end-to-end. You can self-host the data plane so traffic stays in your VPC." },
];

// ── closing CTA ──
function ClosingCta() {
  return (
    <section>
      <div className="zed-wrap" style={{ padding: "var(--z-sec) var(--z-gutter)" }}>
        <div style={{ textAlign: "center" }}>
          <Kicker>start free</Kicker>
          <h2 className="zed-display" style={{ fontSize: "clamp(32px,5vw,48px)", lineHeight: 1.06, margin: "20px auto 0", maxWidth: "20ch" }}>
            Start with a free audit of your real traffic.
          </h2>
          <p className="zed-lead" style={{ margin: "18px auto 0", maxWidth: "52ch" }}>
            Two weeks, metadata-only. You get a hard number &mdash; what you&rsquo;re overpaying, where it&rsquo;s
            going, and what we can give back &mdash; with no commitment to continue.
          </p>
          <div style={{ marginTop: 28 }}>
            <FounderCallButton className="zed-btn zed-btn-primary" location="enterprise_close">
              Book a founder call
            </FounderCallButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EnterprisePage() {
  return (
    <div className="zed-bg">
      <CalBoot />
      <Hero />
      <FailureBand />
      <Govern />
      <Guarantee />
      <HowItWorks />
      <EnterpriseCompare />
      <section>
        <div className="zed-wrap" style={WRAP}>
          <Faq
            items={FAQS}
            heading="Before you hand us the loop."
            kicker="faq"
            lead="The questions every team asks. If yours isn’t here, put it to us on the call."
            sticky
            jsonLd
          />
        </div>
      </section>
      <ClosingCta />
    </div>
  );
}
