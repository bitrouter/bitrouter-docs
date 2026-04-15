import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LanguageToggleButton } from "@/components/language-toggle";

function DiscordIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M22,11V8H21V6H20V5H18V4H15V5H9V4H6V5H4V6H3V8H2v3H1v7H3v1H5v1H7V18H6V17H8v1H9v1h6V18h1V17h2v1H17v2h2V19h2V18h2V11ZM9,15H7V14H6V12H7V11H9v1h1v2H9Zm9-1H17v1H15V14H14V12h1V11h2v1h1Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <rect x="22" y="5" width="1" height="1" />
      <rect x="22" y="3" width="1" height="1" />
      <polygon points="21 5 21 6 22 6 22 7 21 7 21 12 20 12 20 14 19 14 19 16 18 16 18 17 17 17 17 18 16 18 16 19 14 19 14 20 11 20 11 21 4 21 4 20 2 20 2 19 1 19 1 18 3 18 3 19 6 19 6 18 7 18 7 17 5 17 5 16 4 16 4 15 3 15 3 14 5 14 5 13 3 13 3 12 2 12 2 10 4 10 4 9 3 9 3 8 2 8 2 4 3 4 3 5 4 5 4 6 5 6 5 7 7 7 7 8 10 8 10 9 12 9 12 5 13 5 13 4 14 4 14 3 19 3 19 4 22 4 22 5 21 5" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <polygon points="23 9 23 15 22 15 22 17 21 17 21 19 20 19 20 20 19 20 19 21 18 21 18 22 16 22 16 23 15 23 15 18 14 18 14 17 15 17 15 16 17 16 17 15 18 15 18 14 19 14 19 9 18 9 18 6 16 6 16 7 15 7 15 8 14 8 14 7 10 7 10 8 9 8 9 7 8 7 8 6 6 6 6 9 5 9 5 14 6 14 6 15 7 15 7 16 9 16 9 18 7 18 7 17 6 17 6 16 4 16 4 17 5 17 5 19 6 19 6 20 9 20 9 23 8 23 8 22 6 22 6 21 5 21 5 20 4 20 4 19 3 19 3 17 2 17 2 15 1 15 1 9 2 9 2 7 3 7 3 5 4 5 4 4 5 4 5 3 7 3 7 2 9 2 9 1 15 1 15 2 17 2 17 3 19 3 19 4 20 4 20 5 21 5 21 7 22 7 22 9 23 9" />
    </svg>
  );
}

const sharedNav: BaseLayoutProps["nav"] = {
  title: (
    <>
      <img src="/logo.svg" alt="BitRouter" className="h-8 w-8 dark:invert" />
      <span>BitRouter</span>
    </>
  ),
};

const sharedLinks: BaseLayoutProps["links"] = [
  { text: "LLMs", url: "/llms" },
  { text: "Tools", url: "/tools" },
  {
    type: "custom",
    children: (
      <a
        href="/agents"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        Agents
        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-500">
          ALPHA
        </span>
      </a>
    ),
  },
  { text: "Blog", url: "/blog" },
  { text: "Documentation", url: "/docs/overview", active: "nested-url" },
  {
    type: "custom",
    secondary: true,
    children: <LanguageToggleButton />,
  },
  {
    type: "icon",
    label: "Discord",
    text: "Discord",
    url: "https://discord.gg/G3zVrZDa5C",
    icon: <DiscordIcon />,
    external: true,
  },
  {
    type: "icon",
    label: "Twitter/X",
    text: "Twitter/X",
    url: "https://x.com/BitRouterAI",
    icon: <XIcon />,
    external: true,
  },
  {
    type: "icon",
    label: "GitHub",
    text: "GitHub",
    url: "https://github.com/bitrouter",
    icon: <GitHubIcon />,
    external: true,
  },
];

/**
 * Options for layouts with a top navbar (home, blog).
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: sharedNav,
    i18n: false,
    links: sharedLinks,
  };
}

/**
 * Options for the docs layout — no links in sidebar, navbar provided separately.
 */
export function docsOptions(): BaseLayoutProps {
  return {
    nav: sharedNav,
    i18n: false,
    links: [],
  };
}
