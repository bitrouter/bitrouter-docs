import { setRequestLocale } from "next-intl/server";
import { Building2, ArrowUpRight } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { CalButton } from "@/components/landing/sections/CalButton";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EnterprisePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* ── Left 40%: sticky sidebar ── */}
      <div className="w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:w-[40%] lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r lg:flex lg:flex-col lg:justify-center">
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
            Dedicated infrastructure, priority support, and custom routing
            policies for teams that need more.
          </p>

          <a
            href="/docs/overview/enterprise"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            View docs
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>

      {/* ── Right 60%: contact CTA ── */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <RuledSectionLabel label="ENTERPRISE" className="mb-10" />

        <div className="max-w-lg">
          <h2 className="text-lg font-medium tracking-tight text-muted-foreground">
            Get in touch
          </h2>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Schedule a call with the founding team to discuss your routing
            requirements, volume pricing, and deployment options.
          </p>

          <div className="mt-8">
            <CalButton>
              <Button size="lg" className="w-full sm:w-auto">
                Schedule a call &rarr;
              </Button>
            </CalButton>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
            {[
              {
                title: "Dedicated infrastructure",
                description:
                  "Isolated deployment with custom SLAs and uptime guarantees.",
              },
              {
                title: "Priority support",
                description:
                  "Direct access to the engineering team via Slack or Discord.",
              },
              {
                title: "Custom routing policies",
                description:
                  "Tailored model selection, fallback chains, and cost controls.",
              },
              {
                title: "Volume pricing",
                description:
                  "Competitive rates for high-throughput agent workloads.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-background p-5">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
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
