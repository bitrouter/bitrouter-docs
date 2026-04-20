import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Github, GitBranch } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Marquee } from "@/components/ui/marquee";
import { ThemeToggleIcon } from "./ThemeToggleIcon";

const REPO_URL = "https://github.com/bitrouter/bitrouter";
const GITHUB_API = "https://api.github.com/repos/bitrouter/bitrouter";
const DISCORD_URL = "https://discord.gg/G3zVrZDa5C";
const X_URL = "https://x.com/BitRouterAI";
const CHANGELOG_URL = "/changelog";

interface RepoStats {
  stars: number;
  forks: number;
  openIssues: number;
}

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

async function fetchRepoStats(): Promise<RepoStats | null> {
  try {
    const res = await fetch(GITHUB_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
    };
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
    };
  } catch {
    return null;
  }
}

async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(`${GITHUB_API}/contributors?per_page=30`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Contributor[];
    return data.filter(
      (c) =>
        !c.login.endsWith("[bot]") &&
        !c.html_url.includes("/apps/") &&
        !/copilot/i.test(c.login),
    );
  } catch {
    return [];
  }
}

function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

export async function CommunitySection({ counter }: { counter?: string } = {}) {
  const t = await getTranslations("Community");
  const [stats, contributors] = await Promise.all([
    fetchRepoStats(),
    fetchContributors(),
  ]);

  const displayStats = stats ?? { stars: 0, forks: 0, openIssues: 0 };
  const contributorCount = contributors.length;

  return (
    <div>
      <RuledSectionLabel label={t("sectionLabel")} counter={counter} />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {t("description")}
      </p>

      {/* Big numbers */}
      <div className="mt-5 grid grid-cols-3 gap-px border border-border bg-border">
        <StatBlock
          value={formatCount(displayStats.stars)}
          label={t("starsLabel")}
        />
        <StatBlock
          value={formatCount(displayStats.forks)}
          label={t("forksLabel")}
        />
        <StatBlock
          value={contributorCount > 0 ? `${contributorCount}+` : "—"}
          label={t("contributorsLabel")}
        />
      </div>

      {/* Contributor avatar marquee */}
      {contributors.length > 0 && (
        <div className="mt-4 border border-border bg-background/50 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <Marquee pauseOnHover repeat={2} className="[--duration:40s] [--gap:0.4rem] p-3">
            {contributors.map((c) => (
              <a
                key={c.login}
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${c.login} · ${c.contributions} commits`}
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatar_url}
                  alt={c.login}
                  width={36}
                  height={36}
                  loading="lazy"
                  className="h-9 w-9 border border-border hover:border-foreground transition-colors"
                />
              </a>
            ))}
          </Marquee>
        </div>
      )}

      {/* Primary link row */}
      <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        <LinkCard
          href={REPO_URL}
          icon={<Github className="size-4" />}
          label={t("linkGithub")}
        />
        <LinkCard
          href={DISCORD_URL}
          icon={<DiscordGlyph />}
          label={t("linkDiscord")}
        />
        <LinkCard href={X_URL} icon={<XGlyph />} label={t("linkX")} />
        <LinkCard
          href={CHANGELOG_URL}
          icon={<GitBranch className="size-4" />}
          label={t("linkChangelog")}
        />
      </div>

      {/* Bottom strip — legal nav + copyright + theme toggle */}
      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <SmallLink href="/legal/terms" label={t("legalTerms")} />
          <SmallLink href="/legal/privacy" label={t("legalPrivacy")} />
          <SmallLink href="/blog" label={t("legalBlog")} />
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggleIcon label={t("themeToggle")} />
          <span className="h-3 w-px bg-border" />
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {t("copyright")}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-background px-4 py-5 sm:px-5 sm:py-6">
      <div className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function LinkCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-2 bg-background px-4 py-3 transition-colors hover:bg-foreground/[0.04]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
          {icon}
        </span>
        <span className="text-xs font-mono text-foreground/90 truncate">
          {label}
        </span>
      </div>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
    </a>
  );
}

function SmallLink({ href, label }: { href: string; label: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </a>
  );
}

function DiscordGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M19.3 5.3A16.8 16.8 0 0 0 15 4l-.2.4a15.5 15.5 0 0 1 4 1.4 13.3 13.3 0 0 0-12 0 15.5 15.5 0 0 1 4-1.4L10.6 4A16.8 16.8 0 0 0 6.3 5.3C3.7 9.2 3 13 3.3 16.7a16.8 16.8 0 0 0 5.1 2.6l.7-1a10.8 10.8 0 0 1-2.3-1.1c.2-.1.4-.2.5-.4a12 12 0 0 0 10.3 0l.5.4a10.8 10.8 0 0 1-2.3 1.1l.7 1a16.8 16.8 0 0 0 5.1-2.6c.4-4.3-.5-8.1-2.3-11.4zM9 14.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.2 2h3.3l-7.2 8.2L23 22h-6.7l-5.2-6.8L5 22H1.7l7.7-8.8L1 2h6.8l4.7 6.2L18.2 2zm-1.2 18h1.8L7 4H5.2l11.8 16z" />
    </svg>
  );
}
