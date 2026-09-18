---
title: CLI
description: The bro CLI — run and inspect the local router, launch coding agents, and manage your BitRouter Cloud account.
---

BitRouter ships as one **static binary**, `bro`, with no runtime dependencies to install. It runs the local router your applications call, launches supported coding agents, and exposes scriptable commands for routing, evaluation, optimization, and your hosted account.

Start with `bro init` for guided setup, `bro serve` for a foreground router, or `bro code` for BitRouter's coding conversation.

Every command below is **generated from the binary's own `--help`**, so the flags you see here are the flags your installed version accepts.

## Conventions

- **Output is JSON by default** for scriptable commands. The compatibility options `--json`, `--human`, and `--context <NAME>` go before the command when needed.
- **`-c/--config <PATH>`** overrides config discovery for any command that loads a config. Discovery order: `./bitrouter.yaml` → `$BITROUTER_HOME/bitrouter.yaml` → `~/.bitrouter/bitrouter.yaml` → zero-config (in-memory defaults, auto-enabling providers from env keys).
- **Credentials** live under `$XDG_DATA_HOME/bitrouter/account-credentials.json` (mode `0600`), written by `cloud login` or `providers login`.

## Environment variables

| Variable | Effect |
| --- | --- |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENCODE_ZEN_API_KEY` | Zero-config BYOK — auto-enables the provider. See [BYOK](/docs/customization/models#built-in-providers-with-your-own-key) |
| `BITROUTER_API_KEY` | Cloud API key; enables the managed `bitrouter` provider |
| `BITROUTER_HOME` | Config discovery override (see above) |
| `BITROUTER_OAUTH_AS` | Override the OAuth authorization server for self-hosted Cloud |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Opt in to OTLP export. See [OpenTelemetry](/docs/configuration/observability#self-hosted-opentelemetry) |

## Command map

- **Run it** — [daemon lifecycle](#daemon-lifecycle): lifecycle, request history, retained operations, and remote contexts
- **Onboard** — [init and config](#init-and-config): the wizard, config validation
- **Inspect routing** — [routing introspection](#routing-introspection): decision preview, model catalog, OTel state
- **Providers** — [providers](#providers): catalog and subscription login
- **Evaluate and improve** — [policy](#policy): policies, evidence exchange, optimization, and trajectory history
- **Cloud** — [cloud](#cloud): login, keys, usage, billing, policies, BYOK
- **Agents and protocols** — [agents, ACP, and MCP](#agents-acp-and-mcp): agent catalog, ACP adapters, and upstream MCP checks
- **Skills** — [skills](#skills): inspect installed Agent Skills or scaffold one locally
- **Coding agents** — [coding agents](#coding-agents): native launch, interactive conversation, and headless ACP runs
- **Misc** — [key, workflow-state, and update](#key-workflow-state-and-update): virtual keys, benchmark tooling, self-update

The deprecated `bitrouter` command may still be installed as a compatibility alias, but documentation uses `bro`. Agents can operate BitRouter through the shipped [Agent Skill](/docs/usage/skills); BitRouter's MCP support is an upstream client and aggregate gateway, not a first-party origin tool server.
