---
title: Init and config
---

BitRouter discovers its config in this order — first hit wins:

1. `./bitrouter.yaml` in the current directory
2. `$BITROUTER_HOME/bitrouter.yaml` (must exist when the variable is set)
3. `~/.bitrouter/bitrouter.yaml`
4. **Zero-config** — in-memory defaults, auto-enabling any provider whose API key is set in the environment

Any command taking `-c/--config` overrides discovery. The daemon **chdirs into the config's directory** on startup, so relative paths (`database.url`, `policy.path`) resolve there. A JSON Schema for the config lives at `dist/schema/bitrouter.config.schema.json` in the repo for IDE autocomplete.

The full onboarding walkthrough — wizard steps, headless flags, recipes — is the [Quickstart](/docs/overview/quickstart).

## @init

Runs the wizard interactively. With `--yes`, credential prompts are skipped and a JSON result envelope is emitted; choose `--after exit` for a noninteractive setup. Onboarding updates the existing config by default; `--force` starts from the starter template.

```bash
bro init --yes --use-detected --harness claude --after serve
```

## @config validate

The CI-safe check: exits non-zero when the config doesn't match the schema.

```bash
bro config validate -c ./bitrouter.yaml
```
