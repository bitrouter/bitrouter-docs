---
title: Policy
---

On a self-hosted deployment, routing policies are the artifact the [self-improving loop](/docs/overview/what-is-bitrouter) learns into: `init` scaffolds `policy-lock.yaml` and binds it to a named router, live traffic teaches the adequacy ledger, and `evolve --apply` folds proven downgrades back into the file. The walkthrough, table, and ledger semantics are in [bitrouter/auto](/docs/usage/bitrouter-auto#let-evidence-improve-the-policy).

<Callout type="info">
`bro policy create` + `bro key sign` are a **different surface** — per-virtual-key access control (allowed models, budgets, rate limits), not routing. See [Guardrails](/docs/configuration/guardrails).
</Callout>

## @policy init

```bash
bro policy init coding --router coding \
  --strong openai/gpt-5.4 \
  --economy moonshotai/kimi-k2.7-code
```

Writes `policy-lock.yaml` (strong/economy tiers, adequacy pre-seeded) and edits `bitrouter.yaml` comment-preservingly to bind the named router.

## @policy evolve

```bash
bro policy evolve          # dry-run candidate projection
bro policy evolve --apply  # atomically republish policy-lock.yaml in adaptive mode
```

Only **adds** qualified routes — never overwrites or removes yours. Publishing requires a policy mode that permits writes; frozen mode keeps the active lock unchanged.

## @policy reload

Hot-reloads the daemon's policy snapshot. An invalid lock is rejected and the daemon keeps its last-known-good.
