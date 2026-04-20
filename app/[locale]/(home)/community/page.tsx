import {
  ArrowUpRight,
  GitBranch,
  GitPullRequest,
  MessageSquare,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import {
  DiscordIcon,
  GitHubIcon,
  RedditIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons";
import { PageShell, SmallLabel } from "@/components/page-shell";
import { Marquee } from "@/components/ui/marquee";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

const REPO_OWNER = "bitrouter";
const REPO_NAME = "bitrouter";
const REPO_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const DISCORD_URL = "https://discord.gg/G3zVrZDa5C";
const X_URL = "https://x.com/BitRouterAI";

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

async function fetchRepoStats() {
  try {
    const res = await fetch(REPO_API, {
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
    const res = await fetch(`${REPO_API}/contributors?per_page=40`, {
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
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

const copy = {
  en: {
    overline: "COMMUNITY",
    title: "Community",
    intro:
      "BitRouter is shaped as much by its community as by its maintainers. Every room is open, every patch is welcome, and the roadmap is public.",
    sections: {
      channels: "Channels",
      contribute: "Contribute",
      people: "People",
    },
    joinDiscord: "Join Discord",
    channelsIntro: "Five places the community actually shows up.",
    contributeIntro:
      "Issues, pull requests, and the brand kit — no change too small.",
    peopleIntro: "Public stats and everyone who has pushed a commit.",
    starsLabel: "Stars",
    forksLabel: "Forks",
    contributorsLabel: "Contributors",
    openIssuesLabel: "Open issues",
    channels: {
      github: { name: "GitHub", purpose: "Source, issues, discussions." },
      discord: { name: "Discord", purpose: "Real-time Q&A, routing ideas, casual hangout." },
      reddit: { name: "Reddit", purpose: "Long-form posts, comparisons, release recaps." },
      telegram: { name: "Telegram", purpose: "Fast updates and links. Low-noise room." },
      x: { name: "Twitter / X", purpose: "Announcements, screenshots, threads." },
    },
    contribute: {
      issues: {
        title: "Open an issue",
        purpose: "Reproducible bugs, rough edges, unexpected routing.",
      },
      prs: {
        title: "Send a pull request",
        purpose: "Router rules, adapters, docs — read CONTRIBUTING.md first.",
      },
      brandKit: {
        title: "Fork the brand kit",
        purpose: "Wordmarks, colors, and assets — reuse them freely.",
      },
    },
    emptyContributors: "Contributor list will appear once fetched from GitHub.",
    footnote: "Repo activity syncs hourly from the GitHub API.",
  },
  zh: {
    overline: "社区",
    title: "社区",
    intro:
      "BitRouter 既由维护者塑造，也由社区塑造。每一个房间都开放，每一个补丁都欢迎，路线图也是公开的。",
    sections: {
      channels: "频道",
      contribute: "贡献",
      people: "成员",
    },
    joinDiscord: "加入 Discord",
    channelsIntro: "五个社区真正聚集的地方。",
    contributeIntro:
      "Issue、Pull Request、品牌资源——多小的改动都欢迎。",
    peopleIntro: "公开的统计数据，以及所有提交过 Commit 的人。",
    starsLabel: "Stars",
    forksLabel: "Forks",
    contributorsLabel: "贡献者",
    openIssuesLabel: "开放 Issue",
    channels: {
      github: { name: "GitHub", purpose: "源码、Issue 与讨论。" },
      discord: { name: "Discord", purpose: "实时问答、路由创意、轻松聊天。" },
      reddit: { name: "Reddit", purpose: "长文、对比、版本回顾。" },
      telegram: { name: "Telegram", purpose: "快速更新与链接，低噪音群组。" },
      x: { name: "Twitter / X", purpose: "公告、截图与推文串。" },
    },
    contribute: {
      issues: {
        title: "提交 Issue",
        purpose: "可复现的缺陷、粗糙边角、意外路由。",
      },
      prs: {
        title: "发起 Pull Request",
        purpose: "路由规则、适配器、文档——请先阅读 CONTRIBUTING.md。",
      },
      brandKit: {
        title: "Fork 品牌资源",
        purpose: "Wordmark、颜色与素材，可自由使用。",
      },
    },
    emptyContributors: "正在从 GitHub 获取贡献者名单。",
    footnote: "仓库数据每小时从 GitHub API 同步。",
  },
} as const;

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = copy[(locale === "zh" ? "zh" : "en") as "en" | "zh"];

  const [stats, contributors] = await Promise.all([
    fetchRepoStats(),
    fetchContributors(),
  ]);
  const display = stats ?? { stars: 0, forks: 0, openIssues: 0 };

  const channels = [
    {
      ...t.channels.github,
      icon: GitHubIcon,
      href: `https://github.com/${REPO_OWNER}`,
      stat: stats ? `${formatCount(display.stars)} ★` : "github.com/bitrouter",
    },
    {
      ...t.channels.discord,
      icon: DiscordIcon,
      href: DISCORD_URL,
      stat: "discord.gg/bitrouter",
    },
    {
      ...t.channels.reddit,
      icon: RedditIcon,
      href: "https://www.reddit.com/r/bitrouter/",
      stat: "r/bitrouter",
    },
    {
      ...t.channels.telegram,
      icon: TelegramIcon,
      href: "https://t.me/bitrouterai",
      stat: "t.me/bitrouterai",
    },
    {
      ...t.channels.x,
      icon: XIcon,
      href: X_URL,
      stat: "@BitRouterAI",
    },
  ];

  const contributeRows = [
    {
      icon: MessageSquare,
      ...t.contribute.issues,
      href: `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`,
    },
    {
      icon: GitPullRequest,
      ...t.contribute.prs,
      href: `https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls`,
    },
    {
      icon: GitBranch,
      ...t.contribute.brandKit,
      href: "https://github.com/bitrouter/brand-kit",
    },
  ];

  const sections = [
    {
      id: "channels",
      label: t.sections.channels,
      children: (
        <div className="space-y-6">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t.channelsIntro}
          </p>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-2">
            {channels.map((ch) => {
              const Icon = ch.icon;
              return (
                <a
                  key={ch.name}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between gap-5 bg-background p-5 transition-colors hover:bg-foreground/[0.03]"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="size-5 text-foreground/70 transition-colors group-hover:text-foreground" />
                    <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{ch.name}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {ch.purpose}
                    </p>
                    <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      {ch.stat}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "contribute",
      label: t.sections.contribute,
      children: (
        <div className="space-y-6">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t.contributeIntro}
          </p>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
            {contributeRows.map((row) => {
              const Icon = row.icon;
              return (
                <a
                  key={row.title}
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 bg-background p-5 transition-colors hover:bg-foreground/[0.03]"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="size-4 text-foreground/70" />
                    <ArrowUpRight className="size-3.5 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{row.title}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {row.purpose}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "people",
      label: t.sections.people,
      children: (
        <div className="space-y-10">
          <div className="space-y-6">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t.peopleIntro}
            </p>
            <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
              <StatBlock value={formatCount(display.stars)} label={t.starsLabel} />
              <StatBlock value={formatCount(display.forks)} label={t.forksLabel} />
              <StatBlock
                value={contributors.length > 0 ? `${contributors.length}+` : "—"}
                label={t.contributorsLabel}
              />
              <StatBlock
                value={formatCount(display.openIssues)}
                label={t.openIssuesLabel}
              />
            </div>
          </div>

          <div>
            {contributors.length > 0 ? (
              <div className="border border-border bg-background/40 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
                <Marquee
                  pauseOnHover
                  repeat={2}
                  className="[--duration:45s] [--gap:0.5rem] p-4"
                >
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
                        width={40}
                        height={40}
                        loading="lazy"
                        className="h-10 w-10 border border-border transition-colors hover:border-foreground"
                      />
                    </a>
                  ))}
                </Marquee>
              </div>
            ) : (
              <p className="border border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
                {t.emptyContributors}
              </p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        overline={t.overline}
        title={t.title}
        intro={<p>{t.intro}</p>}
        sections={sections}
        cta={{
          label: t.joinDiscord,
          href: DISCORD_URL,
          external: true,
        }}
        footnote={t.footnote}
      />
      <SiteFooter />
    </>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-background p-4 sm:p-5">
      <div className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
        {value}
      </div>
      <div className="mt-1">
        <SmallLabel>{label}</SmallLabel>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: `${isZh ? "社区" : "Community"} — BitRouter`,
    description: isZh
      ? "BitRouter 的所有社区入口：GitHub、Discord、Reddit、Telegram、X。"
      : "Every place the BitRouter community shows up: GitHub, Discord, Reddit, Telegram, X.",
  };
}
