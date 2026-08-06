---
title: Virtual Model
description: Define a named model of your own — a saved bundle of base model, system prompt, params, and routing rules — and invoke it inline with @name.
---

A **virtual model** is a model that doesn't exist upstream: a name you define once and invoke inline by putting `@<name>` in the `model` field. Where a [model variant](/docs/gateway-and-routing/model-variants) (`:cost`) only re-ranks providers for one request, a virtual model can also **substitute the base model**, **prepend a system prompt**, **set default generation params**, and **restrict which providers are eligible** — all behind a single short token.

Like a variant, the token lives in the `model` string itself, so it needs no body fields and no SDK — it works the same on the OpenAI, Anthropic, and Google surfaces. A request that uses `@fast` looks exactly like any other request; the virtual model is resolved server-side before routing.

<Callout type="info">
**In the API and the console these are called _routing presets_.** The endpoints (`/v1/namespaces/{nsid}/routing-presets`), scopes (`routing_preset:read` / `:write`), and the `presets` section of `bitrouter.yaml` all keep that name. "Virtual model" is what the thing *is*; "preset" is what the field is called.
</Callout>

## Invoking a virtual model

Put `@<name>` where you would normally put a model id. The grammar is `@<name>[/<base-model>][:<profile>]`:

| `model` value | Resolves to |
| --- | --- |
| `@fast` | The virtual model `fast`; its saved base model and overrides apply. |
| `@fast:cost` | The virtual model `fast`, with the [`:cost` variant](/docs/gateway-and-routing/model-variants) overriding its own `sort`. |
| `@fast/openai/gpt-5` | The virtual model `fast`, but routed to `openai/gpt-5` instead of its saved model. |

A bare model id with no leading `@` — `anthropic/claude-sonnet-4.6` — is untouched and routes exactly as it does today. Virtual models are purely additive.

## What a virtual model can set

Every field is optional. An empty definition is valid (it just resolves to its base model unchanged).

| Field | Effect |
| --- | --- |
| `model` | The base model to route to (e.g. `openai/gpt-5-mini`). If omitted, the request must supply a base inline (`@name/<model>`). |
| `system_prompt` | A system prompt applied when the request doesn't already set one. |
| `params` | Default generation params (`temperature`, `max_tokens`, `top_p`, …), merged in for keys the request didn't set. |
| `routing.sort` | A default routing profile (`balanced` / `cost` / `latency` / `throughput`) — the same axes as [model variants](/docs/gateway-and-routing/model-variants). |
| `routing.only` | A provider allow-list. Routing is restricted to these `provider_name`s. |
| `routing.ignore` | A provider deny-list. These providers are dropped from the chain. |

## Virtual models are defaults; the request always wins

A virtual model supplies *defaults*. Anything the caller sets explicitly on the request takes precedence:

- **Base model** — an inline `@name/<model>` (or a body that already names a model) overrides the saved `model`. If neither the definition nor the request supplies a base, the request is rejected `400`.
- **Profile** — an explicit `:profile` suffix overrides `routing.sort`; with neither, routing is `balanced`.
- **System prompt** — `system_prompt` is applied only if the request didn't send one. An explicit system message always wins.
- **Params** — saved params are merged key-by-key, and only for keys the request omitted. A `temperature` in the request body beats the saved one.

## Defining a virtual model

Virtual models are scoped to a namespace. Create them in the console under **Settings → Routing Presets**, or with the management API:

```bash
curl -X POST https://api.bitrouter.ai/v1/namespaces/{nsid}/routing-presets \
  -H "Authorization: Bearer $BRK_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fast",
    "model": "openai/gpt-5-mini",
    "system_prompt": "Be terse.",
    "params": { "temperature": 0.1 },
    "routing": { "sort": "latency", "only": ["openai"] }
  }'
```

Then invoke it from any inference surface:

```bash
curl http://127.0.0.1:4356/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "@fast",
    "messages": [{"role": "user", "content": "Summarize this in one line."}]
  }'
```

The full CRUD surface — `list`, `get`, `create`, `update`, `delete`, plus `disable`/`enable` — is documented under [Management API](/docs/reference/management/listRoutingPresets). Reading needs the `routing_preset:read` scope; creating or changing needs `routing_preset:write`.

<Callout type="info">
**`name` is the `@token`.** A name must match `[A-Za-z0-9_-]+` (the same character set the `@name` grammar accepts), so `my-fast_v2` is fine but `my preset` is rejected at create time — a name you could never invoke is never stored.
</Callout>

## Enabling and disabling

A virtual model can be disabled without deleting it (`POST …/routing-presets/{id}/disable`, re-enable with `/enable`, or toggle it in the console). A disabled one is treated as if it doesn't exist: invoking its `@name` returns the same `400` as an unknown name, while the definition is preserved for when you switch it back on.

## Self-hosted: aliases over your own endpoints

The `@name` form above is a BitRouter Cloud namespace feature. When you [self-host](/docs/guides/self-host), the `models` section of `bitrouter.yaml` gives you the other half of the idea — a named alias over an ordered list of endpoints, so one model name fails over across providers:

```yaml
# bitrouter.yaml
models:
  smart:
    strategy: priority        # walk the endpoints in declared order
    endpoints:
      - provider: anthropic
        service_id: claude-sonnet-4-6
      - provider: openai
        service_id: gpt-4o
```

Requests for `smart` route to Anthropic first and fall back to OpenAI. This composes with [bring your own model](/docs/gateway-and-routing/bring-your-own-model) — list your own endpoint first and a hosted model second, and you get free local inference with a hosted safety net behind one name.

## Virtual models never change authorization

Resolution happens *before* policy enforcement, and a virtual model can only ever **narrow** what a key could already do — never widen it:

- Guardrail model allow/deny lists and BYOK rules judge the **resolved base model**, so substituting `openai/gpt-5` is checked exactly as if you had asked for `openai/gpt-5` directly. A virtual model can't smuggle a request past a model denylist.
- `routing.only` / `routing.ignore` can only *remove* providers from the eligible set — they can never add a provider the request wasn't already allowed to reach. [Your own provider keys](/docs/gateway-and-routing/bring-your-own-provider) still rank ahead of platform ones.
- Billing is unchanged — you pay the selected provider's rate for the resolved base model.

## Errors

| Condition | Result |
| --- | --- |
| `@name` is unknown or disabled in the namespace | `400` (distinct from an unknown-model `404`) |
| The definition has no `model` and the request supplied no base | `400` |
| `routing.only` / `routing.ignore` leave no eligible providers | `400` (no providers available under the constraints) |
| At create/update: invalid `name`, a `routing.sort` that isn't a known profile, or a `params` key that collides with a transport control (`model` / `messages` / `stream`) | `400` |

## Virtual models vs. model variants

The two features overlap deliberately — reach for whichever fits:

- A [**model variant**](/docs/gateway-and-routing/model-variants) (`openai/gpt-4o:cost`) is anonymous and zero-setup: it re-ranks providers along one axis for a single request and nothing else.
- A **virtual model** (`@fast`) is named and saved: it captures a base model, a prompt, params, and provider constraints once, so callers invoke a tested configuration by name instead of repeating it.

They compose — `@fast:cost` resolves the virtual model and then overrides its routing profile with the inline variant.
