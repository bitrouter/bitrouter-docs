"use client";

import { useState } from "react";
import { Kicker } from "./primitives";

const PFAQS = [
  {
    q: "How does BitRouter make money if pay-as-you-go is 0% markup?",
    a: "Pay-as-you-go is genuinely passthrough — you pay the exact upstream provider rate, no token markup, no routing fee. BitRouter earns on the flat-rate Subscription and on the outcome-based tier, where we take a share of the spend we actually save you. Routing your usage never carries a BitRouter fee.",
  },
  {
    q: "How does outcome-based pricing work?",
    a: "You run your full production loop through BitRouter. You set a budget and a measurable quality floor. We guarantee the loop stays under your budget, and we bill a custom share of what we save you against your measured baseline — only on runs that clear your quality bar, and never more than we saved you. It's enterprise-only for now; talk to the founders to scope the rate.",
  },
  {
    q: "Do the three plans stack?",
    a: "Yes. Passthrough (0% markup) is the substrate under everything. Subscription overrides it with a flat rate for open-source models — frontier calls still run at passthrough. Outcome-based sits on top as an engagement layer for teams routing production loops at scale. You're not picking one wall; you're stacking layers.",
  },
  {
    q: "What's included in the Subscription plan?",
    a: "The $20/month plan buys flat-rate access to the leading open-source models — Kimi, GLM, DeepSeek, Qwen, MiniMax, and more — at 20 requests/min and 1M tokens/day. Frontier models stay one alias away at passthrough. If you hit the plan's limits, BitRouter falls back to pay-as-you-go so your workloads keep running. (Subscription billing is coming soon.)",
  },
  {
    q: "Can I self-host for free?",
    a: "Yes. The full stack is Apache-2.0. Self-host on your own infrastructure with no platform fee, no minimums, and no token markup — you pay only your upstream provider costs. Same routing engine, guardrails, and observability as the hosted edge.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PFAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function PricingFaq() {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ marginTop: 72, borderTop: "1px solid var(--z-rule)", paddingTop: 44 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div
        className="zed-grid-2"
        style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "start" }}
      >
        <div style={{ position: "sticky", top: 88 }}>
          <Kicker>// faq</Kicker>
          <h2 className="zed-display" style={{ fontSize: 40, lineHeight: 1.06, margin: "16px 0 0" }}>
            Questions.
          </h2>
        </div>
        <div style={{ borderTop: "1px solid var(--z-rule)" }}>
          {PFAQS.map((f, i) => {
            const isOpen = i === open;
            return (
              <div key={f.q} style={{ borderBottom: "1px solid var(--z-rule)" }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    display: "flex",
                    gap: 14,
                    width: "100%",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    padding: "22px 0",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 15,
                    color: isOpen ? "var(--z-ink)" : "var(--z-ink-2)",
                  }}
                >
                  <span style={{ color: "var(--z-blue)", width: 12, flex: "0 0 auto" }}>{isOpen ? "−" : "+"}</span>
                  {f.q}
                </button>
                <div className={`zed-faq-ans${isOpen ? " open" : ""}`}>
                  <div>
                    <div style={{ padding: "0 0 22px 26px", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7, color: "var(--z-ink-4)" }}>
                      {f.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
