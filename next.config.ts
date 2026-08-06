import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

// page slug → final nested path
const finalPath = {
  // get-started (dissolved 2026-08 → overview/quickstart)
  installation: "/docs/overview/quickstart", quickstart: "/docs/overview/quickstart",
  comparison: "/docs/overview/bitrouter-vs-openrouter", "self-host-vs-cloud": "/docs/overview/quickstart#self-host-or-cloud",
  // models & routing (was: features)
  "provider-selection":"/docs/models-and-routing/provider-selection","model-fallback":"/docs/models-and-routing/model-fallback",
  "model-variants":"/docs/models-and-routing/model-variants","presets":"/docs/models-and-routing/presets",
  "structured-outputs":"/docs/models-and-routing/structured-outputs","byok":"/docs/models-and-routing/byok",
  "local-models":"/docs/integrations/models","guardrails":"/docs/features/guardrails",
  "observability":"/docs/features/opentelemetry","opentelemetry":"/docs/features/opentelemetry",
  "tracing":"/docs/features/opentelemetry","telemetry":"/docs/features/opentelemetry",
  "mcp":"/docs/features/tools","acp":"/docs/features/agents",
  "agentskills":"/docs/features/tools",
  // bitrouter cloud (was: infrastructure)
  "managed-provider":"/docs/overview/supported-models","discounted-models":"/docs/overview/supported-models",
  "payment":"/docs/features/payment","workspaces":"/docs/features/namespaces",
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
  ["/docs", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/overview", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/overview/quickstart", "/docs/overview/quickstart"],
  ["/docs/guides/overview/comparison", "/docs/overview/bitrouter-vs-openrouter"],
  ["/docs/guides/overview/provider", "/docs/guides/register-as-a-provider"],
  // intro page renamed (2026-07): recursive-self-improvement → what-is-bitrouter
  ["/docs/overview/recursive-self-improvement", "/docs/overview/what-is-bitrouter"],
  // overview/get-started split + features→models-and-routing (2026-07 reorg)
  ["/docs/get-started/introduction", "/docs/overview/what-is-bitrouter"],
  ["/docs/get-started/supported-models", "/docs/overview/supported-models"],
  ["/docs/get-started/supported-providers", "/docs/overview/supported-providers"],
  ["/docs/features/provider-selection", "/docs/models-and-routing/provider-selection"],
  ["/docs/features/model-fallback", "/docs/models-and-routing/model-fallback"],
  ["/docs/features/model-variants", "/docs/models-and-routing/model-variants"],
  ["/docs/features/presets", "/docs/models-and-routing/presets"],
  ["/docs/features/structured-outputs", "/docs/models-and-routing/structured-outputs"],
  ["/docs/features/byok", "/docs/models-and-routing/byok"],
  // concepts/ section dissolved (2026-07 reorg) → pages land next to their features
  ["/docs/concepts", "/docs/overview/what-is-bitrouter"],
  ["/docs/concepts/models", "/docs/models-and-routing/models"],
  ["/docs/concepts/policy", "/docs/models-and-routing/policy"],
  ["/docs/concepts/tools", "/docs/features/tools"],
  ["/docs/concepts/agents", "/docs/features/agents"],
  ["/docs/concepts/cli", "/docs/reference/cli"],
  ["/docs/concepts/mcp", "/docs/reference/mcp"],
  ["/docs/concepts/agent-skill", "/docs/overview/quickstart"],
  // get-started consolidation (2026-07): onboarding merge, FAQs dissolved, cli/mcp → reference
  ["/docs/get-started/configuration", "/docs/overview/quickstart"],
  ["/docs/get-started/wizard", "/docs/overview/quickstart"],
  ["/docs/get-started/agent-skill", "/docs/overview/quickstart"],
  ["/docs/get-started/faqs", "/docs/overview/quickstart"],
  ["/docs/get-started/cli", "/docs/reference/cli"],
  ["/docs/get-started/mcp", "/docs/reference/mcp"],
  // get-started/ section dissolved (2026-08): onboarding → overview/quickstart,
  // the four set-up-* walkthroughs → the reference pages that own each topic
  ["/docs/get-started", "/docs/overview/quickstart"],
  ["/docs/get-started/onboarding", "/docs/overview/quickstart"],
  // slugs llms.txt advertised under get-started/ that never had a page there
  ["/docs/get-started/quickstart", "/docs/overview/quickstart"],
  ["/docs/get-started/installation", "/docs/overview/quickstart"],
  ["/docs/get-started/comparison", "/docs/overview/bitrouter-vs-openrouter"],
  ["/docs/get-started/set-up-routing", "/docs/models-and-routing/provider-selection"],
  ["/docs/get-started/set-up-tracing", "/docs/features/opentelemetry"],
  ["/docs/get-started/set-up-evaling", "/docs/models-and-routing/policy"],
  ["/docs/get-started/set-up-looping", "/docs/models-and-routing/policy"],
  // infrastructure → bitrouter cloud (folder renamed; pages merged/moved)
  ["/docs/infrastructure/managed-provider", "/docs/overview/supported-models"],
  ["/docs/infrastructure/discounted-models", "/docs/overview/supported-models"],
  ["/docs/infrastructure/payment", "/docs/features/payment"],
  ["/docs/infrastructure/workspaces", "/docs/features/namespaces"],
  ["/docs/infrastructure/for-providers", "/docs/guides/register-as-a-provider"],
  // cloud/ section dissolved (2026-06 reorg) → new homes (preserve old links)
  ["/docs/cloud", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/overview", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/get-started", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/byok", "/docs/models-and-routing/byok"],
  ["/docs/cloud/tracing", "/docs/features/opentelemetry"],
  ["/docs/cloud/managed-models", "/docs/overview/supported-models"],
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
  ["/docs/guides/export-telemetry", "/docs/features/opentelemetry"],
  ["/docs/cloud/managed-tools", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/managed-agents", "/docs/overview/quickstart#self-host-or-cloud"],
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
  // Legacy /zh docs URLs fold straight to the English destination (one hop).
  { source: `/zh${source}`, destination, permanent: true },
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

      // ── /compare article retired; comparisons live in docs → overview (2026-07) ──
      { source: "/compare/bitrouter-vs-openrouter", destination: "/docs/overview/bitrouter-vs-openrouter", permanent: true },
      { source: "/compare/bitrouter-vs-litellm", destination: "/docs/overview/bitrouter-vs-litellm", permanent: true },
      { source: "/compare/bitrouter-vs-portkey", destination: "/docs/overview/bitrouter-vs-openrouter", permanent: true },
      { source: "/compare", destination: "/docs/overview/bitrouter-vs-openrouter", permanent: true },
      { source: "/zh/compare/:slug*", destination: "/docs/overview/bitrouter-vs-openrouter", permanent: true },

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

      // ── Chinese locale removed: any remaining /zh/docs/* URL folds to en ──
      { source: "/zh/docs/:path*", destination: "/docs/:path*", permanent: true },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
