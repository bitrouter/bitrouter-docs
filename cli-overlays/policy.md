---
title: Policy
---

Routing policies are version-controlled lockfiles. BitRouter compiles and
validates candidates against an exact parent and evidence root; publication is
always a separate command and is blocked while `policy.mode: frozen`.

<Callout type="info">
`bitrouter policy create` + `bitrouter key sign` are a different surface:
per-virtual-key access control (allowed models, budgets, and rate limits), not
model routing. See [Guardrails](/docs/models-and-routing/guardrails).
</Callout>

## @policy init

```bash
bitrouter policy init auto --preset auto \
  --economy bitrouter:moonshotai/kimi-k3
```

Creates or extends `policy-lock.yaml`, binds it to the preset, and keeps the
runtime in `frozen` mode. `@auto` is the maintained public preset used by
workflow optimization.

## @policy compile

```bash
bitrouter policy compile --output candidate-policy-lock.yaml \
  --eval-snapshot sha256:<eval-snapshot>
bitrouter policy diff policy-lock.yaml <candidate-path>
```

Compilation writes a candidate without changing the active policy. The
candidate pins its parent, evidence, compiler, and certificate lineage.

## @policy publish

```bash
bitrouter policy publish <candidate-path>
```

Publishes an already-compiled candidate only when the current config, parent
digest, evidence, certificates, and runtime mode still match. A stale candidate
or concurrent edit is rejected.

## @policy evolve

```bash
bitrouter policy evolve          # legacy evidence projection, dry run
bitrouter policy evolve --apply  # explicit publication; requires adaptive mode
```

`evolve` is the legacy adequacy-ledger projection. Use `compile` + `publish`
when an Eval snapshot is part of the candidate lineage, and use
`bitrouter optimize` for the controlled workflow quality/cost loop.

## @policy reload

Hot-reloads the validated active policy through the daemon control socket. An
invalid lock is rejected and the daemon keeps its last-known-good snapshot.
