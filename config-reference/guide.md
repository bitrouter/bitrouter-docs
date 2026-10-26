---
title: Configuration (YAML)
description: Find the active BitRouter configuration, resolve secrets, validate settings, and apply changes.
---

Use `bitrouter.yaml` to connect inference sources, define callable models, and bind routing policies in a local BitRouter deployment. Keep non-secret settings in version control and reference secret values from the environment. A deployment can use in-memory defaults, but an explicit file makes its behavior reproducible.

For a complete field lookup, use [config reference](/docs/routing/configuration#configuration-reference): the pinned schema, required fields, declared defaults, environment references, and reload boundaries. This page starts with the configuration workflow and includes the complete field reference below.

## Configuration and policy artifacts

| Artifact | Responsibility |
| --- | --- |
| `bitrouter.yaml` | Provider connections, virtual models, request presets, variants, and links to routing-policy artifacts |
| `policy-lock.yaml` | Versioned model-selection policy, tier assignments, and runtime adequacy settings |

A request preset supplies a model and defaults. A policy binding adds model-selection decisions to that preset. A valid configuration file alone does not create the binding required by `bitrouter/auto`.

[Strategies](/docs/routing/strategies) explains candidate eligibility and selection. [Auto Router](/docs/routing/auto-router) covers policy-bound model selection. [Auditable Policies](/docs/routing/auditable-policies) covers evidence and reviewed publication. [Context Routing](/docs/routing/context-routing) describes native evidence views; this guide does not imply that every context-view rule has a public YAML setting.

## Create a configuration

```bash
bro init
bro config validate -c bitrouter.yaml
```

```yaml
server:
  listen: "127.0.0.1:4356"
providers:
  openai:
    api_key: "${OPENAI_API_KEY}"
```

Use the guide for the setting you need:

| Task | Guide |
| --- | --- |
| Add an API key, subscription, or custom endpoint | [BYOK & Subscriptions](/docs/models-routing/byok-subscriptions) |
| Define named endpoints and reusable request defaults | [Virtual Models](/docs/models-routing/virtual-models) |
| Initialize an auto policy | [Auto Router](/docs/routing/auto-router) |
| Evaluate evidence and review policy changes | [Auditable Policies](/docs/routing/auditable-policies) |
| Restrict candidates or reuse named routing variants | [Strategies](/docs/routing/strategies#configure-routing-rules) |
| Define failure-driven replacement routes | [Model Fallbacks](/docs/models-routing/model-fallback) |
| Connect an upstream MCP server | [MCP servers](/docs/context-routing/mcp-servers) |
| Configure a custom ACP adapter | [ACP servers](/docs/context-routing/acp-servers#configure-a-custom-agent) |
| Deploy the process and export telemetry | [Self-hosting](/docs/self-hosting) |

## Find the active configuration

BitRouter uses the first matching source:

| Order | Location | Behavior |
| --- | --- | --- |
| 1 | `-c/--config <PATH>` | Explicit; a missing file is an error |
| 2 | `./bitrouter.yaml` | Project-local configuration |
| 3 | `$BITROUTER_HOME/bitrouter.yaml` | Required when `BITROUTER_HOME` is set |
| 4 | `~/.bitrouter/bitrouter.yaml` | Per-user default configuration |
| 5 | No file | In-memory zero-config defaults |

<Callout type="warning">
If `BITROUTER_HOME` is set but contains no `bitrouter.yaml`, BitRouter stops instead of silently loading another file.
</Callout>

Use `${NAME}` for required environment variables and `${NAME:-default}` for an optional fallback:

```yaml
providers:
  local:
    api_base: "${LOCAL_LLM_URL:-http://127.0.0.1:8000/v1}"
    api_key: "${LOCAL_LLM_KEY}"
```

Environment references inside YAML comments are ignored. The resolved value participates in the running policy, but the secret itself should not be committed.

## Validate the contract

Point a YAML-aware editor at the schema generated from the binary's config types:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/bitrouter/bitrouter/main/dist/schema/bitrouter.config.schema.json
```

Pin `main` to a release tag when the file must match a deployed binary exactly. Then validate both syntax and route behavior:

```bash
bro config validate -c bitrouter.yaml
bro route bitrouter/auto -c bitrouter.yaml
bro policy check -c bitrouter.yaml
```

- `config validate` checks the complete router policy without requiring live provider credentials.
- `route` previews model resolution without sending an inference request.
- `policy check` cross-validates the policy file and its linked routing-policy lock.

## Apply and review changes

```bash
bro reload -c bitrouter.yaml
bro policy status -c bitrouter.yaml
bro status -c bitrouter.yaml
```

`reload` applies reloadable changes while the daemon is running. Restart for process-bound changes when the command reports that a field cannot be reloaded. For production rollout, validate and preview the policy with the same released binary that will serve it.

For process supervision, authentication, reload boundaries, and rollback, see [Self-hosting operations](/docs/self-hosting#operate). Use [Request receipts](/docs/cli/request-receipts) to inspect actual serving routes after applying a change.

A linked `policy-lock.yaml` controls policy-bound model selection; it is separate from caller access-control policy. Validate a policy binding with `bro policy check` rather than treating a valid YAML file as proof that the binding is usable.
