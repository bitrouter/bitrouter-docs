---
title: Onboarding
description: Install BitRouter and get your agent routing in under a minute — pick self-host or Cloud, then onboard via the Agent Skill, the CLI wizard, or manual env keys.
---


This page gets BitRouter routing for your agent in under a minute. There are two deployment modes, and three ways to onboard either one — the Agent Skill, the CLI wizard, or manual env keys.

- **BitRouter Cloud (default).** Hosted endpoint at `api.bitrouter.ai`. No upstream keys to manage; agent-native x402/MPP pay-per-use, or BYOK on top.
- **Local proxy.** A single binary on your machine, BYOK with your own provider keys. Zero infrastructure dependencies.

Both modes run the **same open-source core** (Apache 2.0) — the routing engine is identical, so you can start in one mode and switch later without touching your harness.

## Self-host or Cloud?

Every core capability works the same either way — Cloud only adds what needs a server you don't run.

- **Self-host** if you already have provider keys, run local/private models, have data-residency rules, or are prototyping solo.
- **Cloud** if you want no key management and per-request billing, a managed provider network without provider signups, team workspaces, or an uptime SLA.

| Capability | Self-hosted (OSS) | Cloud |
| --- | --- | --- |
| Universal API + cross-protocol routing | ✅ | ✅ |
| BYOK (bring your own provider keys) | ✅ | ✅ |
| Local / private model serving | ✅ | ✅ |
| Model fallback & provider selection | ✅ | ✅ |
| Model variants & presets | ✅ | ✅ |
| Guardrails | ✅ | ✅ |
| Observability (OTLP trace + metric export) | ✅ | ✅ |
| MCP & ACP gateways | ✅ | ✅ |
| Structured outputs | ✅ | ✅ |
| Namespace isolation primitive | ✅ | ✅ |
| Managed provider network (no upstream keys needed) | — | ✅ |
| Team seats & per-workspace access control | — | ✅ |
| Hosted observability console | — | ✅ |
| Managed billing (one wallet, per-request) | — | ✅ |
| SLA on the hosted endpoint | — | ✅ |
| Priority support | — | ✅ |
| Agentic payment marketplace | — | ✅ |

Do you need your own provider keys? Only if you self-host with BYOK — a Cloud account needs **no upstream keys**: one sign-in covers the whole hosted network, billed per request, failed requests not charged. You can also attach Cloud to a self-hosted binary and use both.

## Install the binary

<Tabs items={['macOS / Linux', 'Homebrew', 'npm', 'cargo']}>
<Tab value="macOS / Linux">

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh | sh
```

</Tab>
<Tab value="Homebrew">

```bash
brew install bitrouter/tap/bitrouter
```

</Tab>
<Tab value="npm">

```bash
npm install -g bitrouter
```

</Tab>
<Tab value="cargo">

```bash
cargo install bitrouter
```

</Tab>
</Tabs>

## Onboard via the Agent Skill

For agent runtimes that support skills (Claude Code, Cursor, Codex, Copilot, etc.). BitRouter ships a `/bitrouter` [Agent Skill](https://agentskills.io) so the agent can install, configure, migrate to, and troubleshoot BitRouter **on its own** — the skill carries the facts that drift easily (the listen port, env var names, the `provider/model` slash form, which subcommands exist), and it lives in the main repo at `skills/bitrouter/`, kept in sync with the code in the same change. Install once:

```bash
bitrouter skills add bitrouter        # via BitRouter's own installer
npx skills add bitrouter/bitrouter    # via the generic skills CLI
```

Then ask your agent: *"Set up BitRouter for me."* — the agent runs the wizard, picks Cloud by default, and verifies the connection autonomously.

<Callout type="info">
The `/bitrouter` skill *drives* BitRouter; the [AgentSkills gateway](/docs/features/tools) is the opposite direction — BitRouter *serving* skills as governed, routable resources to the agents behind it.
</Callout>

## Onboard via the CLI wizard

For terminal-first setup, launch the wizard:

```bash
bitrouter
```

Bare `bitrouter` runs a **network-free credential probe** — BYOK env keys, the cloud session file, and the local credential store — then launches the wizard when nothing is configured, or prints a one-line status when it is. It never re-onboards a configured user and never silently spawns a daemon. The wizard walks three steps:

1. **Credentials** — sign in to BitRouter Cloud (default), log in to a provider, or paste a BYOK key.
2. **Harness** — `claude` or `codex`, installed via the native installer when missing.
3. **Finish** — launch the harness, start the proxy at `http://127.0.0.1:4356`, or exit.

