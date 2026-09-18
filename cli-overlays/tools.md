---
title: Agents, ACP, and MCP
---

`agents` inspects ACP adapters, `acp serve` exposes one adapter over protocol-pure stdio, and `mcp check` verifies the upstream MCP servers declared in `bitrouter.yaml`. These are distinct directions: ACP connects a client to an agent; MCP connects BitRouter to upstream tools.

## @agents check

```bash
bro agents check codex-acp
```

Spawns the adapter, performs ACP initialization, and reports whether the configured route is usable.

## @acp serve

```bash
bro acp serve codex-acp
```

Exposes the selected adapter over stdio for an ACP client. It preserves the selected harness's session semantics; it does not create a durable BitRouter workflow.

## @mcp check

```bash
bro mcp check
bro mcp check docs
```

Connects to one or every configured upstream, negotiates MCP capabilities, and lists the tools each server advertises.
