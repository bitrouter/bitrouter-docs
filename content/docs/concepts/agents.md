---
title: Agents
description: What agent-native means on BitRouter — the ACP gateway for identity, discovery, and task dispatch, plus KYA identity for autonomous pay-per-use.
sourceHash: c5a31f9a702b8acb13dc924b259395b23086f67a53fdde6c3a043c3e667d11da
---

BitRouter is **agent-native**: the primitives below assume the caller is an autonomous agent, not a human at a keyboard. That shows up in two places — how agents are identified and reached, and how they pay.

## The ACP gateway — identity and dispatch

Just as the MCP gateway lets an agent reach many tool servers, the **ACP gateway** handles the agent side: **agent identity, discovery, and task dispatch**. It's how an agent hands off or receives tasks — through the same single-endpoint model BitRouter uses everywhere. Today it drives local sub-agents over stdio; cross-host discovery and dispatch across the network arrive with [ACP v2](https://agentclientprotocol.com/rfds/v2/overview).

## KYA — verifiable identity that can pay

An autonomous agent holding your keys is a liability unless it has an identity of its own. **KYA (Know-Your-Agent)** gives an agent a **verifiable identity**, which is what makes autonomous payment safe: with that identity, an agent can **pay per use** through the Machine Payment Protocol — x402/MPP — settling each request itself, with no credit cards, prepaid credits, or invoices in the loop.

## Learn how to

- [Agentic payment](/docs/features/payment) — autonomous pay-per-use via MPP / x402.
