"use client";

import * as React from "react";
import { Ok, Err, Dim, Faint } from "../mono/terminal";
import { ComparePageTemplate } from "./compare-page";
import type { ComparePageData } from "./compare-page";

const DATA: ComparePageData = {
  competitor: "Portkey",
  angle:
    "Portkey is a governance layer for your AI stack. BitRouter is an agent-native runtime with a permissionless provider registry and autonomous payment support.",
  migrationHref: "/docs/get-started/comparison",
  migrationLabel: "Read the full comparison →",
  ctaTitle: "Ready to make the switch?",
  ctaBody:
    "See the full feature comparison and decide which tool fits your stack. If BitRouter is the right call, setup takes under a minute.",

  differentiators: [
    {
      n: "01",
      kicker: "Agent-native",
      title: "Portkey manages APIs. BitRouter manages agents.",
      body: "Portkey is an excellent governance layer for teams sending requests to LLMs. BitRouter goes further: it gives each agent a verified identity (KYA), routes calls through an MCP/ACP gateway, and enables agents to pay for their own resources via x402 — without any human in the loop.",
      powered: ["KYA agent identity", "MCP/ACP gateway", "x402 autonomous payments"],
      term: "agent_a · bitrouter",
      prog: () => [
        ["print", <span><Dim>agent_a →</Dim> <span className="lbl">POST /v1/chat/completions</span></span>, 320],
        ["print", <span><Ok>✓</Ok> <Dim>KYA identity</Dim> <Faint>agent_a · run_8x2k</Faint></span>, 200],
        ["print", <span><Ok>✓</Ok> <Dim>MCP tool gateway</Dim> <Faint>active</Faint></span>, 200],
        ["print", <span><Ok>✓</Ok> <Dim>x402 payment</Dim> <span className="lbl">$0.003 USDC</span> <Faint>autonomous</Faint></span>, 420],
        ["print", <span><Err>Portkey:</Err> <Dim>✗ no agent identity · no payments</Dim></span>, 600],
        ["loop", 2000],
      ],
    },
    {
      n: "02",
      kicker: "Permissionless registry",
      title: "Any provider. No gatekeeper. No application.",
      body: "Portkey's provider list is curated and maintained internally. BitRouter's provider registry is a public GitHub repo — open a PR with your YAML listing, CI runs schema checks, and your provider goes live on the next refresh. No review queue.",
      powered: ["PR-based provider registry", "Open listing process"],
      term: "provider-registry · PR",
      prog: () => [
        ["print", <span className="fnt">$ git clone bitrouter/provider-registry</span>, 340],
        ["print", <span className="fnt">{"$ vim providers/my-llm.yaml"}</span>, 200],
        ["spin", "opening PR · CI schema check", 900,
          <span><Ok>✓</Ok> <Dim>CI green · merged ·</Dim> <span className="lbl">live in 60s</span></span>
        ],
        ["print", <span className="mut">no gatekeeper · no application · no review queue</span>, 600],
        ["loop", 2000],
      ],
    },
    {
      n: "03",
      kicker: "Performance",
      title: "3× lower routing overhead.",
      body: "Portkey's Node.js gateway adds ~15ms of routing overhead p50. BitRouter's Rust async binary runs at ~5ms p50 — flat under any concurrency. For long agent runs making thousands of calls, the compounded difference is measurable.",
      powered: ["Rust async runtime", "~5ms p50 overhead"],
      term: "router · overhead benchmark",
      prog: () => [
        ["print", <span className="mut">routing overhead · p50</span>, 240],
        ["print", <span><span className="ind">Portkey  </span> <Err>~15ms</Err> <Faint>Node.js gateway</Faint></span>, 240],
        ["print", <span><span className="ind">BitRouter</span> <Ok>~5ms</Ok> <Faint>Rust async binary</Faint></span>, 320],
        ["print", <span className="fnt">{"  ↓ 3× faster · no GC pauses"}</span>, 600],
        ["loop", 2000],
      ],
    },
  ],

  tableRows: [
    { feat: "Open source & self-hostable",        them: "✓ MIT (limited features)",  br: "✓ Apache 2.0 full feature" },
    { feat: "Permissionless provider registry",   them: "✗ curated list",             br: "✓ PR-based, open" },
    { feat: "Agent gateway (MCP / ACP / Skills)", them: "✗",                          br: "✓ built-in" },
    { feat: "Autonomous agent payments (x402)",   them: "✗",                          br: "✓" },
    { feat: "KYA agent identity",                 them: "✗",                          br: "✓" },
    { feat: "Multi-provider failover mid-run",    them: "✓ automatic",                br: "✓ automatic" },
    { feat: "Prompt injection detection",         them: "✓ via guardrails",           br: "✓ built-in" },
    { feat: "Routing overhead",                   them: "⚠ ~15ms p50",                br: "✓ ~5ms p50" },
    { feat: "Per-run cost attribution",           them: "✓",                          br: "✓" },
    { feat: "BYOK support",                       them: "✓",                          br: "✓" },
    { feat: "Platform fee",                       them: "— varies by plan",           br: "✓ 2% stablecoin / 5% card" },
  ],

  tradeoffs: [
    "Your team already relies on Portkey's prompt management, versioning, and caching workflows",
    "You need Portkey's enterprise support tier and compliance certifications",
    "You're deeply integrated with Portkey's guardrails marketplace and pre-built policy templates",
  ],
};

export function PortkeyPage() {
  return (
    <div className="br-mono">
      <ComparePageTemplate data={DATA} />
    </div>
  );
}
