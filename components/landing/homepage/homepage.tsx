"use client";

import { CLOUD_PRICING, CLOUD_WELCOME_CREDIT } from "@/lib/commercial-pricing";
import { ArrowRight, ArrowUpRight, Check, Download, Server } from "lucide-react";
import { InstallTabs } from "./install-tabs";
import { HomepageFeatures } from "./features";
import { GitHubStarsBadge } from "../github-stars-badge";
import { Playground } from "../playground/playground";
import "./homepage.css";

function PricingSection() {
  return <section className="ws-pricing ws-wrap" id="pricing" aria-labelledby="home-pricing-title">
    <div className="ws-pricing-header">
      <h2 id="home-pricing-title">Open source. <span>Free to self-host.</span></h2>
      <p className="ws-pricing-intro">Use your own keys, subscriptions, or local models.</p>
    </div>

    <div className="ws-cloud-pricing">
      <article>
        <div className="ws-cloud-heading"><h3>Cloud</h3><span className="ws-access-badge">{CLOUD_PRICING.stage}</span></div>
        <p className="ws-cloud-rate"><strong>{CLOUD_PRICING.price}</strong><span>/ million processed tokens</span></p>
        <p className="ws-pricing-note">Input + output tokens. Cloud Auto Routing and Elastic Inference.</p>
        <p className="ws-pricing-note">0% markup on inference.</p>
        <div className="ws-welcome-credit">
          <h4>{CLOUD_WELCOME_CREDIT.headline}</h4>
          <p className="ws-welcome-no-card">{CLOUD_WELCOME_CREDIT.noCardRequired}</p>
          <p>{CLOUD_WELCOME_CREDIT.description}</p>
        </div>
      </article>
    </div>

    <a className="ws-text-link ws-pricing-details" href="/pricing">View pricing <ArrowUpRight size={15} aria-hidden="true" /></a>

  </section>;
}

function TrustSection() {
  return <section className="ws-trust ws-wrap" id="trust" aria-label="Permissionless participation and trustless inference">
    <span id="privacy" className="ws-trust-legacy-anchor" aria-hidden="true" />
    <div className="ws-trust-flow">
      <div className="ws-trust-pillar">
        <h2>Permissionless</h2>
        <p className="ws-trust-description">Open technical requirements.<br />No case-by-case approval.</p>
        <div className="ws-trust-provider-map">
          <ul className="ws-trust-providers" aria-label="Illustrative participating providers">
            {["Provider A", "Provider B", "Provider C"].map(provider => <li key={provider}>
              <Server size={17} strokeWidth={1.5} aria-hidden="true" />{provider}
            </li>)}
          </ul>
        </div>
      </div>
      <div className="ws-trust-bridge" aria-hidden="true"><span /><ArrowRight size={20} strokeWidth={1.5} /></div>
      <div className="ws-trust-pillar">
        <h2>Trustless</h2>
        <p className="ws-trust-description">One verification standard.<br />Applied to every platform request.</p>
        <div className="ws-trust-proof">
          <h3>Model specification</h3>
          <ul aria-label="Verified model specifications">
            {["Version", "Weights", "Precision"].map(specification => <li key={specification}>
              <Check size={15} strokeWidth={1.5} aria-hidden="true" />{specification}
            </li>)}
          </ul>
          <p className="ws-trust-proof-scope">Request ↔ execution ↔ response</p>
        </div>
      </div>
    </div>
    <div className="ws-trust-footer">
      <p>Illustrative verification flow</p>
      <a className="ws-text-link" href="/enterprise">Explore enterprise <ArrowUpRight size={15} aria-hidden="true" /></a>
    </div>
  </section>;
}

const faqs = [
  ["What is BitRouter?", "BitRouter is an open-source model router for AI agents. It connects your workflow to model providers and lets you inspect and change how requests are routed."],
  ["Do I need to switch agents?", "Keep your existing agent. Connect through BitRouter’s API or use the CLI. The setup and supported capabilities depend on your agent; the integration guides cover each supported path."],
  ["What’s the difference between the API and CLI?", "The API gives applications and agents a local routing endpoint. The CLI lets you configure BitRouter, inspect routes, and work with supported agents from your terminal. Both use the open-source router."],
  ["Can I use my existing subscription?", "Supported subscription-backed providers can be configured in BitRouter. Availability, authentication, and usage limits depend on the provider. Check the provider guide for your subscription."],
  ["What do I pay for?", "Self-hosting is free of BitRouter fees. Cloud Auto Routing and Elastic Inference share one platform fee: $0.01 per million processed input + output tokens at early access pricing. Each request is counted once, including when routing into Elastic Inference. 0% markup on inference. Enterprise terms are custom."],
  ["How does the welcome credit work?", `${CLOUD_WELCOME_CREDIT.description} At the current early access rate, $10 covers the platform fees for one billion processed input + output tokens. This is a one-time credit, not a monthly allowance. No credit card is required to create an account and receive the welcome credit.`],
  ["Can I run it on my own infrastructure?", "Yes. Self-host the Apache-2.0 router and connect your own provider keys, local models, or private inference endpoints. A BitRouter Cloud account is not required for local routing."],
];

export function Homepage() {
  return <div className="workspace-site">
    <main id="main">
      <section className="ws-hero ws-wrap"><h1 aria-label="The Open Market for Elastic Inference"><span>The Open Market</span>{" "}<em>for Elastic Inference</em></h1><p>The right inference for your workload, on your terms.</p><InstallTabs /></section>
      <Playground />
      <HomepageFeatures />
      <PricingSection />
      <TrustSection />
      <section className="ws-faq ws-wrap" id="faq" aria-labelledby="ws-faq-title"><div className="ws-faq-list"><h2 id="ws-faq-title">FAQ</h2>{faqs.map(([q, a]) => <details key={q}><summary>{q}<span className="ws-faq-plus" aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
      <section className="ws-final ws-wrap"><h2>Make your agent<br /><em>self-driving.</em></h2><p>Keep your agent. Let BitRouter handle the routing.</p><div className="ws-actions"><a className="ws-button ws-primary" href="https://github.com/bitrouter/bitrouter/releases/latest"><Download size={16} aria-hidden="true" />Download BitRouter</a><GitHubStarsBadge className="ws-button" label="Star on GitHub" compact={false} /></div><span className="ws-hero-note">Open source. Ready for your workspace.</span></section>
    </main>
  </div>;
}
