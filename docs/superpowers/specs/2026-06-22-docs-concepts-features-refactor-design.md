# Docs refactor: Concepts (gateways + extending) & Features (specific capabilities)

**Date:** 2026-06-22
**Status:** Approved design — ready for implementation plan
**Scope:** Restructure the `concepts` and `features` sections of the BitRouter docs so that **Concepts documents the primitives (gateways) and the extensibility model**, while **Features documents specific, opt-in capabilities** built on top of those primitives.

---

## Problem

The docs already follow a clean hub-and-spoke pattern: each Concepts page explains a primitive (the "what/why") and links into Features for the "how-to." But the split has leaked:

- **Features mixes real features with primitive stubs.** `features/mcp`, `features/acp`, and `features/agentskills` are thin TODO stubs that just re-describe the concept pages — they are primitives, not features.
- **Concepts under-describes the primitives.** The Models page never mentions the universal LLM API (the protocol surfaces); the Tools page omits the gateway's actual aggregation behavior; there is no home for the CLI, plugin, or hook model even though they are core mental models a user needs.

## Goal

1. **Concepts = primitives**, in two sub-groups:
   - **Gateways** — Models, Tools, Agents (the things an agent routes to).
   - **Extending BitRouter** — CLI, Plugins, Hooks (how you operate and extend the router).
2. **Features = specific capabilities** only. No primitive stubs.
3. Nothing 404s: every inbound link to a moved/deleted page is repointed.

This pass delivers **all content fully written** (structure + reframed prose + net-new code-grounded pages), not stubs.

---

