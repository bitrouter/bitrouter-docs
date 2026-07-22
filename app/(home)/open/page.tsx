import { setRequestLocale } from "next-intl/server";
import {
  Star,
  ArrowUpRight,
  Download,
  Terminal,
  Cloud,
  GitBranch,
  Activity,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/landing/copy-button";
import type { Metadata } from "next";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

const CORE_REPO = "https://github.com/bitrouter/bitrouter";
const BRAND_KIT_REPO = "https://github.com/bitrouter/brand-kit";
const STATUS_URL = "https://status.bitrouter.ai";

const RULE = "1px solid var(--z-rule)";
const MONO = "var(--font-mono)";

// ─────────────────────────────────────────────────────────────
// NOTE: The figures below are PLACEHOLDERS for design review.
// Wiring, per the plan: stars/forks/contributors → GitHub API,
// requests/models → product analytics + models catalog, uptime →
// OpenStatus. Swap `value` for the live source when we go live.
// ─────────────────────────────────────────────────────────────
type Stat = { value: string; label: string; source: string };

const STATS: Stat[] = [
  { value: "203", label: "GitHub stars", source: "GitHub" },
  { value: "9", label: "Contributors", source: "GitHub" },
  { value: "50+", label: "Models routable", source: "Catalog" },
  { value: "30+", label: "Providers integrated", source: "Registry" },
  { value: "12.4M", label: "Requests routed", source: "Analytics" },
  { value: "99.95%", label: "Uptime · 90d", source: "OpenStatus" },
];

type Repo = {
  name: string;
  blurb: string;
  meta: string;
  href: string;
};

const REPOS: Repo[] = [
  {
    name: "bitrouter",
    blurb: "The agentic LLM gateway & router. The core, in the open.",
    meta: "Rust · Apache-2.0 · ★ 203",
    href: CORE_REPO,
  },
  {
    name: "bitrouter-docs",
    blurb: "This website, the docs, and the API reference.",
    meta: "TypeScript · MIT",
    href: "https://github.com/bitrouter/bitrouter-docs",
  },
  {
    name: "provider-registry",
    blurb: "Every model and provider we route to, as data.",
    meta: "YAML · open data",
    href: "https://github.com/bitrouter/provider-registry",
  },
  {
    name: "bitrouter-openclaw",
    blurb: "First-party plugin for the OpenClaw agent.",
    meta: "TypeScript",
    href: "https://github.com/bitrouter/bitrouter-openclaw",
  },
  {
    name: "hermes-bitrouter-plugin",
    blurb: "Provider plugin for the Hermes agent framework.",
    meta: "Python",
    href: "https://github.com/bitrouter/hermes-bitrouter-plugin",
  },
  {
    name: "elizaos-plugin-bitrouter",
    blurb: "LLM provider plugin for elizaOS.",
    meta: "TypeScript",
    href: "https://github.com/bitrouter/elizaos-plugin-bitrouter",
  },
];

type ResourceLink = {
  icon: typeof GitBranch;
  label: string;
  blurb: string;
  href: string;
  external?: boolean;
};

const IN_THE_OPEN: ResourceLink[] = [
  {
    icon: ScrollText,
    label: "Changelog",
    blurb: "Every release, shipped in public.",
    href: "/changelog",
  },
  {
    icon: ShieldCheck,
    label: "Subprocessors",
    blurb: "The third parties that touch your data.",
    href: "/subprocessors",
  },
  {
    icon: Activity,
    label: "Status",
    blurb: "Live uptime and incident history.",
    href: STATUS_URL,
    external: true,
  },
  {
    icon: GitBranch,
    label: "Source",
    blurb: "Read the router. Fork it. Send a PR.",
    href: CORE_REPO,
    external: true,
  },
];

const COLORS = [
  { role: "Ink", hex: "#0C0D10", token: "--z-bg" },
  { role: "Signal blue", hex: "#6B9BFF", token: "--z-blue" },
];

const ATTRIBUTION_LINE = "Built with BitRouter — https://github.com/bitrouter";

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

export default function OpenPage() {
  setRequestLocale("en");

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <main className="zed-wrap" style={{ maxWidth: 1040, padding: "72px 34px 96px" }}>
          {/* Page header */}
          <header style={{ marginBottom: 72, borderBottom: RULE, paddingBottom: 56 }}>
            <Kicker>// open startup</Kicker>
            <h1
              className="zed-display"
              style={{
                fontSize: "clamp(40px, 6vw, 60px)",
                lineHeight: 1.0,
                margin: "16px 0 0",
              }}
            >
              Open <span style={{ color: "var(--z-blue)" }}>at the core.</span>
            </h1>
            <p
              style={{
                marginTop: 22,
                maxWidth: "62ch",
                fontFamily: MONO,
                fontSize: 15,
                lineHeight: 1.7,
                color: "var(--z-ink-4)",
              }}
            >
              BitRouter is open at the core. The router is Apache-2.0 and runs on
              your machine; the cloud is the managed version you pay for when you
              want it. We build in the open — code, roadmap, and the numbers.
            </p>
            <a
              href={CORE_REPO}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 28,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 20px",
                borderRadius: 8,
                background: "var(--z-cta)",
                color: "#fff",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Star className="size-3.5" />
              Star on GitHub
              <ArrowUpRight className="size-3.5" />
            </a>
          </header>

          {/* 01 — Why open */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="Why open" index={1} />
            <div
              style={{
                marginTop: 32,
                maxWidth: "66ch",
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
                Most AI infrastructure asks you to trust a black box. We took the
                opposite bet. BitRouter&apos;s core — the router that sits between
                your agents and every model — is open source, Apache-2.0, and runs
                on your machine. You can read it, fork it, and run it with your own
                keys without ever talking to us.
              </p>
              <p style={{ margin: 0 }}>
                The cloud is the managed version: the same router, hosted, with
                billing, pooled keys, and a dashboard. You pay for the operational
                load we take off your plate — never for access to the software. If
                the cloud ever stops earning that, the way out is one{" "}
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "var(--z-code)",
                    background: "#1a1e24",
                    border: "1px solid var(--z-rule-code)",
                    borderRadius: 5,
                    padding: "1px 6px",
                  }}
                >
                  bitrouter serve
                </code>{" "}
                away. No lock-in is a feature we can&apos;t remove.
              </p>
              <p style={{ margin: 0 }}>
                Open-core is only half of it. We build in the open — the roadmap,
                the changelog, the provider registry, the subprocessors we rely on,
                and the numbers below. An open company should be legible from the
                outside. This page is where we keep ourselves honest.
              </p>
            </div>
          </section>

          {/* 02 — Open core, commercial cloud */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="Open core, commercial cloud" index={2} />
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 1,
                  background: "var(--z-rule)",
                  border: RULE,
                }}
              >
                <ModelCard
                  icon={Terminal}
                  kind="Open source"
                  title="The router"
                  body="Runs locally as a proxy behind a single env var. Bring your own keys. Self-host forever, free."
                  points={[
                    "Apache-2.0 — permissive, no strings",
                    "Install via Homebrew, npm, or Cargo",
                    "Any model, any harness, any loop",
                  ]}
                  cta={{ label: "Read the code", href: CORE_REPO }}
                />
                <ModelCard
                  icon={Cloud}
                  kind="Commercial"
                  title="The cloud"
                  body="The same router, hosted at api.bitrouter.ai — so you don't run or scale anything."
                  points={[
                    "Pooled keys, billing, usage dashboard",
                    "Higher limits, BYOK, and support",
                    "OAuth or API key to get started",
                  ]}
                  cta={{ label: "See pricing", href: "/pricing", external: false }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  maxWidth: "64ch",
                  fontFamily: MONO,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--z-ink-4)",
                }}
              >
                That&apos;s the whole deal. The open router is not a crippled demo of
                the cloud — it&apos;s the product. The cloud earns its keep by being
                the easier way to run it, not the only way.
              </p>
            </div>
          </section>

          {/* 03 — By the numbers */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="By the numbers" index={3} />
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 1,
                  background: "var(--z-rule)",
                  border: RULE,
                }}
              >
                {STATS.map((s) => (
                  <StatTile key={s.label} stat={s} />
                ))}
              </div>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, color: "var(--z-ink-7)" }}>
                Placeholder figures — live wiring to GitHub, product analytics, and
                status is in progress.
              </p>
            </div>
          </section>

          {/* 04 — Open repositories */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="Open repositories" index={4} />
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 1,
                background: "var(--z-rule)",
                border: RULE,
              }}
            >
              {REPOS.map((r) => (
                <RepoCard key={r.name} repo={r} />
              ))}
            </div>
          </section>

          {/* 05 — Built in the open */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="Built in the open" index={5} />
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 1,
                background: "var(--z-rule)",
                border: RULE,
              }}
            >
              {IN_THE_OPEN.map((l) => (
                <ResourceLinkCard key={l.label} link={l} />
              ))}
            </div>
          </section>

          {/* 06 — Brand */}
          <section style={{ marginBottom: 72 }}>
            <SectionHeading label="Brand" index={6} />
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 56 }}>
              <Subsection
                title="Mark"
                description="One routing mark, one wordmark. Download the SVG/PNG logos and the full guidelines from the kit."
              >
                <div style={{ border: RULE, borderRadius: 11, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "52px 24px",
                      background: "var(--z-inset)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/bitrouter-mark.png"
                      alt="BitRouter"
                      style={{ height: 56, width: "auto" }}
                    />
                  </div>
                  <div style={{ borderTop: RULE, padding: "14px 18px" }}>
                    <a
                      href={BRAND_KIT_REPO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zed-open-link"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--z-ink-5)",
                      }}
                    >
                      <Download className="size-3" />
                      Download brand kit
                      <ArrowUpRight className="size-3" />
                    </a>
                  </div>
                </div>
              </Subsection>

              <Subsection
                title="Color"
                description="Ink and a single signal blue. The mark stays monochrome; blue is the one accent."
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 1,
                    background: "var(--z-rule)",
                    border: RULE,
                  }}
                >
                  {COLORS.map((c) => (
                    <div key={c.hex} style={{ background: "var(--z-bg)" }}>
                      <div style={{ height: 96, borderBottom: RULE, backgroundColor: c.hex }} />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "14px 16px",
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--z-ink)" }}>
                            {c.role}
                          </div>
                          <div style={{ marginTop: 2, fontFamily: MONO, fontSize: 12, color: "var(--z-ink-5)" }}>
                            {c.token}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--z-ink-5)" }}>{c.hex}</span>
                          <CopyButton value={c.hex} label="Copy hex" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Subsection>

              <Subsection
                title="Attribution"
                description="Using BitRouter in third-party materials? Include this line."
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    border: RULE,
                    borderRadius: 8,
                    background: "var(--z-inset)",
                    padding: "12px 16px",
                  }}
                >
                  <code
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: MONO,
                      fontSize: 13,
                      color: "var(--z-ink-2)",
                    }}
                  >
                    {ATTRIBUTION_LINE}
                  </code>
                  <CopyButton value={ATTRIBUTION_LINE} />
                </div>
              </Subsection>
            </div>
          </section>

          {/* Footnote */}
          <div
            style={{
              borderTop: RULE,
              paddingTop: 24,
              fontFamily: MONO,
              fontSize: 11.5,
              color: "var(--z-ink-7)",
            }}
          >
            bitrouter/bitrouter · Apache-2.0 · self-host or use the cloud
          </div>
        </main>
      </section>

      <style>{`
        .zed-open-hover{transition:background .15s ease}
        .zed-open-hover:hover{background:#101216}
        .zed-open-link{transition:color .15s ease}
        .zed-open-link:hover{color:var(--z-ink)}
      `}</style>
    </div>
  );
}

