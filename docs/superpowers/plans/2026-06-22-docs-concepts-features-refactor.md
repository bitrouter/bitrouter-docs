# Docs Concepts/Features Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the docs `concepts` section into Gateways + Extending BitRouter, and trim `features` to specific capabilities — adding 5 new pages, reframing 3, and deleting 3 stubs — with no broken links.

**Architecture:** Fumadocs MDX docs. Each section is a folder of `.mdx` (English) + `.zh.mdx` (Chinese) twins driven by a shared `meta.json` whose `pages` array sets order and grouping. Concepts pages explain primitives (hub) and link out to Features/Guides/Reference (spokes). This pass does **all English content** and keeps the **Chinese site building** (delete dead zh twins, fix zh links); full Chinese translation of new/reframed pages is a tracked follow-up.

**Tech Stack:** Next.js 16, fumadocs-core/ui/mdx 16.8.x, pnpm. No tests for prose — verification is a build + a link-integrity grep.

**Conventions to match (from existing pages):**
- Frontmatter: `title` + `description` only.
- `import { Callout } from 'fumadocs-ui/components/callout';` when using `<Callout type="info|warn">`.
- Concept pages end with a `## Learn how to` bullet list of links.
- Local endpoint in examples: `http://127.0.0.1:4356`.

**Routes are locale-agnostic.** `/docs/features/mcp` serves `mcp.mdx` (en) or `mcp.zh.mdx` (zh). Deleting both twins makes the route 404, so every inbound link to it — in en **and** zh files — must be repointed.

---

## File map

**Create (English only this pass):**
- `content/docs/concepts/cli.mdx`
- `content/docs/concepts/plugins.mdx`
- `content/docs/concepts/hooks.mdx`
- `content/docs/features/server-tools.mdx`
- `content/docs/features/toolsets.mdx`

**Modify:**
- `content/docs/concepts/meta.json` — sub-group + add cli/plugins/hooks
- `content/docs/features/meta.json` — drop mcp/acp/agentskills, add server-tools/toolsets, group
- `content/docs/concepts/models.mdx` — add "Four protocols in" + broaden Learn-how-to
- `content/docs/concepts/tools.mdx` — MCP gateway + aggregation + Agent Skills throughline
- `content/docs/concepts/agents.mdx` — ACP-led + KYA; remove Skills section
- `content/docs/get-started/introduction.mdx` — "three protocol surfaces" → four protocols
- Inbound-link fixes (en): `content/docs/guides/migrate-from-litellm.mdx`, `content/docs/cloud/managed-tools.mdx`
- Inbound-link fixes (zh, keep-building): `content/docs/concepts/tools.zh.mdx`, `content/docs/concepts/agents.zh.mdx`, `content/docs/guides/migrate-from-litellm.zh.mdx`, `content/docs/cloud/managed-tools.zh.mdx`, `content/docs/get-started/introduction.zh.mdx` (if present)

**Delete:**
- `content/docs/features/mcp.mdx`, `content/docs/features/mcp.zh.mdx`
- `content/docs/features/acp.mdx`, `content/docs/features/acp.zh.mdx`
- `content/docs/features/agentskills.mdx`, `content/docs/features/agentskills.zh.mdx`

---

### Task 1: Concepts nav — sub-group + new pages

**Files:**
- Modify: `content/docs/concepts/meta.json`

- [ ] **Step 1: Replace the file with the grouped nav**

```json
{
  "title": "Concepts",
  "icon": "BookOpen",
  "defaultOpen": false,
  "pages": [
    "---Gateways---",
    "models",
    "tools",
    "agents",
    "---Extending BitRouter---",
    "cli",
    "plugins",
    "hooks"
  ]
}
```

- [ ] **Step 2: Verify it's valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/docs/concepts/meta.json','utf8')); console.log('ok')"`
Expected: `ok`

