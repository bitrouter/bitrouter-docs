import * as React from "react";
import { Ok, Err, Warn, Dim, Faint } from "../zed/terminal";

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
          ["print", <span className="mut">LiteLLM Proxy</span>, 240],
          ["print", <span><Dim>python runtime · proxy configuration</Dim></span>, 200],
          ["print", <span className="mut">BitRouter local</span>, 300],
          ["print", <span><Ok>✓</Ok> <span className="lbl">bro start</span> <Faint>· one Rust binary</Faint></span>, 320],
          ["print", <span className="fnt">{"  ↓ config optional for the first route"}</span>, 600],
          ["loop", 2000],
        ],
      },
      "02": {
        term: "product shape",
        prog: () => [
          ["print", <span className="mut">LiteLLM</span>, 240],
          ["print", <span><Ok>✓</Ok> <Dim>importable SDK</Dim> <Faint>· feature-rich proxy</Faint></span>, 200],
          ["print", <span className="mut">BitRouter</span>, 240],
          ["print", <span><Ok>✓</Ok> <Dim>standalone router</Dim> <Faint>· local or Cloud</Faint></span>, 600],
          ["loop", 2000],
        ],
      },
      "03": {
        term: "agent surfaces · bitrouter",
        prog: () => [
          ["print", <span><Ok>✓</Ok> <Dim>MCP gateway</Dim> <Faint>active</Faint></span>, 180],
          ["print", <span><Ok>✓</Ok> <Dim>local ACP adapters</Dim> <Faint>active</Faint></span>, 180],
          ["print", <span><Ok>✓</Ok> <Dim>Agent Skill</Dim> <Faint>installed in the host</Faint></span>, 420],
          ["print", <span className="mut">one operational surface for agent runtimes</span>, 600],
          ["loop", 2000],
        ],
      },
    },
    rows: [
      { feat: "Provider & endpoint coverage",       them: "✓ broad, including non-chat endpoints",       br: "⚠ curated agentic chat set, extend by PR" },
      { feat: "Product shape",                      them: "✓ importable Python SDK + proxy",              br: "✓ standalone Rust router" },
      { feat: "Agent surfaces",                     them: "✓ gateway features",                           br: "✓ MCP gateway + local ACP adapters" },
      { feat: "Routing policy",                     them: "✓ configurable strategies",                    br: "✓ explicit observe → evaluate → learn loop" },
      { feat: "Managed option",                     them: "✓ commercial Enterprise offering",             br: "✓ self-serve Cloud" },
    ],
    tradeoffs: [
      "You need broad provider coverage plus embeddings, rerank, and audio endpoints",
      "You want the library, not the proxy: in-process Python calls with SDK-level hooks and middleware",
      "You need enterprise checkboxes shipped today — SSO/SAML, audit logs, RBAC, compliance certifications",
    ],
  },

  "bitrouter-vs-openrouter": {
    competitor: "OpenRouter",
    terminals: {
      "01": {
        term: "self-host · bitrouter",
        prog: () => [
          ["print", <span className="fnt">$ bro start</span>, 340],
          ["print", <span><Ok>●</Ok> <Dim>started bitrouter</Dim> <Faint>· 127.0.0.1:4356</Faint></span>, 200],
          ["print", <span><Ok>●</Ok> <Dim>provider keys detected</Dim> <Faint>· routes ready</Faint></span>, 200],
          ["print", <span><Ok>●</Ok> <Dim>routing policy</Dim> <span className="lbl">owned locally</span></span>, 420],
          ["print", <span className="mut">self-hosted · no SaaS · no lock-in</span>, 600],
          ["loop", 2000],
        ],
      },
      "02": {
        term: "billing · self-hosted BYOK",
        prog: () => [
          ["print", <span className="mut">how the gateway is paid</span>, 240],
          ["print", <span><span className="ind">OpenRouter </span> <Warn>plan pricing</Warn> <Faint>hosted service</Faint></span>, 260],
          ["print", <span><span className="ind">BitRouter  </span> <Ok>+$0</Ok> <Faint>self-hosted BYOK gateway fee</Faint></span>, 420],
          ["print", <span className="mut">self-hosted · no platform fee at all</span>, 600],
          ["loop", 2000],
        ],
      },
      "03": {
        term: "router · learning your workload",
        prog: () => [
          ["print", <span><Dim>run 001 →</Dim> <span className="lbl">frontier</span> <Faint>$0.21 · tests green</Faint></span>, 300],
          ["print", <span><Ok>✓</Ok> <Dim>observed · scored · learned</Dim></span>, 200],
          ["print", <span><Dim>run 240 →</Dim> <span className="lbl">open-weight</span> <Faint>$0.04 · tests green</Faint></span>, 320],
          ["print", <span><Ok>●</Ok> <Dim>escalates only what needs frontier</Dim></span>, 420],
          ["print", <span className="mut">static auto-routers never get to run 240</span>, 600],
          ["loop", 2000],
        ],
      },
    },
    rows: [
      { feat: "Open source & self-hostable",   them: "✗ closed-source cloud",        br: "✓ Apache 2.0 binary" },
      { feat: "Gateway pricing",               them: "⚠ varies by hosted plan",      br: "✓ no inference fee when self-hosted" },
      { feat: "Routing policy",                them: "✓ hosted routing preferences", br: "✓ policy file + outcome loop" },
      { feat: "Hosted model catalog",          them: "✓ broader, including long tail", br: "⚠ curated agentic & coding set" },
      { feat: "Free-tier models",              them: "✓",                            br: "✗ not yet" },
    ],
    tradeoffs: [
      "You need the widest possible model catalog, long tail included",
      "You want free-tier models rather than production-grade routing",
      "You need enterprise features we haven't built out yet",
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
      { feat: "Platform fee",                       them: "— varies by plan",           br: "✓ none · 0% markup" },
    ],
    tradeoffs: [
      "Your team already relies on Portkey's prompt management, versioning, and caching workflows",
      "You need Portkey's enterprise support tier and compliance certifications",
      "You're deeply integrated with Portkey's guardrails marketplace and pre-built policy templates",
    ],
  },
};
