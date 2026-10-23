---
title: Policy
---

Local routing policies are the artifact used by the [self-improving loop](/docs/overview/what-is-bitrouter): `init` scaffolds `policy-lock.yaml` and binds it to a named router. Operators can compile candidates from evidence and publish them, or authorize an optimizer step that may publish a transition. See [Routing policy](/docs/models-routing/policy#let-evidence-improve-the-policy).

<Callout type="info">
`bro policy create` + `bro key sign` are a **different surface** — per-virtual-key access control (allowed models, budgets, rate limits), not routing. See [access-control policies](/docs/config/configuration-file#three-meanings-of-policy).
</Callout>

## @policy init

```bash
bro policy init coding --router coding \
  --strong openai:openai/gpt-5.6-sol \
  --economy moonshotai:moonshotai/kimi-k2.7-code
```

The tiers must be configured, active `provider:model` routes; substitute routes available in your deployment. The command writes `policy-lock.yaml` and edits `bitrouter.yaml` to bind the named router. The router binding preserves the configured policy mode.

## @policy evolve

```bash
bro policy evolve          # dry-run candidate projection
bro policy evolve --apply  # atomically republish policy-lock.yaml in adaptive mode
```

Qualified changes may add or update compiler-owned routes; operator-authored routes are preserved. Publishing requires `policy.mode: adaptive`; frozen mode refuses writes.

## @policy reload

Hot-reloads the daemon's policy snapshot. An invalid lock is rejected and the daemon keeps its last-known-good.
