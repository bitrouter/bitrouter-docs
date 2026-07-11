"use client";

/* Startup — for AI startups (~Series A) selling subscription-, usage-, or
   outcome-priced agentic products. Primary value: optimize the production
   agentic loop so cost-per-user drops and margin grows, plus an OSS-model
   credits program to extend runway. The pitch:
   hero (protect margin per user) → the margin problem (per-user receipt) →
   OSS credits program (GLM · Kimi · MiniMax) → how we cut it → self-serve vs
   startup → CTA → FAQ.

   "Talk to the founders" books the Cal.com founder-call embed.

   Reuses the mono design system: mono.css tokens/components + enterprise.css
   (receipt / esteps / eguard / compare) + startup.css (provider cards). */

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";
import "../landing/mono/mono.css";
import "../enterprise/enterprise.css";
import "./startup.css";

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
          <span className="idx">//</span> startup · series a
        </div>
        <h1 className="h-display page-title" style={{ maxWidth: "19ch" }}>
          Protect your margin on every user.
        </h1>
        <p className="page-lead">
          You sell an agentic product on a subscription, usage, or outcome price.
          Frontier-model bills eat the margin on your heaviest users first.
          BitRouter optimizes your production loop so cost-per-user drops
          &mdash; and bundles open-weight model credits to stretch your runway
          while you grow.
        </p>
        <div className="ehero-actions">
          <FounderCTA location="startup_hero">
            Talk to the founders &rarr;
          </FounderCTA>
          <a href="#oss-credits" className="btn btn-ghost">
            See the credits program
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- the margin problem (per-user receipt) ---------------- */
function MarginProblem() {
  return (
    <section className="sec">
      <div className="wrap eguard">
        <div>
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> the margin problem
          </div>
          <h2 className="h-display sec-title">
            Your revenue per user is capped. Your token cost isn&rsquo;t.
          </h2>
          <p className="sec-lead">
            A plan price is fixed, but token cost scales with how hard each user
            leans on the agent. Run everything on a frontier model and your power
            users &mdash; the ones you most want to keep &mdash; are the ones who
            go cost-negative. Optimizing the loop is the difference between
            growth that funds itself and growth that burns.
          </p>
        </div>

        <figure className="receipt">
          <span className="receipt-legend">
            Fig. — unit economics · per active user / mo
          </span>
          <div className="receipt-row">
            <span className="receipt-k">revenue / user (plan)</span>
            <span className="receipt-v">$20.00</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-k">model cost — frontier only</span>
            <span className="receipt-v receipt-warn">
              $14.20{" "}
              <span className="receipt-note-warn">✗ 71% of revenue</span>
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-k">model cost — BitRouter routed</span>
            <span className="receipt-v">
              $3.90 <span className="receipt-note">✓ routed + OSS</span>
            </span>
          </div>
          <hr className="receipt-rule" />
          <div className="receipt-row">
            <span className="receipt-k">gross margin — before</span>
            <span className="receipt-v receipt-warn">$5.80</span>
          </div>
          <div className="receipt-row receipt-total">
            <span className="receipt-k">gross margin — after</span>
            <span className="receipt-v">$16.10</span>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ---------------- OSS credits program ---------------- */
/* Featured open-weight models. Per-model specs (context / price / benchmark)
   are intentionally omitted until verified for each version — see the apply
   footnote. `lab` is the model's maker, which is stable and safe to show. */
type Provider = { name: string; lab: string };
const PROVIDERS: Provider[] = [
  { name: "glm-5.2", lab: "Zhipu · Z.ai" },
  { name: "kimi-k2.7-code", lab: "Moonshot AI" },
  { name: "minimax-m3", lab: "MiniMax" },
  { name: "deepseek-v4-pro", lab: "DeepSeek" },
  { name: "stepfun-3.7-flash", lab: "StepFun" },
  { name: "mimo-v2.5-pro", lab: "Xiaomi · MiMo" },
];

function OssCredits() {
  return (
    <section className="sec" id="oss-credits">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--term-ok)" }}
          >
            <span className="idx">//</span> oss credits · apply
          </div>
          <h2 className="h-display sec-title">
            Open-weight credits to extend your runway.
          </h2>
          <p className="sec-lead">
            Our startup program bundles credits toward open-weight models from
            six labs &mdash; GLM, Kimi, MiniMax, DeepSeek, StepFun, and MiMo
            &mdash; so you can run frontier-class coding and agentic workloads at
            a fraction of the per-token cost. Route your loop through them and
            stretch every dollar of runway. Apply to qualify.
          </p>
        </div>
        <div className="osp-grid">
          {PROVIDERS.map((p) => (
            <div className="osp-card" key={p.name}>
              <div className="osp-top">
                <span className="osp-name">{p.name}</span>
                <span className="osp-badge">open-weight</span>
              </div>
              <span className="osp-lab">{p.lab}</span>
            </div>
          ))}
        </div>
        <p className="osp-apply">
          Credits are a BitRouter program &mdash; you apply once, through us, and
          spend them across providers from one API. Open-weight status and
          licenses per each lab&rsquo;s model card.
        </p>
        <div className="ehero-actions">
          <FounderCTA location="startup_credits">
            Apply for credits &rarr;
          </FounderCTA>
        </div>
      </div>
    </section>
  );
}

/* ---------------- how we cut it ---------------- */
const STEPS: { n: string; h: string; b: string }[] = [
  {
    n: "01",
    h: "Route down",
    b: "Every call goes to the cheapest model that clears your quality bar — frontier only where it earns its price. Your heaviest users stop running on your most expensive model.",
  },
  {
    n: "02",
    h: "Stop re-paying",
    b: "Loops re-send their whole context every turn. We cache and dedupe it, and fail over mid-run — so a rate-limit at step 40 never makes you re-pay for the first 39.",
  },
  {
    n: "03",
    h: "Price with confidence",
    b: "Cost per user, per feature, per plan — measured, not guessed. Now you know which users are underwater and can price so every seat earns its keep.",
  },
];

function HowWeCut() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> how we cut it
          </div>
          <h2 className="h-display sec-title">
            Lower cost per user, same product.
          </h2>
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

/* ---------------- self-serve vs startup ---------------- */
type Mark = "yes" | "no" | string;
type SRow = { feat: string; self: Mark; st: Mark; hi?: boolean };

const SROWS: SRow[] = [
  { feat: "Pricing", self: "0% markup · subscription", st: "0% markup + credits" },
  { feat: "OSS models credits", self: "no", st: "Apply", hi: true },
  { feat: "Cost-per-user analytics", self: "no", st: "yes", hi: true },
  { feat: "Quality-floor routing", self: "yes", st: "yes" },
  { feat: "Mid-run failover", self: "yes", st: "yes" },
  { feat: "Volume discounts as you grow", self: "no", st: "yes" },
  { feat: "Founder onboarding", self: "no", st: "yes" },
  { feat: "Private by default", self: "yes", st: "yes" },
  { feat: "Self-host / your VPC", self: "yes", st: "yes" },
  { feat: "Support", self: "Community", st: "Founders" },
];

function SCell({ v, accent }: { v: Mark; accent?: boolean }) {
  if (v === "yes")
    return <span className="compare-mark compare-mark-yes">✓</span>;
  if (v === "no") return <span className="compare-mark compare-mark-no">—</span>;
  return (
    <span style={accent ? { color: "var(--accent)" } : undefined}>{v}</span>
  );
}

function StartupCompare() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> self-serve vs startup
          </div>
          <h2 className="h-display sec-title">What the startup program adds.</h2>
          <p className="sec-lead">
            Everything in self-serve, plus the OSS models credits, per-user cost
            analytics, and founder onboarding to get your production loop optimized
            fast.
          </p>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-th compare-th-feat">Feature</th>
                <th className="compare-th compare-th-prod">Self-serve</th>
                <th className="compare-th compare-th-prod">
                  <span className="compare-th-brand">Startup</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {SROWS.map((r) => (
                <tr
                  className={"compare-row" + (r.hi ? " erow-hi" : "")}
                  key={r.feat}
                >
                  <th className="compare-feat">
                    {r.hi && <span className="erow-star">●</span>}
                    {r.feat}
                  </th>
                  <td className="compare-cell">
                    <SCell v={r.self} />
                  </td>
                  <td className="compare-cell br">
                    <SCell v={r.st} accent={r.hi} />
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

/* ---------------- CTA ---------------- */
function StartupCta() {
  return (
    <section className="sec">
      <div className="wrap cta-wrap dotgrid" style={{ display: "block" }}>
        <div
          className="eyebrow sec-eyebrow"
          style={{ ["--sec-accent" as string]: "var(--accent)" }}
        >
          <span className="idx">//</span> apply
        </div>
        <h2 className="h-display cta-title" style={{ maxWidth: "20ch" }}>
          Turn your heaviest users into your best margin.
        </h2>
        <p className="sec-lead" style={{ maxWidth: "52ch" }}>
          Bring us your loop and your pricing. We&rsquo;ll show you cost-per-user
          today, where it&rsquo;s leaking, and size a credit bundle to your
          workload &mdash; on a call with the founders.
        </p>
        <div className="ehero-actions">
          <FounderCTA location="startup_cta">
            Talk to the founders &rarr;
          </FounderCTA>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Who qualifies for the credits program?",
    a: "Early-stage startups running production agentic loops — think around Series A, selling a subscription, usage-, or outcome-based product. Apply on a founder call and we'll size a credit bundle to your loop.",
  },
  {
    q: "Do I have to switch off Claude or GPT?",
    a: "No. You keep a quality floor, and frontier models stay in the mix for the calls that need them. We only route down where a cheaper open-weight model clears your bar — so cost drops without your users noticing.",
  },
  {
    q: "How do you keep quality up on cheaper models?",
    a: "Every route is gated by a quality bar you define. Open-weight models from labs like GLM, DeepSeek, and MiniMax now land close to frontier models on public coding and agentic benchmarks, so on many calls the cheaper model is genuinely good enough — and when it isn't, we fall back.",
  },
  {
    q: "Are the credits from GLM, Kimi, MiniMax, and the others directly?",
    a: "The program is BitRouter's: we bundle credits toward those open-weight models so you can route your loop through them and stretch runway. You apply once, through us, and use them across providers from one API.",
  },
];

function Faq() {
  const [open, setOpen] = React.useState<number>(0);
  return (
    <section className="sec faq">
      <div className="wrap faq-grid">
        <div className="faq-aside">
          <h2 className="h-display sec-title">Questions from founders.</h2>
          <p className="sec-lead">
            If yours isn&rsquo;t here, put it to us on the call.
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
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* ---------------- page ---------------- */
export function StartupPage() {
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
      <MarginProblem />
      <OssCredits />
      <HowWeCut />
      <StartupCompare />
      <StartupCta />
      <Faq />
    </div>
  );
}
