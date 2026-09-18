---
title: Policy
---

Routing policies are the artifact the [self-improving loop](/docs/overview/what-is-bitrouter) learns into: `init` scaffolds `policy-lock.yaml` and binds it to a preset, live traffic teaches the adequacy ledger, and `evolve --apply` folds proven downgrades back into the file. The walkthrough, table, and ledger semantics are in [Adaptive routing](/docs/overview/quickstart#adaptive-routing).

<Callout type="info">
`bro policy create` + `bro key sign` are a **different surface** — per-virtual-key access control (allowed models, budgets, rate limits), not routing. See [Guardrails](/docs/configuration/guardrails).
</Callout>

## @policy init

```bash
bro policy init coding --preset coding \
  --economy moonshotai/kimi-k2.7-code
```

Writes `policy-lock.yaml` (strong/economy tiers, adequacy pre-seeded) and edits `bitrouter.yaml` comment-preservingly to bind the preset with `writeback: locked`.

## @policy evolve

```bash
bro policy evolve          # dry-run candidate projection
bro policy unlock
bro policy evolve --apply  # atomically republish policy-lock.yaml
bro policy lock
```

Only **adds** qualified routes — never overwrites or removes yours — and refuses to publish while `writeback: locked`.

## @policy reload

Hot-reloads the daemon's policy snapshot. An invalid lock is rejected and the daemon keeps its last-known-good.
