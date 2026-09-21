"use client";

import { useEffect, useRef, useState } from "react";
import { ZED_LINKS } from "./primitives";

const PLANS = [
  {
    id: "free",
    label: "Free",
    descriptor: "Self-hosted",
    price: "$0",
    priceDetail: "to BitRouter",
    description:
      "Run the Apache-2.0 router in your own infrastructure. Use your provider keys or local models without a BitRouter platform or request fee.",
    rows: [
      ["Best for", "Developers and teams that want to operate their own stack"],
      ["Runs on", "Your infrastructure"],
      ["Model source", "Your provider keys or local models"],
      ["BitRouter billing", "No platform or request fee"],
      ["Provider billing", "Paid directly to your providers"],
      ["Routing", "Included in the open-source core"],
      ["Observability", "Local receipts and OpenTelemetry export"],
      ["Support", "Documentation and community"],
    ],
    action: "Self-host BitRouter",
    href: ZED_LINKS.quickstart,
  },
  {
    id: "tokens",
    label: "Token-based",
    descriptor: "Hosted models",
    price: "0%",
    priceDetail: "token markup",
    description:
      "Use models through BitRouter Cloud and pay their provider token prices with 0% markup. Model routing is included at no additional cost.",
    rows: [
      ["Best for", "Managed inference without separate provider accounts"],
      ["Runs on", "BitRouter Cloud"],
      ["Model source", "Models supplied through BitRouter"],
      ["BitRouter billing", "Provider token prices with 0% token markup"],
      ["Provider billing", "Consolidated through your BitRouter balance"],
      ["Routing", "Included at no additional cost"],
      ["Additional fees", "Third-party payment-processing fees may apply when adding funds"],
      ["Observability", "Hosted activity and request receipts"],
    ],
    action: "Start using Cloud",
    href: ZED_LINKS.apiKey,
  },
  {
    id: "requests",
    label: "Per-request",
    descriptor: "Cloud BYOK",
    price: "Usage-based",
    priceDetail: "per successful request",
    description:
      "Connect your provider keys to BitRouter Cloud. You keep paying providers for inference and pay BitRouter for the hosted routing service.",
    rows: [
      ["Best for", "BYOK teams that do not want to operate the router"],
      ["Runs on", "BitRouter Cloud"],
      ["Model source", "Your provider accounts"],
      ["BitRouter billing", "Once per successful logical request"],
      ["Provider billing", "Paid directly to your providers"],
      ["Routing", "Hosted routing; retries and fallbacks are included"],
      ["Failed requests", "Not billed by BitRouter"],
      ["Observability", "Hosted activity and request receipts"],
    ],
    action: "Use Cloud BYOK",
    href: ZED_LINKS.apiKey,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    descriptor: "Custom",
    price: "Custom",
    priceDetail: "talk to the founders",
    description:
      "Work directly with us on the deployment, security, procurement, support, and operating requirements your team needs.",
    rows: [
      ["Best for", "Teams with defined organizational or operating requirements"],
      ["Runs on", "Hosted, self-hosted, or hybrid"],
      ["Model source", "Hosted models, BYOK, or local models"],
      ["BitRouter billing", "Defined with your team"],
      ["Provider billing", "Depends on the agreed deployment"],
      ["Routing", "Configured around your operating requirements"],
      ["Security", "Scoped with your team"],
      ["Support", "Direct founder engagement"],
    ],
    action: "Talk to the founders",
    href: ZED_LINKS.bookDemo,
  },
] as const;

export function PricingPlans() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = PLANS[activeIndex];

  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === "#teams" || window.location.hash === "#enterprise") {
        setActiveIndex(PLANS.length - 1);
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  function activate(index: number) {
    const next = (index + PLANS.length) % PLANS.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="zed-pricing-selector" id="teams" aria-label="Pricing options">
      <div className="zed-pricing-tabs" role="tablist" aria-label="Choose a pricing option">
        {PLANS.map((plan, index) => (
          <button
            className="zed-pricing-tab"
            id={`pricing-tab-${plan.id}`}
            key={plan.id}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") activate(activeIndex + 1);
              else if (event.key === "ArrowLeft") activate(activeIndex - 1);
              else if (event.key === "Home") activate(0);
              else if (event.key === "End") activate(PLANS.length - 1);
              else return;
              event.preventDefault();
            }}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            role="tab"
            aria-controls="pricing-panel"
            aria-selected={index === activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            <span>{plan.label}</span>
            <small>{plan.descriptor}</small>
          </button>
        ))}
      </div>

      <div
        className="zed-pricing-panel"
        id="pricing-panel"
        role="tabpanel"
        aria-labelledby={`pricing-tab-${active.id}`}
        tabIndex={0}
      >
        <div className="zed-pricing-summary">
          <div>
            <div className="zed-eyebrow">{active.descriptor}</div>
            <h2 className="zed-display">{active.label}</h2>
            <p>{active.description}</p>
          </div>
          <div className="zed-pricing-price">
            <strong>{active.price}</strong>
            <span>{active.priceDetail}</span>
          </div>
        </div>

        <dl className="zed-pricing-details">
          {active.rows.map(([term, detail]) => (
            <div className="zed-pricing-detail" key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="zed-pricing-action">
          <a className="zed-btn zed-btn-primary" href={active.href}>
            {active.action}
          </a>
        </div>
      </div>
    </section>
  );
}