// ── Local presentational pieces ──────────────────────────────

function Subsection({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 19, fontWeight: 600, color: "var(--z-ink)", margin: 0 }}>
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: "8px 0 0",
            maxWidth: "64ch",
            fontFamily: MONO,
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "var(--z-ink-4)",
          }}
        >
          {description}
        </p>
      )}
      <div style={{ marginTop: 24 }}>{children}</div>
    </div>
  );
}

function SmallLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--z-ink-6)",
      }}
    >
      {children}
    </div>
  );
}

function StatTile({ stat }: { stat: Stat }) {
  return (
    <div style={{ background: "var(--z-bg)", padding: "22px 22px" }}>
      <div
        className="zed-display"
        style={{ fontSize: 32, fontStyle: "italic", lineHeight: 1, color: "var(--z-ink)" }}
      >
        {stat.value}
      </div>
      <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 13, color: "var(--z-ink-4)" }}>
        {stat.label}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--z-ink-7)",
        }}
      >
        {stat.source}
      </div>
    </div>
  );
}

function ModelCard({
  icon: Icon,
  kind,
  title,
  body,
  points,
  cta,
}: {
  icon: typeof Terminal;
  kind: string;
  title: string;
  body: string;
  points: string[];
  cta: { label: string; href: string; external?: boolean };
}) {
  const external = cta.external ?? true;
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "var(--z-bg)", padding: "26px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--z-ink-5)" }}>
        <Icon className="size-4" />
        <SmallLabel>{kind}</SmallLabel>
      </div>
      <h3 style={{ marginTop: 16, fontFamily: "var(--font-sans)", fontSize: 19, fontWeight: 600, color: "var(--z-ink)" }}>
        {title}
      </h3>
      <p style={{ margin: "8px 0 0", fontFamily: MONO, fontSize: 13.5, lineHeight: 1.65, color: "var(--z-ink-4)" }}>
        {body}
      </p>
      <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {points.map((p) => (
          <li key={p} style={{ display: "flex", gap: 9, fontFamily: MONO, fontSize: 13, color: "var(--z-ink-4)" }}>
            <span style={{ color: "var(--z-blue)" }}>▸</span>
            {p}
          </li>
        ))}
      </ul>
      <a
        href={cta.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="zed-open-link"
        style={{
          marginTop: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--z-ink-2)",
        }}
      >
        {cta.label}
        <ArrowUpRight className="size-3" />
      </a>
    </div>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.href}
      target="_blank"
      rel="noopener noreferrer"
      className="zed-open-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--z-bg)",
        padding: "20px 22px",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, color: "var(--z-ink)" }}>
          {repo.name}
        </span>
        <ArrowUpRight className="size-3.5" style={{ color: "var(--z-ink-6)" }} />
      </div>
      <p style={{ margin: "10px 0 0", flex: 1, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: "var(--z-ink-4)" }}>
        {repo.blurb}
      </p>
      <div
        style={{
          marginTop: 16,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--z-ink-7)",
        }}
      >
        {repo.meta}
      </div>
    </a>
  );
}

function ResourceLinkCard({ link }: { link: ResourceLink }) {
  const Icon = link.icon;
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      className="zed-open-hover"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "var(--z-bg)",
        padding: "20px 22px",
        textDecoration: "none",
      }}
    >
      <Icon className="size-4" style={{ marginTop: 2, flex: "0 0 auto", color: "var(--z-ink-5)" }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--z-ink)" }}>
          {link.label}
          {link.external && <ArrowUpRight className="size-3" style={{ color: "var(--z-ink-6)" }} />}
        </div>
        <p style={{ margin: "5px 0 0", fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: "var(--z-ink-4)" }}>
          {link.blurb}
        </p>
      </div>
    </a>
  );
}

export const metadata: Metadata = {
  title: "Open — BitRouter",
  description:
    "BitRouter is a commercial open-source company: an Apache-2.0 router you can self-host, a managed cloud on top, and a company built in the open — code, roadmap, and metrics.",
  alternates: { canonical: "https://bitrouter.ai/open" },
};
