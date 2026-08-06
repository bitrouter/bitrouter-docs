---
title: launch, spawn & tui
description: Run coding-agent harnesses pointed at the local daemon — interactive, headless sub-agents, or the orchestrator TUI.
---

Three ways to run a harness on top of the daemon: `launch` for an interactive session, `spawn` for a headless sub-agent, and `tui` for the orchestrator console.

## @launch

```bash
bitrouter launch claude
```

Points the harness's API base URL at the local daemon — the same wiring the [Integrations](/docs/integrations) recipes do by hand — and prints a session spend summary on exit.

## @spawn

```bash
bitrouter spawn -p "summarize the diff" --model @coding
```

Spawns an ACP-compatible harness as a headless sub-agent, routed through the daemon by default. This is the mechanism behind the [Subagent](/docs/gateway-and-routing/subagent) feature.

## @tui

The orchestrator console: supervise multiple agent sessions, inspect per-session cost, and delegate work to sub-agents — backed by the `fleet` MCP backend.
