---
title: Getting Started
description: Install the CLI, connect Cloud or your own providers, and verify the local router.
---

Use `bro` to configure and run the local router, inspect requests, and manage your BitRouter Cloud account. Applications call the [HTTP API](/docs/reference); existing coding tools connect through [Integrations](/docs/integration/bro-harness).

## Install and check the version

Choose an installer from [Quickstart](/docs/overview/quickstart#install-the-binary), then check your installation:

```bash
bro --version
bro --help
```

The [Command Reference](/docs/usage/cli) is captured from `bro 1.0.0-alpha.33`. Check the installed command's `--help` when using another version.

## Choose your connection

| Connection | Setup | Next step |
| --- | --- | --- |
| BitRouter Cloud | Sign in with the CLI or use an existing Cloud API key | Manage the account or call Cloud directly; a local daemon is optional |
| Your own providers or inference servers | Configure provider credentials and endpoints | Start the local router and point your application at it |

For Cloud, follow [Cloud Management](/docs/cli/cloud-management#sign-in-and-check-the-account). To connect your own sources, use [BYOK & Subscriptions](/docs/models-routing/byok-subscriptions) or [Local Models](/docs/models-routing/local-models).

## Set up the CLI

For a local configuration, run the setup wizard and finish without opening a harness:

```bash
bro init -c ./bitrouter.yaml --after exit
bro config validate -c ./bitrouter.yaml
```

The wizard can update an existing configuration. [Configuration](/docs/routing/configuration) explains file discovery, environment references, validation, and which changes need a reload or restart. Model connections and routing policy examples stay in their respective feature guides.

## Start and inspect the router

Start the configured router in the background:

```bash
bro start -c ./bitrouter.yaml
bro status -c ./bitrouter.yaml
bro models -c ./bitrouter.yaml
```

Choose a model from the configured catalog and preview its route with `bro route <model> -c ./bitrouter.yaml`. Route inspection does not invoke inference. Use [API Getting Started](/docs/reference#local-router) for an actual request, then [Run & Inspect](/docs/cli/run-inspect#inspect-settled-requests) to inspect its receipt.

If you are calling Cloud directly, use [API Getting Started](/docs/reference#first-cloud-request) without starting a local daemon.

## Next steps

<Cards>
  <Card title="Configuration" href="/docs/routing/configuration" description="Find, validate, and apply bitrouter.yaml and look up its fields." />
  <Card title="Run & Inspect" href="/docs/cli/run-inspect" description="Operate the router, inspect routes, and diagnose requests." />
  <Card title="Cloud Management" href="/docs/cli/cloud-management" description="Manage credentials, usage, budgets, and account settings." />
  <Card title="Command Reference" href="/docs/usage/cli" description="Look up captured commands, flags, and environment variables." />
</Cards>
