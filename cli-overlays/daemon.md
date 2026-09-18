---
title: Daemon lifecycle
---

The local router listens on `http://127.0.0.1:4356` by default. It serves the supported model protocols and the configured upstream MCP aggregate; ACP agent adapters use their own stdio lifecycle. This section covers the daemon, request history, retained remote operations, and named remote contexts.

## @serve

Runs in the foreground — the form you want under a process supervisor or in a container:

```bash
bro serve -c ./bitrouter.yaml
```

## @start

Daemonizes: writes a pidfile and detaches. `stop`/`restart` target the pidfile; `reload` hot-loads config changes without dropping in-flight connections.

## @status

Prints `running: no` when no daemon is reachable — safe to poll in scripts.
