---
title: MCP
description: Drive BitRouter from any MCP client — the origin MCP server exposing complete, list_models, and status as tools onto the same local endpoint.
sourceHash: 4d81757224047cca87ea8f4a3f4b6d7f1c91868cc852d30bf09714cdb86bf8ac
---

MCP is a second way to **drive** BitRouter, parallel to the [CLI](/docs/concepts/cli). Where the CLI is a command-line surface onto the local daemon, the MCP server is a **tool surface** onto the same endpoint — so any MCP client (Claude, Cursor, or your own agent) can talk to BitRouter as a set of tools instead of shelling out.

## The origin MCP server

`bitrouter mcp serve` exposes BitRouter itself as an **origin** MCP server — a small, fixed set of tools that front the local daemon at `127.0.0.1:4356`:

- `complete` — run a completion through the router, with all the same routing, fallback, and policy behavior as the HTTP API.
- `list_models` — enumerate the models your account or keys can reach.
- `status` — report the daemon's health and configuration.

```bash
bitrouter mcp serve                    # stdio → local daemon at 127.0.0.1:4356
bitrouter mcp install --client claude  # print the mcpServers config block to paste
```

Add `--transport http` to target the multi-tenant cloud backend instead of the local daemon.

### Backend variants

The `--backend` flag selects which tool surface the server exposes:

| Backend | Tools | Use case |
|---------|-------|----------|
| `local` *(default)* | `complete`, `list_models`, `status` | Drive the local daemon from any MCP client |
| `cloud` | `complete`, `list_models`, `status` | Drive BitRouter Cloud over HTTP |
| `fleet` | Orchestrator profile — completion tools plus subagent spawn/manage, cost, routing preview, and human-bridge tools | TUI orchestrator delegated to an agent |
| `skills` | `skills_search`, `skills_get` | Origin AgentSkills server over installed skills |

The `skills` backend is the **AgentSkills gateway** — it exposes installed skills as a standalone server so harnesses can discover and load them. When running under `bitrouter tui`, this server is automatically injected into every launched harness alongside the MCP gateway.

## Not the MCP gateway

Keep two BitRouter-and-MCP roles distinct:

- **This page — the origin server.** BitRouter *is* the tool. A client calls `complete` / `list_models` / `status` to drive the router.
- **The [MCP gateway](/docs/concepts/tools).** BitRouter sits *in front of* your own MCP servers, proxying their tools to agents with auth, access control, and identity forwarding. There BitRouter is the middle, not the endpoint.

One is how you reach BitRouter; the other is how BitRouter reaches your tools. See [Tools](/docs/concepts/tools) for the gateway, and [Agent Skill](/docs/concepts/agent-skill) for the third way an agent drives BitRouter.
