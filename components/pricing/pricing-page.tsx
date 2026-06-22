"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import posthog from "posthog-js";
import { cn } from "@/lib/cn";
import { CalButton } from "@/components/landing/sections/CalButton";

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How is zero markup on Pay-as-you-go sustainable?",
    answer:
      "On Pay-as-you-go you pay the exact upstream provider rate — no token markup, no routing fee, and we absorb card-processing costs. BitRouter makes money on the Subscription and Enterprise plans, not on per-token margin, so routing your usage stays free of any BitRouter fee.",
  },
  {
    question: "Can I bring my own API keys or use OAuth?",
    answer:
      "Yes. External provider mode covers both BYOK (bring your own API key) and BYOO (OAuth-based access for Codex and Claude Code). There is no routing fee and no token markup — you pay the upstream provider directly and BitRouter adds nothing on top.",
  },
  {
    question: "What is included in the Subscription plan?",
    answer:
      "The $20/month Subscription plan covers leading SOTA open-source models — Kimi, GLM, DeepSeek, Qwen, MiniMax, StepFun, and more — with rate limits included. Pair it with your existing Codex or Claude Code subscription: BitRouter handles the routing and fallback layer so you get broader model coverage without duplicating costs.",
  },
  {
    question: "Is there a first-month discount on Subscription?",
    answer:
      "Yes. We offer a discounted or free first month for new Subscription subscribers. Check the sign-up page for the current promotion — availability may vary.",
  },
  {
    question: "What does Custom (Enterprise) look like?",
    answer: (
      <>
        We scope every enterprise deployment personally — dedicated infrastructure, forward deployed engineering, SSO, zero trust security, custom SLAs, and invoicing, built around what your team actually needs. No sales team, no runbook.{" "}
        <CalButton>Book a call with the founders</CalButton>
        {" "}and let&apos;s figure it out together.
      </>
    ),
  },
  {
    question: "Can I self-host BitRouter for free?",
    answer:
      "Yes. The full BitRouter stack is Apache-2.0 licensed. Self-host on your own infrastructure with no platform fee, no usage minimums, and no token markup. You only pay your upstream provider costs.",
  },
  {
    question: "Can I switch between plans?",
    answer:
      "Yes. Switching between Pay-as-you-go and Subscription is automatic — no manual plan changes needed. If your Subscription usage hits its rate limits, BitRouter auto-falls back to Pay-as-you-go so your workloads keep running. For Enterprise, reach out and we'll handle the transition directly.",
  },
];

type TierKey = "payg" | "subscription" | "enterprise";

type FeatureRow = {
  label: string;
  payg: string | React.ReactNode;
  subscription: string | React.ReactNode;
  enterprise: string | React.ReactNode;
  highlight?: boolean;
};

const FEATURES: FeatureRow[] = [
  {
    label: "Price",
    payg: "0% markup\nupstream cost",
    subscription: "$20 / month",
    enterprise: "Custom",
  },
  {
    label: "Self-host",
    payg: "—",
    subscription: "—",
    enterprise: "Forward deployed",
  },
  {
    label: "Models",
    payg: "100+ models",
    subscription: "Open-source only",
    enterprise: "Any models",
  },
  {
    label: "External provider",
    payg: "No fee",
    subscription: "—",
    enterprise: <Check className="size-4" />,
  },
  {
    label: "Rate limits",
    payg: "Flexible",
    subscription: "Included",
    enterprise: "Custom",
  },
  {
    label: "Reliability",
    payg: <Check className="size-4" />,
    subscription: <Check className="size-4" />,
    enterprise: "SLA guarantee",
  },
  {
    label: "Observability",
    payg: <Check className="size-4" />,
    subscription: <Check className="size-4" />,
    enterprise: "Built-in + SIEM",
  },
  {
    label: "Security",
    payg: <Check className="size-4" />,
    subscription: <Check className="size-4" />,
    enterprise: "Zero trust framework",
  },
  {
    label: "Efficiency",
    payg: <Check className="size-4" />,
    subscription: <Check className="size-4" />,
    enterprise: "Customized model router",
  },
  {
    label: "Support",
    payg: "Discord · Telegram · Email",
    subscription: "Discord · Telegram · Email",
    enterprise: "Dedicated channels",
  },
  {
    label: "SSO / SAML",
    payg: "—",
    subscription: "—",
    enterprise: <Check className="size-4" />,
  },
  {
    label: "Volume discounts",
    payg: "—",
    subscription: "—",
    enterprise: <Check className="size-4" />,
  },
  {
    label: "Payment options",
    payg: "Fiat · Stablecoin",
    subscription: "Fiat · Stablecoin",
    enterprise: "Fiat · Stablecoin · Invoicing",
  },
];

function PricingFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border-t border-foreground/[0.08]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-foreground/[0.08]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-sm font-medium">{item.question}</span>
              {isOpen ? (
                <Minus className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <Plus className="size-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-out",
                isOpen
                  ? "grid-rows-[1fr] pb-5 opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TierCard({
  name,
  description,
  price,
  priceDetail,
  recommended,
  cta,
  ctaHref,
  ctaDisabled,
}: {
  name: string;
  description: string;
  price: string;
  priceDetail?: string;
  recommended?: boolean;
  cta: string;
  ctaHref: string;
  ctaDisabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col border border-foreground/[0.08] p-6",
        recommended && "border-foreground/25 bg-foreground/[0.02]",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {name}
        </span>
        {recommended && (
          <span className="border border-foreground/20 bg-foreground/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/70">
            Recommended
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5">
        <span className="text-3xl font-medium tracking-tight">{price}</span>
        {priceDetail && (
          <span className="ml-1 text-sm text-muted-foreground">{priceDetail}</span>
        )}
      </div>
      <div className="mt-6 flex-1" />
      {ctaDisabled ? (
        <span className="flex cursor-not-allowed items-center justify-center border border-foreground/[0.05] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground/50">
          Coming Soon
        </span>
      ) : (
        <Link
          href={ctaHref}
          className={cn(
            "flex items-center justify-center border px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors",
            recommended
              ? "border-foreground/30 bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-foreground/[0.08] text-foreground hover:bg-foreground/[0.03]",
          )}
          onClick={() => posthog.capture("pricing_cta_clicked", { tier: name.toLowerCase().replace(/[^a-z0-9]/g, "_"), cta_label: cta })}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

export function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-6 sm:py-24">
      <section>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Pricing
        </span>
        <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
          Pay upstream cost with zero markup, subscribe for a flat monthly rate,
          or get a custom plan for your team. No hidden fees, no routing fees,
          no minimums. Self-hosting is always free and open-source.
        </p>
      </section>

      <section className="mt-12 grid gap-px sm:grid-cols-3">
        <TierCard
          name="Pay-as-you-go"
          description="Access leading LLMs for coding and agentic use cases — Claude, GPT, Gemini, and 100+ models on a single endpoint."
          price="0%"
          priceDetail="markup · upstream cost"
          recommended
          cta="Get API Key"
          ctaHref="https://cloud.bitrouter.ai"
        />
        <TierCard
          name="Subscription"
          description="Flat monthly rate for open-source models. Pair with your Codex or Claude Code subscription to cover your full AI stack at lower cost."
          price="$20"
          priceDetail="/ month"
          cta="Subscribe"
          ctaHref="https://cloud.bitrouter.ai"
          ctaDisabled
        />
        <TierCard
          name="Custom"
          description="Tell us what you're building. We'll handle the infrastructure, the SLA, and the support personally — no sales team, no runbook."
          price="Custom"
          cta="Contact us"
          ctaHref="/enterprise"
        />
      </section>

      <section className="mt-20">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Compare plans
        </span>
        <h2 className="mt-5 text-2xl font-medium tracking-tight sm:text-3xl">
          Feature comparison
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground/[0.08]">
                <th className="py-3 pr-4 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Pay-as-you-go
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Subscription
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Custom
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-foreground/[0.06]",
                    i % 2 === 0 && "bg-foreground/[0.01]",
                  )}
                >
                  <td className="py-3 pr-4 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <CellContent value={row.payg} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <CellContent value={row.subscription} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <CellContent value={row.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-24">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          FAQ
        </span>
        <h2 className="mt-5 text-2xl font-medium tracking-tight sm:text-3xl">
          Common questions
        </h2>
        <div className="mt-8">
          <PricingFaq items={FAQ_ITEMS} />
        </div>
      </section>
    </div>
  );
}

function CellContent({ value }: { value: string | React.ReactNode }) {
  if (typeof value === "string") {
    if (value.includes("\n")) {
      return value.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ));
    }
    return value;
  }
  return <span className="flex items-center justify-center">{value}</span>;
}
