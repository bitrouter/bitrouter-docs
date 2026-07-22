---
title: Register as a provider
description: Permissionless provider registration on BitRouter via the open registry.
sourceHash: f7d9bafaeea0e922cdbed6d80845f6b7250e4ee7687585de6a390c41a2fe1883
---

<Callout type="warn">
The BitRouter Registry is **experimental**. Pull requests are reviewed and merged case-by-case during this phase, and we reserve the right to reject or delist providers — see [Terms of Use](#terms-of-use) below. The end goal is fully permissionless onboarding; the current process exists to keep the network healthy while we get there.
</Callout>

## The BitRouter Registry

BitRouter is designed as an **open marketplace** for inference. Anyone running an OpenAI- or Anthropic-compatible inference endpoint can apply to register their models — no commercial agreement, no sales cycle, no business form.

Provider listings live in the public BitRouter OSS repository:

> **[github.com/bitrouter/bitrouter/tree/main/registry](https://github.com/bitrouter/bitrouter/tree/main/registry)**

You apply by opening a pull request that adds your provider manifest. Once merged, BitRouter and any agent on the network can discover your models, route to them, and (optionally) pay you per request via x402/MPP.

## How Registration Works

1. Fork [bitrouter](https://github.com/bitrouter/bitrouter).
2. Add a manifest at `providers/<your-provider-id>.yaml` describing your endpoint and model catalog.
3. Open a PR. CI runs schema validation and basic reachability checks against your endpoint.
4. A maintainer reviews the PR. While we aim to merge openly, PRs are evaluated case-by-case during the experimental phase.
5. On merge, your models become discoverable across the BitRouter network and the hosted bitrouter.ai marketplace.

<Callout type="info">
**Registry inclusion ≠ guaranteed traffic.** Being listed in the registry makes your models discoverable, but does not guarantee any volume of inference traffic. BitRouter runs an independent **router** that continuously monitors, scores, and ranks providers — see [Reliability & Routing](#reliability--routing) below. Traffic flows to providers that score well; weaker signals lead to deprioritization, regardless of registry status.
</Callout>

## Provider Manifest

A manifest declares your endpoint metadata, payment modes, and the model catalog.

```yaml
name: example-provider
display_name: Example AI
metadata:
  headquarters: US
  datacenters:
    - US
  name: Example AI
  slug: example-ai
  privacy_policy_url: https://example.ai/privacy
  terms_of_service_url: https://example.ai/terms
api_base: https://api.example.ai/v1
protocol_endpoints:
  anthropic: https://api.example.ai/anthropic/v1
api_protocol:
  - "*": [openai, responses]
rate_limits:
  - "*":
      requests_per_minute: 60
billing: usage_token
auth_scheme: bearer
models:
  - id: example/model-1
    provider_model_id: model-1
    pricing:
      input_tokens:
        no_cache: 1.0
      output_tokens:
        text: 2.0
status: active
```

### Key fields

- **`name`** — provider id used in configs and model prefixes.
- **`display_name`** — human-readable name shown in UIs.
- **`api_base`** — upstream base URL (optional; omit if you require users to supply their own endpoint via `required_config`).
- **`protocol_endpoints`** — per-protocol base URL overrides (e.g., route Anthropic protocol to a different path).
- **`api_protocol`** — glob patterns mapping model prefixes to supported protocols.
- **`rate_limits`** — per-model or wildcard request limits.
- **`billing`** — `usage_token` (pay-per-use) or `subscription` (flat-rate plan).
- **`auth_scheme`** — `bearer`, `x-api-key`, or other supported schemes.
- **`required_config`** — array of required user configuration: `api_key`, `base_url`, `local_oauth`, `local_pkce`. Use this when the provider needs a user-supplied endpoint (e.g., workspace-specific URLs).
- **`metadata.datacenters`** — list of region codes where the provider operates (e.g., `US`, `CN`, `SG`, `EU`).
- **`models`** — list of models served by this provider. Models can also be defined in separate files under `registry/models/<owner>/<model>.yaml`.

## Models Endpoint

BitRouter periodically polls your `models_url` and expects a list of all available models in the following schema.

```json
{
  "data": [
    {
      "id": "example/sonnet-1",
      "name": "Example: Sonnet 1",
      "created": 1704067200,
      "input_modalities": ["text", "image"],
      "output_modalities": ["text"],
      "context_length": 1000000,
      "max_output_length": 128000,
      "quantization": "fp8",
      "pricing": {
        "prompt": "0.000003",
        "completion": "0.000015",
        "image": "0",
        "request": "0",
        "input_cache_read": "0"
      },
      "supported_sampling_parameters": ["temperature", "top_p", "stop"],
      "supported_features": ["tools", "json_mode", "structured_outputs", "reasoning"],
      "is_ready": true
    }
  ]
}
```

Key fields:

- **`id`** — exact identifier BitRouter passes to your endpoint when routing requests.
- **`pricing`** — string-encoded USD per token to avoid floating-point drift. `image` and `request` are per unit.
- **`is_ready`** — set `false` to stage a model without making it live (useful for embargoed launches). Defaults to `true`.

Valid `quantization`: `int4`, `int8`, `fp4`, `fp6`, `fp8`, `fp16`, `bf16`, `fp32`.

Valid `supported_features`: `tools`, `json_mode`, `structured_outputs`, `logprobs`, `web_search`, `reasoning`.

Valid `supported_sampling_parameters`: `temperature`, `top_p`, `top_k`, `min_p`, `top_a`, `frequency_penalty`, `presence_penalty`, `repetition_penalty`, `stop`, `seed`, `max_tokens`, `logit_bias`.

### Tiered Pricing

For long-context tiered pricing, supply `pricing` as an array. The first entry is the base tier; subsequent entries apply once input-token count reaches `min_context`.

```json
{
  "pricing": [
    { "prompt": "0.000002", "completion": "0.000012" },
    { "prompt": "0.000004", "completion": "0.000018", "min_context": 200000 }
  ]
}
```

### Deprecation

Set `deprecation_date` (ISO 8601, `YYYY-MM-DD`) on a model scheduled for retirement. BitRouter surfaces deprecation warnings to consumers and may auto-hide the model after that date.

## Reliability & Routing

The registry tells BitRouter what models *exist* on your endpoint. The **router** decides how much traffic to send. They are separate systems.

The router continuously monitors uptime and performance per endpoint, then scores and ranks providers for every request. Scores update in real time — a provider that degrades will see traffic shift away within minutes.

**Uptime** — successful requests ÷ total requests, excluding user-input errors.

- Counts against uptime: `401`, `402`, `404`, `5xx`, mid-stream errors, success-with-error-finish-reason.
- Doesn't count: `400`, `413`, `429`, `403` (tracked separately).

**Performance** — TTFT (time to first token) and throughput (output tokens ÷ total generation time, including queue + fetch + streaming). Both are public on each model page.

To score well and receive traffic:

- Return early `429`s when overloaded — don't queue.
- Stream tokens as soon as they're available.
- Send SSE keep-alive comments during long pre-token work (e.g. reasoning) so the router doesn't time out and fall back.

Providers with consistently poor scores will be deprioritized. Providers that abuse the network or violate the [Terms of Use](#terms-of-use) below will be delisted entirely.

## Payments

Providers can accept payment in three modes, declared in the manifest:

- **`byok`** — consumers bring their own API key for your service. BitRouter doesn't intermediate payment.
- **`x402`** — accept agent-native x402/MPP payments per request. BitRouter routes payment receipts to the address in your manifest.
- **`invoice`** — opt into invoiced billing for aggregated hosted-mode traffic.

Most new providers start with `byok` plus `x402`, then add `invoice` once volume warrants it.

## Updating Your Listing

Manifest updates (new models, pricing changes, endpoint moves) are PRs to the registry. Pricing changes take effect on merge. To take a model offline, set `is_ready: false` in the next models-endpoint poll or open a PR removing it.

## Terms of Use

By registering as a provider you agree to the following. Violations result in delisting from the registry and the hosted marketplace.

- **No harmful content** — endpoints must not be used to generate or knowingly facilitate CSAM, weapons-of-mass-destruction uplift, targeted harassment, or other content prohibited by applicable law.
- **No malicious behavior** — no credential harvesting, prompt-injection attacks against agents, response tampering, or covert data exfiltration.
- **Honest metadata** — the manifest and models endpoint must accurately reflect what your endpoint actually serves: pricing, context length, capabilities, modalities. Fraudulent metadata is grounds for immediate delisting.
- **Reasonable availability** — providers that consistently fail health checks or fail to respond to maintainer outreach may be delisted.
- **Lawful operation** — providers must comply with the laws of jurisdictions in which they operate, including export controls and sanctions where applicable.

We reserve the right to reject or delist any provider at our discretion during the experimental phase. As the network and tooling mature, we will narrow this discretion toward objective, automated criteria.

## Get Help

- Open an issue on [bitrouter](https://github.com/bitrouter/bitrouter/issues).
- Join the [Discord](https://discord.gg/G3zVrZDa5C).
