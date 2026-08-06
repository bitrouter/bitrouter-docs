---
title: BitRouter vs LiteLLM
description: LiteLLM is a Python-native library that lives inside your app; BitRouter is a single Rust binary with zero dependencies and ~7× better tail latency under load. An honest side-by-side.
---

LiteLLM is the popular MIT-licensed, Python-native option — and if you want a library that lives *inside* your application with SDK-level call hooks, that's exactly its strength. The differences show up in operations and latency.

## Operations and latency

A production LiteLLM deployment typically means Postgres, Redis, and Docker Compose to run the proxy, and its Python runtime carries the GIL: under concurrent load, tail latency climbs to **~85ms p99**. BitRouter is a single binary with zero dependencies (`bitrouter serve`, ready in ~340ms) and a Rust async core that holds **~12ms p99** at 1k req/s.

## What each one routes

On agent features the gap is structural: an MCP/ACP gateway, KYA identity, injection detection, and autonomous x402 payments are built into BitRouter and absent from LiteLLM. LiteLLM routes model calls; BitRouter routes *agent runs* — and wraps them in an [act → observe → evaluate → learn](/docs/overview/what-is-bitrouter) loop that tightens routing every run, instead of forwarding to a static route.

<CompareTable slug="bitrouter-vs-litellm" />

## LiteLLM is the right call when

You want a Python-native library embedded directly in your app code, your stack is pure Python and you rely on framework callbacks (async generators, middleware), or you lean on LiteLLM's extensive provider mapping for non-standard model endpoints. If you'd rather move the routing out of your process, the [migration guide](/docs/guides/migrate-from-litellm) covers it.

## Next steps

<Cards>
  <Card title="Migrate from LiteLLM" href="/docs/guides/migrate-from-litellm" description="Move routing out of your process, keep your provider mappings." />
  <Card title="BitRouter vs OpenRouter" href="/docs/overview/bitrouter-vs-openrouter" description="The cloud-catalog alternative, side by side." />
  <Card title="Provider selection" href="/docs/models-and-routing/provider-selection" description="Get adaptive routing running on your own keys." />
</Cards>