## Decisions (locked)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Concepts shape | Sub-grouped: **Gateways** (models/tools/agents) + **Extending BitRouter** (cli/plugins/hooks) |
| 2 | Protocol framing | **Four peer protocols, flat**: OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, Google Generative AI |
| 3 | Agent Skills | **Moves from `agents` → `tools`**, reframed as a capability gateway (peer to MCP tools), not "onboarding knowledge" |
| 4 | Agents page | **ACP leads, KYA alongside**; payment how-to stays at `cloud/payment` |
| 5 | Tools features | **Lean**: `server-tools` (Advisor/SubAgent/Fusion as sections) + `toolsets`. Aggregation is **not** a feature page |
| 6 | Tool aggregation | Lives on the **Tools concept page** (it is the gateway's defining behavior); heavy config knobs → `reference` |
| 7 | CLI/Plugin/Hook pages | **Concept = mental model, link out** to existing `reference/cli` and `guides/build-a-plugin` |
| 8 | This pass | **Full content** for all three tiers (structure + reframe + net-new) |
| 9 | Page titles | Keep short — `Models`/`Tools`/`Agents`; the **"Gateways"** group label carries the gateway framing |

---

## Target sitemap

```
CONCEPTS
  ── Gateways ──────────────────────────────
  models     Models gateway:  4 protocols in → many providers out (+ aggregate, variants, discount)
  tools      Tools gateway:   MCP gateway (+ aggregation) + Agent Skills
  agents     Agents gateway:  ACP (identity/discovery/dispatch) + KYA alongside
  ── Extending BitRouter ───────────────────
  cli        the local binary/daemon — mental model (links reference/cli)
  plugins    a package that bundles hooks into a pipeline (links guides/build-a-plugin)
  hooks      the pipeline/stage model — five traits (links guides/build-a-plugin)

FEATURES
  ── Models gateway ────────────────────────
  provider-selection · model-fallback · model-variants · presets ·
  structured-outputs · byok · local-models           (all KEEP, unchanged)
  ── Tools gateway ─────────────────────────
  server-tools   (NEW)   Advisor / SubAgent / Fusion sections; per-request declarations; approval gate
  toolsets       (NEW)   composable per-request tool bundles; namespacing
  ── Cross-cutting ─────────────────────────
  guardrails · observability                          (KEEP, unchanged)

  DELETED: features/mcp, features/acp, features/agentskills  (absorbed into Concepts)
```

---

## Per-page content briefs

### Concepts → Gateways

#### `concepts/models.mdx` (reframe + expand)
- **Keep:** "One id, many providers" (aggregate + provider selection), "Variants re-rank for one request", "Open models, discounted".
- **Add — the universal LLM API:** four peer ingress protocols — **OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, Google Generative AI** — plus **cross-protocol routing** (talk OpenAI, route to an Anthropic provider, and vice-versa). Framing line: *four protocols in, many providers out.*
- **Learn how to:** provider-selection, model-fallback, model-variants, presets, structured-outputs, byok, local-models. (Today only the first three are linked; broaden to the full Models-gateway feature set.)

#### `concepts/tools.mdx` (reframe + expand + absorb)
- **Throughline:** *Tools are the capabilities an agent acquires at runtime* — two kinds, both served through a gateway: **MCP servers** (callable tools) and **Agent Skills** (loadable know-how/procedures).
- **MCP gateway:** one endpoint, many servers (existing "Why a gateway": uniform auth, discovery, policy) **plus aggregation behavior folded in conceptually** — the `/mcp` fan-out, `server__tool` prefixing, per-server `aggregate: false` opt-out, and list caching. Keep it conceptual; push TTL/prefix config to `reference`.
- **Agent Skills:** reframed as the second capability gateway — loadable capabilities an agent discovers and pulls in on demand, peer to MCP tools. Drop the narrow "teaches an agent to use BitRouter" framing (it becomes one example use, not the definition).
- **Learn how to:** server-tools, toolsets. (Replaces the dead `features/mcp` link.)

#### `concepts/agents.mdx` (trim)
- **ACP leads:** agent identity, discovery, and task dispatch across hosts, through the same single-endpoint model.
- **KYA alongside:** verifiable agent identity → autonomous pay-per-use (x402/MPP), the identity that makes an agent holding keys safe.
- **Remove** the Agent Skills section (moved to `tools`).
- **Learn how to:** agentic payment (`cloud/payment`). Drop the dead `features/acp` and `features/agentskills` links.

### Concepts → Extending BitRouter (thin; link out, no duplicated reference detail)

#### `concepts/cli.mdx` (new)
- What the single local binary/daemon **is**: one local endpoint your runtime points at; `serve`/`start`/`stop`/`status`; `auth` (sign-in) vs `cloud` (account: keys, usage, billing, policies, BYOK) command groups; why it is shaped this way. Links → `reference/cli` for the full command list.

#### `concepts/plugins.mdx` (new)
- What a plugin **is**: a convenience package that bundles one or more hooks (+ any SQL migrations) and installs them into a pipeline (`language_model` / `mcp` / `acp`) in one call. Reproducible by calling hook methods individually. Links → `guides/build-a-plugin`.

#### `concepts/hooks.mdx` (new)
- The **pipeline model**: a request flows through ordered stages; each hook can **allow / deny / mutate / observe**. Name the five `language_model` traits conceptually — **PreRequest** (auth/policy/rate-limit/guardrails), **Route** (resolve/mutate routing chain), **Execution** (observe + fallback control), **Stream** (rewrite/drop/abort stream parts), **Observe** (read-only) — without reproducing signatures. Links → `guides/build-a-plugin`.

### Features → new (Tools gateway), code-grounded

#### `features/server-tools.mdx` (new)
- BitRouter injects tools into the outbound request and runs the **tool loop server-side**, transparent to the caller (looks like one turn). Covers `max_iterations`, the approval gate, and per-request **server-tool declarations** (`bitrouter:advisor` / `:subagent` / `:fusion` in the request `tools` array).
- **Sections:** **Advisor** (consult a stronger model), **SubAgent** (delegate to a worker), **Fusion** (multi-model panel + judge).
- Source: `crates/bitrouter-sdk/src/language_model/server_tools/{config,loop_controller,declarations,approval}.rs`.

#### `features/toolsets.mdx` (new)
- A **toolset** is a composable bundle of tools advertised per-request and executed in the server-side loop — MCP-backed (`McpRouterToolset`), model-backed (Advisor/SubAgent/Fusion), or in-process; `ToolsetRegistry` composes them and routes calls to the owner; prefix-namespaced; conditional availability.
- Source: `crates/bitrouter-sdk/src/language_model/server_tools/{toolset,mcp_toolset}.rs`.

---

## Navigation & cleanup

### `concepts/meta.json`
```json
{
  "title": "Concepts",
  "icon": "BookOpen",
  "defaultOpen": false,
  "pages": [
    "---Gateways---", "models", "tools", "agents",
    "---Extending BitRouter---", "cli", "plugins", "hooks"
  ]
}
```
(Confirm Fumadocs `---Label---` separator syntax during implementation; fall back to its supported grouping mechanism if different.)

### `features/meta.json`
```json
{
  "title": "Features",
  "icon": "Boxes",
  "defaultOpen": false,
  "pages": [
    "---Models gateway---", "provider-selection", "model-fallback", "model-variants",
    "presets", "structured-outputs", "byok", "local-models",
    "---Tools gateway---", "server-tools", "toolsets",
    "---Cross-cutting---", "guardrails", "observability"
  ]
}
```
Removes `mcp`, `acp`, `agentskills`.

### Deletions
- `features/mcp.mdx`, `features/acp.mdx`, `features/agentskills.mdx`.

### Link repointing (must grep the whole repo — nothing 404s)
- `concepts/tools.mdx` → `features/mcp` becomes `features/server-tools` + `features/toolsets`.
- `concepts/agents.mdx` → `features/acp`, `features/agentskills` removed (ACP now self-contained in concept; Skills moved to `tools`).
- `get-started/introduction.mdx` line ~34: "three protocol surfaces" → **four protocols** (consistency with Models page). Verify its other feature links (`model-fallback`, `provider-selection`, `observability`, `guardrails`, `local-models`) still resolve.
- Any other inbound references to `features/{mcp,acp,agentskills}` across the repo → repoint to `concepts/{tools,agents,tools}` respectively.

---

## Out of scope
- Rewriting `guides/build-a-plugin` or `reference/cli` (they remain the how-to; concept pages link to them).
- New Agents-gateway *feature* pages (ACP task-dispatch features) — none exist yet; revisit when shipped.
- Heavy MCP config reference (caching TTLs, prefix overrides) — belongs in `reference`, a separate effort.

## Acceptance
- Concepts renders two labeled groups; six gateway+extending pages present.
- Features no longer contains mcp/acp/agentskills; contains server-tools and toolsets.
- `models` page describes the four protocols; `tools` page covers MCP aggregation + Agent Skills; `agents` page is ACP-led with KYA.
- Repo-wide link check passes (no references to deleted pages).
