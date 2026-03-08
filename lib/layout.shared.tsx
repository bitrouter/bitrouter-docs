import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img
            src="/logo.svg"
            alt="BitRouter"
            className="h-8 w-8 dark:invert"
          />
          <span>BitRouter</span>
        </>
      ),
    },
    i18n: true,
    links: [
      { text: "Documentation", url: "/docs/overview", active: "nested-url" },
      { text: "Blog", url: "/blog" },
      { text: "GitHub", url: "https://github.com/bitrouter", external: true },
      { text: "Discord", url: "https://discord.gg/G3zVrZDa5C", external: true },
      { text: "Twitter/X", url: "https://x.com/BitRouterAI", external: true },
      {
        type: "button",
        text: "Sign In / Sign Up",
        url: "https://app.bitrouter.ai",
        external: true,
        secondary: true,
      },
    ],
  };
}
