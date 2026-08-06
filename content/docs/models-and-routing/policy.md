---
title: Policy
description: The operator-owned spec that decides how a loop routes — deterministic, no LLM in the path, and off by default.
---

A **policy** is the spec that decides how a loop routes. It's operator-owned config, not a model: the routing decision is deterministic, adds no LLM call to the path, and every deployment ships with it **off by default**. It sits at the center of BitRouter's [act → observe → evaluate → learn](/docs/overview/what-is-bitrouter) loop — the router **acts** on it, and **learning** writes back to it: the file an agent (or you) edits to spend a capable model only where it's earned and a cheaper one everywhere else.

## Preset-bound policy locks

Routing policies live in `policy-lock.yaml`, next to `bitrouter.yaml` by default. Bind a named policy to a preset, then select that preset as the request model. Bare model requests and presets without `policy:` behave exactly as before.

```yaml
# bitrouter.yaml
policy:
  # path: routing/team-policy.yaml  # optional; relative to this file
  writeback: locked

presets:
  coding:
    model: anthropic/claude-opus-4.8
    policy: coding
```

```yaml
# policy-lock.yaml
lockfileVersion: 1
policies:
  coding:
    key_strategy: workflow_state
    tiers:
      economy: moonshotai/kimi-k2.7-code
      strong: anthropic/claude-opus-4.8
    routes: {}
    default_tier: strong
    tool_use_tier: strong
    tool_safe_tiers: [strong]
    adequacy:
      enabled: true
      escalation_tier: strong
      explore_enabled: true
      explore_tier: economy
      explore_threshold: 3
```

Request `@coding` (or `@coding:variant`) to opt in. Preset prompt defaults and variant provider preferences are applied before the policy selects the effective model, and remain attached after selection.

The lock contains only the current effective policy. Git owns file history; the local database owns online evidence. Maps are serialized in a stable order and the semantic digest excludes comments, timestamps, and runtime ids, so the same policy produces the same artifact.

## Evolving and reloading

`locked` means BitRouter cannot programmatically replace `policy-lock.yaml`. It does not prevent an operator or Git from editing the file, and it does not prevent hot reload. Use `policy unlock` to permit a validated evolution candidate to be published atomically.

```bash
bitrouter policy init coding --preset coding \
  --economy moonshotai/kimi-k2.7-code
bitrouter policy check
bitrouter policy status
bitrouter policy evolve             # dry-run
bitrouter policy unlock
bitrouter policy evolve --apply
bitrouter policy reload             # no daemon restart
bitrouter policy lock
```

The optimizer consumes only policy-namespaced adequacy rows and only adds qualified routes that are currently absent. It never overwrites or removes an existing route, so operator and Git edits remain authoritative. Negative evidence still affects live adequacy routing; removing a materialized route is an explicit operator/Git change until writeback provenance is tracked separately in the database. Publication checks the semantic digest before a same-directory atomic rename; a detected intervening edit aborts publication instead of being silently overwritten. An invalid reload is rejected and the daemon keeps its last-known-good policy snapshot.

## Policy table semantics

At its core a policy is a static, operator-owned **table** that picks the model per request instead of taking the caller's requested model at face value:

- **Fingerprint** the agent-loop step from the canonical prompt, by the model's most-recent turn — `opening`, `after_<tool>` (e.g. `after_read_file`), or `midstream`.
- **Resolve** fingerprint → tier → model id, and rewrite the request's model. An unmatched fingerprint falls back to `default_tier`.
- **Hard tool-use guardrail:** a request carrying tools is clamped up to a tool-safe tier, so a downgrade never strands a tool call on a model that can't handle it.
- **Explicitly scoped:** bare models and direct `provider:model` requests never enter a named policy. Once a caller selects a bound preset, that policy owns the preset's effective base model even when it is provider-qualified. Server-tool flows such as `bitrouter/fusion` still pass through untouched.

