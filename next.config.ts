import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";

// page slug → final nested path
const finalPath = {
  // get-started
  installation: "/docs/get-started/installation", quickstart: "/docs/get-started/quickstart",
  comparison: "/docs/get-started/comparison", "self-host-vs-cloud": "/docs/get-started/self-hosted-vs-cloud",
  // features
  "provider-selection":"/docs/features/provider-selection","model-fallback":"/docs/features/model-fallback",
  "model-variants":"/docs/features/model-variants","presets":"/docs/features/presets",
  "structured-outputs":"/docs/features/structured-outputs","byok":"/docs/features/byok",
  "local-models":"/docs/integrations/models","guardrails":"/docs/features/guardrails",
  "observability":"/docs/features/opentelemetry","opentelemetry":"/docs/features/opentelemetry",
  "tracing":"/docs/features/opentelemetry","telemetry":"/docs/features/opentelemetry",
  "mcp":"/docs/concepts/tools","acp":"/docs/concepts/agents",
  "agentskills":"/docs/concepts/tools",
  // bitrouter cloud (was: infrastructure)
  "managed-provider":"/docs/get-started/models-and-providers","discounted-models":"/docs/get-started/models-and-providers",
  "payment":"/docs/features/payment","workspaces":"/docs/features/namespaces",
  "for-providers":"/docs/guides/register-as-a-provider",
  // reference
  "cli":"/docs/concepts/cli",
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
  ["/docs/infrastructure/managed-provider", "/docs/get-started/models-and-providers"],
  ["/docs/infrastructure/discounted-models", "/docs/get-started/models-and-providers"],
  ["/docs/infrastructure/payment", "/docs/features/payment"],
  ["/docs/infrastructure/workspaces", "/docs/features/namespaces"],
  ["/docs/infrastructure/for-providers", "/docs/guides/register-as-a-provider"],
  // cloud/ section dissolved (2026-06 reorg) → new homes (preserve old links)
  ["/docs/cloud", "/docs/get-started/self-hosted-vs-cloud"],
  ["/docs/cloud/overview", "/docs/get-started/self-hosted-vs-cloud"],
  ["/docs/cloud/get-started", "/docs/get-started/self-hosted-vs-cloud"],
  ["/docs/cloud/byok", "/docs/features/byok"],
  ["/docs/cloud/tracing", "/docs/features/opentelemetry"],
  ["/docs/cloud/managed-models", "/docs/get-started/models-and-providers"],
  ["/docs/cloud/workspaces", "/docs/features/namespaces"],
  ["/docs/cloud/payment", "/docs/features/payment"],
  // reference wildcards (api-reference unwrapped into /docs/reference)
  ["/docs/api-reference/:slug*", "/docs/reference/:slug*"],
  ["/docs/reference/api-reference/:slug*", "/docs/reference/:slug*"],
  ["/docs/changelog/:slug*", "/docs/reference/changelog/:slug*"],
  ["/docs/changelog", "/docs/reference/changelog"],
  // moved/removed pages (2026-06 refactor) → live destinations
  ["/docs/features/observability", "/docs/features/opentelemetry"],
  ["/docs/features/tracing", "/docs/features/opentelemetry"],
  ["/docs/features/telemetry", "/docs/features/opentelemetry"],
  ["/docs/features/local-models", "/docs/integrations/models"],
  ["/docs/features/toolsets", "/docs/features/server-tools"],
  ["/docs/reference/cli", "/docs/concepts/cli"],
  ["/docs/guides/export-telemetry", "/docs/features/opentelemetry"],
  ["/docs/cloud/managed-tools", "/docs/get-started/self-hosted-vs-cloud"],
  ["/docs/cloud/managed-agents", "/docs/get-started/self-hosted-vs-cloud"],
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
      { source: "/zh/blog", destination: "/blog", permanent: true },
      { source: "/zh/blog/:slug", destination: "/blog/:slug", permanent: true },

      // ── Compare subpages merged into a single /compare article (2026-07) ──
      { source: "/compare/bitrouter-vs-openrouter", destination: "/compare#bitrouter-vs-openrouter", permanent: true },
      { source: "/compare/bitrouter-vs-litellm", destination: "/compare#bitrouter-vs-litellm", permanent: true },
      { source: "/compare/bitrouter-vs-portkey", destination: "/compare#bitrouter-vs-portkey", permanent: true },
      { source: "/zh/compare/:slug*", destination: "/compare", permanent: true },

      // ── Legal pages moved off /legal to flat top-level URLs ──
      { source: "/legal/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/legal/terms", destination: "/terms-of-service", permanent: true },
      { source: "/zh/legal/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/zh/legal/terms", destination: "/terms-of-service", permanent: true },
      { source: "/zh/legal", destination: "/privacy-policy", permanent: true },
      { source: "/legal", destination: "/privacy-policy", permanent: true },
      { source: "/zh/privacy-policy", destination: "/privacy-policy", permanent: true },
      { source: "/zh/terms-of-service", destination: "/terms-of-service", permanent: true },

      {
        source: "/docs/overview/privacy-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/privacy-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/docs/overview/terms-of-service",
        destination: "/terms-of-service",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/terms-of-service",
        destination: "/terms-of-service",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
