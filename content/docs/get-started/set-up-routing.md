---
title: Set Up Routing
description: From zero-config provider keys to presets, fallback chains, and multi-account failover — the routing half of the loop, in one walkthrough.
---

This page gets model routing working end to end. It assumes you've [installed BitRouter](/docs/get-started/onboarding) and have the proxy running (`bitrouter start`, listening at `http://127.0.0.1:4356`). Everything here is the **act** step of the [loop](/docs/overview/what-is-bitrouter) — the walkthrough is opinionated; the full reference lives in [Models & Routing](/docs/models-and-routing/provider-selection).

## Zero-config: keys in the environment

With no config file at all, BitRouter auto-enables any provider whose key is set:

```bash
export OPENAI_API_KEY=sk-...        # ANTHROPIC_API_KEY / GEMINI_API_KEY / OPENROUTER_API_KEY also work
bitrouter start
```

Point your runtime at `http://127.0.0.1:4356/v1` and request any model those providers serve — BitRouter picks a provider for you. For anything beyond that, scaffold a config:

```bash
bitrouter init        # writes ./bitrouter.yaml
bitrouter config validate
```

BitRouter looks for `bitrouter.yaml` in the current directory first, then `$BITROUTER_HOME`, then `~/.bitrouter` — and falls back to zero-config when none exists.

## Declare providers

```yaml
providers:
  openai: {}                                  # uses OPENAI_API_KEY
  anthropic:
    api_key: "${ANTHROPIC_KEY_A}"             # ${VAR} resolved at load time
  google:
    accounts:                                 # multi-account failover
      - { api_key: "${GEMINI_KEY_A}", label: primary }
      - { api_key: "${GEMINI_KEY_B}", label: overflow }
    account_strategy: failover                # or balance
inherit_defaults: true
```

`inherit_defaults: true` keeps the built-in provider catalog; your blocks override per provider. Rate limits, custom `api_base` endpoints, per-model pricing, and protocol mappings all live under the same `providers.<id>` key — see [Provider selection](/docs/models-and-routing/provider-selection) for the full field reference and how providers behind a model get ranked.

## Route by name: presets and variants

A **preset** is a named routing profile your agent selects in the model field:

```yaml
presets:
  coding:
    model: anthropic/claude-opus-4.8
    routing:
      require_tags: [tools]
```

```bash
curl http://127.0.0.1:4356/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "@coding", "messages": [{"role": "user", "content": "Hello"}]}'
```

`@coding:cheap` selects a **variant** — the same preset with a different provider preference. Presets are also the opt-in boundary for adaptive routing: binding a `policy:` to a preset is what lets the loop learn on it. See [Presets](/docs/models-and-routing/presets) and [Model variants](/docs/models-and-routing/model-variants).

## Add a fallback chain

A **virtual model** walks an ordered endpoint list when an upstream fails — a retryable failure (`5xx` / `408` / `429` / timeout / credit exhaustion) advances to the next endpoint:

```yaml
models:
  assistant:
    strategy: priority          # or cascade
    endpoints:
      - { provider: anthropic, service_id: claude-opus-4.8 }
      - { provider: openai, service_id: gpt-5.5 }
```

Your agent requests `assistant`; the chain is invisible to it. See [Model fallback](/docs/models-and-routing/model-fallback) for strategy semantics and per-endpoint overrides.

## Verify

```bash
bitrouter models                 # every model id routable right now
bitrouter route anthropic/claude-opus-4.8   # preview the routing decision
```

Then send a real request and watch it route — wire up [tracing](/docs/get-started/set-up-tracing) first if you want to see every hop.

## Next steps

<Cards>
  <Card title="Set up tracing" href="/docs/get-started/set-up-tracing" description="See every routing decision as a trace, with cost per hop." />
  <Card title="Set up looping" href="/docs/get-started/set-up-looping" description="Bind a policy to a preset and let routing improve every run." />
  <Card title="Provider selection" href="/docs/models-and-routing/provider-selection" description="The full provider config and ranking reference." />
  <Card title="BYOK" href="/docs/models-and-routing/byok" description="Every recognized key variable and account layout." />
</Cards>
