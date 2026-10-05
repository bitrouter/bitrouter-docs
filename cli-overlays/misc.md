---
title: Key, workflow-state, and update
---

## @key sign

Mints a **virtual key** bound to an access-control policy — the per-key guardrails surface (allowed models, budgets, rate limits), distinct from routing policies. See [Guardrails](/docs/configuration/guardrails).

```bash
bro key sign --user ci --policy nightly-cap
```

## @workflow-state

<Callout type="warn">
Internal benchmark tooling — the plumbing behind the published Terminal-Bench reports (trace capture, outcome bundling, reward feedback), not a production user surface. It's documented here only for completeness; you almost certainly don't need it.
</Callout>

## @update

```bash
bro update
```

Updates the installed binary in place to the latest release — follows prereleases by default while pre-1.0. Homebrew and `cargo install` builds update through their own package manager instead.

After a self-managed update, BitRouter attempts a safe handoff to an idle
daemon that `bro start` owns. The daemon must support the handoff protocol and
the SQLite migration preflight must succeed. A busy, legacy, incompatible, or
externally supervised daemon is left running and the update reports `deferred`;
finish its work and use the owning service manager or an explicit `bro restart`
as appropriate. `bro update --check` never restarts a daemon. The hidden
`--restart` spelling remains accepted for older scripts, but safe handoff is
already the default.
