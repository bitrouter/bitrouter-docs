---
title: init & config
description: The onboarding wizard and config tooling — write the starter bitrouter.yaml, validate it against the published schema.
---

BitRouter discovers its config in this order — first hit wins:

1. `./bitrouter.yaml` in the current directory
2. `$BITROUTER_HOME/bitrouter.yaml` (must exist when the variable is set)
3. `~/.bitrouter/bitrouter.yaml`
4. **Zero-config** — in-memory defaults, auto-enabling any provider whose API key is set in the environment

Any command taking `-c/--config` overrides discovery. The daemon **chdirs into the config's directory** on startup, so relative paths (`database.url`, `policy.path`) resolve there. A JSON Schema for the config lives at `dist/schema/bitrouter.config.schema.json` in the repo for IDE autocomplete.

The full onboarding walkthrough — wizard steps, headless flags, recipes — is [Onboarding](/docs/get-started/onboarding).

## @init

Re-runs the wizard interactively; with `--yes` it never blocks and emits a JSON result envelope — the form an agent or CI should drive. Refuses to overwrite an existing `bitrouter.yaml` unless `--force`.

```bash
bitrouter init --yes --use-detected --harness claude --after serve
```

## @config validate

The CI-safe check: exits non-zero when the config doesn't match the schema.

```bash
bitrouter config validate -c ./bitrouter.yaml
```
