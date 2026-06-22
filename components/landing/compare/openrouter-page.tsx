"use client";

import * as React from "react";
import { Ok, Err, Dim, Faint } from "../mono/terminal";
import { ComparePageTemplate } from "./compare-page";
import type { ComparePageData } from "./compare-page";

const DATA: ComparePageData = {
  competitor: "OpenRouter",
  angle:
    "OpenRouter is a closed-source cloud gateway. BitRouter is an Apache 2.0 binary you own, deploy anywhere, and extend.",
  migrationHref: "/docs/guides/migrate-from-openrouter",
  migrationLabel: "Read the migration guide →",

  differentiators: [
    {
      n: "01",
      kicker: "Ownership",
      title: "A binary you run anywhere. Not a SaaS you depend on.",
      body: "OpenRouter is closed-source and cloud-only — there is no self-host option. BitRouter is Apache 2.0: one binary, no daemon, no infrastructure dependencies. Fork it, extend it, run it in your CI pipeline or inside your VPC.",
      powered: ["Apache 2.0 binary", "Zero infrastructure deps"],
      term: "self-host · bitrouter",
      prog: () => [
        ["print", <span className="fnt">$ bitrouter serve</span>, 340],
        ["print", <span><Ok>●</Ok> <Dim>started bitrouter</Dim> <Faint>· port 8787</Faint></span>, 200],
        ["print", <span><Ok>●</Ok> <Dim>loaded 6 providers · 187 models</Dim></span>, 200],
        ["print", <span><Ok>●</Ok> <Dim>ready in</Dim> <span className="lbl">340ms</span> <Faint>· 0 dependencies</Faint></span>, 420],
        ["print", <span className="mut">self-hosted · no SaaS · no lock-in</span>, 600],
        ["loop", 2000],
      ],
    },
    {
      n: "02",
      kicker: "Agent primitives",
      title: "Built for agents, not APIs.",
      body: "OpenRouter routes model requests. BitRouter routes agent runs — with MCP/ACP gateway, KYA identity per agent, prompt injection detection, and autonomous x402 payments. None of these exist in OpenRouter.",
      powered: ["MCP/ACP gateway", "KYA identity", "x402 payments"],
      term: "agent_a · bitrouter gateway",
      prog: () => [
        ["print", <span><Dim>agent_a →</Dim> <span className="lbl">POST /v1/chat/completions</span></span>, 320],
        ["print", <span><Ok>✓</Ok> <Dim>KYA identity verified</Dim> <Faint>agent_a · run_8x2k</Faint></span>, 200],
        ["print", <span><Ok>✓</Ok> <Dim>injection check</Dim> <Faint>clean</Faint></span>, 200],
        ["print", <span><Ok>✓</Ok> <Dim>x402 payment authorized</Dim> <span className="lbl">$0.003 USDC</span></span>, 420],
        ["print", <span><Err>OpenRouter:</Err> <Dim>✗ no MCP · no KYA · no payments</Dim></span>, 600],
        ["loop", 2000],
      ],
    },
    {
      n: "03",
      kicker: "Latency",
      title: "Sub-10ms routing overhead.",
      body: "OpenRouter's hosted gateway adds ~30ms of routing overhead per call. BitRouter's Rust async binary runs at ~5ms p50 — 6× faster, with latency that stays flat under concurrent load.",
      powered: ["Rust async runtime", "~5ms p50 overhead"],
      term: "router · latency benchmark",
      prog: () => [
        ["print", <span className="mut">routing overhead · p50</span>, 240],
        ["print", <span><span className="ind">OpenRouter </span> <Err>~30ms</Err> <Faint>hosted SaaS</Faint></span>, 200],
        ["print", <span><span className="ind">BitRouter  </span> <Ok>~5ms</Ok> <Faint>Rust async binary</Faint></span>, 320],
        ["print", <span className="fnt">{"  ↓ 6× faster overhead"}</span>, 300],
        ["print", <span className="mut">at 10k calls/day · saves ~4 min of latency</span>, 600],
        ["loop", 2000],
      ],
    },
  ],

  tableRows: [
    { feat: "Open source & self-hostable",        them: "✗ closed-source cloud",   br: "✓ Apache 2.0 binary" },
    { feat: "Permissionless provider registry",   them: "✗ curated, closed",        br: "✓ PR-based, open" },
    { feat: "Agent gateway (MCP / ACP / Skills)", them: "✗",                        br: "✓ built-in" },
    { feat: "Autonomous agent payments (x402)",   them: "✗",                        br: "✓" },
    { feat: "KYA agent identity",                 them: "✗",                        br: "✓" },
    { feat: "Prompt injection detection",         them: "✗",                        br: "✓" },
    { feat: "Multi-provider failover mid-run",    them: "⚠ limited",                br: "✓ automatic" },
    { feat: "Routing overhead",                   them: "✗ ~30ms",                  br: "✓ ~5ms p50" },
    { feat: "Per-run cost attribution",           them: "✗",                        br: "✓" },
    { feat: "BYOK support",                       them: "✓",                        br: "✓" },
    { feat: "Platform fee",                       them: "✗ 5.5% card only",         br: "✓ 2% stablecoin / 5% card" },
  ],

  tradeoffs: [
    "You need the widest possible model catalog and don't want to operate any infrastructure",
    "You're building a consumer-facing app that doesn't require agent-native features",
    "Your team already has OpenRouter integrations and no migration bandwidth right now",
  ],
};

export function OpenRouterPage() {
  return (
    <div className="br-mono">
      <ComparePageTemplate data={DATA} />
    </div>
  );
}
