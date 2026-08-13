import "./zed.css";
import { Kicker } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { ZED_LINKS } from "./primitives";
/* Billing is tokens at provider list price, 0% markup. Anything expressed
   per-session on this page is a unit of account for comparing `bitrouter/auto`
   against a frontier baseline — never a quote, and never what we invoice.
   The measured proof lives on the landing benchmark (real routed runs); this
   page compares *prices*, not product behaviour.

   There is deliberately no cost calculator here. A modelled one overstated the
   frontier baseline by up to 3x (it ignored cache-read pricing, which 45 of 52
   catalogued models publish at ~10% of input) and priced `auto` against an
   arithmetic mean of open-weight models that corresponds to no route the router
   would actually pick. A wrong estimate is worse than none; it returns when it
   can be driven by observed routing rather than assumed parameters. */

/* No model count here on purpose: the live registry and the build-time snapshot
   disagree (20 vs 52 at time of writing), so any figure flips depending on which
   one answers. `/models` is the authority for the catalog size. */
const INCLUDED = [
  "Routing across every model on the catalog — never metered",
  "No BitRouter rate limit · no request cap",
  "Unlimited seats · 1 workspace",
  "1M trace receipts / mo · 30-day retention",
  "Evals, guardrails and multi-provider failover",
  "BYOK and self-host — Apache-2.0, no platform fee",
];

const ENTERPRISE = [
  "Measured baseline & quality floor",
  "Budget guarantee — never more than we save you",
  "Shared workspaces & spend controls",
  "Retention to 7 years · SSO · SIEM · DPA",
  "Founders + SLA",
];

/** What each gateway's fee is actually charged on. Figures are published rates. */
const CMP_COLS = ["BitRouter", "OpenRouter", "LiteLLM"];
const CMP_ROWS: { label: string; row: string[]; hi?: boolean }[] = [
  { label: "What it selects for you", row: ["Model × provider, per call", "Provider, for a model you pick", "Neither — you configure routes"], hi: true },
  { label: "Which cost lever that moves", row: ["Model choice — multiples", "Host choice — single digits", "None — your config decides"], hi: true },
  { label: "Gateway fee on tokens", row: ["0% markup", "5.5% to load credits", "None on the OSS proxy"] },
  { label: "Hosted tier", row: ["Self-serve, no call", "Self-serve", "Quote-only, sales call"] },
  { label: "BYOK fee", row: ["None", "5% past the free allowance", "n/a — self-hosted"] },
  { label: "Self-host", row: ["Apache-2.0, free", "n/a", "MIT, free"] },
  { label: "SSO · audit logs · RBAC", row: ["Enterprise", "n/a", "Enterprise"] },
];

/** Each axis is a target you declare and we report against — not a reading you
 *  passively receive. Accuracy ships with a default metric; an eval refines it. */
const REPORT_DIMS: { dim: string; define: string; report: string }[] = [
  {
    dim: "Cost",
    define: "A budget or cost-per-run ceiling for the workload",
    report: "Actual spend per session against that ceiling, straight from the receipts — plus what the same sessions would have cost on your baseline model.",
  },
  {
    dim: "Latency",
    define: "The p50 / p95 you need the route to hold",
    report: "End-to-end latency per request measured against it, so you can see what a cheaper route cost you in time before you keep it.",
  },
  {
    dim: "Accuracy",
    define: "The quality floor a route has to clear",
    report: "Pass rate against that floor. Success rate is the default and needs nothing from you; point an eval at it when your bar is domain-specific.",
  },
];

