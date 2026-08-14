---
title: Routing introspection
---

Three read-only views over the same routing state the daemon acts on. Use them to answer *what would BitRouter do?* before sending traffic.

## @route

```bash
bitrouter route anthropic/claude-opus-4.8
bitrouter route @coding          # presets resolve through their bound policy
```

Uses the running daemon when reachable, otherwise resolves from the config on disk — so it works in CI too.

## @models

```bash
bitrouter models                 # every model id routable right now
bitrouter models --provider anthropic
```

## @observe status

Reports the OTel exporter's live state — endpoint, sampler, cardinality usage, in-flight spans. The verification step for [OpenTelemetry](/docs/evals-and-observability/opentelemetry).
