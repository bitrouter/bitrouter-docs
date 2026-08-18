"use client";

/* Startup — for AI startups (~Series A) on subscription/usage/outcome pricing.
   On the Zed design system. hero → margin problem (per-user receipt) → OSS
   credits program → how we cut it → self-serve vs startup → CTA → FAQ.
   "Talk to the founders" books the Cal.com founder-call embed. */

import * as React from "react";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

// v3 pads only the top, so consecutive sections sit one --z-sec apart rather
// than stacking two paddings, and no section carries a hairline.
const WRAP: React.CSSProperties = { padding: "var(--z-sec) var(--z-gutter) 0" };
const H2: React.CSSProperties = { fontSize: 40, lineHeight: 1.08, margin: "20px 0 0" };
const LEAD: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7, color: "var(--z-ink-5)", margin: "20px 0 0", maxWidth: "64ch" };

function FounderCTA({ location, children }: { location: string; children: React.ReactNode }) {
  return (
    <button
      data-cal-namespace="founder-call"
      data-cal-link="kelsenliu/founder-call"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      className="zed-btn zed-btn-primary"
      onClick={() => posthog.capture("founder_call_booked", { location })}
    >
      {children}
    </button>
  );
}

function SecHead({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <div style={{ maxWidth: 720, marginBottom: 40 }}>
      <Kicker>{kicker}</Kicker>
      <h2 className="zed-display" style={H2}>{title}</h2>
      {lead && <p style={LEAD}>{lead}</p>}
    </div>
  );
}

// ── hero ──
function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div className="zed-wrap" style={{ padding: "64px var(--z-gutter) 40px" }}>
        <Kicker>startup · series a</Kicker>
        <h1 className="zed-display" style={{ fontSize: "clamp(38px,6.4vw,68px)", lineHeight: 1.04, margin: "30px 0 0", maxWidth: "19ch" }}>
          Protect your margin on every user.
        </h1>
        <p style={{ ...LEAD, fontSize: 16, lineHeight: 1.65 }}>
          You sell an agentic product on a subscription, usage, or outcome price. Frontier-model bills eat the
          margin on your heaviest users first. BitRouter optimizes your production loop so cost-per-user drops —
          and bundles open-weight model credits to stretch your runway while you grow.
        </p>
        <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
          <FounderCTA location="startup_hero">Talk to the founders →</FounderCTA>
          <a href="#oss-credits" className="zed-btn-underline">See the credits program</a>
        </div>
      </div>
    </section>
  );
}

