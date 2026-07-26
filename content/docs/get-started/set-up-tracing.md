---
title: Set Up Tracing
description: Turn on OpenTelemetry export in three steps — every request becomes a trace with per-hop cost, tokens, and latency, pushed over OTLP to any backend you run.
---

Tracing is the **observe** step of the [loop](/docs/overview/what-is-bitrouter): every request becomes a trace — ingress, the routing decision, one span per upstream attempt (including failovers), and settlement — following the OpenTelemetry GenAI semantic conventions. It's **off until you point it somewhere**, excludes message content by default, and runs entirely on your own infrastructure.

## 1. Pick a backend

Anything that speaks OTLP/HTTP works: an OpenTelemetry Collector (the usual front door, and the bridge to Prometheus-based stacks), Jaeger, Honeycomb, Grafana Cloud, or the Datadog Agent. For a first look, run a local collector and use its default OTLP/HTTP receiver at `http://localhost:4318`.

## 2. Point BitRouter at it

Add an `otel` block under the `bitrouter-observe` plugin in `bitrouter.yaml` — an endpoint alone turns export on:

```yaml
plugins:
  bitrouter-observe:
    otel:
      endpoint: "http://localhost:4318"
      service_name: "bitrouter"
```

Or skip the file entirely — every field has an environment override, so this alone opts in:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
bitrouter reload        # pick up config without dropping connections
```

For an authenticated backend like Honeycomb, keep secrets in the environment:

```yaml
plugins:
  bitrouter-observe:
    otel:
      endpoint: "https://api.honeycomb.io"
      headers:
        x-honeycomb-team: "${HONEYCOMB_API_KEY}"
```

## 3. Verify

```bash
bitrouter observe status     # endpoint, sampler, cardinality, in-flight spans
```

Send a request through the proxy, then look for one inbound `chat` span with a `CLIENT` child per upstream attempt. A failover chain shows every provider tried, in order — traces are where routing behavior becomes legible.

<Callout type="info">
There is **no Prometheus scrape endpoint** — metrics push over OTLP only. If your stack is Prometheus-based, put a Collector with the Prometheus exporter in between.
</Callout>

## Tune it

The defaults are production-safe: parent-based sampling, content excluded, cardinality-capped dimensions. Common knobs, all under the same `otel` block:

```yaml
otel:
  sampler: "parentbased_traceidratio"
  sampler_arg: 0.1              # keep 10% of root traces
  content_capture: "full"       # off (default) | full — prompts/responses onto spans
```

<Callout type="warn">
`content_capture: "full"` writes user prompts and model responses into your telemetry backend, where they inherit that backend's access controls and retention. Leave it `off` outside scoped debugging sessions.
</Callout>

## Next steps

The full reference — span attributes, timing metrics, the metrics table, backend recipes (Collector, Honeycomb, Grafana, Datadog), and Cloud's hosted Activity view — lives on the feature page:

<Cards>
  <Card title="OpenTelemetry" href="/docs/features/opentelemetry" description="Span model, metrics, sampling, and backend recipes." />
  <Card title="Set up evaling" href="/docs/get-started/set-up-evaling" description="Score what the routes you traced actually did." />
  <Card title="Set up looping" href="/docs/get-started/set-up-looping" description="Fold the observed signal back into the policy spec." />
</Cards>
