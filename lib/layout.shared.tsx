import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "BitRouter",
    },
    i18n: true,
    githubUrl: "https://github.com/AIMOverse",
    links: [
      { text: "Playground", url: "https://bitrouter.ai/chat" },
      { text: "Models", url: "https://bitrouter.ai/models" },
      { text: "Docs", url: "/docs/overview", active: "nested-url" },
    ],
  };
}
