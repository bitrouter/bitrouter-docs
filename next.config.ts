import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

// page slug → final nested path
const finalPath = {
  // get-started (dissolved 2026-08 → overview/quickstart)
  installation: "/docs/overview/quickstart", quickstart: "/docs/overview/quickstart",
  comparison: "/docs/overview/bitrouter-vs-openrouter", "self-host-vs-cloud": "/docs/overview/quickstart#self-host-or-cloud",
  // models & routing
  "provider-selection":"/docs/models-and-routing/provider-selection","model-fallback":"/docs/models-and-routing/model-fallback",
  "model-variants":"/docs/models-and-routing/model-variants","presets":"/docs/models-and-routing/virtual-model",
  "structured-outputs":"/docs/models-and-routing/structured-outputs","byok":"/docs/models-and-routing/bring-your-own-provider",
  "local-models":"/docs/integrations/models","guardrails":"/docs/models-and-routing/guardrails",
  "observability":"/docs/evals-and-observability/opentelemetry","opentelemetry":"/docs/evals-and-observability/opentelemetry",
  "tracing":"/docs/evals-and-observability/tracing","telemetry":"/docs/evals-and-observability/opentelemetry",
  "mcp":"/docs/usage/mcp","acp":"/docs/models-and-routing/acp-gateway",
  "agentskills":"/docs/usage/skills",
  // bitrouter cloud (was: infrastructure)
  "managed-provider":"/docs/overview/supported-models","discounted-models":"/docs/overview/supported-models",
  "payment":"/docs/overview/quickstart#self-host-or-cloud","workspaces":"/docs/reference/management/listNamespaces",
  "for-providers":"/docs/models-and-routing/bring-your-own-provider",
  // usage (CLI + MCP moved out of reference/ into the Documentation tab, 2026-08)
  "cli":"/docs/usage/cli",
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
  // Guides is its own tab (2026-08) but has no index page — land on its first.
  ["/docs/guides", "/docs/guides/migrate-from-litellm"],
  ["/docs/guides/overview", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/overview/quickstart", "/docs/overview/quickstart"],
  ["/docs/guides/overview/comparison", "/docs/overview/bitrouter-vs-openrouter"],
  ["/docs/guides/overview/provider", "/docs/models-and-routing/bring-your-own-provider"],
  // intro page renamed (2026-07): recursive-self-improvement → what-is-bitrouter
  ["/docs/overview/recursive-self-improvement", "/docs/overview/what-is-bitrouter"],
  // overview/get-started split + features→models-and-routing (2026-07 reorg)
  ["/docs/get-started/introduction", "/docs/overview/what-is-bitrouter"],
  ["/docs/get-started/supported-models", "/docs/overview/supported-models"],
  ["/docs/get-started/supported-providers", "/docs/overview/supported-models"],
  ["/docs/features/provider-selection", "/docs/models-and-routing/provider-selection"],
  ["/docs/features/model-fallback", "/docs/models-and-routing/model-fallback"],
  ["/docs/features/model-variants", "/docs/models-and-routing/model-variants"],
  ["/docs/features/presets", "/docs/models-and-routing/virtual-model"],
  ["/docs/features/structured-outputs", "/docs/models-and-routing/structured-outputs"],
  ["/docs/features/byok", "/docs/models-and-routing/bring-your-own-provider"],
  // concepts/ section dissolved (2026-07 reorg) → pages land next to their features
  ["/docs/concepts", "/docs/overview/what-is-bitrouter"],
  ["/docs/concepts/models", "/docs/overview/supported-models#how-model-ids-work"],
  ["/docs/concepts/policy", "/docs/overview/quickstart#adaptive-routing"],
  ["/docs/concepts/tools", "/docs/usage/mcp"],
  ["/docs/concepts/agents", "/docs/models-and-routing/acp-gateway"],
  ["/docs/concepts/cli", "/docs/usage/cli"],
  ["/docs/concepts/mcp", "/docs/usage/mcp"],
  ["/docs/concepts/agent-skill", "/docs/overview/quickstart"],
  // get-started consolidation (2026-07): onboarding merge, FAQs dissolved, cli/mcp → reference
  ["/docs/get-started/configuration", "/docs/overview/quickstart"],
  ["/docs/get-started/wizard", "/docs/overview/quickstart"],
  ["/docs/get-started/agent-skill", "/docs/overview/quickstart"],
  ["/docs/get-started/faqs", "/docs/overview/quickstart"],
  ["/docs/get-started/cli", "/docs/usage/cli"],
  ["/docs/get-started/mcp", "/docs/usage/mcp"],
  // get-started/ section dissolved (2026-08): onboarding → overview/quickstart,
  // the four set-up-* walkthroughs → the quickstart or the page that owns each topic
  ["/docs/get-started", "/docs/overview/quickstart"],
  ["/docs/get-started/onboarding", "/docs/overview/quickstart"],
  // slugs llms.txt advertised under get-started/ that never had a page there
  ["/docs/get-started/quickstart", "/docs/overview/quickstart"],
  ["/docs/get-started/installation", "/docs/overview/quickstart"],
  ["/docs/get-started/comparison", "/docs/overview/bitrouter-vs-openrouter"],
  ["/docs/get-started/set-up-routing", "/docs/models-and-routing/provider-selection"],
  ["/docs/get-started/set-up-tracing", "/docs/evals-and-observability/opentelemetry"],
  ["/docs/get-started/set-up-evaling", "/docs/evals-and-observability/evaluation"],
  ["/docs/get-started/set-up-looping", "/docs/overview/quickstart#adaptive-routing"],
  // infrastructure → bitrouter cloud (folder renamed; pages merged/moved)
  ["/docs/infrastructure/managed-provider", "/docs/overview/supported-models"],
  ["/docs/infrastructure/discounted-models", "/docs/overview/supported-models"],
  ["/docs/infrastructure/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/infrastructure/workspaces", "/docs/reference/management/listNamespaces"],
  ["/docs/infrastructure/for-providers", "/docs/models-and-routing/bring-your-own-provider"],
  // cloud/ section dissolved (2026-06 reorg) → new homes (preserve old links)
  ["/docs/cloud", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/overview", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/get-started", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/byok", "/docs/models-and-routing/bring-your-own-provider"],
  ["/docs/cloud/tracing", "/docs/evals-and-observability/tracing"],
  ["/docs/cloud/managed-models", "/docs/overview/supported-models"],
  ["/docs/cloud/workspaces", "/docs/reference/management/listNamespaces"],
  ["/docs/cloud/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  // CLI + MCP left the API Reference tab for Documentation → Usage (2026-08).
  // These must stay above the /docs/reference wildcards below.
  ["/docs/reference/cli/:slug*", "/docs/usage/cli/:slug*"],
  ["/docs/reference/cli", "/docs/usage/cli"],
  ["/docs/reference/mcp", "/docs/usage/mcp"],
  // The CLI reference collapsed from ten pages into one (2026-08). Each retired
  // page lands on its `##` section anchor — keep these in sync with the section
  // titles in cli-overlays/<group>.md, which is where the anchors come from.
  ["/docs/usage/cli/index", "/docs/usage/cli"],
  ["/docs/usage/cli/daemon", "/docs/usage/cli#daemon-lifecycle"],
  ["/docs/usage/cli/init", "/docs/usage/cli#init-and-config"],
  ["/docs/usage/cli/route", "/docs/usage/cli#routing-introspection"],
  ["/docs/usage/cli/providers", "/docs/usage/cli#providers"],
  ["/docs/usage/cli/policy", "/docs/usage/cli#policy"],
  ["/docs/usage/cli/cloud", "/docs/usage/cli#cloud"],
  ["/docs/usage/cli/tools", "/docs/usage/cli#tools-agents-and-acp"],
  ["/docs/usage/cli/skills", "/docs/usage/cli#skills-and-mcp"],
  ["/docs/usage/cli/harnesses", "/docs/usage/cli#harnesses"],
  ["/docs/usage/cli/misc", "/docs/usage/cli#key-workflow-state-and-update"],
  // AI Resources dissolved (2026-08): skills and the docs MCP server moved into
  // Usage; the llms.txt page retired (the endpoints themselves still serve).
  ["/docs/ai-resources", "/docs/usage/skills"],
  ["/docs/ai-resources/skills", "/docs/usage/skills"],
  ["/docs/ai-resources/mcp", "/docs/usage/mcp#the-docs-mcp-server"],
  ["/docs/ai-resources/llms-txt", "/docs/usage/mcp#the-docs-mcp-server"],
  // reference wildcards (api-reference unwrapped into /docs/reference)
  ["/docs/api-reference/:slug*", "/docs/reference/:slug*"],
  ["/docs/reference/api-reference/:slug*", "/docs/reference/:slug*"],
  // The changelog is a top-level route (app/changelog), not a docs section —
  // /docs/reference/changelog has never existed.
  ["/docs/changelog/:slug*", "/changelog/:slug*"],
  ["/docs/changelog", "/changelog"],
  // moved/removed pages (2026-06 refactor) → live destinations
  ["/docs/features/observability", "/docs/evals-and-observability/opentelemetry"],
  ["/docs/features/tracing", "/docs/evals-and-observability/tracing"],
  ["/docs/features/telemetry", "/docs/evals-and-observability/opentelemetry"],
  // observability & evaluation split out of features/ (2026-08); the single
  // opentelemetry page was two pages welded together — OSS export vs hosted view
  ["/docs/features/opentelemetry", "/docs/evals-and-observability/opentelemetry"],
  ["/docs/features/local-models", "/docs/integrations/models"],
  ["/docs/features/toolsets", "/docs/models-and-routing/tool-calling/server-tools"],
  ["/docs/guides/export-telemetry", "/docs/evals-and-observability/opentelemetry"],
  ["/docs/cloud/managed-tools", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/managed-agents", "/docs/overview/quickstart#self-host-or-cloud"],
  // integrations + cookbook history
  ["/docs/integrations/harnesses/:slug*", "/docs/integrations/:slug*"],
  ["/docs/cookbook/integration/:slug*", "/docs/integrations/:slug*"],
  // the local-models page was unpublished; the model catalog absorbed it
  ["/docs/cookbook/local-models", "/docs/integrations/models"],
  ["/docs/integrations/local-models", "/docs/integrations/models"],
  ["/docs/cookbook", "/docs/integrations"],
  // migration history → guides
  ["/docs/integrations/migrate/litellm", "/docs/guides/migrate-from-litellm"],
  ["/docs/integrations/migrate/openrouter", "/docs/guides/migrate-from-openrouter"],
  ["/docs/cookbook/migration/litellm", "/docs/guides/migrate-from-litellm"],
  ["/docs/cookbook/migration/openrouter", "/docs/guides/migrate-from-openrouter"],
  // The section was models-and-routing → gateway-and-routing (2026-08) → back to
  // models-and-routing (2026-09), so most of its own slugs are live URLs again and
  // need no redirect. Only the two renamed pages and the index still do.
  ["/docs/models-and-routing/presets", "/docs/models-and-routing/virtual-model"],
  ["/docs/models-and-routing/byok", "/docs/models-and-routing/bring-your-own-provider"],
  ["/docs/models-and-routing", "/docs/models-and-routing/provider-selection"],
  // gateway-and-routing/ split (2026-09): the routing pages went back to
  // models-and-routing/, the tool-calling pages to what became
  // models-and-routing/tool-calling/ (see the section dissolve below).
  ["/docs/gateway-and-routing/model-fallback", "/docs/models-and-routing/model-fallback"],
  ["/docs/gateway-and-routing/provider-selection", "/docs/models-and-routing/provider-selection"],
  ["/docs/gateway-and-routing/virtual-model", "/docs/models-and-routing/virtual-model"],
  ["/docs/gateway-and-routing/model-variants", "/docs/models-and-routing/model-variants"],
  ["/docs/gateway-and-routing/bring-your-own-model", "/docs/models-and-routing/bring-your-own-model"],
  ["/docs/gateway-and-routing/bring-your-own-provider", "/docs/models-and-routing/bring-your-own-provider"],
  ["/docs/gateway-and-routing/structured-outputs", "/docs/models-and-routing/structured-outputs"],
  ["/docs/gateway-and-routing/guardrails", "/docs/models-and-routing/guardrails"],
  ["/docs/gateway-and-routing/mcp-gateway", "/docs/usage/mcp"],
  ["/docs/gateway-and-routing/server-tools", "/docs/models-and-routing/tool-calling/server-tools"],
  ["/docs/gateway-and-routing/advisor", "/docs/models-and-routing/tool-calling/advisor"],
  ["/docs/gateway-and-routing/subagent", "/docs/models-and-routing/tool-calling/subagent"],
  ["/docs/gateway-and-routing/fusion", "/docs/models-and-routing/tool-calling/fusion"],
  ["/docs/gateway-and-routing/websearch", "/docs/models-and-routing/tool-calling/websearch"],
  ["/docs/gateway-and-routing/web-fetch", "/docs/models-and-routing/tool-calling/web-fetch"],
  ["/docs/gateway-and-routing/acp-gateway", "/docs/models-and-routing/acp-gateway"],
  ["/docs/gateway-and-routing", "/docs/models-and-routing/provider-selection"],
  // mcp-and-tool-calling/ dissolved (2026-08): the section never earned its own
  // top-level slot. The six server-tool pages nest under Models & Routing as a
  // collapsed tool-calling/ subfolder, the MCP gateway joins Usage next to the
  // origin MCP server it is the mirror of, and the still-unlisted ACP gateway
  // sits on its own under models-and-routing/ rather than paired with MCP.
  // The section index has no page of its own, and `:slug*` matches zero
  // segments too — so the bare path has to be claimed before the wildcard.
  ["/docs/mcp-and-tool-calling", "/docs/models-and-routing/tool-calling/server-tools"],
  ["/docs/mcp-and-tool-calling/mcp-gateway", "/docs/usage/mcp"],
  ["/docs/mcp-and-tool-calling/acp-gateway", "/docs/models-and-routing/acp-gateway"],
  ["/docs/mcp-and-tool-calling/:slug*", "/docs/models-and-routing/tool-calling/:slug*"],
  // evals-and-tracing/ → evals-and-observability/ (2026-08): section renamed
  ["/docs/evals-and-tracing/:slug*", "/docs/evals-and-observability/:slug*"],
  ["/docs/evals-and-tracing", "/docs/evals-and-observability/opentelemetry"],
  // Guides tab trimmed to migration only (2026-08): the Cloud and Extending
  // sections were retired, and usage/mcp-gateway folded away into usage/mcp.
  ["/docs/guides/cloud-api", "/docs/usage/cli"],
  ["/docs/guides/build-a-plugin", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/register-as-a-provider", "/docs/models-and-routing/bring-your-own-provider"],
  ["/docs/usage/mcp-gateway", "/docs/usage/mcp"],
  // observability/ → evals-and-observability/ (2026-09)
  ["/docs/observability/:slug*", "/docs/evals-and-observability/:slug*"],
  ["/docs/observability", "/docs/evals-and-observability/opentelemetry"],
  // tools/agents pages retitled to name their protocol; features/ dissolved —
  // guardrails moved, namespaces and payment retired (2026-08)
  ["/docs/gateway-and-routing/tools", "/docs/usage/mcp"],
  ["/docs/gateway-and-routing/agents", "/docs/models-and-routing/acp-gateway"],
  ["/docs/features", "/docs/models-and-routing/guardrails"],
  ["/docs/features/guardrails", "/docs/models-and-routing/guardrails"],
  ["/docs/features/namespaces", "/docs/reference/management/listNamespaces"],
  ["/docs/features/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/features/tools", "/docs/usage/mcp"],
  ["/docs/features/server-tools", "/docs/models-and-routing/tool-calling/server-tools"],
  ["/docs/features/websearch", "/docs/models-and-routing/tool-calling/websearch"],
  ["/docs/features/web-fetch", "/docs/models-and-routing/tool-calling/web-fetch"],
  ["/docs/features/agents", "/docs/models-and-routing/acp-gateway"],
  ["/docs/features/subagent", "/docs/models-and-routing/tool-calling/subagent"],
  ["/docs/features/advisor", "/docs/models-and-routing/tool-calling/advisor"],
  ["/docs/features/fusion", "/docs/models-and-routing/tool-calling/fusion"],
  // pages retired (2026-08): the provider directory and the models concept page
  // folded into the model catalog, policy semantics into the quickstart, and the
  // search-provider integrations into the web search feature page.
  ["/docs/overview/supported-providers", "/docs/overview/supported-models"],
  ["/docs/gateway-and-routing/models", "/docs/overview/supported-models#how-model-ids-work"],
  ["/docs/gateway-and-routing/policy", "/docs/overview/quickstart#adaptive-routing"],
  ["/docs/integrations/tools", "/docs/models-and-routing/tool-calling/websearch"],
  ["/docs/integrations/exa", "/docs/models-and-routing/tool-calling/websearch"],
  ["/docs/integrations/parallel", "/docs/models-and-routing/tool-calling/websearch"],
  ["/docs/integrations/firecrawl", "/docs/models-and-routing/tool-calling/websearch"],
  ["/docs/integrations/tavily", "/docs/models-and-routing/tool-calling/websearch"],
  // gateway pages renamed for what they are, not what the field is called
  // (2026-08): presets → virtual model, external providers (BYOK) → bring your
  // own provider. The API keeps `routing-presets` and `byok`; the docs don't.
  ["/docs/gateway-and-routing/presets", "/docs/models-and-routing/virtual-model"],
  ["/docs/gateway-and-routing/byok", "/docs/models-and-routing/bring-your-own-provider"],
  // the OpenRouter page was unpublished (2026-08); the aggregator provider block
  // it documented is the worked example on the model-sources page. The
  // migrate-from-openrouter guide is unaffected.
  ["/docs/integrations/openrouter", "/docs/integrations/models"],
  // Self-hosting became its own tab (2026-08). The single `guides/self-host`
  // page was split across the new section: config → production-config, daemon
  // → run-as-a-service, telemetry → operations, hardening → hardening. Its old
  // `#1-…`/`#5-…` anchors can't be redirected (fragments never reach the
  // server), so the index page links out to all four.
  ["/docs/guides/self-host", "/docs/self-hosting"],
  ["/docs/self-host", "/docs/self-hosting"],
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

      // ── Per-harness marketing routes retired (2026-08) ──
      // /claude-code, /codex, … were IntegrationStub placeholders ("setup guide
      // pending") with no unique content, so they land on the real setup guide.
      // Note the slug change: the route was /hermes-agent, the doc is hermes.
      { source: "/claude-code", destination: "/docs/integrations/claude-code", permanent: true },
      { source: "/codex", destination: "/docs/integrations/codex", permanent: true },
      { source: "/opencode", destination: "/docs/integrations/opencode", permanent: true },
      { source: "/openclaw", destination: "/docs/integrations/openclaw", permanent: true },
      { source: "/hermes-agent", destination: "/docs/integrations/hermes", permanent: true },
      { source: "/zh/claude-code", destination: "/docs/integrations/claude-code", permanent: true },
      { source: "/zh/codex", destination: "/docs/integrations/codex", permanent: true },
      { source: "/zh/opencode", destination: "/docs/integrations/opencode", permanent: true },
      { source: "/zh/openclaw", destination: "/docs/integrations/openclaw", permanent: true },
      { source: "/zh/hermes-agent", destination: "/docs/integrations/hermes", permanent: true },

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
