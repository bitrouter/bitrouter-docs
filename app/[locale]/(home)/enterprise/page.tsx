import { setRequestLocale } from "next-intl/server";
import { Building2, ArrowUpRight } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { CalButton } from "@/components/landing/sections/CalButton";
import { Button } from "@/components/ui/button";
import { EnterpriseContactForm } from "@/components/enterprise/enterprise-contact-form";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

const FEATURE_CHECKLIST = [
  "Dedicated infrastructure with custom SLAs",
  "Zero data retention & GDPR compliance",
  "SSO, RBAC & organization support",
  "Custom routing policies & fallback chains",
  "Per-key spend management & analytics",
  "In-region routing & data residency",
  "Priority support from the engineering team",
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
            href="/pricing"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            View pricing
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>

      {/* ── Right 60%: scrollable content ── */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
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