Every step maps to a flag, so an agent (or CI) can run the whole flow without a human. `--yes` never blocks: it consumes flag-supplied credentials, reports-and-skips anything that would need interactive OAuth, and emits a JSON result envelope on stdout:

```bash
bitrouter init --yes \
  --provider openai --provider-api-key "sk-..." \
  --harness claude --after serve
```

| Flag | Step | Effect |
| --- | --- | --- |
| `--cloud-login` | 1 | Sign in to Cloud via device-flow OAuth (skipped + reported under `--yes`) |
| `--api-key <BRK_KEY>` | 1 | Seed the Cloud credential from a `brk_` API key (non-interactive) |
| `--provider <ID>` | 1 | Log in to an upstream provider by id (repeatable) |
| `--provider-api-key <KEY>` | 1 | Key for the `--provider` at the same position (repeatable) |
| `--use-detected` | 1 | Accept the auto-detected credential(s) without prompting |
| `--harness <claude\|codex>` | 2 | Harness to drive (repeatable) |
| `--no-install` | 2 | Never install a missing harness |
| `--after <launch\|serve\|exit>` | 3 | What to do at the end |
| `-c, --config <PATH>` | — | Where to write the starter `bitrouter.yaml` |
| `--force` | — | Allow overwriting an existing `bitrouter.yaml` |
| `--reset` | — | Clear stored onboarding credentials before running |

```bash
bitrouter init --yes --use-detected --harness claude --after serve   # accept env keys, run proxy
bitrouter init --yes --api-key "brk_..." --after exit                # Cloud key, no launch
bitrouter init --reset                                               # clear credentials, start over
```

The wizard never writes `bitrouter.yaml` beyond the canned starter template — your routing config stays yours to edit.

## Run self-hosted

Set your provider keys in the environment and start the proxy:

```bash
export OPENAI_API_KEY=sk-...    # ANTHROPIC_API_KEY / GEMINI_API_KEY also work
bitrouter start
# Proxy running at http://127.0.0.1:4356
```

BitRouter auto-detects any key set in the environment — no config file needed. Any provider whose key is present is immediately available. See [BYOK](/docs/models-and-routing/byok) for the full list of recognized variables, or [local & private models](/docs/integrations/models) to point BitRouter at Ollama, vLLM, or LM Studio for free.

For advanced routing rules, guardrails, or multi-account failover, scaffold a config file:

```bash
bitrouter init          # writes ./bitrouter.yaml (override with `-c <path>`)
bitrouter start
```

## Use BitRouter Cloud

Sign in to a BitRouter Cloud account from the terminal — one account covers every model the hosted network offers, with no upstream provider keys required:

```bash
bitrouter cloud login   # RFC 8628 device flow against api.bitrouter.ai
bitrouter start         # the `bitrouter` provider auto-enables once signed in
```

You can also point an agent straight at the hosted endpoint without running a local binary. Either way the core is the same — a Cloud account is an account and network, not a separate deployment. See the [Supported Models](/docs/overview/supported-models) catalog for pricing.

## Attach Cloud to a self-hosted binary

Cloud is not a different binary — it's an account you attach:

```bash
bitrouter cloud login
# Opens a browser to sign in and pick a workspace.
# Your local binary now routes Cloud-managed models alongside your BYOK keys.
```

You can add or remove the Cloud account at any time. The binary's self-hosted capabilities are unaffected either way.

## Point your agent at the proxy

However you start it, BitRouter is a drop-in proxy. Point your agent runtime at the proxy base URL — `http://127.0.0.1:4356` when self-hosting — and every model call routes through BitRouter with no harness changes.

Verify with a request:

```bash
curl http://127.0.0.1:4356/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

Point any OpenAI-compatible runtime at `http://127.0.0.1:4356/v1` to route through BitRouter.

## Next steps

<Cards>
  <Card title="Set up routing" href="/docs/get-started/set-up-routing" description="Presets, fallback chains, and multi-account failover." />
  <Card title="Integrations" href="/docs/integrations" description="Step-by-step guides for every supported agent runtime" />
  <Card title="CLI reference" href="/docs/reference/cli" description="The full command surface of the binary." />
  <Card title="For Providers" href="/docs/guides/register-as-a-provider" description="List your models on the BitRouter Registry" />
</Cards>
