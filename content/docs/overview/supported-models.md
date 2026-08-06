---
title: Supported Models
description: The full catalog of models any BitRouter account can call — with pricing, reachable over your own keys or one hosted BitRouter Cloud account.
---

Every model BitRouter can route to is listed below. Reach any of them over your own provider keys ([BYOK](/docs/models-and-routing/byok), paid to the providers at their list price) or one [BitRouter Cloud](/docs/overview/quickstart) account — one sign-in, no upstream keys, billed per request with failed requests not charged. Running your own model? See [local & private models](/docs/integrations/models) (free).

Prices are USD per **million tokens** — what a BitRouter Cloud request costs today, from the cheapest provider actually serving that model (`—` means no per-token provider is currently serving it). A provider listed in the [registry](https://github.com/bitrouter/bitrouter/tree/main/registry) but not currently reachable isn't priced here, so bringing your own key to one of them can beat these rates. Every model is served by one or more registered providers — see [Supported Providers](/docs/overview/supported-providers) for the full list and how to register your own.

## Model catalog

| Model | Name | Context | Modalities | Open weights | Input $/M | Output $/M |
| --- | --- | --- | --- | --- | --- | --- |
| `anthropic/claude-fable-5` | Anthropic: Claude Fable 5 | 1M | text, image | — | $10 | $50 |
| `anthropic/claude-haiku-4.5` | Anthropic: Claude Haiku 4.5 | 200K | text, image | — | $1 | $5 |
| `anthropic/claude-opus-4.6` | Anthropic: Claude Opus 4.6 | 200K | text, image | — | $5 | $25 |
| `anthropic/claude-opus-4.7` | Anthropic: Claude Opus 4.7 | 200K | text, image | — | $4.5 | $22.5 |
| `anthropic/claude-opus-4.8` | Anthropic: Claude Opus 4.8 | 1M | text, image | — | $5 | $25 |
| `anthropic/claude-sonnet-4.6` | Anthropic: Claude Sonnet 4.6 | 1M | text, image | — | $3 | $15 |
| `anthropic/claude-sonnet-5` | Anthropic: Claude Sonnet 5 | 1M | text, image | — | $2 | $10 |
| `deepseek/deepseek-v3.2` | DeepSeek: DeepSeek V3.2 | 128K | text | ✅ | $0.21 | $0.315 |
| `deepseek/deepseek-v4-flash` | DeepSeek: DeepSeek V4 Flash | 256K | text | ✅ | $0.0983 | $0.1966 |
| `deepseek/deepseek-v4-pro` | DeepSeek: DeepSeek V4 Pro | 256K | text | ✅ | $1.305 | $2.61 |
| `google/gemini-3.1-flash-lite-preview` | Google: Gemini 3.1 Flash Lite Preview | 1M | text, image | — | $0.25 | $1.5 |
| `google/gemini-3.1-pro-preview` | Google: Gemini 3.1 Pro Preview | 2M | text, image | — | $2 | $12 |
| `google/gemini-3.5-flash` | Google: Gemini 3.5 Flash | 1M | text, image, audio | — | $1.5 | $9 |
| `google/gemma-4-31b` | Google: Gemma 4 31B | 128K | text, image | ✅ | $0.13 | $0.4 |
| `meituan/longcat-2.0` | LongCat 2.0 | 1M | text | ✅ | $0.75 | $2.95 |
| `minimax/minimax-m2.5` | MiniMax: M2.5 | 192K | text | ✅ | $0.225 | $0.9 |
| `minimax/minimax-m2.7` | MiniMax: M2.7 | 192K | text | ✅ | $0.225 | $0.9 |
| `minimax/minimax-m3` | MiniMax: M3 | 1M | text, image | ✅ | $0.3 | $1.2 |
| `moonshotai/kimi-k2.5` | Kimi: K2.5 | 256K | text, image | ✅ | $0.44 | $2 |
| `moonshotai/kimi-k2.6` | Kimi: K2.6 | 256K | text | ✅ | $0.7125 | $3 |
| `moonshotai/kimi-k2.7-code` | Kimi: K2.7 Code | 256K | text, image | ✅ | $0.7125 | $3 |
| `moonshotai/kimi-k3` | Kimi: K3 | 1M | text, image | ✅ | $3 | $15 |
| `openai/gpt-5.4` | OpenAI: GPT-5.4 | 128K | text, image | — | $2.5 | $15 |
| `openai/gpt-5.4-mini` | OpenAI: GPT-5.4 Mini | 128K | text, image | — | $0.75 | $4.5 |
| `openai/gpt-5.5` | OpenAI: GPT-5.5 | 128K | text, image | — | $5 | $30 |
| `openai/gpt-5.6-luna` | OpenAI: GPT-5.6 Luna | 400K | text, image | — | $1 | $6 |
| `openai/gpt-5.6-sol` | OpenAI: GPT-5.6 Sol | 1M | text, image | — | $5 | $30 |
| `openai/gpt-5.6-terra` | OpenAI: GPT-5.6 Terra | 1M | text, image | — | $2.5 | $15 |
| `qwen/qwen3.5-122b-a10b` | Qwen: Qwen3.5 122B-A10B | 256K | text, image | ✅ | $0.26 | $2.08 |
| `qwen/qwen3.5-27b` | Qwen: Qwen3.5 27B | 256K | text, image | ✅ | $0.25 | $2 |
| `qwen/qwen3.6-27b` | Qwen: Qwen3.6 27B | 256K | text, image | ✅ | $0.3 | $3.2 |
| `qwen/qwen3.6-35b-a3b` | Qwen: Qwen3.6 35B-A3B | 256K | text, image | ✅ | $0.248 | $1.485 |
| `qwen/qwen3.6-flash` | Qwen: Qwen3.6 Flash | 1M | text, image | — | $0.1875 | $1.125 |
| `qwen/qwen3.7-max` | Qwen: Qwen3.7 Max | 1M | text | — | $1.875 | $5.625 |
| `qwen/qwen3.7-plus` | Qwen: Qwen3.7 Plus | 1M | text, image | — | $0.4 | $1.6 |
| `stepfun/step-3.5-flash` | StepFun: Step 3.5 Flash | 256K | text | ✅ | $0.072 | $0.216 |
| `stepfun/step-3.7-flash` | StepFun: Step 3.7 Flash | 256K | text, image | ✅ | $0.15 | $0.8625 |
| `tencent/hy3` | Hunyuan 3 | 256K | text | ✅ | $0.066 | $0.26 |
| `x-ai/grok-4.20` | xAI: Grok 4.20 | 128K | text, image | — | $1.25 | $2.5 |
| `x-ai/grok-4.20-multi-agent` | xAI: Grok 4.20 Multi-Agent | 1M | text, image | — | $1.25 | $2.5 |
| `x-ai/grok-4.3` | xAI: Grok 4.3 | 1M | text, image | — | $1.25 | $2.5 |
| `x-ai/grok-4.5` | xAI: Grok 4.5 | 500K | text, image | — | $2 | $6 |
| `x-ai/grok-build-0.1` | xAI: Grok Build 0.1 | 256K | text | — | $1 | $2 |
| `xiaomi/mimo-v2.5` | Xiaomi: MiMo V2.5 | 256K | text | ✅ | $0.3 | $1.5 |
| `xiaomi/mimo-v2.5-pro` | Xiaomi: MiMo V2.5 Pro | 256K | text | ✅ | $0.75 | $2.25 |
| `z-ai/glm-4.7` | Zhipu: GLM-4.7 | 200K | text | ✅ | $0.6 | $2.2 |
| `z-ai/glm-5` | Zhipu: GLM-5 | 198K | text | ✅ | $0.6 | $1.92 |
| `z-ai/glm-5.1` | Zhipu: GLM-5.1 | 128K | text | ✅ | $0.98 | $3.08 |
| `z-ai/glm-5.2` | Zhipu: GLM-5.2 | 1M | text | ✅ | $0.97 | $3.07 |

## Using BitRouter Cloud

The **BitRouter Cloud provider** lets an agent call any model above with a single BitRouter account — no upstream provider keys, no per-provider signups. You pay BitRouter directly at the prices listed here, billed per request; failed requests aren't billed.

```bash
bitrouter cloud login   # one-time device-flow sign-in
bitrouter start         # the `bitrouter` provider auto-enables once signed in
```
