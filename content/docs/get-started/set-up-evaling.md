---
title: Set Up Evaling
description: The evaluate step of the loop — what's live today (per-request adequacy outcomes, cost metering, traces as the eval substrate) and what's landing next (run-level, objective-scored evals).
---

The **evaluate** step of the [loop](/docs/overview/what-is-bitrouter) answers one question after each request: *the route BitRouter picked — did it still reach the goal?* That signal is what makes adaptive routing safe to turn on, and it's what the learn step folds back into the policy.

This page is honest about scope: the evaluation signal below **is live today** and already drives routing decisions. Run-level, objective-scored evals — scoring a whole agent run against your chosen objective — are the next milestone and are called out as such.

## The adequacy outcome signal (live)

Every request that goes through a policy-bound route is observed and classified by outcome — success, or a hard failure with a cause (`provider transient`, `provider permanent`, `protocol`, `auth`, `client`, `semantic`). The classification is recorded against the request's **fingerprint** (which step of the loop it was) in the local adequacy ledger.

There is **no LLM judge in the path** — the signal is deterministic and free. It's also what makes cheap-tier downgrades safe: after `escalation_threshold` consecutive failures on a downgraded fingerprint, the route is pinned back up to a more capable tier automatically.

You don't configure the classifier itself — it runs whenever a policy has adequacy enabled:

```yaml
# policy-lock.yaml (per named policy)
adequacy:
  enabled: true
  escalation_tier: strong
  escalation_threshold: 2
```

The full semantics — pins, cooldowns, exploration trials — and the walkthrough are in [Set up looping](/docs/get-started/set-up-looping).

## Cost metering (live)

Every request is metered into the local database with an estimated charge, so *what did that run cost?* is answerable per request, per model, per provider — the raw material for cost-objective evaluation. Two ways to read it:

- **Traces** — the settlement span carries cost attributes into your OTLP backend, so cost sits next to latency and outcome on every request. See [Set up tracing](/docs/get-started/set-up-tracing).
- **Cloud Activity** — on BitRouter Cloud, spend, tokens, and the per-request log are hosted for you; content is never stored. See [Cloud Activity](/docs/features/opentelemetry#cloud-activity-hosted).

## Traces as the eval substrate (live)

Because every hop is traced with outcome, cost, tokens, and the model that actually served, your OTLP backend doubles as an evaluation store: join spans by run, score them however you like, and you have run-level evals on your own terms today. This is the same substrate BitRouter's own benchmark harness consumes.

## Objective-scored evals (next milestone)

<Callout type="info">
The dedicated eval engine — scoring each *run* and routing decision against a declared objective (cost today, latency and accuracy next) as a first-class, user-facing feature — is **landing next**. What's described above is the live signal it will be built on; nothing on this page changes when it ships, it just gains a scorer on top.
</Callout>

## Next steps

<Cards>
  <Card title="Set up looping" href="/docs/get-started/set-up-looping" description="Fold the adequacy signal back into the policy spec." />
  <Card title="Set up tracing" href="/docs/get-started/set-up-tracing" description="The observability substrate evals build on." />
</Cards>