The same fields are available under each named policy in `policy-lock.yaml`. The legacy top-level `policy_table:` remains supported as a global ingress transform for compatibility; new configurations should prefer preset-bound policies because their opt-in boundary is explicit.

That table alone is a complete, deterministic router. The rest of this page is the *adaptive* half — entirely opt-in.

## The adequacy ledger

Turn on `adequacy` and the router learns online, per request, without any round structure. An observer recomputes the fingerprint of each served request, maps the served model back to its tier, and — **only for a genuine downgrade** — records whether the request hard-failed:

- After `escalation_threshold` consecutive failures the fingerprint is **pinned** and escalated to a more capable tier. Pins persist locally and **decay after a cooldown**.
- With `explore_enabled`, the daemon periodically **trials** the cheap tier on fingerprints you left at the capable tier and **locks** the ones that keep succeeding — discovering safe downgrades automatically. A failed trial escalates and stops. The tool-use guardrail still clamps any trial of a tool request.

```yaml
adequacy:
  enabled: true
  escalation_tier: capable
  escalation_threshold: 2
  pin_cooldown_secs: 1800
  explore_enabled: true     # the aggressive knob
  explore_tier: cheap
  explore_threshold: 3
  explore_interval: 5
```

## The guarantee

The evidence rule is asymmetric: negative evidence escalates immediately, while a cheaper route needs repeated request-level success and any configured semantic-success gate before it becomes effective. A failed learned route unlocks and escalates again. Both learning and exploration are opt-in, so a policy with `adequacy` off behaves exactly like its deterministic table.

## Evaluation signal

The ledger above is fed by the **evaluate** step of the [act → observe → evaluate → learn](/docs/overview/what-is-bitrouter) loop, which answers one question after each request: *the route BitRouter picked — did it still reach the goal?*

Every request that goes through a policy-bound route is classified by outcome — success, or a hard failure with a cause (`provider transient`, `provider permanent`, `protocol`, `auth`, `client`, `semantic`) — and recorded against the request's fingerprint. There is **no LLM judge in the path**: the signal is deterministic and free, which is what makes cheap-tier downgrades safe to attempt at all. You don't configure the classifier; it runs whenever a policy has `adequacy` enabled.

Alongside it, every request is **cost-metered** into the local database with an estimated charge, so *what did that run cost?* is answerable per request, per model, and per provider. Two ways to read it:

- **Traces** — the settlement span carries cost attributes into your OTLP backend, so cost sits next to latency and outcome on every request. See [OpenTelemetry](/docs/features/opentelemetry).
- **Cloud Activity** — on BitRouter Cloud, spend, tokens, and the per-request log are hosted for you; content is never stored. See [Cloud Activity](/docs/features/opentelemetry#cloud-activity-hosted).

Because every hop is traced with outcome, cost, tokens, and the model that actually served, your OTLP backend doubles as an evaluation store: join spans by run, score them however you like, and you have run-level evals on your own terms today. This is the same substrate BitRouter's own benchmark harness consumes.

<Callout type="info">
The dedicated eval engine — scoring each *run* and routing decision against a declared objective (cost today, latency and accuracy next) as a first-class, user-facing feature — is **landing next**. What's described above is the live signal it will be built on; nothing here changes when it ships, it just gains a scorer on top.
</Callout>

## Not the same as Cloud policy

This page is about **routing** policy in the local router. BitRouter Cloud has a *separate* policy surface — `bitrouter cloud policy` manages budgets, rate limits, guardrails, and presets bound to an API key or workspace. See the [CLI](/docs/reference/cli) for those commands.

## Related

- [Provider selection](/docs/models-and-routing/provider-selection) — how the providers behind a chosen model are ranked.
- [Model fallback](/docs/models-and-routing/model-fallback) — walk an ordered list of models on failure.
- [Models](/docs/models-and-routing/models) — why a model is an aggregate the policy routes across.
