---
title: Harnesses
---

Three ways to run a harness on top of the daemon: `launch` for an interactive
session, `spawn` for a headless sub-agent, and `tui` for the orchestrator
console. All routed modes use the same daemon provider and policy runtime.

## @launch

```bash
bitrouter launch -a claude
```

Points the harness's API base URL and model at the local daemon without editing
the agent's global config, then prints a session spend summary on exit.

## @spawn

```bash
bitrouter spawn -p "summarize the diff" --model @coding
```

Spawns an ACP-compatible harness as a headless sub-agent, routed through the daemon by default. This is the mechanism behind the [Subagent](/docs/mcp-and-tool-calling/subagent) feature.
