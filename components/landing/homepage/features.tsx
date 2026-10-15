"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { Check, CircleCheck, Code2, Laptop, Search, Server, Cloud } from "lucide-react";
import ClaudeCode from "@lobehub/icons/es/ClaudeCode/components/Mono";
import Codex from "@lobehub/icons/es/Codex/components/Mono";
import OpenCode from "@lobehub/icons/es/OpenCode/components/Mono";
import Qwen from "@lobehub/icons/es/Qwen/components/Mono";
import Claude from "@lobehub/icons/es/Claude/components/Mono";
import Gemini from "@lobehub/icons/es/Gemini/components/Mono";
import Meta from "@lobehub/icons/es/Meta/components/Mono";
import "./features.css";

type DemoProps = { step: number };
type Feature = {
  id: string;
  title: string;
  description: string;
  Demo: ComponentType<DemoProps>;
};

const harnesses = [
  { name: "Claude Code", Icon: ClaudeCode },
  { name: "Codex", Icon: Codex },
  { name: "OpenCode", Icon: OpenCode },
];

function AgentDemo({ step }: DemoProps) {
  return <div className="wf-icon-row wf-agent-demo">
    {harnesses.map(({ name, Icon }, index) => <span key={name} role="img" aria-label={name} className={`wf-icon ${step >= index ? "is-ready" : ""}`}><Icon size={32} aria-hidden="true" /></span>)}
  </div>;
}

const phases = [
  { name: "Explore with Qwen", WorkIcon: Search, ModelIcon: Qwen },
  { name: "Build with Claude", WorkIcon: Code2, ModelIcon: Claude },
  { name: "Verify with Gemini", WorkIcon: CircleCheck, ModelIcon: Gemini },
];

function RoutingDemo({ step }: DemoProps) {
  return <div className="wf-icon-row wf-routing-demo">
    {phases.map(({ name, WorkIcon, ModelIcon }, index) => <span key={name} role="img" aria-label={name} className={`wf-routing-pair wf-icon ${step >= index ? "is-ready" : ""}`}>
      <WorkIcon size={18} strokeWidth={1.5} aria-hidden="true" />
      <ModelIcon size={30} aria-hidden="true" />
    </span>)}
  </div>;
}

function ComputeDemo({ step }: DemoProps) {
  return <div className="wf-icon-row wf-compute-demo" role="img" aria-label="Local, private, and hosted compute. The private endpoint is selected.">
    <Laptop size={30} strokeWidth={1.5} aria-hidden="true" className="wf-icon" />
    <Server size={30} strokeWidth={1.5} aria-hidden="true" className={`wf-icon ${step >= 1 ? "is-ready" : ""}`} />
    <Cloud size={30} strokeWidth={1.5} aria-hidden="true" className="wf-icon" />
  </div>;
}

function ReceiptDemo({ step }: DemoProps) {
  return <div className="wf-icon-row wf-receipt-demo" role="img" aria-label="Illustrative completed request: Llama model, 1,552 total tokens, successful.">
    <Meta size={32} aria-hidden="true" className={`wf-receipt-item ${step >= 1 ? "is-visible" : ""}`} />
    <span aria-hidden="true" className={`wf-token-count wf-receipt-item ${step >= 2 ? "is-visible" : ""}`}>1,552<small>tokens</small></span>
    <Check size={23} strokeWidth={1.5} aria-hidden="true" className={`wf-receipt-item ${step >= 3 ? "is-visible" : ""}`} />
  </div>;
}

// Append a feature without changing the layout or animation lifecycle.
const features: readonly Feature[] = [
  { id: "agent", title: "Keep your agent.", description: "Keep your tools, context, and habits. Connect the agent you already work with.", Demo: AgentDemo },
  { id: "routing", title: "Let inference follow the work.", description: "Match the model and reasoning effort to each step, with decisions you can inspect.", Demo: RoutingDemo },
  { id: "compute", title: "Put your compute to work.", description: "Connect local models, private endpoints, and hosted providers. Choose where your requests run.", Demo: ComputeDemo },
  { id: "receipts", title: "Know what your tokens achieved.", description: "Trace each request to its model and token usage. Understand what ran and what it consumed.", Demo: ReceiptDemo },
];

function FeaturePreview({ feature }: { feature: Feature }) {
  const container = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [step, setStep] = useState(3);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let intersecting = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const active = intersecting && !document.hidden;
      setVisible(active);
      setReducedMotion(preference.matches);
      if (preference.matches) setStep(3);
      if (active && !started.current) {
        started.current = true;
        if (!preference.matches) setStep(0);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting && entry.intersectionRatio >= 0.65;
      update();
    }, { threshold: 0.65 });
    observer.observe(element);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion || step === 3) return;
    const timer = window.setTimeout(() => setStep(value => Math.min(value + 1, 3)), 800);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, step]);

  const { Demo } = feature;
  return <div className="wf-preview" ref={container} role="group" aria-label={`${feature.title} Illustrative preview`} data-step={step}><Demo step={step} /></div>;
}

export function HomepageFeatures() {
  return <section className="ws-wrap wf-section" id="features" aria-labelledby="wf-title">
    <div className="wf-heading"><h2 id="wf-title">Everything in its place.<br /><em>You, back in your flow.</em></h2><span>Illustrative workflows</span></div>
    <div className="wf-feature-list">{features.map(feature => <article className="wf-feature-row" key={feature.id} aria-labelledby={`wf-${feature.id}`}>
      <div className="wf-copy"><h3 id={`wf-${feature.id}`}>{feature.title}</h3><p>{feature.description}</p></div>
      <FeaturePreview feature={feature} />
    </article>)}</div>
  </section>;
}
