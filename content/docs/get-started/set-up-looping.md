---
title: Set Up Looping
description: Turn on the self-improving loop — bind a policy to a preset, let the adequacy signal learn from live traffic, and fold what it proves back into the policy spec.
---

This is the page that closes the [act → observe → evaluate → learn](/docs/overview/what-is-bitrouter) cycle. The router **acts** on a policy spec, telemetry **observes** every hop, the adequacy signal **evaluates** each route — and here you wire the **learn** step, so proven improvements get written back into the spec. It assumes you've [set up routing](/docs/get-started/set-up-routing) and have a preset in mind.

The artifact at the center is `policy-lock.yaml` — the current effective policy, living next to `bitrouter.yaml`. **Git owns its history; the local database owns the evidence.**

## 1. Create the policy

One command scaffolds everything:

```bash
bitrouter policy init coding --preset coding \
  --economy moonshotai/kimi-k2.7-code
```

This writes `policy-lock.yaml` with a two-tier table (strong = your preset's model, economy = the cheap model), clamps tool-carrying requests to the strong tier so a downgrade never strands a tool call, pre-seeds adequacy learning, and edits `bitrouter.yaml` to bind the policy to the preset with `writeback: locked`:

```yaml
# bitrouter.yaml (edited by policy init)
presets:
  coding:
    model: anthropic/claude-opus-4.8
    policy: coding
policy:
  writeback: locked
```

## 2. Route traffic through it

Select the preset as the model — that's the entire opt-in boundary. Bare model requests are untouched by policies:

```bash
curl http://127.0.0.1:4356/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "@coding", "messages": [{"role": "user", "content": "..."}]}'
```

Each request is fingerprinted by loop step (`opening`, `after_<tool>`, `midstream`) and routed per the table. Right now every fingerprint routes strong — the table starts conservative.

## 3. Learning runs automatically

With adequacy enabled, the daemon learns online from the [eval signal](/docs/get-started/set-up-evaling) — no LLM, no randomness, a deterministic trial cadence:

- **Escalation (the safety half)** — a downgraded fingerprint that hard-fails `escalation_threshold` consecutive times is pinned up to the strong tier. Pins decay after a cooldown.
- **Exploration (the aggressive half)** — with `explore_enabled`, roughly 1-in-`explore_interval` candidate requests is trialed on the economy tier; `explore_threshold` consecutive adequate trials *qualify* the fingerprint for the cheap tier. A failed trial escalates and stops.

```yaml
# policy-lock.yaml
adequacy:
  enabled: true
  escalation_tier: strong
  explore_enabled: true
  explore_tier: economy
  explore_threshold: 3
```

## 4. Fold learning back into the spec

Qualified downgrades live in the database until you publish them. The publish cycle is explicit and digest-checked:

```bash
bitrouter policy status          # path, digest, writeback mode, bindings
bitrouter policy evolve          # dry-run: which routes would materialize
bitrouter policy unlock          # permit programmatic writeback
bitrouter policy evolve --apply  # atomically republish policy-lock.yaml
bitrouter policy reload          # daemon picks it up — no restart
bitrouter policy lock            # forbid programmatic writes again
```

`evolve --apply` only **adds** qualified routes — it never overwrites or removes anything you or Git wrote, and a detected intervening edit aborts the publish instead of clobbering it. Commit the result and the improved table is in Git, where a policy belongs. Run the cycle on whatever cadence suits you — by hand, from cron, or from an agent you trust with `unlock`.

<Callout type="info">
`bitrouter policy create` + `bitrouter key sign` are a **different surface** — per-key access control (allowed models, budgets, rate limits), not routing. See [Guardrails](/docs/features/guardrails).
</Callout>

## Next steps

<Cards>
  <Card title="Policy" href="/docs/models-and-routing/policy" description="Full table semantics, the adequacy ledger, and the asymmetric evidence guarantee." />
  <Card title="Set up evaling" href="/docs/get-started/set-up-evaling" description="The signal the loop learns from." />
  <Card title="Presets" href="/docs/models-and-routing/presets" description="The opt-in boundary for adaptive routing." />
</Cards>