(`"---Label---"` is Fumadocs' separator syntax. If the sidebar later renders the labels as broken links instead of section headers, fall back to a flat `pages` array without the two separator entries — note it and continue.)

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/meta.json
git commit -m "docs(concepts): sub-group nav into Gateways + Extending BitRouter"
```

---

### Task 2: Reframe `concepts/models.mdx` — add the four protocols

**Files:**
- Modify: `content/docs/concepts/models.mdx`

- [ ] **Step 1: Replace the whole file**

```mdx
---
title: Models
description: On BitRouter a model is an aggregate served by many providers — reached through four protocols, ranked per request, with discounted open supply.
---
import { Callout } from 'fumadocs-ui/components/callout';

On BitRouter a "model" is not a single endpoint. It's an **aggregate**: one logical model — say `openai/gpt-4o` or `anthropic/claude-sonnet-4.6` — that can be served by many providers at once. You address it by a stable **model id**, and BitRouter decides which underlying provider endpoint actually answers each request.

That indirection is the whole point. You write your agent against `anthropic/claude-sonnet-4.6`, and the set of providers behind it can grow, shrink, or re-price without you changing a line of code.

## Four protocols in

You reach the models gateway through whichever API your runtime already speaks. BitRouter exposes **four protocols**, side by side, on one local endpoint:

- **OpenAI Chat Completions** — `POST /v1/chat/completions`
- **OpenAI Responses** — `POST /v1/responses`
- **Anthropic Messages** — `POST /v1/messages`
- **Google Generative AI** — `POST /v1beta/models/{model}:generateContent`

Pick the one your SDK is already wired for — you don't adopt a new client. And because the gateway speaks all four, it can **route across them**: a request that arrives as Anthropic Messages can be served by an OpenAI provider, and vice-versa. One model id, reachable four ways, answerable by any eligible provider.

## One id, many providers

Because a model is an aggregate, requesting it kicks off a **provider selection** step. By default BitRouter ranks the eligible providers by a balanced score — a blend of cost, latency, throughput, and uptime — and sends your request to the best one. When the chosen provider fails transiently, it can fall through to the next-ranked provider, or to the next model you listed.

## Variants re-rank for one request

When one model has several providers, you sometimes want to bias that ranking for a single call. A **model variant** is an inline suffix on the id — `:cost`, `:latency`, `:throughput` — that re-ranks the *eligible* providers along the axis you named, for that request only. It never changes which providers are eligible, never changes authorization, and a bare id is just the balanced default.

## Open models, discounted

Open (non-closed-source) models carry a second property: BitRouter serves them through its own self-hosted provider at **25% below official pricing by default**, with no suffix or configuration. The `:discount` suffix pins a request to that supply explicitly, and it's where any custom account discount applies.

## Learn how to

- [Provider selection](/docs/features/provider-selection) — how providers behind one model are ranked.
- [Model fallback](/docs/features/model-fallback) — pass an ordered list and walk it on failure.
- [Model variants](/docs/features/model-variants) — the `:cost` / `:latency` / `:throughput` suffixes.
- [Presets](/docs/features/presets) — named, reusable routing configurations.
- [Structured outputs](/docs/features/structured-outputs) — enforce a JSON schema across providers.
- [Add external keys (BYOK)](/docs/features/byok) — route through your own provider account.
- [Local & private models](/docs/features/local-models) — point BitRouter at your own server.
- [Managed provider & pricing](/docs/cloud/managed-models) — the hosted provider and the full catalog.
```

- [ ] **Step 2: Verify every Learn-how-to target exists**

Run:
```bash
for p in features/provider-selection features/model-fallback features/model-variants features/presets features/structured-outputs features/byok features/local-models cloud/managed-models; do
  test -f "content/docs/$p.mdx" && echo "ok $p" || echo "MISSING $p"
done
```
Expected: eight `ok` lines, no `MISSING`.

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/models.mdx
git commit -m "docs(concepts): models — add the four ingress protocols, broaden feature links"
```

---

### Task 3: Reframe `concepts/tools.mdx` — MCP gateway + aggregation + Agent Skills

**Files:**
- Modify: `content/docs/concepts/tools.mdx`

- [ ] **Step 1: Replace the whole file**

```mdx
---
title: Tools
description: Tools are the capabilities an agent acquires at runtime — MCP servers and Agent Skills — both served through one BitRouter gateway.
---

On BitRouter, **tools** are the capabilities an agent picks up at runtime to get work done. They come in two kinds, and BitRouter serves both through one endpoint so an agent connects once instead of wiring up each source by hand:

- **MCP servers** — callable tools (a search API, a database, a file system, a payment rail).
- **Agent Skills** — loadable know-how: procedures and instructions an agent pulls in on demand.

## The MCP gateway

An agent's callable tools are [MCP](https://modelcontextprotocol.io) servers. Each exposes a set of tools an agent can discover and invoke. The catch is that those servers live in many places, each with its own address, auth, and endpoint — an agent that wants ten tool servers normally has to know about ten endpoints.

BitRouter's **MCP gateway** sits in front of them and proxies them. Your agent connects to one BitRouter endpoint; behind it, the gateway forwards **tool discovery** and **tool calls** to the right upstream host and relays the responses back. One connection, many tool servers — mirroring how BitRouter treats models.

Routing tools through one gateway buys you three things you'd otherwise rebuild per agent:

- **Uniform auth** — the agent authenticates once to BitRouter, instead of carrying credentials for every upstream server.
- **Discovery** — tools across hosts surface in one place, so an agent finds what's available without being pre-wired to each server.
- **Policy** — every tool call passes through the gateway, the natural place to enforce rules consistently.

### One endpoint, many servers

The gateway exposes a single aggregate endpoint that **fans out** across every configured server. A list call queries each server and returns the merged catalog; a tool call routes to the owning server. To keep names from colliding, each server's tools are **namespaced with a prefix** — the `search` tool on the `demo` server is advertised as `demo__search`. A server can **opt out** of the aggregate to stay reachable only on its own route, and cheap list calls are **cached** briefly so discovery stays fast. The exact prefix and cache settings live in the [configuration reference](/docs/reference).

## Agent Skills

The second capability an agent acquires is **know-how**. **Agent Skills** are drop-in capabilities an agent loads on demand — a packaged procedure, a set of instructions, a workflow — discovered and pulled in the same way tools are, through the gateway. Where an MCP tool is something the agent *calls*, a Skill is something the agent *learns*: the knowledge travels with the agent instead of living in a human's setup notes. One common Skill simply teaches an agent how to drive BitRouter itself.

## Learn how to

- [Server tools](/docs/features/server-tools) — let BitRouter run the tool-calling loop for you, server-side.
- [Toolsets](/docs/features/toolsets) — how the tools advertised on a request are bundled and namespaced.
```

- [ ] **Step 2: Verify targets exist (server-tools/toolsets are created in Tasks 9–10; reference index exists now)**

Run: `test -f content/docs/reference/meta.json && echo "ref ok"`
Expected: `ref ok`
(The `features/server-tools` and `features/toolsets` links resolve once Tasks 9–10 land; the final build in Task 12 confirms.)

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/tools.mdx
git commit -m "docs(concepts): tools — capability gateway (MCP + aggregation + Agent Skills)"
```

---

### Task 4: Trim `concepts/agents.mdx` — ACP-led + KYA, drop Skills

**Files:**
- Modify: `content/docs/concepts/agents.mdx`

- [ ] **Step 1: Replace the whole file**

```mdx
---
title: Agents
description: What agent-native means on BitRouter — the ACP gateway for identity, discovery, and task dispatch, plus KYA identity for autonomous pay-per-use.
---

BitRouter is **agent-native**: the primitives below assume the caller is an autonomous agent, not a human at a keyboard. That shows up in two places — how agents are identified and reached, and how they pay.

## The ACP gateway — identity and dispatch

Just as the MCP gateway lets an agent reach many tool servers, the **ACP gateway** handles the agent side: **agent identity, discovery, and task dispatch** across hosts. It's how an agent gets a place in the network, can be found, and can hand off or receive tasks — through the same single-endpoint model BitRouter uses everywhere.

## KYA — verifiable identity that can pay

An autonomous agent holding your keys is a liability unless it has an identity of its own. **KYA (Know-Your-Agent)** gives an agent a **verifiable identity**, which is what makes autonomous payment safe: with that identity, an agent can **pay per use** through the Machine Payment Protocol — x402/MPP — settling each request itself, with no credit cards, prepaid credits, or invoices in the loop.

## Learn how to

- [Agentic payment](/docs/cloud/payment) — autonomous pay-per-use via MPP / x402.
```

- [ ] **Step 2: Verify the payment target exists**

Run: `test -f content/docs/cloud/payment.mdx && echo "ok" || echo "MISSING — adjust link"`
Expected: `ok`. (If MISSING, search for the right route: `git ls-files 'content/docs/cloud/*payment*'` and use that path.)

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/agents.mdx
git commit -m "docs(concepts): agents — ACP-led with KYA; Agent Skills moved to tools"
```

---

### Task 5: New `concepts/cli.mdx`

**Files:**
- Create: `content/docs/concepts/cli.mdx`

- [ ] **Step 1: Create the file**

```mdx
---
title: CLI
description: The single local binary that runs BitRouter — one endpoint your runtime points at, a daemon you control, and a scriptable surface for your account.
---

BitRouter ships as one **static binary**, `bitrouter`, with no dependencies to install. It plays two roles: it runs the **local router** your agent talks to, and it's the **command-line surface** for your hosted account.

## The local endpoint

Your agent never talks to a remote API directly — it points at the binary running locally, by default on `http://127.0.0.1:4356`. Everything else in these docs — the four model protocols, the MCP and ACP gateways — is served from that one endpoint.

You run it as a daemon and control its lifecycle:

- `bitrouter serve` — run the router in the foreground.
- `bitrouter start` / `stop` / `status` — manage it as a background daemon.

## Account commands

The same binary manages your hosted account, so scripts and agents can do everything the console can:

- `bitrouter auth login | whoami | logout` — sign in to your account (device-code OAuth) and inspect or clear local credentials.
- `bitrouter cloud …` — manage the account itself: API keys, usage and request history, billing balance, BYOK provider keys, routing and budget policies, and OAuth clients.

For the full command list, flags, and output formats, see the [CLI reference](/docs/reference/cli).
```

- [ ] **Step 2: Verify the reference link target exists**

Run: `test -f content/docs/reference/cli.mdx && echo "ok"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/cli.mdx
git commit -m "docs(concepts): add CLI concept page"
```

---

### Task 6: New `concepts/plugins.mdx`

**Files:**
- Create: `content/docs/concepts/plugins.mdx`

- [ ] **Step 1: Create the file**

```mdx
---
title: Plugins
description: A plugin packages one or more hooks (plus any migrations) and installs them into a BitRouter pipeline in a single call.
---

A **plugin** is the unit that packages one or more [hooks](/docs/concepts/hooks) — plus any database migrations they need — and installs them into the router in a single call. It's how a capability like guardrails, observability, or attestation ships as one installable piece instead of a loose set of callbacks.

## Pipelines

Every plugin targets one of three pipelines, depending on what kind of traffic it acts on:

- **`language_model`** — the main LLM pipeline, with the full set of hooks.
- **`mcp`** — Model Context Protocol routing.
- **`acp`** — Agent Client Protocol routing.

## A convenience, not the atomic unit

A plugin is a **convenience package**: it bundles a related set of hooks and migrations and installs them together. It is *not* the atomic unit — every plugin can be reproduced by registering its hooks one by one. Bundling them just makes a capability reproducible and installable in one step. The core ships several this way, including `bitrouter-guardrails`, `bitrouter-observe`, and `bitrouter-attestation`.

To write one against the Rust SDK, see [Build a plugin](/docs/guides/build-a-plugin).
```

- [ ] **Step 2: Verify the guide link target exists**

Run: `test -f content/docs/guides/build-a-plugin.mdx && echo "ok"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/plugins.mdx
git commit -m "docs(concepts): add Plugins concept page"
```

---

### Task 7: New `concepts/hooks.mdx`

**Files:**
- Create: `content/docs/concepts/hooks.mdx`

- [ ] **Step 1: Create the file**

```mdx
---
title: Hooks
description: The pipeline model behind BitRouter — a request flows through ordered stages, and each hook can allow, deny, mutate, or observe it.
---

A **hook** is a callback that runs at a specific point as a request flows through the router. BitRouter processes every request as an ordered **pipeline of stages**; hooks attach to those stages, and depending on the stage a hook can **allow, deny, mutate, or observe** the request. [Plugins](/docs/concepts/plugins) bundle hooks and install them.

## The language-model pipeline

The main `language_model` pipeline runs five kinds of hook, in order:

1. **PreRequest** — auth, policy, rate-limit, balance, and guardrail checks. Each returns *allow* or *deny*; the first deny stops the pipeline and maps to an HTTP status.
2. **Route** — resolve or rewrite the ordered chain of routing targets for the request.
3. **Execution** — observe each attempt and control fallback on success or failure.
4. **Stream** — intercept streamed response parts to rewrite, drop, or abort them.
5. **Observe** — read-only observation at every stage boundary; it never influences the request, and a failure here can't break it.

Settlement — metering, charging, and receipts — runs against an immutable context once the request is done.

For the trait signatures and a worked example, see [Build a plugin](/docs/guides/build-a-plugin).
```

- [ ] **Step 2: Verify the guide link target exists**

Run: `test -f content/docs/guides/build-a-plugin.mdx && echo "ok"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add content/docs/concepts/hooks.mdx
git commit -m "docs(concepts): add Hooks concept page"
```

---

### Task 8: Features nav — drop stubs, add new pages, group

**Files:**
- Modify: `content/docs/features/meta.json`

- [ ] **Step 1: Replace the file**

```json
{
  "title": "Features",
  "icon": "Boxes",
  "defaultOpen": false,
  "pages": [
    "---Models gateway---",
    "provider-selection",
    "model-fallback",
    "model-variants",
    "presets",
    "structured-outputs",
    "byok",
    "local-models",
    "---Tools gateway---",
    "server-tools",
    "toolsets",
    "---Cross-cutting---",
    "guardrails",
    "observability"
  ]
}
```

- [ ] **Step 2: Verify valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/docs/features/meta.json','utf8')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add content/docs/features/meta.json
git commit -m "docs(features): drop mcp/acp/agentskills stubs, add server-tools/toolsets, group nav"
```

---

### Task 9: New `features/server-tools.mdx`

**Files:**
- Create: `content/docs/features/server-tools.mdx`

Source of truth (verify identifiers against these before committing): `crates/bitrouter-sdk/src/language_model/server_tools/{config,loop_controller,declarations,approval}.rs` in the bitrouter repo. Defaults: `max_iterations=10`, `tool_timeout=30s`, `total_budget=120s`, `max_consecutive_errors=3`. Declaration types: `bitrouter:advisor|subagent|fusion`. ApprovalPolicy default `AllowAll`.

- [ ] **Step 1: Create the file**

```mdx
---
title: Server tools
description: Let BitRouter run the tool-calling loop for you, server-side — including the Advisor, SubAgent, and Fusion model-backed tools.
---
import { Callout } from 'fumadocs-ui/components/callout';

Normally your agent runs the tool-calling loop: the model asks to call a tool, your harness executes it, appends the result, and calls the model again. **Server tools** move that loop into BitRouter. You declare a set of tools, BitRouter advertises them to the model, and when the model calls one, BitRouter **executes it and feeds the result back itself** — looping until the model stops calling them. To the caller it looks like a single response.

## How the loop runs

BitRouter injects the declared tools into the outbound request, intercepts the model's calls to them, runs them, appends the results, and re-calls the upstream — repeating until the model returns an answer with no tool calls, or a bound is hit. The loop is bounded so it can't run away:

| Bound | Default | Meaning |
| --- | --- | --- |
| `max_iterations` | 10 | Maximum tool rounds before the loop stops. |
| `tool_timeout` | 30s | Per-tool execution timeout. |
| `total_budget` | 120s | Wall-clock budget for the whole loop. |
| `max_consecutive_errors` | 3 | Stop after this many back-to-back tool failures. |

Before each call, an **approval policy** decides whether the tool may run. The default allows everything; a denied call returns an execution-denied result to the model instead of running.

## Enabling server tools per request

You turn server tools on by declaring them in the request's `tools` array — no config change required. BitRouter recognizes three built-in, model-backed tools and only advertises the ones you declare:

```json
{
  "tools": [
    { "type": "bitrouter:advisor",  "args": { "model": "anthropic/claude-opus-4.8", "instructions": "..." } },
    { "type": "bitrouter:subagent", "args": { "model": "openai/gpt-4o-mini", "instructions": "..." } },
    { "type": "bitrouter:fusion",   "args": { "panel": [{ "model": "..." }], "judge": { "model": "..." } } }
  ]
}
```

MCP-server tools are wired through configuration instead — set `server_tools.mcp_servers` to the servers whose tools BitRouter should run inside the loop.

## Advisor

**Advisor** lets the running model **consult a stronger model mid-generation**. The advisor model is fixed by your declaration (and falls back to the parent model); the calling model sends a `prompt` and gets back structured advice. Use it when one hard sub-question is worth a brief escalation, without switching the whole request to a pricier model.

## SubAgent

**SubAgent** lets the running model **delegate a self-contained task to a cheaper, faster worker model**. The worker is fixed by the declaration; the caller supplies a `task_name` and `task_description` and gets back the outcome. Use it to fan out bounded sub-tasks without spending frontier tokens on them.

## Fusion

**Fusion** runs a **panel of models (1–8) on the same prompt in parallel**, then a **judge** model compares — not merges — their answers into a structured analysis (consensus, contradictions, partial coverage, unique insights, blind spots), which the calling model uses to write the final answer. An optional synthesizer can write that answer instead. Use it for high-stakes questions where cross-checking several models is worth the cost.

<Callout type="info">
Advisor, SubAgent, and Fusion are each backed by model calls nested inside your request. They cost what their underlying model calls cost, and they appear in your usage history like any other call.
</Callout>
```

- [ ] **Step 2: Verify config keys against the SDK (read-only check)**

Run: `grep -nE 'max_iterations|tool_timeout|total_budget|max_consecutive_errors|mcp_servers' /Users/kelsen/Documents/Code/bitrouter/crates/bitrouter-sdk/src/language_model/server_tools/config.rs`
Expected: matches confirming the field names and the `=10` default. If a name differs, fix it in the page before committing.

- [ ] **Step 3: Commit**

```bash
git add content/docs/features/server-tools.mdx
git commit -m "docs(features): add server-tools (Advisor/SubAgent/Fusion)"
```

---

### Task 10: New `features/toolsets.mdx`

**Files:**
- Create: `content/docs/features/toolsets.mdx`

Source of truth: `crates/bitrouter-sdk/src/language_model/server_tools/{toolset,mcp_toolset}.rs`. Trait `RouterToolset` (`list_tools`, `call_tool`, `owns`); registry `ToolsetRegistry`; prefix scheme `{server}__{tool}`; conditional advertising via declarations.

- [ ] **Step 1: Create the file**

```mdx
---
title: Toolsets
description: A toolset is a composable bundle of tools BitRouter advertises on a request and executes itself — MCP-backed, model-backed, or in-process.
---

A **toolset** is a bundle of tools that BitRouter advertises to the model and executes itself during the [server-tool loop](/docs/features/server-tools). It's the seam that makes router-run tools provider-agnostic: each toolset decides which tools to advertise on a given request and how to run them, and BitRouter composes several into the single set the model sees.

## What a toolset does

Every toolset answers two questions for a request: **which tools to advertise**, and **how to run a call** to one of them. BitRouter keeps a registry of toolsets; when the model calls a tool, the registry routes the call to the toolset that **owns** that name. Because several toolsets can be active at once, tool names are **prefixed** to avoid collisions — the `search` tool from the `demo` server is advertised as `demo__search`.

## Kinds of toolset

- **MCP-backed** — one per upstream MCP server; its tools are the server's tools, run through the gateway.
- **Model-backed** — [Advisor, SubAgent, and Fusion](/docs/features/server-tools), each wrapping a nested model call.
- **In-process** — tools implemented directly in the router.

## Conditional availability

A toolset doesn't have to advertise on every request. It can check what the caller **declared** and stay silent otherwise — which is how the model-backed tools work: Advisor only appears when the request declares `bitrouter:advisor`, and likewise for SubAgent and Fusion. The model only ever sees the tools that request actually opted into.
```

- [ ] **Step 2: Verify the trait/registry names (read-only check)**

Run: `grep -nE 'trait RouterToolset|struct ToolsetRegistry|fn owns' /Users/kelsen/Documents/Code/bitrouter/crates/bitrouter-sdk/src/language_model/server_tools/toolset.rs`
Expected: matches for the trait and registry. If a name differs, the page doesn't expose it verbatim, so usually no change needed — but confirm the prefix example (`demo__search`) matches `mcp_toolset.rs`.

- [ ] **Step 3: Commit**

```bash
git add content/docs/features/toolsets.mdx
git commit -m "docs(features): add toolsets"
```

---

### Task 11: Delete stubs, repoint all inbound links, reconcile protocol count

**Files:**
- Delete: `content/docs/features/{mcp,acp,agentskills}.mdx` and their `.zh.mdx` twins
- Modify (en): `content/docs/guides/migrate-from-litellm.mdx`, `content/docs/cloud/managed-tools.mdx`, `content/docs/get-started/introduction.mdx`
- Modify (zh, keep-building): `content/docs/concepts/tools.zh.mdx`, `content/docs/concepts/agents.zh.mdx`, `content/docs/guides/migrate-from-litellm.zh.mdx`, `content/docs/cloud/managed-tools.zh.mdx`, `content/docs/get-started/introduction.zh.mdx`

- [ ] **Step 1: Delete the six stub files**

```bash
git rm content/docs/features/mcp.mdx content/docs/features/mcp.zh.mdx \
       content/docs/features/acp.mdx content/docs/features/acp.zh.mdx \
       content/docs/features/agentskills.mdx content/docs/features/agentskills.zh.mdx
```

- [ ] **Step 2: Repoint English inbound links**

In `content/docs/guides/migrate-from-litellm.mdx`:
- `/docs/features/mcp` → `/docs/concepts/tools` (lines ~38, ~128, and the `<Card href=…>` ~161)
- `/docs/features/acp` → `/docs/concepts/agents` (lines ~39, ~129)
- `/docs/features/agentskills` → `/docs/concepts/tools` (line ~130)

In `content/docs/cloud/managed-tools.mdx` (line ~9):
- `/docs/features/mcp` → `/docs/concepts/tools`

In `content/docs/get-started/introduction.mdx` (line ~34), replace:
> One binary, three protocol surfaces: OpenAI Chat Completions + Responses, Anthropic Messages, and Google Generative AI.

with:
> One binary, four protocols: OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, and Google Generative AI.

(Use Edit on each exact string; don't sed blindly — confirm surrounding text first.)

- [ ] **Step 3: Repoint Chinese inbound links (keep the zh site building)**

In `content/docs/concepts/tools.zh.mdx` (line ~24, the "Learn how to" link list): replace the single `/docs/features/mcp` bullet with two bullets pointing to `/docs/features/server-tools` and `/docs/features/toolsets` (Chinese link text; routes fall back to English content until translated).

In `content/docs/concepts/agents.zh.mdx` (lines ~22–23): remove the `/docs/features/acp` and `/docs/features/agentskills` bullets; leave (or add) a bullet to `/docs/cloud/payment`.

In `content/docs/guides/migrate-from-litellm.zh.mdx`: same route repoints as Step 2 (`features/mcp`→`concepts/tools`, `features/acp`→`concepts/agents`, `features/agentskills`→`concepts/tools`, the `<Card href>`).

In `content/docs/cloud/managed-tools.zh.mdx` (line ~9): `/docs/features/mcp` → `/docs/concepts/tools`.

In `content/docs/get-started/introduction.zh.mdx` (if it exists): update the "三种协议 / three protocol surfaces" sentence to four protocols, mirroring Step 2.

- [ ] **Step 4: Verify no inbound link to a deleted route remains anywhere**

Run: `grep -rnE 'docs/features/(mcp|acp|agentskills)' content/ src/ || echo "CLEAN"`
Expected: `CLEAN`.

- [ ] **Step 5: Commit**

```bash
git add -A content/
git commit -m "docs: delete mcp/acp/agentskills stubs, repoint links, reconcile protocol count to four"
```

---

### Task 12: Full build + final link integrity gate

**Files:** none (verification only)

- [ ] **Step 1: Confirm dependencies are installed**

Run: `test -d node_modules && echo "deps ok" || pnpm install`
Expected: `deps ok` (or a successful install).

- [ ] **Step 2: Build the site**

Run: `pnpm build`
Expected: build succeeds. The new routes (`concepts/cli`, `concepts/plugins`, `concepts/hooks`, `features/server-tools`, `features/toolsets`) compile; the deleted routes are gone.

If `prebuild` (the `generate-openapi`/`generate-models`/`generate-changelog` scripts) fails for environmental reasons unrelated to this change, run the build directly to validate MDX + routing:
`pnpm exec next build` — and note the prebuild skip in the commit/PR description.

- [ ] **Step 3: Confirm the zh locale didn't break on the new English-only pages**

The new pages have no `.zh.mdx` twin yet. Verify the build did not error on a missing Chinese translation (Fumadocs falls back to the default locale). If the build *did* error on a missing zh page, create minimal `.zh.mdx` twins that re-export the English content as an interim, and note them in the follow-up.

Run: `for p in concepts/cli concepts/plugins concepts/hooks features/server-tools features/toolsets; do test -f "content/docs/$p.mdx" && echo "ok $p"; done`
Expected: five `ok` lines.

- [ ] **Step 4: Final repo-wide dead-link sweep**

Run: `grep -rnE 'docs/features/(mcp|acp|agentskills)' content/ src/ || echo "CLEAN"`
Expected: `CLEAN`.

- [ ] **Step 5: Commit any build-driven fixes**

```bash
git add -A
git commit -m "docs: build green after concepts/features refactor" --allow-empty
```

---

## Self-review (completed at write time)

- **Spec coverage:** every spec item maps to a task — Concepts grouping (T1), models/4-protocols (T2), tools+aggregation+Skills (T3), agents ACP+KYA (T4), CLI/Plugins/Hooks (T5–T7), Features nav trim (T8), server-tools/toolsets (T9–T10), deletions + link repointing + protocol-count reconcile (T11), build gate (T12).
- **Localization fork (decision A):** handled in T11 (delete dead zh twins, fix zh links) + T12 Step 3 (zh fallback check). Full zh translation of new/reframed pages is **deferred** (see below).
- **Placeholders:** none — every page's full content is inline; config defaults and route targets are concrete.
- **Consistency:** route targets cross-checked against the link-audit grep; `server-tools`/`toolsets` link forward (created T9–T10, validated by the T12 build).

## Deferred / follow-up (not in this plan)
- **Chinese translation pass** for the reframed (`models`, `tools`, `agents`) and new (`cli`, `plugins`, `hooks`, `server-tools`, `toolsets`) pages — author/verify by a Chinese-reading reviewer.
- **Heavy MCP config reference** (cache TTLs, `tool_prefix` overrides, `aggregate` flag) → a `reference` page; the Tools concept links to it.
- **Optional `meta.zh.json`** to localize the sidebar separator labels ("Gateways" / "Extending BitRouter" / etc.) on the Chinese site.
- **Per-request declaration wire format** in `server-tools` is shown illustratively; expand with verified, protocol-specific examples when writing the API reference.
```
