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

const CORE_REPO = "https://github.com/bitrouter/bitrouter";
const BRAND_KIT_REPO = "https://github.com/bitrouter/brand-kit";
const STATUS_URL = "https://status.bitrouter.ai";

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
  { role: "Foreground", hex: "#000000", token: "--foreground" },
  { role: "Background", hex: "#FFFFFF", token: "--background" },
];

const ATTRIBUTION_LINE = "Built with BitRouter — https://github.com/bitrouter";

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

export default function OpenPage() {
  setRequestLocale("en");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
      {/* Page header */}
      <header className="mb-20 border-b border-border pb-16">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Open startup
        </div>
        <h1 className="mt-6 inline-block border-b border-foreground pb-1 text-5xl font-medium tracking-tight">
          Open
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          BitRouter is open at the core. The router is Apache-2.0 and runs on
          your machine; the cloud is the managed version you pay for when you
          want it. We build in the open — code, roadmap, and the numbers.
        </p>
        <a
          href={CORE_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-2.5 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-90"
        >
          <Star className="size-3.5" />
          Star on GitHub
          <ArrowUpRight className="size-3.5" />
        </a>
      </header>

      {/* 01 — Why open */}
      <section className="mb-20">
        <SectionHeading label="Why open" index={1} />
        <div className="mt-8 max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Most AI infrastructure asks you to trust a black box. We took the
            opposite bet. BitRouter&apos;s core — the router that sits between
            your agents and every model — is open source, Apache-2.0, and runs
            on your machine. You can read it, fork it, and run it with your own
            keys without ever talking to us.
          </p>
          <p>
            The cloud is the managed version: the same router, hosted, with
            billing, pooled keys, and a dashboard. You pay for the operational
            load we take off your plate — never for access to the software. If
            the cloud ever stops earning that, the way out is one{" "}
            <code className="font-mono text-[13px] text-foreground">
              bitrouter serve
            </code>{" "}
            away. No lock-in is a feature we can&apos;t remove.
          </p>
          <p>
            Open-core is only half of it. We build in the open — the roadmap,
            the changelog, the provider registry, the subprocessors we rely on,
            and the numbers below. An open company should be legible from the
            outside. This page is where we keep ourselves honest.
          </p>
        </div>
      </section>

      {/* 02 — Open core, commercial cloud */}
      <section className="mb-20">
        <SectionHeading label="Open core, commercial cloud" index={2} />
        <div className="mt-8 space-y-8">
          <div className="grid gap-px border border-border bg-border md:grid-cols-2">
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
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            That&apos;s the whole deal. The open router is not a crippled demo of
            the cloud — it&apos;s the product. The cloud earns its keep by being
            the easier way to run it, not the only way.
          </p>
        </div>
      </section>

      {/* 03 — By the numbers */}
      <section className="mb-20">
        <SectionHeading label="By the numbers" index={3} />
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
            {STATS.map((s) => (
              <StatTile key={s.label} stat={s} />
            ))}
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/60">
            Placeholder figures — live wiring to GitHub, product analytics, and
            status is in progress.
          </p>
        </div>
      </section>

      {/* 04 — Open repositories */}
      <section className="mb-20">
        <SectionHeading label="Open repositories" index={4} />
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
          {REPOS.map((r) => (
            <RepoCard key={r.name} repo={r} />
          ))}
        </div>
      </section>

      {/* 05 — Built in the open */}
      <section className="mb-20">
        <SectionHeading label="Built in the open" index={5} />
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
          {IN_THE_OPEN.map((l) => (
            <ResourceLinkCard key={l.label} link={l} />
          ))}
        </div>
      </section>

      {/* 06 — Brand */}
      <section className="mb-20">
        <SectionHeading label="Brand" index={6} />
        <div className="mt-8 space-y-14">
          <Subsection
            title="Wordmark"
            description="Geist Mono, two colors, one wordmark. Download the SVG/PNG logos and the full guidelines from the kit."
          >
            <div className="border border-border bg-background">
              <div className="flex items-center justify-center p-12">
                <img
                  src="/logo.svg"
                  alt="BitRouter"
                  className="h-14 w-auto dark:invert"
                />
              </div>
              <div className="border-t border-border p-4">
                <a
                  href={BRAND_KIT_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
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
            description="Black and white by default. Accent tokens live in product, not on marketing surfaces."
          >
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {COLORS.map((c) => (
                <div key={c.hex} className="bg-background">
                  <div
                    className="h-24 border-b border-border"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <div className="font-medium">{c.role}</div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {c.token}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {c.hex}
                      </span>
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
            <div className="flex items-center justify-between gap-3 border border-border bg-background px-4 py-3">
              <code className="truncate font-mono text-[13px] text-foreground">
                {ATTRIBUTION_LINE}
              </code>
              <CopyButton value={ATTRIBUTION_LINE} />
            </div>
          </Subsection>
        </div>
      </section>

      {/* Footnote */}
      <div className="border-t border-border pt-6 font-mono text-[11px] text-muted-foreground/60">
        bitrouter/bitrouter · Apache-2.0 · self-host or use the cloud
      </div>
    </main>
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
      <h3 className="text-xl font-medium tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SmallLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  );
}

function StatTile({ stat }: { stat: Stat }) {
  return (
    <div className="bg-background p-5">
      <div className="text-3xl font-medium tabular-nums tracking-tight">
        {stat.value}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
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
    <div className="flex flex-col bg-background p-6 lg:p-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <SmallLabel>{kind}</SmallLabel>
      </div>
      <h3 className="mt-4 text-xl font-medium tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      <ul className="mt-5 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-foreground" />
            {p}
          </li>
        ))}
      </ul>
      <a
        href={cta.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-foreground transition-colors"
      >
        {cta.label}
        <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
      className="group flex flex-col bg-background p-5 transition-colors hover:bg-foreground/[0.02]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium text-foreground">
          {repo.name}
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {repo.blurb}
      </p>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
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
      className="group flex items-start gap-3 bg-background p-5 transition-colors hover:bg-foreground/[0.02]"
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {link.label}
          {link.external && (
            <ArrowUpRight className="size-3 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
