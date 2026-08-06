---
title: What is BitRouter?
description: BitRouter is an open-source, adaptive LLM gateway that wraps your agent loop in a second loop — act, observe, evaluate, learn — so routing tightens with every run, with zero harness changes.
---

We started BitRouter out of frustration. We were running agents in production, and every step of every loop — every model call, every tool call, every sub-agent — billed at frontier prices by default. The routers we pointed our loops at were static: they forwarded each call to a fixed route, and that route was exactly as good on run one thousand as it was on run one. That felt backwards to us. A router sits in the middle of everything your agent does — given the right signals, it should be the part of your stack that learns.

So we built it. BitRouter is an **open-source, adaptive LLM gateway and router** for production agent loops: a single local binary that gives any agent one endpoint for its model calls, tools, and sub-agents, and routes each one to the best path that still reaches the goal — with **zero harness changes**. Point your runtime at it and every step of every loop stops billing at frontier prices by default.

It runs anywhere your agent runs, with no dependencies to install, and operates as a permissionless network where any provider can register and any agent can connect. The **Core** is **open-source under Apache 2.0 and self-hostable for free** — bring your own keys or run a local model and you owe us nothing. **Cloud** is an optional hosted layer that adds managed providers, agentic payments, and account-wide policies on top. You can [install either mode](/docs/overview/quickstart) in under a minute, and browse the full [models & pricing](/docs/overview/supported-models) catalog.

## The idea: a second loop

Our bet is simple: routing is a learning problem. BitRouter wraps your agentic loop in a **second loop**. Each loop gets its own [policy spec](/docs/models-and-routing/policy) — a config file that declares how its calls, tools, and agents should route — and against that spec BitRouter runs a continuous **act → observe → evaluate → learn** cycle. Every step is a component it already ships:

- **Act — the router.** Each model, tool, and agent call is rewritten to a chosen route: policy-table routing, cross-protocol translation, multi-account failover. See [Provider selection](/docs/models-and-routing/provider-selection).
- **Observe — telemetry.** Every hop is attributed with cost, tokens, latency, and outcome, exported over OTLP to any backend you run. See [OpenTelemetry](/docs/features/opentelemetry).
- **Evaluate — the adequacy signal.** Each served request is scored against the route that served it — did the cheaper path still reach the goal? — and every request is cost-metered. Run-level, objective-scored evals are the next milestone. See [Evaluation signal](/docs/models-and-routing/policy#evaluation-signal).
- **Learn — the policy engine.** The observed signal folds back into the policy spec: proven downgrades materialize into the table, failed ones escalate back. The next turn of the loop acts on the improved spec. See [Policy](/docs/models-and-routing/policy).

You choose what the loop optimizes for, and it improves the longer it runs in production. We call this recursive self-improvement applied to infrastructure: the router gets better at routing your loop every time the loop runs.

## Not just models

Here's something we noticed early: an agentic loop consumes three things, and most routers govern only one. We built BitRouter to make all three routable, observable, and governed:

- **Models** — route LLM calls across providers, accounts, and wire protocols (OpenAI, Anthropic, Google). See [Models](/docs/models-and-routing/models).
- **Capabilities** — an **MCP gateway** and an **AgentSkills gateway**: tools and skills become governed, routable resources, not hardcoded endpoints. See [Tools](/docs/features/tools).
- **Agents** — an **ACP gateway**: sub-agents are first-class routable primitives, so a task can go to the sub-agent that best fits the objective — just as a call routes to the best-fit model. See [Agents](/docs/features/agents).

Optimizing a loop isn't just model selection — it's the model, the tool, *and* the sub-agent that best serve the loop's objective.

## Where we are today

**Today BitRouter optimizes for cost.** That's the objective that ships: trivial calls stop billing at frontier prices, and the loop keeps tightening as evidence accumulates. Latency and accuracy objectives are next on the roadmap — the loop is multi-objective by design, and we'd rather ship one objective that works than three that half-work.

## Next steps

BitRouter is a drop-in proxy for any runtime that supports a custom OpenAI or Anthropic base URL. The [Quickstart](/docs/overview/quickstart) gets you routing in under a minute; [Models & Routing](/docs/models-and-routing/provider-selection) and [Policy](/docs/models-and-routing/policy) cover the rest of the loop. Per-runtime recipes (Claude Code, OpenClaw, Codex, and more) live in [Integrations](/docs/integrations), and machine-readable docs in [AI Resources](/docs/ai-resources).
