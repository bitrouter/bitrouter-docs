---
title: Providers
---

Two ways a provider becomes available: **BYOK** (its API key in the environment — see [BYOK](/docs/gateway-and-routing/bring-your-own-provider)) and **`providers login`** (OAuth against subscription providers such as Claude or Codex subscriptions — see [Integrations](/docs/integrations)). `providers list` shows the catalog and which providers are active in the current config.

## @providers login

```bash
bitrouter providers login <provider-id>
```

Opens the provider's OAuth flow and stores the credential in the local credential store — no key to paste. `providers logout` removes it.
