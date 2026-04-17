import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: "/docs", destination: "/docs/overview", permanent: false },
      { source: "/zh/docs", destination: "/zh/docs/overview", permanent: false },
      { source: "/install.sh", destination: "https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh", permanent: false },
      { source: "/install.ps1", destination: "https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.ps1", permanent: false },
      { source: "/apis", destination: "/llms", permanent: true },
      { source: "/apis/models/:id*", destination: "/llms/:id*", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/api/docs/llms-mdx/:path*",
      },
    ];
  },
};

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
