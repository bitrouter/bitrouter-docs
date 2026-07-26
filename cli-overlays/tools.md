---
title: tools, agents & acp
description: MCP server introspection, the ACP agent catalog, and the per-session ACP substrate.
---

The command surfaces behind the [Tools](/docs/features/tools) and [Agents](/docs/features/agents) gateways: `tools` introspects the MCP upstreams declared under `mcp_servers`, `agents` manages the ACP agent catalog, and `acp` runs per-session headless agent sessions.

## @tools discover

Probes each configured MCP server and reports the tools it actually exposes — the debugging step when a tool isn't reaching the model.

## @agents check

Spawns each configured agent and verifies it responds to `initialize`, printing latency or the error per agent.

## @acp serve

Exposes one agent session as a vanilla ACP Agent over stdio — how a parent agent delegates to a BitRouter-managed sub-agent.
