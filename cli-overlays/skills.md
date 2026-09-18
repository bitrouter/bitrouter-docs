---
title: Skills
---

`bro skills` inspects installed [Agent Skills](https://agentskills.io) and scaffolds a local `SKILL.md`. Installing a published skill remains the responsibility of the agent runtime or its skill installer; BitRouter no longer exposes an origin MCP server that installs skills for a client.

## @skills list

```bash
bro skills list
bro skills list --global
```

## @skills init

```bash
bro skills init my-skill
```

This creates `my-skill/SKILL.md` in the current directory unless `--output` names another path.
