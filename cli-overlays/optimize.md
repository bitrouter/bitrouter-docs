---
title: Optimize
---

`optimize` measures one `@auto` strong-to-economy route change against a
project-owned agent workflow. Setup discovers an eval entrypoint when it can,
pins the workflow, evaluator, prices, and policy lineage in version-controlled
files, and keeps every workflow model call behind a fresh private daemon.
It reuses existing `@auto` tiers, prompts for missing routes on a TTY, and
requires explicit `--strong` / `--economy` values in headless fresh setup.

```bash
bitrouter optimize setup
bitrouter optimize run --human
bitrouter optimize review --human
bitrouter optimize publish
```

`run` never publishes or retries a workflow identity. `review` separates the
agentic quality verdict from daemon-authored cost, latency, settlement, and
route attribution. The first frozen-to-adaptive publication needs TTY
confirmation or the explicit headless `--enable-adaptive` flag.

See [Workflow optimization](/docs/evals-and-tracing/workflow-optimization) for
the artifact and failure contract.
