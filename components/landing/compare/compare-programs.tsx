import * as React from "react";
import { Ok, Err, Dim, Faint } from "../mono/terminal";

export type TermStep = { term: string; prog: () => unknown[] };
export type CompareRow = { feat: string; them: string; br: string };

export interface CompareRegistryEntry {
  competitor: string;
  terminals: Record<string, TermStep>; // keyed by differentiator number, e.g. "01"
  rows: CompareRow[];
  tradeoffs: string[];
  ctaTitle?: string;
  ctaBody?: string;
}

export const COMPARE_REGISTRY: Record<string, CompareRegistryEntry> = {
  "bitrouter-vs-litellm": {
    competitor: "LiteLLM",
    terminals: {
      "01": {
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
      "02": {
        term: "latency · 1k req/s",
        prog: () => [
          ["print", <span className="mut">tail latency · 1k concurrent req/s</span>, 240],
          ["print", <span><span className="ind">LiteLLM </span> <Err>~85ms p99</Err> <Faint>Python GIL</Faint></span>, 240],
          ["print", <span><span className="ind">BitRouter</span> <Ok>~12ms p99</Ok> <Faint>Rust async</Faint></span>, 320],
          ["print", <span className="fnt">{"  ↓ no GIL · no thread contention"}</span>, 600],
          ["loop", 2000],
        ],
      },
      "03": {
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
    },
    rows: [
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
  },

  "bitrouter-vs-openrouter": {
    competitor: "OpenRouter",
    terminals: {
      "01": {
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
      "02": {
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
      "03": {
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
    },
    rows: [
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
  },

  "bitrouter-vs-portkey": {
    competitor: "Portkey",
    ctaTitle: "Ready to make the switch?",
    ctaBody:
      "See the full feature comparison and decide which tool fits your stack. If BitRouter is the right call, setup takes under a minute.",
    terminals: {
      "01": {
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
      "02": {
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
      "03": {
        term: "router · overhead benchmark",
        prog: () => [
          ["print", <span className="mut">routing overhead · p50</span>, 240],
          ["print", <span><span className="ind">Portkey  </span> <Err>~15ms</Err> <Faint>Node.js gateway</Faint></span>, 240],
          ["print", <span><span className="ind">BitRouter</span> <Ok>~5ms</Ok> <Faint>Rust async binary</Faint></span>, 320],
          ["print", <span className="fnt">{"  ↓ 3× faster · no GC pauses"}</span>, 600],
          ["loop", 2000],
        ],
      },
    },
    rows: [
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
  },
};