// ── margin problem (per-user receipt) ──
function MarginProblem() {
  const row = (k: string, v: React.ReactNode, opts: { warn?: boolean; total?: boolean } = {}) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: opts.total ? "12px 0 0" : "7px 0", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
      <span style={{ color: "var(--z-ink-5)" }}>{k}</span>
      <span style={{ color: opts.warn ? "var(--z-amber)" : opts.total ? "var(--z-ink)" : "var(--z-ink-2)", fontWeight: opts.total ? 600 : 400 }}>{v}</span>
    </div>
  );
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 56, alignItems: "center" }}>
          <div>
            <Kicker>the margin problem</Kicker>
            <h2 className="zed-display" style={H2}>Your revenue per user is capped. Your token cost isn&rsquo;t.</h2>
            <p style={LEAD}>
              A plan price is fixed, but token cost scales with how hard each user leans on the agent. Run
              everything on a frontier model and your power users — the ones you most want to keep — are the
              ones who go cost-negative. Optimizing the loop is the difference between growth that funds itself
              and growth that burns.
            </p>
          </div>
          <div className="zed-term">
            <div className="zed-term-head"><span>unit economics · per active user / mo</span></div>
            <div style={{ padding: "16px 20px" }}>
              {row("revenue / user (plan)", "$20.00")}
              {row("model cost — frontier only", <>$14.20 <span style={{ color: "var(--z-amber)", fontSize: 11 }}>✗ 71% of revenue</span></>, { warn: true })}
              {row("model cost — BitRouter routed", <>$3.90 <span style={{ color: "var(--z-green)", fontSize: 11 }}>✓ routed + OSS</span></>)}
              <hr style={{ border: "none", borderTop: "1px solid var(--z-rule)", margin: "10px 0 2px" }} />
              {row("gross margin — before", "$5.80", { warn: true })}
              {row("gross margin — after", "$16.10", { total: true })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── OSS credits program ──
const PROVIDERS = [
  { name: "glm-5.2", lab: "Zhipu · Z.ai" },
  { name: "kimi-k2.7-code", lab: "Moonshot AI" },
  { name: "minimax-m3", lab: "MiniMax" },
  { name: "deepseek-v4-pro", lab: "DeepSeek" },
  { name: "stepfun-3.7-flash", lab: "StepFun" },
  { name: "mimo-v2.5-pro", lab: "Xiaomi · MiMo" },
];
function OssCredits() {
  return (
    <section id="oss-credits">
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="oss credits · apply" title="Open-weight credits to extend your runway."
          lead="Our startup program bundles credits toward open-weight models from six labs — GLM, Kimi, MiniMax, DeepSeek, StepFun, and MiMo — so you can run frontier-class coding and agentic workloads at a fraction of the per-token cost. Route your loop through them and stretch every dollar of runway. Apply to qualify." />
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {PROVIDERS.map((p) => (
            <div key={p.name} style={{ borderTop: "1px solid var(--z-rule)", paddingTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--z-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--z-ink-5)", border: "1px solid var(--z-rule-2)", padding: "2px 6px", whiteSpace: "nowrap" }}>open-weight</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)", marginTop: 8 }}>{p.lab}</div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.65, color: "var(--z-ink-5)", margin: "18px 0 0", maxWidth: "78ch" }}>
          Credits are a BitRouter program — you apply once, through us, and spend them across providers from one
          API. Open-weight status and licenses per each lab&rsquo;s model card.
        </p>
        <div style={{ marginTop: 24 }}>
          <FounderCTA location="startup_credits">Apply for credits →</FounderCTA>
        </div>
      </div>
    </section>
  );
}

// ── how we cut it ──
const STEPS = [
  { n: "01", h: "Route down", b: "Every call goes to the cheapest model that clears your quality bar — frontier only where it earns its price. Your heaviest users stop running on your most expensive model." },
  { n: "02", h: "Stop re-paying", b: "Loops re-send their whole context every turn. We cache and dedupe it, and fail over mid-run — so a rate-limit at step 40 never makes you re-pay for the first 39." },
  { n: "03", h: "Price with confidence", b: "Cost per user, per feature, per plan — measured, not guessed. Now you know which users are underwater and can price so every seat earns its keep." },
];
function HowWeCut() {
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="how we cut it" title="Lower cost per user, same product." />
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ borderTop: "1px solid var(--z-rule)", paddingTop: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--z-ink-6)" }}>{s.n}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 24, color: "var(--z-ink)", margin: "10px 0 10px" }}>{s.h}</h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.65, color: "var(--z-ink-4)" }}>{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── self-serve vs startup ──
type Mark = "yes" | "no" | string;
const SROWS: { feat: string; self: Mark; st: Mark; hi?: boolean }[] = [
  { feat: "Pricing", self: "0% markup · individual", st: "0% markup + credits" },
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
  if (v === "yes") return <span style={{ color: "var(--z-ink)" }}>✓</span>;
  if (v === "no") return <span style={{ color: "var(--z-ink-8)" }}>—</span>;
  return <span style={{ color: accent ? "var(--z-ink-2)" : "var(--z-ink-5)" }}>{v}</span>;
}
function StartupCompare() {
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <SecHead kicker="self-serve vs startup" title="What the startup program adds."
          lead="Everything in self-serve, plus the OSS models credits, per-user cost analytics, and founder onboarding to get your production loop optimized fast." />
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 620, borderTop: "1px solid var(--z-ink)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", borderBottom: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-6)" }}>
              <div style={{ padding: "13px 18px", color: "var(--z-ink-6)" }}>Feature</div>
              <div style={{ padding: "13px 14px", color: "var(--z-ink-2)" }}>Self-serve</div>
              <div style={{ padding: "13px 14px 13px 0", color: "var(--z-ink)" }}>Startup</div>
            </div>
            {SROWS.map((r) => (
              <div key={r.feat} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", borderBottom: "1px solid var(--z-rule-faint)", background: r.hi ? "rgba(107,155,255,0.04)" : "transparent" }}>
                <div style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-4)" }}>
                  {r.feat}
                </div>
                <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5 }}><SCell v={r.self} /></div>
                <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5, borderLeft: "1px solid var(--z-rule-faint)" }}><SCell v={r.st} accent={r.hi} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA ──
