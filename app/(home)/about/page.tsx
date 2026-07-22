import { setRequestLocale } from "next-intl/server";
import { GitHubIcon, XIcon, LinkedInIcon } from "@/components/icons";
import { Mail } from "lucide-react";
import type { Metadata } from "next";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

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

const RULE = "1px solid var(--z-rule)";
const MONO = "var(--font-mono)";

function SectionHeading({ label, index }: { label: string; index: number }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        borderBottom: RULE,
        paddingBottom: 14,
      }}
    >
      <h2
        className="zed-display"
        style={{ fontSize: "clamp(23px, 3.2vw, 30px)", lineHeight: 1.1, margin: 0 }}
      >
        {label}
      </h2>
      <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--z-ink-6)" }}>
        {String(index).padStart(2, "0")}
      </span>
    </header>
  );
}

function TeamCard({ member }: { member: (typeof TEAM)[number] }) {
  const links = [
    { href: member.x, label: "X / Twitter", Icon: XIcon },
    { href: member.github, label: "GitHub", Icon: GitHubIcon },
    { href: member.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: `mailto:${member.email}`, label: "Email", Icon: Mail },
  ];
  return (
    <div style={{ background: "var(--z-bg)", padding: "26px 28px" }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontWeight: 600,
          color: "var(--z-ink)",
        }}
      >
        {member.name}
      </div>
      <div
        style={{
          marginTop: 5,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--z-ink-6)",
        }}
      >
        {member.role}
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
        {links.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={label}
            className="zed-about-social"
          >
            <Icon className="size-4" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  setRequestLocale("en");

  return (
    <div className="zed-bg">
      <style>{`.zed-about-social{color:var(--z-ink-6);transition:color .15s ease}.zed-about-social:hover{color:var(--z-ink)}`}</style>
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <main className="zed-wrap" style={{ maxWidth: 960, padding: "72px 34px 96px" }}>
          {/* Page header */}
          <header style={{ marginBottom: 72, borderBottom: RULE, paddingBottom: 56 }}>
            <Kicker>// who we are</Kicker>
            <h1
              className="zed-display"
              style={{
                fontSize: "clamp(40px, 6vw, 60px)",
                lineHeight: 1.0,
                margin: "16px 0 0",
              }}
            >
              About
            </h1>
            <p
              style={{
                marginTop: 22,
                maxWidth: "60ch",
                fontFamily: MONO,
                fontSize: 15,
                lineHeight: 1.7,
                color: "var(--z-ink-4)",
              }}
            >
              We&apos;re building the routing layer for the AI era — open,
              model-agnostic, and grounded in the belief that intelligence should
              be accessible to everyone, not rationed by whoever runs the largest
              data center.
            </p>
          </header>

          {/* The team */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="The team" index={1} />
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 1,
                background: "var(--z-rule)",
                border: RULE,
              }}
            >
              {TEAM.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </section>

          {/* Our story */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="Our story" index={2} />
            <div
              style={{
                marginTop: 32,
                maxWidth: "64ch",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                fontFamily: MONO,
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--z-ink-4)",
              }}
            >
              <p style={{ margin: 0 }}>
                We met at twenty, both convinced that AI was about to become
                infrastructure in the same way electricity did — not just a
                product, but the substrate everything else runs on. The question
                that wouldn&apos;t leave us alone: who owns the pipes?
              </p>
              <p style={{ margin: 0 }}>
                We started building at the intersection of AI and blockchain
                because we believe the answer has to be decentralized. AI is the
                commodification of intelligence, and like every commodification in
                history, how it gets routed and distributed will determine whether
                it belongs to everyone or just a few.
              </p>
              <p style={{ margin: 0 }}>
                BitRouter is our answer. We build it in the open — the code, the
                roadmap, the reasoning. We&apos;re committed to that. And if you
                believe in the same future, we&apos;d genuinely like to hear from
                you.
              </p>
            </div>
          </section>

          {/* How we work */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="How we work" index={3} />
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 1,
                background: "var(--z-rule)",
                border: RULE,
              }}
            >
              {VALUES.map((v, i) => (
                <div key={v.label} style={{ background: "var(--z-bg)", padding: "22px 24px" }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--z-blue)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--z-ink)",
                    }}
                  >
                    {v.label}
                  </div>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontFamily: MONO,
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: "var(--z-ink-4)",
                    }}
                  >
                    {v.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Say hi */}
          <section>
            <SectionHeading label="Say hi" index={4} />
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
              <p
                style={{
                  margin: 0,
                  maxWidth: "62ch",
                  fontFamily: MONO,
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: "var(--z-ink-4)",
                }}
              >
                We&apos;re not hiring today. But we&apos;re always interested in
                people who are thinking about the same problems — the
                infrastructure, the sovereignty, the long game. If something here
                resonates, reach out. Just a note. No résumé, no deck.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 20px",
                  borderRadius: 8,
                  background: "var(--z-cta)",
                  color: "#fff",
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Email us
                <span style={{ opacity: 0.8, fontWeight: 400 }}>{CONTACT_EMAIL}</span>
              </a>
              <div style={{ fontFamily: MONO, fontSize: 11.5, color: "var(--z-ink-7)" }}>
                We read every message. Most get a reply.
              </div>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}

export const metadata: Metadata = {
  title: "About — BitRouter",
  description:
    "We're Kelsen and Archer. We built BitRouter to keep the routing layer for AI open, decentralized, and accessible to everyone.",
  alternates: { canonical: "https://bitrouter.ai/about" },
};
