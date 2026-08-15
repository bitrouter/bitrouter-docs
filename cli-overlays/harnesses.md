---
title: Harnesses
---

Three ways to run a harness on top of the daemon: `launch` for an interactive session, `spawn` for a headless sub-agent, and `tui` for the orchestrator console — supervise multiple agent sessions, inspect per-session cost, and delegate work to sub-agents, backed by the `fleet` MCP backend. `tui` is not in the binary's own `--help` listing, so it has no generated subsection below.

## @launch

```bash
bitrouter launch claude
```

Points the harness's API base URL at the local daemon — the same wiring the [Integrations](/docs/integrations/harnesses) recipes do by hand — and prints a session spend summary on exit.

## @spawn

```bash
bitrouter spawn -p "summarize the diff" --model @coding
```

Spawns an ACP-compatible harness as a headless sub-agent, routed through the daemon by default. This is the mechanism behind the [Subagent](/docs/models-and-routing/tool-calling/subagent) feature.
