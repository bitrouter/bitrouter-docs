---
title: Namespaces
description: The isolation boundary that scopes API keys, policies, and usage to a single deployment — available on any self-hosted or local BitRouter node.
---

A **namespace** is BitRouter's isolation primitive. API keys, policies, and usage data are all scoped to a single namespace. On a self-hosted or local node you can run multiple namespaces to separate projects, environments, or agent deployments from one another.

## Credential model: namespace-scoped keys

Every credential issued by BitRouter is **namespace-scoped** — baked to exactly one namespace at issuance. That scope is permanent; it cannot be widened after the fact.

| Capability | Namespace-scoped credential |
|---|---|
| **Invoke inference** | Yes |
| **Manage keys within the namespace** | Yes |
| **Manage policies within the namespace** | Yes |
| **Read usage within the namespace** | Yes |
| **Reach another namespace** | No |

Because no credential spans namespaces, a compromised key or misbehaving agent can affect only the namespace it was issued for. The blast radius is bounded by design.

## Listing and inspecting namespaces

To see which namespace your current session is bound to:

```bash
bitrouter cloud namespace current   # offline — reads local credential
bitrouter cloud whoami              # also prints the bound namespace
```

To list all namespaces on the node:

```bash
bitrouter cloud namespace list      # all namespaces; active one marked
```

```
ns_01jxyz…  default       (active)
ns_01jabc…  production
ns_01jdef…  staging
```

See the [CLI reference](/docs/reference/cli) for the full `bitrouter cloud` surface.

## Managing keys inside a namespace

A credential has full autonomy over the namespace it is bound to. It can mint sub-keys, list existing keys, and revoke them — without ever gaining access to another namespace.

```bash
bitrouter cloud keys mint --name my-agent \
  --scope "inference:invoke keys:read policy:read usage:read"
bitrouter cloud keys list
bitrouter cloud keys revoke <id>
```

> [!NOTE]
> `bitrouter cloud keys mint` is the recommended way for an agent to provision sub-keys for its own tools. The minted key is baked to the same namespace as the caller and cannot upscale its scopes beyond the caller's.

## Policies

Guardrail, rate-limit, and preset policy bindings are also namespace-scoped. A credential can read and write policies within its namespace:

```bash
bitrouter cloud policy list
bitrouter cloud policy bind <policy-id> --principal-type api_key --principal-id <key-id>
bitrouter cloud budget create --name daily-cap --window day --limit-micro-usd 5000000
```

See [Guardrails](/docs/features/guardrails) and [Presets](/docs/models-and-routing/presets) for details on authoring policies.

## Usage reporting

Usage is attributed per namespace at request time. A namespace-scoped credential can only read its own usage — cross-namespace aggregation requires a wider credential issued by the node operator. For the CLI commands, the hosted dashboard, and the management endpoints, see [Tracing](/docs/observability/tracing).
