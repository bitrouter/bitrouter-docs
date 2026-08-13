"use client";

import { useState } from "react";
import { Kicker } from "./primitives";

const PFAQS = [
  {
    q: "How is this different from OpenRouter and LiteLLM?",
    a: "OpenRouter picks the best provider for a model you chose, and charges 5.5% to load credits. LiteLLM doesn't pick anything — you configure the routes yourself, and its hosted tier is quote-only through a sales call. BitRouter picks the model and the provider for each call, based on where it sits in your agent's trajectory and how much risk it carries, and charges 0%. That difference isn't a discount, it's a different lever: choosing a cheaper host for the same model moves cost by single digits, while choosing a cheaper model for the calls that don't need a frontier one moves it by multiples. We don't need a percentage because the routing is the product.",
  },
  {
    q: "So what do I actually pay?",
    a: "Tokens, at the provider's published list price, with 0% markup — no routing fee, no platform fee, no seat fee. Routing itself is never metered, and that's a commitment rather than a not-yet: your request volume will not turn into a billed line later. A free account also includes 1M trace receipts a month kept 30 days, evals, guardrails, multi-provider failover, unlimited seats and one workspace. Point BitRouter at your own provider contracts and we take no percentage on that traffic either — unlike gateways that levy one on BYOK — or self-host the whole Apache-2.0 stack, with the same routing engine, guardrails and observability as the hosted edge, and owe us nothing at all.",
  },
  {
    q: "Is cost-per-session a quote, or what you bill me on?",
    a: "Neither — it's a unit of account. Cost-per-session is how you compare bitrouter/auto against running a frontier model outright, in the unit the router actually controls; your invoice is tokens at list price. And we deliberately don't quote it in advance, because an accurate forecast would have to absorb the variance in your context shape, how often the router escalates, and upstream prices that move — the spread we'd charge to cover that would be exactly the markup we removed. What we can do is show you what your traffic did cost, computed from your own receipts, against what your baseline model would have cost for the same sessions. At enterprise scale the variance does get absorbed: that's what the budget guarantee is.",
  },
  {
    q: "How do I know routing didn't make quality worse?",
    a: "Because a route has to earn its traffic. You declare what each workload is optimizing for — a cost ceiling, a p50/p95 target, a quality floor — and every session is measured against it. Success rate is the default quality metric and needs nothing from you: outcome classification is deterministic, with no judge in the request path, so a failure escalates a route immediately and a cheaper route must succeed repeatedly before it earns traffic. If your definition of good is narrower than that, point an eval at it — `bitrouter optimize` then runs your workflow twice, once as-is and once with a single routing change, and reports the cost and quality deltas so you can publish or roll back.",
  },
  {
    q: "How long are traces kept, and why those windows?",
    a: "A free account keeps receipts for 30 days, sized for debugging rather than for an audit. Longer windows are set by the regimes that actually govern log retention rather than by round numbers: 6 months matches the EU AI Act's Article 19 minimum for providers of high-risk AI systems, applicable since 2 August 2026; 12 months matches SOC 2 expectations and PCI DSS 4.0; 7 years covers HIPAA and SOX. Whether a given obligation applies to your system is a call for your own counsel — under the AI Act the duty sits with the provider of the high-risk system, not with BitRouter. Either way we store receipts, never prompts or responses.",
  },
  {
    q: "How does outcome-based pricing work?",
    a: "You run your full production loop through BitRouter. You set a budget and a measurable quality floor. We guarantee the loop stays under your budget, and we bill a custom share of what we save you against your measured baseline — only on runs that clear your quality bar, and never more than we saved you. It's enterprise-only, because agreeing a baseline and a quality bar takes a conversation; talk to the founders to scope the rate.",
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
