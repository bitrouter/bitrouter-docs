import { setRequestLocale } from "next-intl/server";
import {
  Building2,
  ArrowUpRight,
  Shield,
  Zap,
  BarChart3,
  RefreshCw,
  Lock,
  Users,
  CreditCard,
  Eye,
  Globe,
  BookOpen,
  Code2,
  Route,
  FileText,
} from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { CalButton } from "@/components/landing/sections/CalButton";
import { Button } from "@/components/ui/button";
import { EnterpriseContactForm } from "@/components/enterprise/enterprise-contact-form";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

const FEATURE_CHECKLIST = [
  "Multi-provider routing",
  "Automatic failover",
  "Zero data retention",
  "Custom SLAs",
  "SSO & org support",
  "Usage analytics",
  "Spend management",
  "Priority support",
];

const FEATURES = [
  {
    icon: Zap,
    title: "Automatic failover",
    description:
      "Edge-deployed with automatic failover across 50+ cloud providers for best-in-class uptime.",
  },
  {
    icon: Shield,
    title: "Dedicated infrastructure",
    description:
      "Isolated deployment with custom SLAs, uptime guarantees, and in-region routing.",
  },
  {
    icon: Users,
    title: "Priority support",
    description:
      "Direct access to the engineering team via Slack or Discord with a dedicated engineering contact.",
  },
  {
    icon: Route,
    title: "Custom routing policies",
    description:
      "Tailored model selection, fallback chains, and cost controls for your specific workloads.",
  },
  {
    icon: CreditCard,
    title: "Spend management",
    description:
      "Per-key credit limits with automatic daily, weekly, or monthly resets. Real-time usage tracking.",
  },
  {
    icon: BarChart3,
    title: "Volume pricing",
    description:
      "Competitive rates for high-throughput agent workloads. Invoiced billing and credit lines available.",
  },
  {
    icon: Eye,
    title: "Observability",
    description:
      "Broadcast traces to Langfuse, Datadog, and more. Monitor token usage, costs, and latency across all requests.",
  },
  {
    icon: Lock,
    title: "Compliance & privacy",
    description:
      "Zero data retention support. GDPR compliance. Route requests exclusively to providers with ZDR policies.",
  },
  {
    icon: Globe,
    title: "Sovereign AI",
    description:
      "In-region routing, data residency controls, and compliance features that keep workloads within national boundaries.",
  },
];

const PAIN_SOLUTIONS = [
  {
    pain: "Managing 5+ provider relationships",
    solution: "Single API, single contract, unified billing",
  },
  {
    pain: "Building custom retry & failover logic",
    solution: "Automatic failover across 50+ cloud providers",
  },
  {
    pain: "Capacity and rate limits",
    solution: "Fail over into our capacity when your limits are hit",
  },
  {
    pain: "Maintaining separate code for each model",
    solution: "Zero switching cost between models",
  },
  {
    pain: "Data retention and privacy concerns",
    solution: "Zero data retention with single-click ZDR",
  },
  {
    pain: "Compliance with each provider",
    solution: "A single GDPR-compatible, SOC-2 compliant partner",
  },
];

const TECHNICAL_RESOURCES = [
  {
    icon: BookOpen,
    title: "Enterprise quickstart",
    description: "Get your organization up and running with BitRouter",
    href: "/docs/overview/enterprise",
  },
  {
    icon: Code2,
    title: "API documentation",
    description: "Comprehensive guides and reference documentation",
    href: "/docs/api-reference",
  },
  {
    icon: Route,
    title: "Routing guide",
    description: "Learn how to optimize routing for your use case",
    href: "/docs/overview/routing",
  },
  {
    icon: FileText,
    title: "Integration examples",
    description: "Code samples for popular frameworks and languages",
    href: "/docs/overview/quickstart",
  },
];

export default async function EnterprisePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* ── Left 40%: sticky sidebar ── */}
      <div className="w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:w-[40%] lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:border-b-0 lg:border-r lg:flex lg:flex-col lg:justify-center">
        <div className="lg:max-w-md lg:mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Building2 className="size-4" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Enterprise
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl text-muted-foreground">
            Enterprise-grade routing at scale.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Unified access to every AI provider with zero operational overhead.
            One API, one bill, every model.
          </p>

          {/* Feature checklist */}
          <ul className="mt-6 space-y-1.5">
            {FEATURE_CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs font-mono text-muted-foreground"
              >
                <span className="text-muted-foreground/60">+</span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href="/docs/overview/enterprise"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            View docs
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>

      {/* ── Right 60%: scrollable content ── */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* ── Metrics ── */}
        <RuledSectionLabel label="ENTERPRISE" className="mb-8" />

        <div className="grid grid-cols-3 gap-px border border-border bg-border max-w-lg mb-12">
          {[
            { value: "1.2M+", label: "Requests routed" },
            { value: "3,400+", label: "Agents connected" },
            { value: "$2.4M", label: "Cost savings" },
          ].map((stat) => (
            <div key={stat.label} className="bg-background p-4 text-center">
              <div className="text-lg font-semibold tracking-tight">
                {stat.value}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Pain → Solution ── */}
        <RuledSectionLabel label="WHY BITROUTER" className="mb-8" />

        <div className="max-w-2xl mb-12">
          <p className="text-sm text-muted-foreground mb-6">
            Stop managing complexity. Start shipping features.
          </p>
          <div className="grid grid-cols-1 gap-px border border-border bg-border">
            {PAIN_SOLUTIONS.map((item) => (
              <div
                key={item.pain}
                className="bg-background grid grid-cols-2 gap-px"
              >
                <div className="flex items-start gap-2 p-4 border-r border-border">
                  <RefreshCw className="size-3 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {item.pain}
                  </span>
                </div>
                <div className="flex items-start gap-2 p-4">
                  <Zap className="size-3 text-foreground/70 mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/80 leading-relaxed">
                    {item.solution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature grid ── */}
        <RuledSectionLabel label="CAPABILITIES" className="mb-8" />

        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 max-w-2xl mb-12">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-background p-5">
                <Icon className="size-4 text-muted-foreground mb-2" />
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Technical resources ── */}
        <RuledSectionLabel label="RESOURCES" className="mb-8" />

        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 max-w-2xl mb-12">
          {TECHNICAL_RESOURCES.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                className="bg-background p-5 group hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="size-3.5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold group-hover:text-foreground transition-colors">
                    {item.title}
                  </h3>
                  <ArrowUpRight className="size-3 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </a>
            );
          })}
        </div>

        {/* ── Contact form + Cal.com ── */}
        <RuledSectionLabel label="GET IN TOUCH" className="mb-8" />

        <div className="max-w-lg mb-12">
          <h2 className="text-lg font-medium tracking-tight text-muted-foreground">
            Get in touch
          </h2>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Fill out the form and we&apos;ll be in touch within 24 hours, or
            schedule a call directly with the founding team.
          </p>

          <div className="mt-6">
            <EnterpriseContactForm />
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground/60">
            <div className="flex-1 border-t border-border" />
            <span className="font-mono uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <div className="mt-6">
            <CalButton>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-none"
              >
                Schedule a call &rarr;
              </Button>
            </CalButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Enterprise - BitRouter",
    description:
      "Enterprise-grade LLM routing with dedicated infrastructure, priority support, and custom policies.",
  };
}
