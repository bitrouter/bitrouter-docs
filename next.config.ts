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
      { source: "/apis", destination: "/llms", permanent: true },
      { source: "/apis/models/:id*", destination: "/llms/:id*", permanent: true },
      {
        source: "/docs/overview/privacy-policy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/privacy-policy",
        destination: "/zh/legal/privacy",
        permanent: true,
      },
      {
        source: "/docs/overview/terms-of-service",
        destination: "/legal/terms",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/terms-of-service",
        destination: "/zh/legal/terms",
        permanent: true,
      },
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
