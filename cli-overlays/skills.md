---
title: Skills and MCP
---

`skills` manages the [Agent Skills](https://agentskills.io) installed for your harness — install them with `npx skills add <source>`; `mcp` runs BitRouter's own MCP server — the tool surface any MCP client can drive instead of shelling out. What the server exposes (backends, transports, the gateway distinction) lives on the [MCP Server](/docs/usage/mcp) page.

## @mcp serve

```bash
bitrouter mcp serve                    # stdio → local daemon at 127.0.0.1:4356
bitrouter mcp serve --backend skills   # the AgentSkills gateway as a standalone server
bitrouter mcp install --client claude  # print the mcpServers config block to paste
```
