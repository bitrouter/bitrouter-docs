---
title: Daemon lifecycle
description: serve, start, stop, restart, reload, status — run and control the local BitRouter daemon your agent talks to.
---

Your agent never talks to a remote API directly — it points at the binary running locally, by default on `http://127.0.0.1:4356`. Everything else in these docs — the four model protocols, the MCP and ACP gateways — is served from that one endpoint. These six commands run and control it.

## @serve

Runs in the foreground — the form you want under a process supervisor or in a container:

```bash
bitrouter serve -c ./bitrouter.yaml
```

## @start

Daemonizes: writes a pidfile and detaches. `stop`/`restart` target the pidfile; `reload` hot-loads config changes without dropping in-flight connections.

## @status

Prints `running: no` when no daemon is reachable — safe to poll in scripts.
