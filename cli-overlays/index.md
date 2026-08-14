---
title: CLI
description: The bitrouter binary — one local endpoint your runtime points at, a daemon you control, and a scriptable surface for routing, policy, and your Cloud account.
---

BitRouter ships as one **static binary**, `bitrouter`, with no dependencies to install. It plays two roles: it runs the **local router** your agent talks to (by default on `http://127.0.0.1:4356`), and it's the **command-line surface** for routing introspection, policy lifecycle, and your hosted account.

Running it bare is always safe: `bitrouter` probes for configured credentials without touching the network, then launches the [onboarding wizard](/docs/overview/quickstart) when nothing is configured, or prints a one-line status when it is.

Every command below is **generated from the binary's own `--help`**, so the flags you see here are the flags your installed version accepts.

## Conventions

- **Output is JSON by default** (agent-native). `-j/--json` forces JSON where it's optional; `--human` renders the human-readable view instead. Both are [global flags](#global-flags) — accepted everywhere, so the per-command tables below list only what's specific to that command.
- **`-c/--config <PATH>`** overrides config discovery for any command that loads a config. Discovery order: `./bitrouter.yaml` → `$BITROUTER_HOME/bitrouter.yaml` → `~/.bitrouter/bitrouter.yaml` → zero-config (in-memory defaults, auto-enabling providers from env keys).
- **Credentials** live under `$XDG_DATA_HOME/bitrouter/account-credentials.json` (mode `0600`), written by `cloud login` or `providers login`.

## Environment variables

| Variable | Effect |
| --- | --- |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENCODE_ZEN_API_KEY` | Zero-config BYOK — auto-enables the provider. See [BYOK](/docs/models-and-routing/bring-your-own-provider) |
| `BITROUTER_API_KEY` | Cloud API key; enables the managed `bitrouter` provider |
| `BITROUTER_HOME` | Config discovery override (see above) |
| `BITROUTER_OAUTH_AS` | Override the OAuth authorization server for self-hosted Cloud |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Opt in to OTLP export. See [OpenTelemetry](/docs/evals-and-observability/opentelemetry) |

## Command map

- **Run it** — [daemon lifecycle](#daemon-lifecycle): `serve`, `start`, `stop`, `restart`, `reload`, `status`
- **Onboard** — [init and config](#init-and-config): the wizard, config validation
- **Inspect routing** — [routing introspection](#routing-introspection): decision preview, model catalog, OTel state
- **Providers** — [providers](#providers): catalog and subscription login
- **The loop** — [policy](#policy): init, check, evolve, lock/unlock, reload
- **Cloud** — [cloud](#cloud): login, keys, usage, billing, policies, BYOK
- **Gateways** — [tools, agents, and ACP](#tools-agents-and-acp): MCP introspection, agent catalog, ACP sessions
- **Skills & MCP** — [skills and MCP](#skills-and-mcp): install skills, run the origin MCP server
- **Harnesses** — [harnesses](#harnesses): run agents pointed at the daemon
- **Misc** — [key, workflow-state, and update](#key-workflow-state-and-update): virtual keys, benchmark tooling, self-update

Not the only surface: an agent can also drive BitRouter over [MCP](/docs/usage/mcp) — the origin server exposing `complete`, `list_models`, and `status` as tools — or via the shipped `/bitrouter` [Agent Skill](/docs/usage/skills), which teaches a coding agent to install and operate BitRouter on its own.
