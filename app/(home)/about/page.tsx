import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { GitHubIcon, XIcon, LinkedInIcon } from "@/components/icons";
import { Mail } from "lucide-react";
import type { Metadata } from "next";

const CONTACT_EMAIL = "contact@bitrouter.ai";

const TEAM = [
  {
    name: "Kelsen Liu",
    role: "Co-founder & CEO",
    email: "kelsenliu@bitrouter.ai",
    x: "https://x.com/kelrouter",
    github: "https://github.com/SPIKESPIGEL404",
    linkedin: "https://www.linkedin.com/in/kelsen-liu-668b72258/",
  },
  {
    name: "Archer Yang",
    role: "Co-founder & CTO",
    email: "archeryang@bitrouter.ai",
    x: "https://x.com/arcrouter",
    github: "https://github.com/FrozenArcher404",
    linkedin: "https://www.linkedin.com/in/archer-yang-95602234a/",
  },
];

const VALUES = [
  {
    label: "Craft",
    body: "Type systems, benchmarks, careful typography. The details that outlive us.",
  },
  {
    label: "Openness",
    body: "The code runs in the open. So do the roadmap, the bugs, and the reasoning.",
  },
  {
    label: "Rigor",
    body: "If it can't be measured, it probably isn't done. We ship fewer things, slower, better.",
  },
];

function SectionHeading({ label, index }: { label: string; index: number }) {
  return (
    <header className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
      <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">{label}</h2>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {String(index).padStart(2, "0")}
      </span>
    </header>
  );
}

function TeamCard({ member }: { member: (typeof TEAM)[number] }) {
  return (
    <div className="bg-background p-6 lg:p-8">
      <div className="text-base font-medium">{member.name}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {member.role}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <a
          href={member.x}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X / Twitter"
          className="text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <XIcon className="size-4" />
        </a>
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <GitHubIcon className="size-4" />
        </a>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <LinkedInIcon className="size-4" />
        </a>
        <a
          href={`mailto:${member.email}`}
          aria-label="Email"
          className="text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <Mail className="size-4" />
        </a>
      </div>
    </div>
  );
}

export default function AboutPage() {
  setRequestLocale("en");

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        {/* Page header */}
        <header className="mb-20 border-b border-border pb-16">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Who we are
          </div>
          <h1 className="mt-6 inline-block border-b border-foreground pb-1 text-5xl font-medium tracking-tight">
            About
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            We're building the routing layer for the AI era — open, model-agnostic, and grounded
            in the belief that intelligence should be accessible to everyone, not rationed by
            whoever runs the largest data center.
          </p>
        </header>

        {/* The team */}
        <section className="mb-20">
          <SectionHeading label="The team" index={1} />
          <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
            {TEAM.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </section>

        {/* Our story */}
        <section className="mb-20">
          <SectionHeading label="Our story" index={2} />
          <div className="mt-8 max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              We met at twenty, both convinced that AI was about to become infrastructure in the
              same way electricity did — not just a product, but the substrate everything else runs
              on. The question that wouldn't leave us alone: who owns the pipes?
            </p>
            <p>
              We started building at the intersection of AI and blockchain because we believe the
              answer has to be decentralized. AI is the commodification of intelligence, and like
              every commodification in history, how it gets routed and distributed will determine
              whether it belongs to everyone or just a few.
            </p>
            <p>
              BitRouter is our answer. We build it in the open — the code, the roadmap, the
              reasoning. We're committed to that. And if you believe in the same future, we'd
              genuinely like to hear from you.
            </p>
          </div>
        </section>

        {/* How we work */}
        <section className="mb-20">
          <SectionHeading label="How we work" index={3} />
          <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <div key={v.label} className="bg-background p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 text-sm font-medium">{v.label}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Say hi */}
        <section>
          <SectionHeading label="Say hi" index={4} />
          <div className="mt-8 space-y-6">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              We're not hiring today. But we're always interested in people who are thinking about
              the same problems — the infrastructure, the sovereignty, the long game. If something
              here resonates, reach out. Just a note. No résumé, no deck.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group inline-flex items-center gap-2.5 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-90"
            >
              Email us
              <span className="font-mono text-[11px] normal-case tracking-normal opacity-80">
                {CONTACT_EMAIL}
              </span>
            </a>
            <div className="font-mono text-[11px] text-muted-foreground/60">
              We read every message. Most get a reply.
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const metadata: Metadata = {
  title: "About — BitRouter",
  description:
    "We're Kelsen and Archer. We built BitRouter to keep the routing layer for AI open, decentralized, and accessible to everyone.",
  alternates: { canonical: "https://bitrouter.ai/about" },
};
