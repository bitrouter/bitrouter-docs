---
title: BitRouter vs OpenRouter
description: OpenRouter is a closed-source cloud gateway with the widest model catalog; BitRouter is an Apache 2.0 binary you run anywhere, with ~6× less routing overhead and agent-native primitives built in. An honest side-by-side.
---

Every LLM gateway makes the same headline promise: one API, many models, automatic failover. The differences that actually decide the choice show up underneath — how you deploy it, what it costs you in latency on every call, and whether it was built for chat apps or for agents.

## Deployment and overhead

OpenRouter is a closed-source cloud gateway with the widest model catalog on the market. That breadth is real, but it comes with a dependency: there is no self-host option, so your routing layer lives on someone else's infrastructure and adds their network hop to every call — roughly **~30ms of overhead per request**. BitRouter is the inverse trade: an Apache 2.0 binary you own and run inside your own VPC or CI, at **~5ms p50** — about 6× less overhead — with an open, PR-based provider registry instead of a curated one you can't extend.

## What each one routes

The sharper divide is what each one routes. OpenRouter routes model requests. BitRouter routes *agent runs*: identity per agent (KYA), an MCP/ACP tool gateway, injection checks, and autonomous stablecoin payments (x402) — none of which exist in OpenRouter. And where OpenRouter's routing is static, BitRouter wraps your loop in an [act → observe → evaluate → learn](/docs/overview/what-is-bitrouter) cycle that tightens routing every run.

<CompareTable slug="bitrouter-vs-openrouter" />

## OpenRouter is the right call when

You need the widest possible model catalog with zero infrastructure to operate, you're building a consumer-facing app that doesn't need agent-native features, or your team already runs OpenRouter and has no migration bandwidth right now. Switching later is a one-URL, one-key change — the [migration guide](/docs/guides/migrate-from-openrouter) walks it in under five minutes.

## Next steps

<Cards>
  <Card title="Migrate from OpenRouter" href="/docs/guides/migrate-from-openrouter" description="One URL, one key — under five minutes." />
  <Card title="BitRouter vs LiteLLM" href="/docs/overview/bitrouter-vs-litellm" description="The other gateway teams most often weigh against BitRouter." />
  <Card title="Provider selection" href="/docs/gateway-and-routing/provider-selection" description="Get adaptive routing running on your own keys." />
</Cards>