function StartupCta() {
  return (
    <section>
      <div className="zed-wrap" style={{ padding: "var(--z-sec) var(--z-gutter)" }}>
        <div style={{ position: "relative", padding: "60px 0", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(60% 70% at 50% 0%, rgba(107,155,255,0.08), transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <Kicker>apply</Kicker>
            <h2 className="zed-display" style={{ fontSize: "clamp(32px,5vw,48px)", lineHeight: 1.06, margin: "20px auto 0", maxWidth: "20ch" }}>
              Turn your heaviest users into your best margin.
            </h2>
            <p style={{ ...LEAD, margin: "18px auto 0", maxWidth: "52ch", textAlign: "left" }}>
              Bring us your loop and your pricing. We&rsquo;ll show you cost-per-user today, where it&rsquo;s
              leaking, and size a credit bundle to your workload — on a call with the founders.
            </p>
            <div style={{ marginTop: 28 }}>
              <FounderCTA location="startup_cta">Talk to the founders →</FounderCTA>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──
const FAQS = [
  { q: "Who qualifies for the credits program?", a: "Early-stage startups running production agentic loops — think around Series A, selling a subscription, usage-, or outcome-based product. Apply on a founder call and we'll size a credit bundle to your loop." },
  { q: "Do I have to switch off Claude or GPT?", a: "No. You keep a quality floor, and frontier models stay in the mix for the calls that need them. We only route down where a cheaper open-weight model clears your bar — so cost drops without your users noticing." },
  { q: "How do you keep quality up on cheaper models?", a: "Every route is gated by a quality bar you define. Open-weight models from labs like GLM, DeepSeek, and MiniMax now land close to frontier models on public coding and agentic benchmarks, so on many calls the cheaper model is genuinely good enough — and when it isn't, we fall back." },
  { q: "Are the credits from GLM, Kimi, MiniMax, and the others directly?", a: "The program is BitRouter's: we bundle credits toward those open-weight models so you can route your loop through them and stretch runway. You apply once, through us, and use them across providers from one API." },
];
function Faq() {
  const [open, setOpen] = React.useState(0);
  return (
    <section>
      <div className="zed-wrap" style={WRAP}>
        <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 88 }}>
            <Kicker>faq</Kicker>
            <h2 className="zed-display" style={{ fontSize: 40, lineHeight: 1.08, margin: "20px 0 0" }}>Questions from founders.</h2>
            <p style={LEAD}>If yours isn&rsquo;t here, put it to us on the call.</p>
          </div>
          <div style={{ borderTop: "1px solid var(--z-rule)" }}>
            {FAQS.map((f, i) => {
              const isOpen = i === open;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid var(--z-rule)" }}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ display: "flex", gap: 14, width: "100%", background: "none", border: "none", textAlign: "left", padding: "22px 0", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 15, color: isOpen ? "var(--z-ink)" : "var(--z-ink-2)" }}>
                    <span style={{ color: "var(--z-ink-6)", width: 12, flex: "0 0 auto" }}>{isOpen ? "−" : "+"}</span>{f.q}
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

export function StartupPage() {
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
      <MarginProblem />
      <OssCredits />
      <HowWeCut />
      <StartupCompare />
      <StartupCta />
      <Faq />
      <div style={{ height: "var(--z-sec)" }} />
    </div>
  );
}
