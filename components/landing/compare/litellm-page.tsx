"use client";

import * as React from "react";
import { Ok, Err, Dim, Faint } from "../mono/terminal";
import { ComparePageTemplate } from "./compare-page";
import type { ComparePageData } from "./compare-page";

const DATA: ComparePageData = {
  competitor: "LiteLLM",
  angle:
    "LiteLLM is a Python library you embed in your app. BitRouter is a binary you drop in front of everything — no code changes, no infra.",
  migrationHref: "/docs/guides/migrate-from-litellm",
  migrationLabel: "Read the migration guide →",

  differentiators: [
    {
      n: "01",
      kicker: "Zero-ops",
      title: "One binary. No Postgres. No Redis. No Docker.",
      body: "Running LiteLLM in production means managing Postgres, Redis, Docker Compose, and a proxy process. BitRouter is a single binary with no runtime dependencies — drop it in a container, a CI step, or run it from the terminal.",
      powered: ["Single binary", "Zero infrastructure deps"],
      term: "deploy · bitrouter",
      prog: () => [
        ["print", <span className="mut">LiteLLM production</span>, 240],
        ["print", <span><Err>✗</Err> <Dim>postgres · redis · docker-compose · nginx</Dim></span>, 200],
        ["print", <span className="mut">BitRouter</span>, 300],
        ["print", <span><Ok>✓</Ok> <span className="lbl">bitrouter serve</span> <Faint>· 1 binary · 0 deps</Faint></span>, 320],
        ["print", <span><Ok>●</Ok> <Dim>ready in</Dim> <span className="lbl">340ms</span></span>, 600],
        ["loop", 2000],
      ],
    },
    {
      n: "02",
      kicker: "Performance",
      title: "Rust async vs the Python GIL.",
      body: "LiteLLM is Python — under high concurrency, the single-process asyncio event loop saturates and tail latency climbs. BitRouter's Rust async runtime keeps latency flat at any concurrency level. At 1k req/s, that difference is material.",
      powered: ["Rust async runtime", "Flat tail latency"],
      term: "latency · 1k req/s",
      prog: () => [
        ["print", <span className="mut">tail latency · 1k concurrent req/s</span>, 240],
        ["print", <span><span className="ind">LiteLLM </span> <Err>~85ms p99</Err> <Faint>Python GIL</Faint></span>, 240],
        ["print", <span><span className="ind">BitRouter</span> <Ok>~12ms p99</Ok> <Faint>Rust async</Faint></span>, 320],
        ["print", <span className="fnt">{"  ↓ no GIL · no thread contention"}</span>, 600],
        ["loop", 2000],
      ],
    },
    {
      n: "03",
      kicker: "Agent runtime",
      title: "Guardrails, identity, and payments — not an SDK.",
      body: "LiteLLM has no in-line guardrails, no agent identity, no MCP/ACP gateway, and no payment handling. BitRouter ships all of them at the router layer — configured once, applied to every agent.",
      powered: ["Router-level guardrails", "MCP/ACP gateway", "x402 payments"],
      term: "policy · bitrouter",
      prog: () => [
        ["print", <span><Dim>configuring policy</Dim> <span className="lbl">default</span></span>, 320],
        ["print", <span><Ok>✓</Ok> <Dim>MCP gateway</Dim> <Faint>active</Faint></span>, 180],
        ["print", <span><Ok>✓</Ok> <Dim>KYA identity</Dim> <Faint>active</Faint></span>, 180],
        ["print", <span><Ok>✓</Ok> <Dim>injection detect</Dim> <Faint>active</Faint></span>, 180],
        ["print", <span><Ok>✓</Ok> <Dim>x402 payments</Dim> <Faint>active</Faint></span>, 420],
        ["print", <span><Err>LiteLLM:</Err> <Dim>none of the above</Dim></span>, 600],
        ["loop", 2000],
      ],
    },
  ],

  tableRows: [
    { feat: "Open source",                        them: "✓ MIT",                       br: "✓ Apache 2.0" },
    { feat: "Single binary (no dependencies)",    them: "✗ Postgres + Redis + Docker",  br: "✓" },
    { feat: "Agent gateway (MCP / ACP / Skills)", them: "✗",                            br: "✓ built-in" },
    { feat: "Autonomous agent payments (x402)",   them: "✗",                            br: "✓" },
    { feat: "KYA agent identity",                 them: "✗",                            br: "✓" },
    { feat: "Prompt injection detection",         them: "✗",                            br: "✓" },
    { feat: "Multi-provider failover mid-run",    them: "✗ manual config",              br: "✓ automatic" },
    { feat: "Routing overhead",                   them: "✗ ~20ms+ (asyncio overhead)",   br: "✓ ~5ms p50" },
    { feat: "Per-run cost attribution",           them: "✗",                            br: "✓" },
    { feat: "BYOK support",                       them: "✓",                            br: "✓" },
    { feat: "Platform fee (hosted option)",       them: "— self-host only",             br: "✓ 2% stablecoin / 5% card" },
  ],

  tradeoffs: [
    "You want a Python-native library embedded directly in your application code with SDK-level call hooks",
    "Your stack is pure Python and you need framework callbacks (async generators, middleware)",
    "You're using LiteLLM's extensive provider mapping for non-standard model endpoints",
  ],
};

export function LiteLLMPage() {
  return (
    <div className="br-mono">
      <ComparePageTemplate data={DATA} />
    </div>
  );
}
