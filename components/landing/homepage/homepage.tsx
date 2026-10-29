"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CLOUD_PRICING } from "@/lib/commercial-pricing";
import { ArrowUpRight, Download } from "lucide-react";
import { ValueTui } from "./value-tui";
import { InstallTabs } from "./install-tabs";
import { HomepageFeatures } from "./features";
import { GitHubStarsBadge } from "../github-stars-badge";
import "./homepage.css";

const values = [
  {
    id: "spending", label: "overspending.",
  },
  {
    id: "waiting", label: "waiting around.",
  },
  {
    id: "managing", label: "micromanaging.",
  },
] as const;

function ValueTabs() {
  const [selection, setSelection] = useState({ index: 0, run: 0 });
  const [columns, setColumns] = useState(100);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const value = values[selection.index];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2), { threshold: [0, 0.2] });
    const resize = new ResizeObserver(([entry]) => setColumns(Math.max(28, Math.min(112, Math.floor((entry.contentRect.width - 36) / 7.55)))));
    if (section.current) intersection.observe(section.current);
    if (stage.current) resize.observe(stage.current);
    return () => {
      intersection.disconnect();
      resize.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const updateProgress = useCallback((progress: number) => {
    tabRefs.current.forEach((tab, index) => tab?.style.setProperty("--value-progress", index === selection.index ? String(progress) : "0"));
  }, [selection.index]);
  const select = (index: number) => {
    tabRefs.current.forEach(tab => tab?.style.setProperty("--value-progress", "0"));
    setSelection(current => ({ index, run: current.run + 1 }));
  };
  const advance = useCallback((finishedRun: number) => {
    setSelection(current => current.run === finishedRun
      ? { index: (current.index + 1) % values.length, run: current.run + 1 }
      : current);
  }, []);

  return <section ref={section} className="ws-values ws-wrap" id="values" aria-label="What BitRouter does for your workflow"
    onPointerDownCapture={() => setKeyboardFocus(false)}
    onFocusCapture={event => {
      const target = event.target as HTMLElement;
      // WTerm focuses its hidden input on first mount. Ignore that autofocus,
      // while preserving keyboard reading when focus moves into the terminal.
      if (target.matches(":focus-visible") && !target.closest(".ws-value-terminal")) setKeyboardFocus(true);
    }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setKeyboardFocus(false); }}
  >
    <div className="ws-value-tabs" role="tablist" aria-label="Product benefits">
      {values.map((item, i) => <button
        key={item.id} ref={element => { tabRefs.current[i] = element; }}
        id={`value-tab-${item.id}`} role="tab" type="button"
        aria-selected={selection.index === i} aria-controls="value-panel" tabIndex={selection.index === i ? 0 : -1}
        onClick={() => select(i)}
        onKeyDown={event => {
          const next = event.key === "ArrowRight" ? (i + 1) % values.length : event.key === "ArrowLeft" ? (i + values.length - 1) % values.length : event.key === "Home" ? 0 : event.key === "End" ? values.length - 1 : null;
          if (next === null) return;
          event.preventDefault(); setKeyboardFocus(true); select(next); tabRefs.current[next]?.focus();
        }}
      ><span className="ws-tab-progress" aria-hidden="true" /><span className="ws-tab-label">Stop <em>{item.label}</em></span></button>)}
    </div>
    <div id="value-panel" role="tabpanel" aria-labelledby={`value-tab-${value.id}`} tabIndex={0}>
      <div className="ws-value-animation">
        <div ref={stage} className="ws-tui-stage"
          onPointerEnter={event => { if (event.pointerType === "mouse") setHovering(true); }}
          onPointerLeave={() => setHovering(false)}
        >
          <ValueTui scenario={value.id} run={selection.run} columns={columns} playing={visible && pageVisible} canAdvance={!hovering && !keyboardFocus} reducedMotion={reducedMotion} onAdvance={advance} onProgress={updateProgress} />
        </div>
      </div>
    </div>
  </section>;
}

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
      </article>
    </div>

    <a className="ws-text-link ws-pricing-details" href="/pricing">View pricing <ArrowUpRight size={15} aria-hidden="true" /></a>

  </section>;
}

function PrivacySection() {
  return <section className="ws-privacy ws-wrap" id="privacy" aria-labelledby="ws-privacy-title">
    <h2 id="ws-privacy-title">Built for<br /><em>privacy first.</em></h2>
    <div>
      <p>Route on your infrastructure. Telemetry excludes prompt and response bodies by default.</p>
      <a className="ws-text-link" href="/enterprise#enterprise-self-hosting">Explore enterprise <ArrowUpRight size={15} aria-hidden="true" /></a>
    </div>
  </section>;
}

const faqs = [
  ["What is BitRouter?", "BitRouter is an open-source model router for AI agents. It connects your workflow to model providers and lets you inspect and change how requests are routed."],
  ["Do I need to switch agents?", "Keep your existing agent. Connect through BitRouter’s API or use the CLI. The setup and supported capabilities depend on your agent; the integration guides cover each supported path."],
  ["What’s the difference between the API and CLI?", "The API gives applications and agents a local routing endpoint. The CLI lets you configure BitRouter, inspect routes, and work with supported agents from your terminal. Both use the open-source router."],
  ["Can I use my existing subscription?", "Supported subscription-backed providers can be configured in BitRouter. Availability, authentication, and usage limits depend on the provider. Check the provider guide for your subscription."],
  ["What do I pay for?", "Self-hosting is free of BitRouter fees. Cloud Auto Routing and Elastic Inference share one platform fee: $0.01 per million processed input + output tokens at early access pricing. Each request is counted once, including when routing into Elastic Inference. 0% markup on inference. Enterprise terms are custom."],
  ["Can I run it on my own infrastructure?", "Yes. Self-host the Apache-2.0 router and connect your own provider keys, local models, or private inference endpoints. A BitRouter Cloud account is not required for local routing."],
];

export function Homepage() {
  return <div className="workspace-site">
    <main id="main">
      <section className="ws-hero ws-wrap"><h1 aria-label="The Open Market for Elastic Inference"><span>The Open Market</span>{" "}<em>for Elastic Inference</em></h1><p>The right inference for your workload, on your terms.</p><InstallTabs /></section>
      <ValueTabs />
      <HomepageFeatures />
      <PricingSection />
      <PrivacySection />
      <section className="ws-faq ws-wrap" id="faq" aria-labelledby="ws-faq-title"><div className="ws-faq-list"><h2 id="ws-faq-title">FAQ</h2>{faqs.map(([q, a]) => <details key={q}><summary>{q}<span className="ws-faq-plus" aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
      <section className="ws-final ws-wrap"><h2>Make your agent<br /><em>self-driving.</em></h2><p>Keep your agent. Let BitRouter handle the routing.</p><div className="ws-actions"><a className="ws-button ws-primary" href="https://github.com/bitrouter/bitrouter/releases/latest"><Download size={16} aria-hidden="true" />Download BitRouter</a><GitHubStarsBadge className="ws-button" label="Star on GitHub" compact={false} /></div><span className="ws-hero-note">Open source. Ready for your workspace.</span></section>
    </main>
  </div>;
}