export function ZedPricingPage() {
  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 1180 }}>
          {/* header */}
          <div style={{ padding: "56px 0 34px", textAlign: "center" }}>
            <Kicker>// pricing</Kicker>
            <h1 className="zed-display" style={{ fontSize: "clamp(38px, 6vw, 56px)", lineHeight: 1.0, margin: "16px auto 0", maxWidth: "22ch" }}>
              Every gateway adds a line to your bill. <span style={{ color: "var(--z-blue)" }}>We take one off.</span>
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "16px auto 0", maxWidth: "62ch" }}>
              0% markup on every token, on every model. The savings come from{" "}
              <code style={{ color: "var(--z-blue)" }}>bitrouter/auto</code> choosing the model for each call —
              not from shaving a percentage off the fee.
            </p>
          </div>

          {/* plans */}
          <div className="zed-grid-2" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 22 }}>
            <div style={{ border: "1px solid var(--z-rule)", borderRadius: 12, padding: "28px 30px", background: "#0e1220", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-7)" }}>usage-based</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 42, lineHeight: 1, color: "var(--z-blue)" }}>0%</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)" }}>markup · pay-as-you-go</span>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.65, color: "var(--z-ink-4)", margin: "14px 0 18px" }}>
                You pay the provider&apos;s list price for tokens and nothing to us. Everything the router needs
                to do its job is included.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                {INCLUDED.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.5, color: "var(--z-ink-3)" }}>
                    <span style={{ color: "var(--z-blue)" }}>▸</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href={ZED_LINKS.apiKey} style={{ marginTop: "auto", display: "block", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, padding: "10px 14px", borderRadius: 7, background: "var(--z-cta)", color: "#fff", fontWeight: 500 }}>
                Get API key →
              </a>
            </div>

            <div style={{ border: "1px solid var(--z-rule)", borderRadius: 12, padding: "28px 30px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-7)" }}>outcome-based</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 42, lineHeight: 1, color: "var(--z-ink)" }}>Custom</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)" }}>on savings · enterprise</span>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.65, color: "var(--z-ink-4)", margin: "14px 0 18px" }}>
                At scale the comparison stops being something you read and becomes something we guarantee — we
                bill a share of what we save, only on runs that clear your quality bar.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                {ENTERPRISE.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.5, color: "var(--z-ink-3)" }}>
                    <span style={{ color: "var(--z-blue)" }}>▸</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:contact@bitrouter.ai" style={{ marginTop: "auto", display: "block", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, padding: "10px 14px", borderRadius: 7, color: "var(--z-ink)", border: "1px solid var(--z-rule-2)" }}>
                Talk to the founders →
              </a>
            </div>
          </div>

          {/* comparison */}
          <div style={{ marginTop: 72, borderTop: "1px solid var(--z-rule)", paddingTop: 44, overflowX: "auto" }}>
            <Kicker>// versus other gateways</Kicker>
            <h2 className="zed-display" style={{ fontSize: 38, lineHeight: 1.06, margin: "14px 0 0", maxWidth: "26ch" }}>
              A markup, a sales call, or a router that lowers the bill.
            </h2>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "14px 0 26px", maxWidth: "70ch" }}>
              Picking the <em>provider</em> for a model you chose moves cost by single digits — same model,
              cheaper host. Picking the <em>model</em> moves it by multiples. That is why we don&apos;t need a percentage.
            </p>
            <div style={{ minWidth: 720, border: "1px solid var(--z-rule)", borderRadius: 11, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr 1fr 1fr", background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)" }}>
                <div style={{ padding: "13px 18px" }} />
                {CMP_COLS.map((n, i) => (
                  <div key={n} style={{ padding: "13px 16px", fontFamily: "var(--font-mono)", fontSize: 11.5, color: i === 0 ? "var(--z-ink)" : "var(--z-ink-4)" }}>{n}</div>
                ))}
              </div>
              {CMP_ROWS.map((r) => (
                <div key={r.label} style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr 1fr 1fr", borderBottom: "1px solid var(--z-rule-faint)", background: r.hi ? "var(--z-inset)" : "transparent" }}>
                  <div style={{ padding: "13px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: r.hi ? "var(--z-ink-2)" : "var(--z-ink-4)" }}>{r.label}</div>
                  {r.row.map((v, i) => (
                    <div key={i} style={{ padding: "13px 16px", fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.5, color: i === 0 ? "var(--z-blue)" : "var(--z-ink-5)" }}>{v}</div>
                  ))}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.6, color: "var(--z-ink-6)", margin: "14px 0 0", maxWidth: "82ch" }}>
              Competitor figures are their published rates at time of writing; LiteLLM Enterprise is quote-only, so
              there is no rate to compare. See the{" "}
              <a href="/docs/guides/migrate-from-openrouter" className="zed-link">OpenRouter</a> and{" "}
              <a href="/docs/overview/bitrouter-vs-litellm" className="zed-link">LiteLLM</a> comparisons for the detail.
            </p>
          </div>

          {/* your numbers */}
          <div style={{ marginTop: 72, borderTop: "1px solid var(--z-rule)", paddingTop: 44 }}>
            <Kicker>// your numbers, not ours</Kicker>
            <h2 className="zed-display" style={{ fontSize: 38, lineHeight: 1.06, margin: "14px 0 0", maxWidth: "24ch" }}>
              You set the target. We report against it.
            </h2>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "14px 0 26px", maxWidth: "72ch" }}>
              We&apos;d rather show you your own numbers than a projection of them. Each workload declares what
              it is optimizing for, and every session is measured against that. Routing you can&apos;t hold to a
              number is just a black box with opinions.
            </p>
            <div style={{ border: "1px solid var(--z-rule)", borderRadius: 11, overflow: "hidden" }}>
              <div className="zed-hide-sm" style={{ display: "grid", gridTemplateColumns: "0.5fr 1.1fr 1.9fr", background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)" }}>
                {["Axis", "What you define", "What we report"].map((h) => (
                  <div key={h} style={{ padding: "11px 20px", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-6)" }}>{h}</div>
                ))}
              </div>
              {REPORT_DIMS.map((d, i) => (
                <div
                  key={d.dim}
                  className="zed-grid-3"
                  style={{ display: "grid", gridTemplateColumns: "0.5fr 1.1fr 1.9fr", alignItems: "baseline", borderBottom: i === REPORT_DIMS.length - 1 ? "none" : "1px solid var(--z-rule-faint)" }}
                >
                  <div style={{ padding: "15px 20px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--z-ink)" }}>{d.dim}</div>
                  <div style={{ padding: "15px 20px", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--z-blue)" }}>{d.define}</div>
                  <div style={{ padding: "15px 20px", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--z-ink-5)" }}>{d.report}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.65, color: "var(--z-ink-6)", margin: "14px 0 0", maxWidth: "84ch" }}>
              None of the three costs extra, and none of them waits on us. Success rate ships as the default
              quality metric — outcome classification is deterministic, with no judge in the request path — so a
              route has to earn its traffic before it keeps it. An eval only refines that bar where your
              definition of good is narrower than ours. Beyond it sits the enterprise engagement, where we
              measure the baseline with you and price on the savings. For measured runs against an all-frontier
              baseline, see the <a href="/#benchmark" className="zed-link">routed benchmark</a>.
            </p>
          </div>

          <PricingFaq />
          <div style={{ height: 76 }} />
        </div>
      </section>
    </div>
  );
}
