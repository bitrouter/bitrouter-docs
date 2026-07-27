---
title: key, workflow-state & update
description: Virtual-key signing for access control, benchmark trace utilities, and the self-updater.
---

## @key sign

Mints a **virtual key** bound to an access-control policy — the per-key guardrails surface (allowed models, budgets, rate limits), distinct from routing policies. See [Guardrails](/docs/features/guardrails).

```bash
bitrouter key sign --user ci --policy nightly-cap
```

## @workflow-state

<Callout type="warn">
Internal benchmark tooling — the plumbing behind the published Terminal-Bench reports (trace capture, outcome bundling, reward feedback), not a production user surface. It's documented here only for completeness; you almost certainly don't need it.
</Callout>

## @update

```bash
bitrouter update
```

Updates the installed binary in place to the latest release — follows prereleases by default while pre-1.0. Homebrew and `cargo install` builds update through their own package manager instead.
