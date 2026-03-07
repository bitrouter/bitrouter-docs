import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "BitRouter",
    },
    i18n: true,
    links: [
      { text: "Documentation", url: "/docs/overview", active: "nested-url" },
      { text: "Blog", url: "/blog" },
      { text: "GitHub", url: "https://github.com/AIMOverse", external: true },
      { text: "Discord", url: "https://discord.gg/TODO", external: true },
      { text: "Twitter/X", url: "https://x.com/AIMOverse", external: true },
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
