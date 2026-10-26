---
title: config reference
description: Look up local bitrouter.yaml fields, schema defaults, environment references, and reload boundaries.
---

Use this reference to look up the accepted shape of `bitrouter.yaml`. Start with [Configuration (YAML)](/docs/routing/configuration) to find, create, validate, and apply a file. For connecting a coding agent, use [bro [harness]](/docs/integration/bro-harness).

## Version and scope

The field tables are generated from the **{{VERSION}} configuration schema**, pinned to [BitRouter source `{{REVISION}}`]({{SOURCE_BASE}}/dist/schema/bitrouter.config.schema.json) (source commit dated {{SOURCE_DATE}}). This is a source/schema snapshot, not a claim that every installed binary supports these fields. Check `bro --version` and validate with the binary that will run the file. The [CLI reference](/docs/usage/cli#command-reference) has its own captured command version.

[Download the pinned JSON Schema](/schemas/bitrouter.config.schema.json) for an editor or offline validation. The schema describes file structure; runtime validation, credentials, model capabilities, and policy bindings can impose additional requirements.

```yaml
# yaml-language-server: $schema=https://bitrouter.ai/schemas/bitrouter.config.schema.json
```

This site URL serves the snapshot documented here and can change with a docs update. Save the schema locally, or use the commit-pinned source link above, when matching an older deployment.

**Reading the tables:** `Required` applies to the containing object or tagged alternative. `Not declared` means the schema does not publish a default; it does not mean the field is required, disabled, or empty. A schema `null` default is distinct from an inherited or resolved runtime value. Map keys such as provider and agent ids are user-defined; follow the linked type to inspect each value's fields. Types and enum values reflect the pinned schema.

<Callout type="warning">
Schema defaults and onboarding defaults differ. The schema declares `server.listen: "0.0.0.0:4356"` and `server.skip_auth: false`. The local configuration written by `bro init` uses `127.0.0.1:4356` with `skip_auth: true`. Inspect your actual file before assuming a listener or authentication mode. Neither setting grants access to the separate control or task APIs.
</Callout>

## Find a setting

| What you are configuring | Root fields | Usage guide |
| --- | --- | --- |
| Listener, authentication, upstream timeouts, and storage | `server`, `upstream`, `database` | [Self-hosting](/docs/self-hosting) |
| Provider keys, multiple accounts, and custom endpoints | `providers`, `registry`, `inherit_defaults` | [BYOK & Subscriptions](/docs/models-routing/byok-subscriptions) |
| Named model endpoints and request defaults | `models`, `presets`, `variants` | [Virtual Models](/docs/models-routing/virtual-models) |
| Named routers, policy artifacts, and checks | `routers`, `policy`, `checkers` | [Auditable Policies](/docs/routing/auditable-policies) |
| Native semantic decision backend | `decision_model` | [Context Routing](/docs/routing/context-routing) |
| ACP adapters and saved interactive defaults | `agents`, `chat` | [ACP servers](/docs/context-routing/acp-servers) |
| Upstream MCP connections and aggregation | `mcp_servers`, `mcp` | [MCP servers](/docs/context-routing/mcp-servers) |
| Retention, recording, and continuation | `trajectory`, `acp_recording`, `continuation` | [Request receipts](/docs/cli/request-receipts) |

Native harness launch prepares connection settings for the child process. `agents` configures ACP adapters; it is not a replacement for the harness's own configuration. See [native launch settings](/docs/integration/bro-harness#what-gets-configured) for that boundary.

`plugins` is an open map whose values are arbitrary JSON; this schema does not define a universal plugin contract. `server_tools` and its supporting types are retained in the schema tables for completeness while their product guides are retired during refactoring. Their presence does not establish current feature availability. `policy-lock.yaml` is a separate artifact, not another block to paste into `bitrouter.yaml`.

## Environment references

| Input | Meaning |
| --- | --- |
| `-c/--config PATH` | Select an explicit configuration file for commands that accept it. A missing explicit file is an error. |
| `BITROUTER_HOME` | Configuration discovery and runtime home override. A project-local file takes precedence during file discovery. See the [complete discovery order](/docs/routing/configuration#find-the-active-configuration). |
| `${NAME}` inside YAML | Substitute the named environment variable; an undefined variable is a configuration load error. |
| `${NAME:-fallback}` inside YAML | Use the fallback when the variable is unavailable. Substitution in YAML comments is ignored. |
| `RUST_LOG` | Overrides `server.log_level`. The log filter is resolved at process startup. |
| A field named `token_env` | Names the variable containing a dedicated credential; enter the variable's name in YAML, not the token itself. Consult that field's description. |

Provider-specific automatic credential discovery is covered by [BYOK & Subscriptions](/docs/models-routing/byok-subscriptions#built-in-providers-with-your-own-key). Provider credentials, a client's BitRouter virtual key, and a dedicated control/task API token serve different authentication hops. A YAML `${NAME}` reference can use a variable name you choose; it does not itself register a new automatic provider environment variable.

These file-loading conventions are source-checked against the pinned [configuration loader]({{SOURCE_BASE}}/crates/bitrouter-sdk/src/config/mod.rs) and [application paths]({{SOURCE_BASE}}/apps/bitrouter/src/paths.rs).

## Reload and restart

The schema does not encode hot-reload support. The pinned [reload implementation]({{SOURCE_BASE}}/apps/bitrouter/src/reload.rs) classifies changes against the daemon's startup configuration and live consumers.

| Change | Activation boundary |
| --- | --- |
| Listener, control socket, log filter, authentication mode, or known-pricing admission under `server` | Restart required. |
| Named `routers`, compiled `checkers`, `agents`, MCP connections/aggregation, or plugin configuration | Restart required in this source snapshot. |
| Database URL, native decision backend, recording/retention settings, or continuation retention | Restart required. |
| Provider routing and credentials | Some changes reload, but provider adapter membership, pricing, and other startup-owned consumers can require restart. Do not treat the entire `providers` map as hot-reloadable. |
| Any unclassified or unsupported change | Inspect the daemon's result; do not infer successful activation from a saved file or a valid schema. |

Local `bro reload` can forward provider environment values from the invoking shell. SIGHUP cannot carry newly exported shell values; remote-context reload uses server-owned files without forwarding the client's environment. Check the reload result and `bro status` (`config_state` when available) before relying on new settings. Older daemons may not expose this evidence. See [apply and review changes](/docs/routing/configuration#apply-and-review-changes) for the workflow.
