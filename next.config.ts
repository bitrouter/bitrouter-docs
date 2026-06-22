import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";

// page slug → final nested path
const finalPath = {
  // get-started
  installation: "/docs/get-started/installation", quickstart: "/docs/get-started/quickstart",
  comparison: "/docs/get-started/comparison", "self-host-vs-cloud": "/docs/get-started/self-host-vs-cloud",
  // features
  "provider-selection":"/docs/features/provider-selection","model-fallback":"/docs/features/model-fallback",
  "model-variants":"/docs/features/model-variants","presets":"/docs/features/presets",
  "structured-outputs":"/docs/features/structured-outputs","byok":"/docs/features/byok",
  "local-models":"/docs/features/local-models","guardrails":"/docs/features/guardrails",
  "observability":"/docs/features/observability","mcp":"/docs/features/mcp","acp":"/docs/features/acp",
  "agentskills":"/docs/features/agentskills",
  // bitrouter cloud (was: infrastructure)
  "managed-provider":"/docs/cloud/managed-models","discounted-models":"/docs/cloud/managed-models",
  "payment":"/docs/cloud/payment","workspaces":"/docs/cloud/workspaces",
  "for-providers":"/docs/guides/register-as-a-provider",
  // reference
  "cli":"/docs/reference/cli",
};
const legacyBuckets = ["core","cloud","features","routing"]; // /docs/guides/<bucket>/<slug>
const pairs: Array<[string, string]> = [];
for (const [slug, dest] of Object.entries(finalPath)) {
  pairs.push(["/docs/" + slug, dest]);                          // current flat form
  for (const b of legacyBuckets) pairs.push(["/docs/guides/" + b + "/" + slug, dest]); // production+branch buckets
}
// overview + root + special
pairs.push(
  ["/docs", "/docs/get-started/introduction"],
  ["/docs/guides", "/docs/get-started/introduction"],
  ["/docs/guides/overview", "/docs/get-started/introduction"],
  ["/docs/guides/overview/quickstart", "/docs/get-started/quickstart"],
  ["/docs/guides/overview/comparison", "/docs/get-started/comparison"],
  ["/docs/guides/overview/provider", "/docs/guides/register-as-a-provider"],
  // infrastructure → bitrouter cloud (folder renamed; pages merged/moved)
  ["/docs/infrastructure/managed-provider", "/docs/cloud/managed-models"],
  ["/docs/infrastructure/discounted-models", "/docs/cloud/managed-models"],
  ["/docs/infrastructure/payment", "/docs/cloud/payment"],
  ["/docs/infrastructure/workspaces", "/docs/cloud/workspaces"],
  ["/docs/infrastructure/for-providers", "/docs/guides/register-as-a-provider"],
  ["/docs/cloud", "/docs/cloud/overview"],
  // reference wildcards
  ["/docs/api-reference/:slug*", "/docs/reference/api-reference/:slug*"],
  ["/docs/changelog/:slug*", "/docs/reference/changelog/:slug*"],
  ["/docs/changelog", "/docs/reference/changelog"],
  // integrations + cookbook history
  ["/docs/integrations/harnesses/:slug*", "/docs/integrations/:slug*"],
  ["/docs/cookbook/integration/:slug*", "/docs/integrations/:slug*"],
  ["/docs/cookbook/local-models", "/docs/integrations/local-models"],
  ["/docs/cookbook", "/docs/integrations"],
  // migration history → guides
  ["/docs/integrations/migrate/litellm", "/docs/guides/migrate-from-litellm"],
  ["/docs/integrations/migrate/openrouter", "/docs/guides/migrate-from-openrouter"],
  ["/docs/cookbook/migration/litellm", "/docs/guides/migrate-from-litellm"],
  ["/docs/cookbook/migration/openrouter", "/docs/guides/migrate-from-openrouter"],
);
const docsRedirects = pairs.flatMap(([source, destination]) => [
  { source, destination, permanent: true },
  { source: `/zh${source}`, destination: `/zh${destination}`, permanent: true },
]);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async redirects() {
    return [
      ...docsRedirects,
      // ── Landing/site pages are English-only: fold old /zh/* URLs back to en ──
      { source: "/zh", destination: "/", permanent: true },
      { source: "/zh/models", destination: "/models", permanent: true },
      { source: "/zh/models/:slug*", destination: "/models/:slug*", permanent: true },
      { source: "/zh/providers", destination: "/providers", permanent: true },
      { source: "/zh/providers/:slug", destination: "/providers/:slug", permanent: true },
      { source: "/zh/brand", destination: "/brand", permanent: true },
      { source: "/careers", destination: "/about", permanent: true },
      { source: "/zh/careers", destination: "/about", permanent: true },
      { source: "/zh/enterprise", destination: "/enterprise", permanent: true },
      { source: "/zh/legal", destination: "/legal", permanent: true },
      { source: "/zh/legal/:slug", destination: "/legal/:slug", permanent: true },
      { source: "/zh/blog", destination: "/blog", permanent: true },
      { source: "/zh/blog/:slug", destination: "/blog/:slug", permanent: true },

      {
        source: "/docs/overview/privacy-policy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/privacy-policy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/docs/overview/terms-of-service",
        destination: "/legal/terms",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/terms-of-service",
        destination: "/legal/terms",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
