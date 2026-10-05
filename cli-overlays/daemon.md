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

Daemonizes: writes a pidfile and detaches. `stop`/`restart` target the pidfile; `reload` hot-loads config changes without dropping in-flight connections. A daemon launched this way is eligible for an automatic upgrade handoff when it is idle.

## @restart

`restart` is the explicit maintenance path. For a file-backed SQLite database,
it validates migration lineage and applies pending migrations to a private
snapshot before retaining a recovery backup and stopping the old daemon. It can
interrupt active agent runs, so use it after those runs finish.

## @status

Prints `running: no` when no daemon is reachable — safe to poll in scripts.
When the daemon supports upgrade metadata, JSON includes the installed and
daemon versions, `compatibility`, launcher ownership, and observed active-work
counts. These counts are only a snapshot; the daemon checks again before a
handoff can stop it.
