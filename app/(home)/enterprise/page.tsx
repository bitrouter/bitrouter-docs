import { setRequestLocale } from "next-intl/server";
import { EnterpriseContactForm } from "@/components/enterprise/enterprise-contact-form";
import { EnterpriseFaq, type FaqItem } from "@/components/enterprise/enterprise-faq";
import type { Metadata } from "next";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is BitRouter Enterprise?",
    answer:
      "Everything in the open-source proxy, plus the operational layer that makes it ship in regulated stacks: dedicated infrastructure, in-region routing, SSO and RBAC, custom SLAs, and direct support from the engineering team.",
  },
  {
    question: "How do I get started?",
    answer:
      "Send us a note below or book a 30-minute call. We start with a free workload audit, run a sandboxed pilot on real traffic, then handle SSO, routing policy, and billing before cutting over to production — typically within two weeks.",
  },
  {
    question: "Is the audit really free?",
    answer:
      "Yes. We run a scoped discovery on a sample of your real agent traffic, show you where spend and reliability are leaking, and hand you the findings — with no commitment to continue.",
  },
  {
    question: "How does pricing work?",
    answer:
      "The full stack is Apache-2.0 and free to self-host. Enterprise is priced on managed operations, volume, and support — usually a flat platform fee plus usage. Tell us your traffic profile and we'll put a number in front of you.",
  },
  {
    question: "Can I self-host or run in my own VPC?",
    answer:
      "Yes. Run the entire stack on your own infra, including air-gapped deployments, or use a hybrid setup where the control plane is hosted and the data plane stays in your VPC so prompts never leave your network.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Prompts and completions are not stored — logs are metadata-only and configurable per project. We support in-region routing across US, EU, and APAC, SSO via SAML and OIDC, and audit logs streamed to your SIEM. A DPA is available on request.",
  },
];

const SERVICES: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Free workload audit",
    body:
      "We start with a free audit of your agent workloads — we trace your real traffic, find where you're paying frontier prices for routine calls, and map the reliability and guardrail gaps. You walk away with a concrete savings-and-risk report, whether or not you move forward.",
  },
  {
    n: "02",
    title: "Forward-deployed engineering",
    body:
      "Our engineers embed with your team to ship it: routing policy, open-model substitution, guardrails, SSO, and migration — hands-on through cutover. A working integration, not a slide deck and a support ticket.",
  },
];

export default function EnterprisePage() {
  setRequestLocale("en");

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-6 sm:py-24">
      {/* ── Hero ── */}
      <section>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Enterprise
        </span>
        <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">
          BitRouter for your team
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
          Interested in bringing BitRouter to your organization? Every engagement
          starts with a free workload audit and hands-on engineers who stay until
          it ships in production.
        </p>
      </section>

      {/* ── How we help ── */}
      <section className="mt-16">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          How we help
        </span>
        <div className="mt-8 space-y-10">
          {SERVICES.map((s) => (
            <div key={s.n} className="border-t border-foreground/10 pt-6">
              <span className="font-mono text-xs text-muted-foreground">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-medium tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact form ── */}
      <section className="mt-16">
        <EnterpriseContactForm />
      </section>

      {/* ── FAQ ── */}
      <section className="mt-24">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          FAQ
        </span>
        <h2 className="mt-5 text-2xl font-medium tracking-tight sm:text-3xl">
          Common questions
        </h2>
        <div className="mt-8">
          <EnterpriseFaq items={FAQ_ITEMS} />
        </div>
      </section>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Enterprise — BitRouter",
    description:
      "Free workload audit and forward-deployed engineers, plus dedicated infrastructure, in-region routing, SSO, RBAC, and custom SLAs for teams running BitRouter at scale.",
    alternates: { canonical: "https://bitrouter.ai/enterprise" },
  };
}
