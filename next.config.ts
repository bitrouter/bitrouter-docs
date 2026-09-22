import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

// page slug → final nested path
const finalPath = {
  // get-started (dissolved 2026-08 → overview/quickstart)
  installation: "/docs/overview/quickstart", quickstart: "/docs/overview/quickstart",
  comparison: "/docs/overview/comparison#openrouter", "self-host-vs-cloud": "/docs/overview/quickstart#self-host-or-cloud",
  // models & routing
  "provider-selection":"/docs/configuration/models#candidate-eligibility","model-fallback":"/docs/configuration/models#fallback-chains",
  "model-variants":"/docs/configuration/models#variants","presets":"/docs/configuration/models#presets",
  "structured-outputs":"/docs/configuration/models#protocol-compatibility","byok":"/docs/customization/models#built-in-providers-with-your-own-key",
  "local-models":"/docs/usage/model-sources/local-inference","guardrails":"/docs/configuration/guardrails",
  "observability":"/docs/configuration/telemetry","opentelemetry":"/docs/configuration/telemetry#self-hosted-opentelemetry",
  "tracing":"/docs/configuration/telemetry#cloud-activity","telemetry":"/docs/configuration/telemetry",
  "evaluation":"/docs/configuration/evaluations","evaluations":"/docs/configuration/evaluations",
  "mcp":"/docs/usage/mcp","acp":"/docs/usage/acp",
  "agentskills":"/docs/usage/skills",
  // bitrouter cloud (was: infrastructure)
  "managed-provider":"/docs/overview/supported-models","discounted-models":"/docs/overview/supported-models",
  "payment":"/docs/overview/quickstart#self-host-or-cloud","workspaces":"/docs/reference/management/listNamespaces",
  "for-providers":"/docs/customization/models#built-in-providers-with-your-own-key",
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
  // Section overview pages retired in 2026-09. Each section now starts with
  // its first concrete task page.
  ["/docs/usage", "/docs/usage/bitrouter-auto"],
  ["/docs/configuration", "/docs/configuration/policy"],
  ["/docs/customization", "/docs/customization/models"],
  // Claude Code, Codex, and model-source guidance now live on one Coding
  // agents page. Preserve the former canonical URLs at stable anchors.
  ["/docs/usage/coding-agents/claude-code", "/docs/usage/coding-agents#claude-code"],
  ["/docs/usage/coding-agents/codex", "/docs/usage/coding-agents#codex"],
  ["/docs/usage/model-sources", "/docs/usage/coding-agents#model-sources"],
  // 2026-09 information-architecture cleanup. The command remains `bro code`;
  // TUI is the user-facing documentation name.
  ["/docs/usage/code", "/docs/usage/tui"],
  ["/docs/usage/protocols", "/docs/usage/cli"],
  ["/docs/usage/mcp-gateway", "/docs/usage/mcp#mcp-gateway"],
  ["/docs/usage/model-sources/claude-subscription", "/docs/usage/coding-agents#use-a-claude-subscription"],
  ["/docs/usage/model-sources/codex-subscription", "/docs/usage/coding-agents#use-a-codex-subscription"],
  ["/docs/usage/migrate", "/docs/overview/comparison"],
  ["/docs/usage/migrate/litellm", "/docs/overview/comparison#migrate-from-litellm"],
  ["/docs/usage/migrate/openrouter", "/docs/overview/comparison#migrate-from-openrouter"],
  ["/docs/usage/migrate/tensorzero", "/docs/overview/comparison"],
  ["/docs/usage/acp-gateway", "/docs/usage/acp"],
  // Product-specific recipes collapsed into maintained task pages (2026-09).
  ["/docs/usage/coding-agents/opencode", "/docs/usage/coding-agents"],
  ["/docs/usage/coding-agents/pi", "/docs/usage/coding-agents"],
  ["/docs/usage/coding-agents/deepseek-harness", "/docs/usage/coding-agents#other-harnesses"],
  ["/docs/usage/model-sources/ollama", "/docs/usage/model-sources/local-inference"],
  ["/docs/usage/model-sources/vllm", "/docs/usage/model-sources/local-inference"],
  ["/docs/usage/model-sources/unsloth", "/docs/usage/model-sources/local-inference"],
  // Configuration details collapsed into maintained task pages (2026-09).
  ["/docs/configuration/config-file", "/docs/configuration/policy"],
  ["/docs/configuration/routing", "/docs/configuration/models"],
  ["/docs/usage/structured-outputs", "/docs/configuration/models#protocol-compatibility"],
  ["/docs/configuration/structured-outputs", "/docs/configuration/models#protocol-compatibility"],
  ["/docs/configuration/provider-selection", "/docs/configuration/models#candidate-eligibility"],
  ["/docs/configuration/model-fallback", "/docs/configuration/models#fallback-chains"],
  ["/docs/configuration/virtual-model", "/docs/configuration/models#presets"],
  ["/docs/configuration/model-variants", "/docs/configuration/models#variants"],
  // Observability was split into the narrower Telemetry and Evaluations pages.
  ["/docs/configuration/observability", "/docs/configuration/telemetry"],
  ["/docs/configuration/observability/opentelemetry", "/docs/configuration/telemetry#self-hosted-opentelemetry"],
  ["/docs/configuration/observability/tracing", "/docs/configuration/telemetry#cloud-activity"],
  ["/docs/configuration/observability/evaluation", "/docs/configuration/evaluations"],
  ["/docs/configuration/observability/:slug*", "/docs/configuration/telemetry"],
  // Customization recipes collapsed around capability families (2026-09).
  ["/docs/customization/models/bring-your-own-model", "/docs/customization/models#custom-endpoints-and-models"],
  ["/docs/customization/models/bring-your-own-provider", "/docs/customization/models#built-in-providers-with-your-own-key"],
  ["/docs/customization/tools/advisor", "/docs/customization/tools/model-backed-tools#advisor"],
  ["/docs/customization/tools/subagent", "/docs/customization/tools/model-backed-tools#sub-agent"],
  ["/docs/customization/tools/fusion", "/docs/customization/tools/model-backed-tools#fusion"],
  ["/docs/customization/tools/websearch", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/customization/tools/web-fetch", "/docs/customization/tools/web-tools#web-fetch"],
  // Self-hosting lifecycle consolidated into one page (2026-09).
  ["/docs/self-hosting/install", "/docs/self-hosting#install"],
  ["/docs/self-hosting/deploy", "/docs/self-hosting#deploy"],
  ["/docs/self-hosting/secure", "/docs/self-hosting#secure"],
  ["/docs/self-hosting/operate", "/docs/self-hosting#operate"],
  ["/docs/self-hosting/production-config", "/docs/self-hosting#production-configuration"],
  ["/docs/self-hosting/run-as-a-service", "/docs/self-hosting#run-as-a-service"],
  ["/docs/self-hosting/networking", "/docs/self-hosting#network-and-tls"],
  ["/docs/self-hosting/authentication", "/docs/self-hosting#authenticate-callers"],
  ["/docs/self-hosting/hardening", "/docs/self-hosting#production-checklist"],
  ["/docs/self-hosting/operations", "/docs/self-hosting#change-and-diagnose"],
  ["/docs/self-hosting/state-and-backups", "/docs/self-hosting#state-and-backups"],
  // Comparison pages consolidated into one singular route (2026-09).
  ["/docs/overview/comparisons", "/docs/overview/comparison"],
  ["/docs/overview/comparisons/openrouter", "/docs/overview/comparison#openrouter"],
  ["/docs/overview/comparisons/litellm", "/docs/overview/comparison#litellm"],
  // 2026-09 task-language rename: Router → Configuration,
  // Extensions → Customization. Router configuration became Router policy.
  ["/docs/routers", "/docs/configuration/policy"],
  ["/docs/routers/configuration", "/docs/configuration/policy"],
  ["/docs/routers/:slug+", "/docs/configuration/:slug+"],
  ["/docs/extensions", "/docs/customization/models"],
  ["/docs/extensions/:slug+", "/docs/customization/:slug+"],
  // The former Guides section is now organized around usage tasks.
  ["/docs/guides", "/docs/usage/cli"],
  ["/docs/guides/overview", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/overview/quickstart", "/docs/overview/quickstart"],
  ["/docs/guides/overview/comparison", "/docs/overview/comparison#openrouter"],
  ["/docs/guides/overview/provider", "/docs/customization/models#built-in-providers-with-your-own-key"],
  // intro page renamed (2026-07): recursive-self-improvement → what-is-bitrouter
  ["/docs/overview/recursive-self-improvement", "/docs/overview/what-is-bitrouter"],
  // overview/get-started split + features→models-and-routing (2026-07 reorg)
  ["/docs/get-started/introduction", "/docs/overview/what-is-bitrouter"],
  ["/docs/get-started/supported-models", "/docs/overview/supported-models"],
  ["/docs/get-started/supported-providers", "/docs/overview/supported-models"],
  ["/docs/features/provider-selection", "/docs/configuration/models#candidate-eligibility"],
  ["/docs/features/model-fallback", "/docs/configuration/models#fallback-chains"],
  ["/docs/features/model-variants", "/docs/configuration/models#variants"],
  ["/docs/features/presets", "/docs/configuration/models#presets"],
  ["/docs/features/structured-outputs", "/docs/configuration/models#protocol-compatibility"],
  ["/docs/features/byok", "/docs/customization/models#built-in-providers-with-your-own-key"],
  // concepts/ section dissolved (2026-07 reorg) → pages land next to their features
  ["/docs/concepts", "/docs/overview/what-is-bitrouter"],
  ["/docs/concepts/models", "/docs/overview/supported-models#how-model-ids-work"],
  ["/docs/concepts/policy", "/docs/usage/bitrouter-auto#let-evidence-improve-the-policy"],
  ["/docs/concepts/tools", "/docs/usage/mcp"],
  ["/docs/concepts/agents", "/docs/usage/acp"],
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
  ["/docs/get-started/comparison", "/docs/overview/comparison#openrouter"],
  ["/docs/get-started/set-up-routing", "/docs/configuration/models#candidate-eligibility"],
  ["/docs/get-started/set-up-tracing", "/docs/configuration/telemetry#self-hosted-opentelemetry"],
  ["/docs/get-started/set-up-evaling", "/docs/configuration/evaluations"],
  ["/docs/get-started/set-up-looping", "/docs/usage/bitrouter-auto#let-evidence-improve-the-policy"],
  // infrastructure → bitrouter cloud (folder renamed; pages merged/moved)
  ["/docs/infrastructure/managed-provider", "/docs/overview/supported-models"],
  ["/docs/infrastructure/discounted-models", "/docs/overview/supported-models"],
  ["/docs/infrastructure/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/infrastructure/workspaces", "/docs/reference/management/listNamespaces"],
  ["/docs/infrastructure/for-providers", "/docs/customization/models#built-in-providers-with-your-own-key"],
  // cloud/ section dissolved (2026-06 reorg) → new homes (preserve old links)
  ["/docs/cloud", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/overview", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/get-started", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/byok", "/docs/customization/models#built-in-providers-with-your-own-key"],
  ["/docs/cloud/tracing", "/docs/configuration/telemetry#cloud-activity"],
  ["/docs/cloud/managed-models", "/docs/overview/supported-models"],
  ["/docs/cloud/workspaces", "/docs/reference/management/listNamespaces"],
  ["/docs/cloud/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  // CLI + MCP left the API Reference tab for Documentation → Usage (2026-08).
  // These must stay above the /docs/reference wildcards below.
  ["/docs/reference/cli", "/docs/usage/cli"],
  ["/docs/reference/cli/:slug*", "/docs/usage/cli/:slug*"],
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
  ["/docs/usage/cli/tools", "/docs/usage/cli#agents-acp-and-mcp"],
  ["/docs/usage/cli/skills", "/docs/usage/cli#skills"],
  ["/docs/usage/cli/harnesses", "/docs/usage/cli#coding-agents"],
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
  // Changelog is a standalone top-level section using the native Fumadocs
  // notebook layout; these aliases preserve its established canonical route.
  ["/docs/changelog/:slug*", "/changelog/:slug*"],
  ["/docs/changelog", "/changelog"],
  // moved/removed pages (2026-06 refactor) → live destinations
  ["/docs/features/observability", "/docs/configuration/telemetry"],
  ["/docs/features/tracing", "/docs/configuration/telemetry#cloud-activity"],
  ["/docs/features/telemetry", "/docs/configuration/telemetry"],
  // observability & evaluation split out of features/ (2026-08); the single
  // opentelemetry page was two pages welded together — OSS export vs hosted view
  ["/docs/features/opentelemetry", "/docs/configuration/telemetry#self-hosted-opentelemetry"],
  ["/docs/features/local-models", "/docs/usage/model-sources/local-inference"],
  ["/docs/features/toolsets", "/docs/customization/tools/server-tools"],
  ["/docs/guides/export-telemetry", "/docs/configuration/telemetry#self-hosted-opentelemetry"],
  ["/docs/cloud/managed-tools", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/managed-agents", "/docs/overview/quickstart#self-host-or-cloud"],
  // integrations + cookbook history → usage.
  // `:slug+` (one or more), NOT `:slug*` — with `*` this rule also matched the
  // bare /docs/integrations/harnesses and bounced it to the index, shadowing
  // the Harnesses overview page itself. Keep the wildcard narrow so the
  // Coding agents overview remains addressable.
  ["/docs/integrations/harnesses/:slug+", "/docs/usage/coding-agents/:slug+"],
  ["/docs/cookbook/integration/:slug*", "/docs/usage/coding-agents/:slug*"],
  // the local-models page was unpublished; the model catalog absorbed it
  ["/docs/cookbook/local-models", "/docs/usage/model-sources/local-inference"],
  ["/docs/integrations/local-models", "/docs/usage/model-sources/local-inference"],
  ["/docs/cookbook", "/docs/usage/coding-agents"],
  // Migration walkthroughs now live on the relevant comparison pages.
  ["/docs/integrations/migrate/litellm", "/docs/overview/comparison#migrate-from-litellm"],
  ["/docs/integrations/migrate/openrouter", "/docs/overview/comparison#migrate-from-openrouter"],
  ["/docs/cookbook/migration/litellm", "/docs/overview/comparison#migrate-from-litellm"],
  ["/docs/cookbook/migration/openrouter", "/docs/overview/comparison#migrate-from-openrouter"],
  // Earlier router-section names now resolve into Router or Extensions.
  ["/docs/models-and-routing/presets", "/docs/configuration/models#presets"],
  ["/docs/models-and-routing/byok", "/docs/customization/models#built-in-providers-with-your-own-key"],
  ["/docs/models-and-routing", "/docs/configuration/models#candidate-eligibility"],
  // gateway-and-routing/ split (2026-09): the routing pages went back to
  // models-and-routing/, the tool-calling pages to what became
  // models-and-routing/tool-calling/ (see the section dissolve below).
  ["/docs/gateway-and-routing/model-fallback", "/docs/configuration/models#fallback-chains"],
  ["/docs/gateway-and-routing/provider-selection", "/docs/configuration/models#candidate-eligibility"],
  ["/docs/gateway-and-routing/virtual-model", "/docs/configuration/models#presets"],
  ["/docs/gateway-and-routing/model-variants", "/docs/configuration/models#variants"],
  ["/docs/gateway-and-routing/bring-your-own-model", "/docs/customization/models#custom-endpoints-and-models"],
  ["/docs/gateway-and-routing/bring-your-own-provider", "/docs/customization/models#built-in-providers-with-your-own-key"],
  ["/docs/gateway-and-routing/structured-outputs", "/docs/configuration/models#protocol-compatibility"],
  ["/docs/gateway-and-routing/guardrails", "/docs/configuration/guardrails"],
  ["/docs/gateway-and-routing/mcp-gateway", "/docs/usage/mcp#mcp-gateway"],
  ["/docs/gateway-and-routing/server-tools", "/docs/customization/tools/server-tools"],
  ["/docs/gateway-and-routing/advisor", "/docs/customization/tools/model-backed-tools#advisor"],
  ["/docs/gateway-and-routing/subagent", "/docs/customization/tools/model-backed-tools#sub-agent"],
  ["/docs/gateway-and-routing/fusion", "/docs/customization/tools/model-backed-tools#fusion"],
  ["/docs/gateway-and-routing/websearch", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/gateway-and-routing/web-fetch", "/docs/customization/tools/web-tools#web-fetch"],
  ["/docs/gateway-and-routing/acp-gateway", "/docs/usage/acp"],
  ["/docs/gateway-and-routing", "/docs/configuration/models#candidate-eligibility"],
  // mcp-and-tool-calling/ dissolved: tools live under Extensions, while the
  // The MCP gateway and local ACP adapter are usage tasks.
  // The section index has no page of its own, and `:slug*` matches zero
  // segments too — so the bare path has to be claimed before the wildcard.
  ["/docs/mcp-and-tool-calling", "/docs/customization/tools/server-tools"],
  ["/docs/mcp-and-tool-calling/mcp-gateway", "/docs/usage/mcp#mcp-gateway"],
  ["/docs/mcp-and-tool-calling/acp-gateway", "/docs/usage/acp"],
  ["/docs/mcp-and-tool-calling/:slug*", "/docs/customization/tools/:slug*"],
  // evals-and-tracing/ split into objective evidence and operational telemetry.
  ["/docs/evals-and-tracing", "/docs/configuration/telemetry"],
  ["/docs/evals-and-tracing/evaluation", "/docs/configuration/evaluations"],
  ["/docs/evals-and-tracing/evaluations", "/docs/configuration/evaluations"],
  ["/docs/evals-and-tracing/evals", "/docs/configuration/evaluations"],
  ["/docs/evals-and-tracing/:slug*", "/docs/configuration/telemetry"],
  // agent and tool protocol history → Usage and Extensions.
  ["/docs/models-and-routing/acp-gateway", "/docs/usage/acp"],
  // Tool pages keep their filenames, so one wildcard covers them.
  ["/docs/models-and-routing/tool-calling", "/docs/customization/tools/server-tools"],
  ["/docs/models-and-routing/tool-calling/:slug*", "/docs/customization/tools/:slug*"],
  ["/docs/agents-and-orchestration", "/docs/usage/coding-agents"],
  // Retired guide slugs resolve to the current task pages.
  ["/docs/guides/cloud-api", "/docs/usage/cli"],
  ["/docs/guides/build-a-plugin", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/register-as-a-provider", "/docs/customization/models#built-in-providers-with-your-own-key"],
  // observability/ → Router telemetry
  ["/docs/observability/:slug*", "/docs/configuration/telemetry"],
  // tools/agents pages retitled to name their protocol; features/ dissolved —
  // guardrails moved, namespaces and payment retired (2026-08)
  ["/docs/gateway-and-routing/tools", "/docs/usage/mcp"],
  ["/docs/gateway-and-routing/agents", "/docs/usage/acp"],
  ["/docs/features", "/docs/configuration/guardrails"],
  ["/docs/features/guardrails", "/docs/configuration/guardrails"],
  ["/docs/features/namespaces", "/docs/reference/management/listNamespaces"],
  ["/docs/features/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/features/tools", "/docs/usage/mcp"],
  ["/docs/features/server-tools", "/docs/customization/tools/server-tools"],
  ["/docs/features/websearch", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/features/web-fetch", "/docs/customization/tools/web-tools#web-fetch"],
  ["/docs/features/agents", "/docs/usage/acp"],
  ["/docs/features/subagent", "/docs/customization/tools/model-backed-tools#sub-agent"],
  ["/docs/features/advisor", "/docs/customization/tools/model-backed-tools#advisor"],
  ["/docs/features/fusion", "/docs/customization/tools/model-backed-tools#fusion"],
  // pages retired (2026-08): the provider directory and the models concept page
  // folded into the model catalog, policy semantics into bitrouter/auto, and the
  // search-provider integrations into the web search feature page.
  ["/docs/overview/supported-providers", "/docs/overview/supported-models"],
  ["/docs/gateway-and-routing/models", "/docs/overview/supported-models#how-model-ids-work"],
  ["/docs/gateway-and-routing/policy", "/docs/usage/bitrouter-auto#let-evidence-improve-the-policy"],
  ["/docs/integrations/tools", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/integrations/exa", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/integrations/parallel", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/integrations/firecrawl", "/docs/customization/tools/web-tools#web-search"],
  ["/docs/integrations/tavily", "/docs/customization/tools/web-tools#web-search"],
  // gateway pages renamed for what they are, not what the field is called
  // (2026-08): presets → virtual model, external providers (BYOK) → bring your
  // own provider. The API keeps `routing-presets` and `byok`; the docs don't.
  ["/docs/gateway-and-routing/presets", "/docs/configuration/models#presets"],
  ["/docs/gateway-and-routing/byok", "/docs/customization/models#built-in-providers-with-your-own-key"],
  // the OpenRouter page was unpublished (2026-08); the aggregator provider block
  // it documented is the worked example on the model-sources page. The
  // migrate-from-openrouter guide is unaffected.
  ["/docs/integrations/openrouter", "/docs/usage/coding-agents#model-sources"],
  // Self-hosting became its own tab (2026-08). The single `guides/self-host`
  // page was split across the new section: config → production-config, daemon
  // → run-as-a-service, telemetry → operations, hardening → hardening. Its old
  // `#1-…`/`#5-…` anchors can't be redirected (fragments never reach the
  // server), so the index page links out to all four.
  ["/docs/guides/self-host", "/docs/self-hosting"],
  ["/docs/self-host", "/docs/self-hosting"],
);
// Legacy /zh docs URLs are not twinned here: the catch-all `/zh/docs/:path*`
// rule at the end of redirects() folds them to the English path, which then
// takes its own 301 to the final destination. One extra hop, on a dead locale.
const docsRedirects = pairs.map(([source, destination]) => ({
  source,
  destination,
  permanent: true,
}));

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  transpilePackages: ["@wterm/core", "@wterm/dom", "@wterm/react"],
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
      // /about, /open and /startup were retired (2026-09). Nothing replaced the
      // company surface, so every alias folds to the homepage.
      { source: "/about", destination: "/", permanent: true },
      { source: "/zh/about", destination: "/", permanent: true },
      { source: "/open", destination: "/", permanent: true },
      { source: "/zh/open", destination: "/", permanent: true },
      { source: "/careers", destination: "/", permanent: true },
      { source: "/zh/careers", destination: "/", permanent: true },
      { source: "/startup", destination: "/", permanent: true },
      { source: "/zh/startup", destination: "/", permanent: true },
      // The standalone enterprise offer was retired before it became a distinct
      // product. Team conversations now start from the honest pricing surface.
      { source: "/enterprise", destination: "/pricing#teams", permanent: true },
      { source: "/zh/enterprise", destination: "/pricing#teams", permanent: true },
      { source: "/zh/blog", destination: "/blog", permanent: true },
      { source: "/zh/blog/:slug", destination: "/blog/:slug", permanent: true },

      // ── Per-harness marketing routes retired (2026-08) ──
      // /claude-code, /codex, … were IntegrationStub placeholders ("setup guide
      // pending") with no unique content, so they land on the real setup guide.
      // /openclaw and /hermes-agent land on the harnesses overview instead:
      // their integration pages were retired in 2026-08 (see below), so there
      // is no per-harness doc left to point them at.
      { source: "/claude-code", destination: "/docs/usage/coding-agents#claude-code", permanent: true },
      { source: "/codex", destination: "/docs/usage/coding-agents#codex", permanent: true },
      { source: "/opencode", destination: "/docs/usage/coding-agents", permanent: true },
      { source: "/openclaw", destination: "/docs/usage/coding-agents", permanent: true },
      { source: "/hermes-agent", destination: "/docs/usage/coding-agents", permanent: true },
      { source: "/zh/claude-code", destination: "/docs/usage/coding-agents#claude-code", permanent: true },
      { source: "/zh/codex", destination: "/docs/usage/coding-agents#codex", permanent: true },
      { source: "/zh/opencode", destination: "/docs/usage/coding-agents", permanent: true },
      { source: "/zh/openclaw", destination: "/docs/usage/coding-agents", permanent: true },
      { source: "/zh/hermes-agent", destination: "/docs/usage/coding-agents", permanent: true },

      // ── OpenClaw / Hermes integration pages retired (2026-08) ──
      { source: "/docs/integrations/openclaw", destination: "/docs/usage/coding-agents", permanent: true },
      { source: "/docs/integrations/hermes", destination: "/docs/usage/coding-agents", permanent: true },

      // ── Integrations URL history → Usage ──
      { source: "/docs/integrations/models", destination: "/docs/usage/coding-agents#model-sources", permanent: true },
      { source: "/docs/integrations/claude-subscription", destination: "/docs/usage/coding-agents#use-a-claude-subscription", permanent: true },
      { source: "/docs/integrations/codex-subscription", destination: "/docs/usage/coding-agents#use-a-codex-subscription", permanent: true },
      { source: "/docs/integrations/ollama", destination: "/docs/usage/model-sources/local-inference", permanent: true },
      { source: "/docs/integrations/vllm", destination: "/docs/usage/model-sources/local-inference", permanent: true },
      { source: "/docs/integrations/unsloth", destination: "/docs/usage/model-sources/local-inference", permanent: true },

      // ── /compare article retired; comparisons live in docs → overview (2026-07) ──
      { source: "/compare/bitrouter-vs-openrouter", destination: "/docs/overview/comparison#openrouter", permanent: true },
      { source: "/compare/bitrouter-vs-litellm", destination: "/docs/overview/comparison#litellm", permanent: true },
      { source: "/compare/bitrouter-vs-portkey", destination: "/docs/overview/comparison#openrouter", permanent: true },
      { source: "/compare", destination: "/docs/overview/comparison#openrouter", permanent: true },
      { source: "/zh/compare/:slug*", destination: "/docs/overview/comparison#openrouter", permanent: true },

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
