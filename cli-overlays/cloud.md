---
title: cloud
description: BitRouter Cloud from the terminal — sign-in, API keys, usage, billing, policies, budgets, presets, and BYOK.
---

`bitrouter cloud login` either runs the RFC 8628 Device Authorization Grant or stores an existing BitRouter API key. Both credential types live under `$XDG_DATA_HOME/bitrouter/account-credentials.json` (mode `0600` on Unix). The API-key form performs no network request, which makes it suitable for CI. Interactive OAuth lets you pick the workspace this session is bound to; tokens refresh automatically within 60 s of expiry.

The default scope set covers `inference:invoke`, `usage:read`, `keys:read`/`keys:write`, `billing:read`, `policy:read`/`policy:write`, `byok:read`/`byok:write`, and `namespace:read`. Sensitive scopes such as `billing:write` are opt-in via `--scope`. After either login form, the `bitrouter` provider auto-enables in zero-config mode — every model your account is entitled to is routable as `bitrouter:<model-id>`.

Every leaf accepts `--json` for raw output; the default is a `systemctl`-style key:value block for single resources and a small table for lists. When the server returns `403 missing required scope: <s>`, OAuth users get a copy-pasteable re-login hint; API-key users are told to mint a key with that scope. See the [Cloud API guide](/docs/guides/cloud-api) for protocol details.

## @cloud login

```bash
bitrouter cloud login                              # device flow, pick a workspace
bitrouter cloud login --api-key "$BITROUTER_API_KEY"   # CI: no network, no browser
```

## @cloud api

Modeled after `gh api`: injects the stored bearer against the logged-in origin and streams the response. Absolute URLs and redirect following are rejected, so the credential never leaves its login origin.

```bash
bitrouter cloud api /v1/models
bitrouter cloud api /v1/chat/completions --input request.json
bitrouter cloud api /v1/responses -f model=openai/gpt-5 -F stream=true
```

## @cloud keys mint

Returns the plaintext `brk_…` token **exactly once** — the server keeps only the SHA-256 hash. Requested scopes must be a subset of your effective scopes.

```bash
bitrouter cloud keys mint --name ci --scope "policy:read usage:read"
```

## @cloud policy

`--spec` reads a JSON file (or `-` for stdin) holding the flat inner spec body — e.g. `{"window": "day", "limit_micro_usd": 5000000}` for a budget. `effective` and `for-principal` answer "what would happen to a request from this principal" without making an inference call. `budget` and `preset` are typed sugar over the same rows.

## @cloud byok set

Ciphertext must be sealed against the cloud's current X25519 public key **before** submission — the server only stores already-encrypted bytes. Fetch the current key from `GET /v1/byok/encryption-pubkey` first.
