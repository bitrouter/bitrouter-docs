import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import { readdirSync } from "node:fs";

// page slug → final nested path
const finalPath = {
  // get-started (dissolved 2026-08 → overview/quickstart)
  installation: "/docs/overview/quickstart", quickstart: "/docs/overview/quickstart",
  comparison: "/docs/overview/comparison/openrouter", "self-host-vs-cloud": "/docs/overview/quickstart#self-host-or-cloud",
  // models & routing
  "provider-selection":"/docs/routing/strategies#candidate-eligibility","model-fallback":"/docs/models-routing/model-fallback#fallback-chains",
  "model-variants":"/docs/routing/strategies#variants","presets":"/docs/models-routing/virtual-models#presets",
  "structured-outputs":"/docs/models-routing/virtual-models#protocol-compatibility","byok":"/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key",
  "local-models":"/docs/models-routing/local-models","guardrails":"/docs/routing/configuration#create-a-configuration",
  "observability":"/docs/cli/request-receipts","opentelemetry":"/docs/self-hosting#opentelemetry",
  "tracing":"/docs/cli/request-receipts#cloud-activity","telemetry":"/docs/cli/request-receipts",
  "evaluation":"/docs/routing/auditable-policies#evaluations","evaluations":"/docs/routing/auditable-policies#evaluations",
  "mcp":"/docs/context-routing/mcp-servers","acp":"/docs/context-routing/acp-servers",
  "agentskills":"/docs/context-routing/skills",
  // bitrouter cloud (was: infrastructure)
  "managed-provider":"/docs/overview/supported-models","discounted-models":"/docs/overview/supported-models",
  "payment":"/docs/overview/quickstart#self-host-or-cloud","workspaces":"/docs/reference/management/listNamespaces",
  "for-providers":"/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key",
  // usage (CLI + MCP moved out of reference/ into the Documentation tab, 2026-08)
  "cli":"/docs/usage/cli",
};
const legacyBuckets = ["core","cloud","features","routing"]; // /docs/guides/<bucket>/<slug>
const pairs: Array<[string, string]> = [];
for (const [slug, dest] of Object.entries(finalPath)) {
  pairs.push(["/docs/" + slug, dest]);                          // current flat form
  for (const b of legacyBuckets) pairs.push(["/docs/guides/" + b + "/" + slug, dest]); // production+branch buckets
}
// Exact release redirects leave the established RSS/Atom endpoints reachable.
for (const file of readdirSync("content/changelog")) {
  if (!file.endsWith(".mdx")) continue;
  const slug = file.replace(/\.mdx$/, "");
  pairs.push([`/changelog/${slug}`, `/docs/changelog#${slug}`]);
  pairs.push([`/docs/changelog/${slug}`, `/docs/changelog#${slug}`]);
}
// overview + root + special
pairs.push(
  // Overview consolidates the former market placeholders into Flex Inference.
  ["/docs/overview/inference-flex-market", "/docs/overview/flex-inference"],
  ["/docs/overview/inference-spot", "/docs/overview/flex-inference"],
  ["/docs/overview/inference-forwards", "/docs/overview/flex-inference"],
  // Guides include their references; legal policies use the documentation layout.
  ["/docs/cli/reference", "/docs/usage/cli"],
  ["/docs/configuration-reference", "/docs/routing/configuration"],
  ["/docs/data-handling", "/docs/privacy-policy"],
  ["/privacy-policy", "/docs/privacy-policy"],
  ["/terms-of-service", "/docs/terms-of-service"],
  // Router separates auto policy workflows from reusable routing rules.
  ["/docs/routing/routing-rules", "/docs/routing/strategies"],
  ["/docs/routing/model-routing", "/docs/routing/strategies"],
  ["/docs/models-routing/model-variants", "/docs/routing/strategies#variants"],
  // Model owns source connections; Market owns buying and selling inference.
  ["/docs/providers/byok-subscriptions", "/docs/models-routing/byok-subscriptions"],
  ["/docs/providers/local-models", "/docs/models-routing/local-models"],
  ["/docs/models-routing/buy-inference", "/docs/market/buy-inference"],
  ["/docs/providers/sell-inference", "/docs/market/sell-inference"],
  ["/docs/providers/custom-provider", "/docs/models-routing/byok-subscriptions#custom-endpoints-and-models"],
  // Retired public email signup and confirmation pages.
  ["/newsletter", "/"],
  ["/newsletter/confirm", "/"],
  ["/newsletter/confirmed", "/"],
  // Usage guides and single-page references (2026-10).
  ["/docs/cli/orchestrator", "/docs/usage/cli"],
  ["/docs/cli/tui", "/docs/usage/cli"],
  ["/docs/cli/headless", "/docs/usage/cli"],
  ["/docs/api/responses", "/docs/usage/responses-api"],
  ["/docs/api/decisions", "/docs/reference/decisions"],
  ["/docs/api/chat-completions-messages", "/docs/reference/chat-completions-messages"],
  ["/docs/cli/reference/daemon", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/init", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/route", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/providers", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/policy", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/cloud", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/tools", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/skills", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/harnesses", "/docs/usage/cli#command-reference"],
  ["/docs/cli/reference/misc", "/docs/usage/cli#command-reference"],
  // Comparison is a folder only; its retired index opens the first comparison.
  ["/docs/overview/comparison", "/docs/overview/comparison/openrouter"],
  ["/compare/bitrouter-vs-openrouter", "/docs/overview/comparison/openrouter"],
  ["/compare/bitrouter-vs-litellm", "/docs/overview/comparison/litellm"],
  ["/compare/bitrouter-vs-portkey", "/docs/overview/comparison/openrouter"],
  ["/compare", "/docs/overview/comparison/openrouter"],
  ["/zh/compare/:slug*", "/docs/overview/comparison/openrouter"],
  // Routing guides consolidated into configuration, mechanisms, and strategies.
  ["/docs/routing/inference-pool", "/docs/routing/strategies"],
  ["/docs/routing/policy", "/docs/routing/auditable-policies"],
  ["/docs/routing/evaluations", "/docs/routing/auditable-policies#evaluations"],
  // Routing decisions have their own section.
  ["/docs/models-routing/policy", "/docs/routing/auditable-policies"],
  ["/docs/models-routing/evaluations", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/context-routing/context-switch", "/docs/routing/context-routing"],
  // Model resources and routing decisions now have separate ownership.
  ["/docs/models-routing/inference-pool", "/docs/routing/strategies"],
  // Config retired; model guides now follow inference resource tasks.
  ["/docs/config/configuration-file", "/docs/routing/configuration"],
  ["/docs/config/providers", "/docs/models-routing/byok-subscriptions"],
  ["/docs/config/model-routes", "/docs/models-routing/virtual-models"],
  ["/docs/config/mcp-connections", "/docs/context-routing/mcp-servers"],
  ["/docs/config/server-tools", "/docs/context-routing/server-tools"],
  ["/docs/config/telemetry", "/docs/cli/request-receipts"],
  ["/docs/models-routing/models", "/docs/models-routing/virtual-models"],
  ["/docs/models-routing/bitrouter-auto", "/docs/routing/auto-router#initialize-a-policy-binding"],
  ["/docs/models-routing/local-inference", "/docs/models-routing/local-models"],
  // Context guides reorganized; retain retired canonical URLs.
  ["/docs/integration/acp-servers", "/docs/context-routing/acp-servers"],
  ["/docs/context-routing/agents-md", "/docs/context-routing/server-tools"],
  // Model discovery and prices share one page; individual model URLs remain.
  ["/models", "/pricing#models"],
  ["/docs/api", "/docs/usage/responses-api"],
  // Earlier Config aliases now resolve to the task-specific guides.
  ["/docs/config", "/docs/routing/configuration"],
  ["/docs/config/guardrails", "/docs/routing/configuration#create-a-configuration"],
  ["/docs/config/telemetry-export", "/docs/cli/request-receipts"],
  ["/docs/models-routing/telemetry", "/docs/cli/request-receipts"],
  ["/docs/cli/configuration", "/docs/routing/configuration"],
  ["/docs/models-routing/providers", "/docs/models-routing/byok-subscriptions"],
  ["/docs/models-routing/guardrails", "/docs/routing/configuration#create-a-configuration"],
  // Development section retired; retain entry points to related product guides.
  ["/docs/development", "/docs/overview/what-is-bitrouter"],
  ["/docs/development/mcp", "/docs/context-routing/mcp-servers"],
  ["/docs/development/agent-skills", "/docs/context-routing/skills"],
  ["/docs/cli/telemetry", "/docs/cli/request-receipts"],
  ["/docs/cli/permissions", "/docs/context-routing/acp-servers#headless-permissions"],
  // Documentation reorganized around models, context, and CLI (2026-10).
  ["/docs/usage/bitrouter-auto", "/docs/routing/auto-router#initialize-a-policy-binding"],
  ["/docs/customization/models", "/docs/models-routing/byok-subscriptions"],
  ["/docs/configuration/models", "/docs/models-routing/virtual-models"],
  ["/docs/configuration/guardrails", "/docs/routing/configuration#create-a-configuration"],
  ["/docs/configuration/evaluations", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/configuration/policy", "/docs/routing/configuration"],
  ["/docs/configuration/telemetry", "/docs/cli/request-receipts"],
  ["/docs/usage/tui", "/docs/usage/cli#interactive-tui"],
  ["/docs/usage/skills", "/docs/context-routing/skills"],
  ["/docs/usage/coding-agents", "/docs/integration/coding-agents"],
  ["/docs/usage/model-sources/local-inference", "/docs/models-routing/local-models"],
  ["/docs/usage/agent", "/docs/cli/agent"],
  ["/docs/customization/tools/server-tools", "/docs/context-routing/server-tools"],
  ["/docs/customization/tools/model-backed-tools", "/docs/overview/what-is-bitrouter"],
  ["/docs/customization/tools/web-tools", "/docs/overview/what-is-bitrouter"],
  ["/docs/customization/tools", "/docs/overview/what-is-bitrouter"],
  ["/docs", "/docs/overview/what-is-bitrouter"],
  ["/docs/enterprise", "/enterprise"],
  // Section overview pages retired in 2026-09. Each section now starts with
  // its first concrete task page.
  ["/docs/usage", "/docs/usage/desktop"],
  ["/docs/configuration", "/docs/routing/configuration"],
  ["/docs/customization", "/docs/models-routing/byok-subscriptions"],
  // Claude Code, Codex, and model-source guidance now live on one Coding
  // agents page. Preserve the former canonical URLs at stable anchors.
  ["/docs/usage/coding-agents/claude-code", "/docs/integration/coding-agents#claude-code"],
  ["/docs/usage/coding-agents/codex", "/docs/integration/coding-agents#codex"],
  ["/docs/usage/model-sources", "/docs/integration/coding-agents#model-sources"],
  // 2026-09 information-architecture cleanup. The command remains `bro code`;
  // TUI is the user-facing documentation name.
  ["/docs/usage/code", "/docs/usage/cli#interactive-tui"],
  ["/docs/usage/protocols", "/docs/usage/cli#init-and-config"],
  ["/docs/usage/mcp-gateway", "/docs/context-routing/mcp-servers#mcp-gateway"],
  ["/docs/usage/model-sources/claude-subscription", "/docs/integration/coding-agents#use-a-claude-subscription"],
  ["/docs/usage/model-sources/codex-subscription", "/docs/integration/coding-agents#use-a-codex-subscription"],
  ["/docs/usage/migrate", "/docs/overview/comparison/openrouter"],
  ["/docs/usage/migrate/litellm", "/docs/overview/comparison/litellm#migrate-from-litellm"],
  ["/docs/usage/migrate/openrouter", "/docs/overview/comparison/openrouter#migrate-from-openrouter"],
  ["/docs/usage/migrate/tensorzero", "/docs/overview/comparison/openrouter"],
  // ACP integration guide moved from Usage (2026-10).
  ["/docs/usage/acp", "/docs/context-routing/acp-servers"],
  ["/docs/usage/acp-gateway", "/docs/context-routing/acp-servers"],
  // Product-specific recipes collapsed into maintained task pages (2026-09).
  ["/docs/usage/coding-agents/opencode", "/docs/integration/coding-agents"],
  ["/docs/usage/coding-agents/pi", "/docs/integration/coding-agents"],
  ["/docs/usage/coding-agents/deepseek-harness", "/docs/integration/coding-agents#other-harnesses"],
  ["/docs/usage/model-sources/ollama", "/docs/models-routing/local-models"],
  ["/docs/usage/model-sources/vllm", "/docs/models-routing/local-models"],
  ["/docs/usage/model-sources/unsloth", "/docs/models-routing/local-models"],
  // Configuration details collapsed into maintained task pages (2026-09).
  ["/docs/configuration/config-file", "/docs/routing/configuration"],
  ["/docs/configuration/routing", "/docs/models-routing/virtual-models"],
  ["/docs/usage/structured-outputs", "/docs/models-routing/virtual-models#protocol-compatibility"],
  ["/docs/configuration/structured-outputs", "/docs/models-routing/virtual-models#protocol-compatibility"],
  ["/docs/configuration/provider-selection", "/docs/routing/strategies#candidate-eligibility"],
  ["/docs/configuration/model-fallback", "/docs/models-routing/model-fallback#fallback-chains"],
  ["/docs/configuration/virtual-model", "/docs/models-routing/virtual-models#define-a-virtual-model"],
  ["/docs/configuration/model-variants", "/docs/routing/strategies#variants"],
  // Observability was split into the narrower Telemetry and Evaluations pages.
  ["/docs/configuration/observability", "/docs/cli/request-receipts"],
  ["/docs/configuration/observability/opentelemetry", "/docs/self-hosting#opentelemetry"],
  ["/docs/configuration/observability/tracing", "/docs/cli/request-receipts#cloud-activity"],
  ["/docs/configuration/observability/evaluation", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/configuration/observability/:slug*", "/docs/cli/request-receipts"],
  // Customization recipes collapsed around capability families (2026-09).
  ["/docs/customization/models/bring-your-own-model", "/docs/models-routing/byok-subscriptions#custom-endpoints-and-models"],
  ["/docs/customization/models/bring-your-own-provider", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  ["/docs/customization/tools/advisor", "/docs/overview/what-is-bitrouter"],
  ["/docs/customization/tools/subagent", "/docs/overview/what-is-bitrouter"],
  ["/docs/customization/tools/fusion", "/docs/overview/what-is-bitrouter"],
  ["/docs/customization/tools/websearch", "/docs/overview/what-is-bitrouter"],
  ["/docs/customization/tools/web-fetch", "/docs/overview/what-is-bitrouter"],
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
  ["/docs/overview/comparisons", "/docs/overview/comparison/openrouter"],
  ["/docs/overview/comparisons/openrouter", "/docs/overview/comparison/openrouter"],
  ["/docs/overview/comparisons/litellm", "/docs/overview/comparison/litellm"],
  // 2026-09 task-language rename: Router → Configuration,
  // Extensions → Customization. Router configuration became Router policy.
  ["/docs/routers", "/docs/routing/configuration"],
  ["/docs/routers/configuration", "/docs/routing/configuration"],
  ["/docs/routers/:slug+", "/docs/configuration/:slug+"],
  ["/docs/extensions", "/docs/models-routing/byok-subscriptions"],
  ["/docs/extensions/:slug+", "/docs/customization/:slug+"],
  // The former Guides section is now organized around usage tasks.
  ["/docs/guides", "/docs/usage/cli#init-and-config"],
  ["/docs/guides/overview", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/overview/quickstart", "/docs/overview/quickstart"],
  ["/docs/guides/overview/comparison", "/docs/overview/comparison/openrouter"],
  ["/docs/guides/overview/provider", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  // intro page renamed (2026-07): recursive-self-improvement → what-is-bitrouter
  ["/docs/overview/recursive-self-improvement", "/docs/overview/what-is-bitrouter"],
  // overview/get-started split + features→models-and-routing (2026-07 reorg)
  ["/docs/get-started/introduction", "/docs/overview/what-is-bitrouter"],
  ["/docs/get-started/supported-models", "/docs/overview/supported-models"],
  ["/docs/get-started/supported-providers", "/docs/overview/supported-models"],
  ["/docs/features/provider-selection", "/docs/routing/strategies#candidate-eligibility"],
  ["/docs/features/model-fallback", "/docs/models-routing/model-fallback#fallback-chains"],
  ["/docs/features/model-variants", "/docs/routing/strategies#variants"],
  ["/docs/features/presets", "/docs/models-routing/virtual-models#presets"],
  ["/docs/features/structured-outputs", "/docs/models-routing/virtual-models#protocol-compatibility"],
  ["/docs/features/byok", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  // concepts/ section dissolved (2026-07 reorg) → pages land next to their features
  ["/docs/concepts", "/docs/overview/what-is-bitrouter"],
  ["/docs/concepts/models", "/docs/overview/supported-models#how-model-ids-work"],
  ["/docs/concepts/policy", "/docs/routing/auto-router#initialize-a-policy-binding"],
  ["/docs/concepts/tools", "/docs/context-routing/mcp-servers"],
  ["/docs/concepts/agents", "/docs/context-routing/acp-servers"],
  ["/docs/concepts/cli", "/docs/usage/cli#init-and-config"],
  ["/docs/concepts/mcp", "/docs/context-routing/mcp-servers"],
  ["/docs/concepts/agent-skill", "/docs/overview/quickstart"],
  // get-started consolidation (2026-07): onboarding merge, FAQs dissolved, cli/mcp → reference
  ["/docs/get-started/configuration", "/docs/overview/quickstart"],
  ["/docs/get-started/wizard", "/docs/overview/quickstart"],
  ["/docs/get-started/agent-skill", "/docs/overview/quickstart"],
  ["/docs/get-started/faqs", "/docs/overview/quickstart"],
  ["/docs/get-started/cli", "/docs/usage/cli#init-and-config"],
  ["/docs/get-started/mcp", "/docs/context-routing/mcp-servers"],
  // get-started/ section dissolved (2026-08): onboarding → overview/quickstart,
  // the four set-up-* walkthroughs → the quickstart or the page that owns each topic
  ["/docs/get-started", "/docs/overview/quickstart"],
  ["/docs/get-started/onboarding", "/docs/overview/quickstart"],
  // slugs llms.txt advertised under get-started/ that never had a page there
  ["/docs/get-started/quickstart", "/docs/overview/quickstart"],
  ["/docs/get-started/installation", "/docs/overview/quickstart"],
  ["/docs/get-started/comparison", "/docs/overview/comparison/openrouter"],
  ["/docs/get-started/set-up-routing", "/docs/models-routing/virtual-models#resolution-order"],
  ["/docs/get-started/set-up-tracing", "/docs/self-hosting#opentelemetry"],
  ["/docs/get-started/set-up-evaling", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/get-started/set-up-looping", "/docs/routing/auto-router#initialize-a-policy-binding"],
  // infrastructure → bitrouter cloud (folder renamed; pages merged/moved)
  ["/docs/infrastructure/managed-provider", "/docs/overview/supported-models"],
  ["/docs/infrastructure/discounted-models", "/docs/overview/supported-models"],
  ["/docs/infrastructure/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/infrastructure/workspaces", "/docs/reference/management/listNamespaces"],
  ["/docs/infrastructure/for-providers", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  // cloud/ section dissolved (2026-06 reorg) → new homes (preserve old links)
  ["/docs/cloud", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/overview", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/get-started", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/cloud/byok", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  ["/docs/cloud/tracing", "/docs/cli/request-receipts#cloud-activity"],
  ["/docs/cloud/managed-models", "/docs/overview/supported-models"],
  ["/docs/cloud/workspaces", "/docs/reference/management/listNamespaces"],
  ["/docs/cloud/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  // CLI + MCP left the API Reference tab for Documentation → Usage (2026-08).
  // These must stay above the /docs/reference wildcards below.
  ["/docs/reference/cli", "/docs/usage/cli#init-and-config"],
  ["/docs/reference/cli/:slug*", "/docs/usage/cli/:slug*"],
  ["/docs/reference/mcp", "/docs/context-routing/mcp-servers"],
  // The CLI reference collapsed from ten pages into one (2026-08). Each retired
  // page lands on its `##` section anchor — keep these in sync with the section
  // titles in cli-overlays/<group>.md, which is where the anchors come from.
  ["/docs/usage/cli/index", "/docs/usage/cli#init-and-config"],
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
  ["/docs/ai-resources", "/docs/context-routing/skills"],
  ["/docs/ai-resources/skills", "/docs/context-routing/skills"],
  ["/docs/ai-resources/mcp", "/docs/context-routing/mcp-servers"],
  ["/docs/ai-resources/llms-txt", "/docs/context-routing/mcp-servers"],
  // reference wildcards (api-reference unwrapped into /docs/reference)
  ["/docs/api-reference/:slug*", "/docs/reference/:slug*"],
  ["/docs/reference/api-reference/:slug*", "/docs/reference/:slug*"],
  // Changelog release permalinks now resolve to anchors on the docs page.
  ["/changelog", "/docs/changelog"],
  // moved/removed pages (2026-06 refactor) → live destinations
  ["/docs/features/observability", "/docs/cli/request-receipts"],
  ["/docs/features/tracing", "/docs/cli/request-receipts#cloud-activity"],
  ["/docs/features/telemetry", "/docs/cli/request-receipts"],
  // observability & evaluation split out of features/ (2026-08); the single
  // opentelemetry page was two pages welded together — OSS export vs hosted view
  ["/docs/features/opentelemetry", "/docs/self-hosting#opentelemetry"],
  ["/docs/features/local-models", "/docs/models-routing/local-models"],
  ["/docs/features/toolsets", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/export-telemetry", "/docs/self-hosting#opentelemetry"],
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
  ["/docs/cookbook/local-models", "/docs/models-routing/local-models"],
  ["/docs/integrations/local-models", "/docs/models-routing/local-models"],
  ["/docs/cookbook", "/docs/integration/coding-agents"],
  // Migration walkthroughs now live on the relevant comparison pages.
  ["/docs/integrations/migrate/litellm", "/docs/overview/comparison/litellm#migrate-from-litellm"],
  ["/docs/integrations/migrate/openrouter", "/docs/overview/comparison/openrouter#migrate-from-openrouter"],
  ["/docs/cookbook/migration/litellm", "/docs/overview/comparison/litellm#migrate-from-litellm"],
  ["/docs/cookbook/migration/openrouter", "/docs/overview/comparison/openrouter#migrate-from-openrouter"],
  // Earlier router-section names now resolve into Router or Extensions.
  ["/docs/models-and-routing/presets", "/docs/models-routing/virtual-models#presets"],
  ["/docs/models-and-routing/byok", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  ["/docs/models-and-routing", "/docs/models-routing/virtual-models#resolution-order"],
  // gateway-and-routing/ split (2026-09): the routing pages went back to
  // models-and-routing/, the tool-calling pages to what became
  // models-and-routing/tool-calling/ (see the section dissolve below).
  ["/docs/gateway-and-routing/model-fallback", "/docs/models-routing/model-fallback#fallback-chains"],
  ["/docs/gateway-and-routing/provider-selection", "/docs/routing/strategies#candidate-eligibility"],
  ["/docs/gateway-and-routing/virtual-model", "/docs/models-routing/virtual-models#define-a-virtual-model"],
  ["/docs/gateway-and-routing/model-variants", "/docs/routing/strategies#variants"],
  ["/docs/gateway-and-routing/bring-your-own-model", "/docs/models-routing/byok-subscriptions#custom-endpoints-and-models"],
  ["/docs/gateway-and-routing/bring-your-own-provider", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  ["/docs/gateway-and-routing/structured-outputs", "/docs/models-routing/virtual-models#protocol-compatibility"],
  ["/docs/gateway-and-routing/guardrails", "/docs/routing/configuration#create-a-configuration"],
  ["/docs/gateway-and-routing/mcp-gateway", "/docs/context-routing/mcp-servers#mcp-gateway"],
  ["/docs/gateway-and-routing/server-tools", "/docs/context-routing/server-tools"],
  ["/docs/gateway-and-routing/advisor", "/docs/overview/what-is-bitrouter"],
  ["/docs/gateway-and-routing/subagent", "/docs/overview/what-is-bitrouter"],
  ["/docs/gateway-and-routing/fusion", "/docs/overview/what-is-bitrouter"],
  ["/docs/gateway-and-routing/websearch", "/docs/overview/what-is-bitrouter"],
  ["/docs/gateway-and-routing/web-fetch", "/docs/overview/what-is-bitrouter"],
  ["/docs/gateway-and-routing/acp-gateway", "/docs/context-routing/acp-servers"],
  ["/docs/gateway-and-routing", "/docs/models-routing/virtual-models#resolution-order"],
  // mcp-and-tool-calling/ dissolved: tools live under Extensions, while the
  // The MCP gateway lives in Usage; ACP servers live in Integration.
  // The section index has no page of its own, and `:slug*` matches zero
  // segments too — so the bare path has to be claimed before the wildcard.
  ["/docs/mcp-and-tool-calling", "/docs/overview/what-is-bitrouter"],
  ["/docs/mcp-and-tool-calling/mcp-gateway", "/docs/context-routing/mcp-servers#mcp-gateway"],
  ["/docs/mcp-and-tool-calling/acp-gateway", "/docs/context-routing/acp-servers"],
  ["/docs/mcp-and-tool-calling/:slug*", "/docs/customization/tools/:slug*"],
  // evals-and-tracing/ split into objective evidence and operational telemetry.
  ["/docs/evals-and-tracing", "/docs/cli/request-receipts"],
  ["/docs/evals-and-tracing/evaluation", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/evals-and-tracing/evaluations", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/evals-and-tracing/evals", "/docs/routing/auditable-policies#evaluations"],
  ["/docs/evals-and-tracing/:slug*", "/docs/cli/request-receipts"],
  // agent and tool protocol history → Usage and Extensions.
  ["/docs/models-and-routing/acp-gateway", "/docs/context-routing/acp-servers"],
  // Tool pages keep their filenames, so one wildcard covers them.
  ["/docs/models-and-routing/tool-calling", "/docs/overview/what-is-bitrouter"],
  ["/docs/models-and-routing/tool-calling/:slug*", "/docs/customization/tools/:slug*"],
  ["/docs/agents-and-orchestration", "/docs/integration/coding-agents"],
  // Retired guide slugs resolve to the current task pages.
  ["/docs/guides/cloud-api", "/docs/usage/cli#init-and-config"],
  ["/docs/guides/build-a-plugin", "/docs/overview/what-is-bitrouter"],
  ["/docs/guides/register-as-a-provider", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  // observability/ → Router telemetry
  ["/docs/observability/:slug*", "/docs/cli/request-receipts"],
  // tools/agents pages retitled to name their protocol; features/ dissolved —
  // guardrails moved, namespaces and payment retired (2026-08)
  ["/docs/gateway-and-routing/tools", "/docs/context-routing/mcp-servers"],
  ["/docs/gateway-and-routing/agents", "/docs/context-routing/acp-servers"],
  ["/docs/features", "/docs/routing/configuration#create-a-configuration"],
  ["/docs/features/guardrails", "/docs/routing/configuration#create-a-configuration"],
  ["/docs/features/namespaces", "/docs/reference/management/listNamespaces"],
  ["/docs/features/payment", "/docs/overview/quickstart#self-host-or-cloud"],
  ["/docs/features/tools", "/docs/context-routing/mcp-servers"],
  ["/docs/features/server-tools", "/docs/context-routing/server-tools"],
  ["/docs/features/websearch", "/docs/overview/what-is-bitrouter"],
  ["/docs/features/web-fetch", "/docs/overview/what-is-bitrouter"],
  ["/docs/features/agents", "/docs/context-routing/acp-servers"],
  ["/docs/features/subagent", "/docs/overview/what-is-bitrouter"],
  ["/docs/features/advisor", "/docs/overview/what-is-bitrouter"],
  ["/docs/features/fusion", "/docs/overview/what-is-bitrouter"],
  // pages retired (2026-08): the provider directory and the models concept page
  // folded into the model catalog, policy semantics into bitrouter/auto, and the
  // search-provider integrations into the web search feature page.
  ["/docs/overview/supported-providers", "/docs/overview/supported-models"],
  ["/docs/gateway-and-routing/models", "/docs/overview/supported-models#how-model-ids-work"],
  ["/docs/gateway-and-routing/policy", "/docs/routing/auto-router#initialize-a-policy-binding"],
  ["/docs/integrations/tools", "/docs/overview/what-is-bitrouter"],
  ["/docs/integrations/exa", "/docs/overview/what-is-bitrouter"],
  ["/docs/integrations/parallel", "/docs/overview/what-is-bitrouter"],
  ["/docs/integrations/firecrawl", "/docs/overview/what-is-bitrouter"],
  ["/docs/integrations/tavily", "/docs/overview/what-is-bitrouter"],
  // gateway pages renamed for what they are, not what the field is called
  // (2026-08): presets → virtual model, external providers (BYOK) → bring your
  // own provider. The API keeps `routing-presets` and `byok`; the docs don't.
  ["/docs/gateway-and-routing/presets", "/docs/models-routing/virtual-models#presets"],
  ["/docs/gateway-and-routing/byok", "/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key"],
  // the OpenRouter page was unpublished (2026-08); the aggregator provider block
  // it documented is the worked example on the model-sources page. The
  // migrate-from-openrouter guide is unaffected.
  ["/docs/integrations/openrouter", "/docs/integration/coding-agents#model-sources"],
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
const movedGuideRoutes = new Set([
  "/docs/overview/inference-flex-market",
  "/docs/overview/inference-spot",
  "/docs/overview/inference-forwards",
  "/docs/cli/reference",
  "/docs/configuration-reference",
  "/docs/data-handling",
  "/privacy-policy",
  "/terms-of-service",

  "/docs/routing/routing-rules",
  "/docs/routing/model-routing",
  "/docs/models-routing/model-variants",

  "/docs/providers/byok-subscriptions",
  "/docs/providers/local-models",
  "/docs/models-routing/buy-inference",
  "/docs/providers/sell-inference",
  "/docs/providers/custom-provider",

  "/newsletter",
  "/newsletter/confirm",
  "/newsletter/confirmed",
  "/changelog",
  "/docs/cli/orchestrator",
  "/docs/cli/tui",
  "/docs/cli/headless",
  "/docs/api/responses",
  "/docs/api/decisions",
  "/docs/api/chat-completions-messages",
  "/docs/cli/reference/daemon",
  "/docs/cli/reference/init",
  "/docs/cli/reference/route",
  "/docs/cli/reference/providers",
  "/docs/cli/reference/policy",
  "/docs/cli/reference/cloud",
  "/docs/cli/reference/tools",
  "/docs/cli/reference/skills",
  "/docs/cli/reference/harnesses",
  "/docs/cli/reference/misc",
  "/docs/cli/configuration",
  "/docs/routing/inference-pool",
  "/docs/routing/policy",
  "/docs/routing/evaluations",
  "/docs/cli/permissions",
  "/docs/models-routing/policy",
  "/docs/models-routing/evaluations",
  "/docs/context-routing/context-switch",

  "/docs/models-routing/inference-pool",
  "/docs/config/configuration-file",
  "/docs/config/providers",
  "/docs/config/model-routes",
  "/docs/config/mcp-connections",
  "/docs/config/server-tools",
  "/docs/config/telemetry",
  "/docs/context-routing/agents-md",
  "/docs/models-routing/models",
  "/docs/models-routing/bitrouter-auto",
  "/docs/models-routing/local-inference",
  "/docs/integration/acp-servers"
]);
const docsRedirects = pairs.map(([source, destination]) => ({
  source,
  destination,
  ...(source === "/models" || movedGuideRoutes.has(source) || source.startsWith("/changelog/") || source.startsWith("/docs/changelog/") || destination.startsWith("/docs/overview/comparison")
    ? { statusCode: 301 }
    : { permanent: true }),
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
      { source: "/zh/enterprise", destination: "/enterprise", permanent: true },
      { source: "/zh/blog", destination: "/blog", permanent: true },
      { source: "/zh/blog/:slug", destination: "/blog/:slug", permanent: true },

      // ── Per-harness marketing routes retired (2026-08) ──
      // /claude-code, /codex, … were IntegrationStub placeholders ("setup guide
      // pending") with no unique content, so they land on the real setup guide.
      // /openclaw and /hermes-agent land on the harnesses overview instead:
      // their integration pages were retired in 2026-08 (see below), so there
      // is no per-harness doc left to point them at.
      { source: "/claude-code", destination: "/docs/integration/coding-agents#claude-code", permanent: true },
      { source: "/codex", destination: "/docs/integration/coding-agents#codex", permanent: true },
      { source: "/opencode", destination: "/docs/integration/coding-agents", permanent: true },
      { source: "/openclaw", destination: "/docs/integration/coding-agents", permanent: true },
      { source: "/hermes-agent", destination: "/docs/integration/coding-agents", permanent: true },
      { source: "/zh/claude-code", destination: "/docs/integration/coding-agents#claude-code", permanent: true },
      { source: "/zh/codex", destination: "/docs/integration/coding-agents#codex", permanent: true },
      { source: "/zh/opencode", destination: "/docs/integration/coding-agents", permanent: true },
      { source: "/zh/openclaw", destination: "/docs/integration/coding-agents", permanent: true },
      { source: "/zh/hermes-agent", destination: "/docs/integration/coding-agents", permanent: true },

      // ── OpenClaw / Hermes integration pages retired (2026-08) ──
      { source: "/docs/integrations/openclaw", destination: "/docs/integration/coding-agents", permanent: true },
      { source: "/docs/integrations/hermes", destination: "/docs/integration/coding-agents", permanent: true },

      // ── Integrations URL history → Usage ──
      { source: "/docs/integrations/models", destination: "/docs/integration/coding-agents#model-sources", permanent: true },
      { source: "/docs/integrations/claude-subscription", destination: "/docs/integration/coding-agents#use-a-claude-subscription", permanent: true },
      { source: "/docs/integrations/codex-subscription", destination: "/docs/integration/coding-agents#use-a-codex-subscription", permanent: true },
      { source: "/docs/integrations/ollama", destination: "/docs/models-routing/local-models", permanent: true },
      { source: "/docs/integrations/vllm", destination: "/docs/models-routing/local-models", permanent: true },
      { source: "/docs/integrations/unsloth", destination: "/docs/models-routing/local-models", permanent: true },


      // ── Legal pages moved off /legal to flat top-level URLs ──
      { source: "/legal/privacy", destination: "/docs/privacy-policy", permanent: true },
      { source: "/legal/terms", destination: "/docs/terms-of-service", permanent: true },
      { source: "/zh/legal/privacy", destination: "/docs/privacy-policy", permanent: true },
      { source: "/zh/legal/terms", destination: "/docs/terms-of-service", permanent: true },
      { source: "/zh/legal", destination: "/docs/privacy-policy", permanent: true },
      { source: "/legal", destination: "/docs/privacy-policy", permanent: true },
      { source: "/zh/privacy-policy", destination: "/docs/privacy-policy", permanent: true },
      { source: "/zh/terms-of-service", destination: "/docs/terms-of-service", permanent: true },

      {
        source: "/docs/overview/privacy-policy",
        destination: "/docs/privacy-policy",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/privacy-policy",
        destination: "/docs/privacy-policy",
        permanent: true,
      },
      {
        source: "/docs/overview/terms-of-service",
        destination: "/docs/terms-of-service",
        permanent: true,
      },
      {
        source: "/zh/docs/overview/terms-of-service",
        destination: "/docs/terms-of-service",
        permanent: true,
      },

      // ── Chinese locale removed: any remaining /zh/docs/* URL folds to en ──
      { source: "/zh/docs/:path*", destination: "/docs/:path*", permanent: true },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
