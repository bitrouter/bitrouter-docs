import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LanguageToggleButton } from "@/components/language-toggle";

const sharedNav: BaseLayoutProps["nav"] = {
  title: (
    <>
      <img src="/logo.svg" alt="BitRouter" className="h-8 w-8 dark:invert" />
      <span>BitRouter</span>
    </>
  ),
};

const sharedLinks: BaseLayoutProps["links"] = [
  { text: "Documentation", url: "/docs/overview", active: "nested-url" },
  { text: "Benchmark", url: "/benchmark" },
  { text: "APIs", url: "/apis" },
  { text: "Blog", url: "/blog" },
  { text: "Discord", url: "https://discord.gg/G3zVrZDa5C", external: true },
  { text: "Twitter/X", url: "https://x.com/BitRouterAI", external: true },
  {
    type: "custom",
    secondary: true,
    children: <LanguageToggleButton />,
  },
];

/**
 * Options for layouts with a top navbar (home, blog).
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: sharedNav,
    i18n: false,
    githubUrl: "https://github.com/bitrouter",
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
    githubUrl: "https://github.com/bitrouter",
    links: [],
  };
}
