import { setRequestLocale } from "next-intl/server";
import { Terminal, ArrowUpRight, Copy, Shield, Zap, RefreshCw, Ban, Eye, ShieldAlert, Check } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

import OpenAI from "@lobehub/icons/es/OpenAI";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Google from "@lobehub/icons/es/Google";
import Mistral from "@lobehub/icons/es/Mistral";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import Meta from "@lobehub/icons/es/Meta";
import Groq from "@lobehub/icons/es/Groq";
import Cohere from "@lobehub/icons/es/Cohere";
import type { ComponentType } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

const installMethods = [
  { label: "curl", command: "curl -fsSL https://get.bitrouter.ai | sh" },
  { label: "npm", command: "npx bitrouter@latest" },
  { label: "brew", command: "brew install bitrouter/tap/bitrouter" },
  { label: "cargo", command: "cargo install bitrouter" },
];

const routingRows = [
  { from: "gpt-4o", to: "claude-sonnet-4", provider: "Anthropic", reason: "Cost optimization", latency: "8ms" },
  { from: "claude-opus", to: "claude-haiku", provider: "Anthropic", reason: "Low complexity", latency: "6ms" },
  { from: "gpt-4o", to: "gemini-2.5-pro", provider: "Google", reason: "Fallback (429)", latency: "9ms" },
  { from: "any", to: "deepseek-r1", provider: "DeepSeek", reason: "Reasoning task", latency: "7ms" },
];

const firewallFeatures = [
  { icon: Eye, title: "Inspect", description: "Monitor all requests and responses in real time. Full token-level visibility." },
  { icon: ShieldAlert, title: "Warn", description: "Flag risky content patterns and log alerts without blocking the request." },
  { icon: Shield, title: "Redact", description: "Strip PII, credentials, and sensitive data before it reaches the provider." },
  { icon: Ban, title: "Block", description: "Hard-stop requests that violate policy. Content filtering at the proxy layer." },
];

const configCode = `# bitrouter.yaml
providers:
  - name: anthropic
    api_key: \${ANTHROPIC_API_KEY}
  - name: openai
    api_key: \${OPENAI_API_KEY}
  - name: google
    api_key: \${GOOGLE_API_KEY}

routing:
  strategy: cost-optimized
  rules:
    - match: { complexity: high }
      model: claude-opus-4
    - match: { task: code-gen }
      model: claude-sonnet-4
    - fallback: claude-haiku

firewall:
  pii_redaction: true
  content_filter: warn
  audit_log: true`;

const providers: { name: string; icon: ComponentType<{ size?: number }> }[] = [
  { name: "OpenAI", icon: OpenAI },
  { name: "Anthropic", icon: Anthropic },
  { name: "Google", icon: Google },
  { name: "Mistral", icon: Mistral },
  { name: "DeepSeek", icon: DeepSeek },
  { name: "Meta", icon: Meta },
  { name: "Groq", icon: Groq },
  { name: "Cohere", icon: Cohere },
];

const comparison = [
  { feature: "Open source", bitrouter: true, openrouter: false, litellm: true },
  { feature: "Self-hostable", bitrouter: true, openrouter: false, litellm: true },
  { feature: "Routing overhead", bitrouter: "< 10ms", openrouter: "25–40ms", litellm: "15–30ms" },
  { feature: "Agent-native (KYA/ACP)", bitrouter: true, openrouter: false, litellm: false },
  { feature: "Zero dependencies", bitrouter: true, openrouter: "N/A", litellm: false },
  { feature: "Agent firewall", bitrouter: true, openrouter: false, litellm: false },
  { feature: "402/MPP payments", bitrouter: true, openrouter: false, litellm: false },
  { feature: "Single binary", bitrouter: true, openrouter: "N/A", litellm: false },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-xs font-mono text-muted-foreground">{value}</span>;
  }
  return value ? (
    <Check className="size-3.5 text-foreground" />
  ) : (
    <span className="text-xs text-muted-foreground/40">—</span>
  );
}

export default async function ProxyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* ── Left 40%: sticky sidebar ── */}
      <div className="w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:w-[40%] lg:sticky lg:top-12 lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r lg:overflow-clip lg:flex lg:flex-col lg:justify-center">
        <div className="lg:max-w-md lg:mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Terminal className="size-4" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Proxy
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Single Binary.{" "}
            <span className="text-muted-foreground">
              Zero Dependencies. Sub‑10ms Routing.
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A high-performance Rust proxy that routes LLM requests across providers through a single OpenAI-compatible endpoint. Built for autonomous agents, not chatbots.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a href="/docs/overview/quickstart">
              <Button size="lg">Install</Button>
            </a>
            <a
              href="https://github.com/bitrouter/bitrouter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                GitHub <ArrowUpRight className="size-3 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* ── Right 60%: scrollable content ── */}
      <div className="flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 space-y-12">
        {/* ── INSTALL ── */}
        <div>
          <RuledSectionLabel label="INSTALL" />
          <p className="mt-4 text-sm text-muted-foreground">
            No Postgres. No Redis. No Docker orchestration. One command to start routing.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
            {installMethods.map((m) => (
              <div key={m.label} className="bg-background p-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <code className="text-xs font-mono text-foreground/80 break-all">
                    {m.command}
                  </code>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Runs on macOS, Linux, and Docker. Windows via WSL.
          </p>
        </div>

        {/* ── ROUTING ── */}
        <div>
          <RuledSectionLabel label="ROUTING" />
          <p className="mt-4 text-sm text-muted-foreground">
            Requests arrive in OpenAI format. BitRouter selects the optimal provider and model based on task type, cost, and availability — then translates the protocol automatically.
          </p>
          <div className="mt-4 border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Request</th>
                  <th className="px-3 py-2 font-medium">Routed to</th>
                  <th className="px-3 py-2 font-medium hidden sm:table-cell">Provider</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                  <th className="px-3 py-2 font-medium text-right">Overhead</th>
                </tr>
              </thead>
              <tbody>
                {routingRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="px-3 py-2 font-mono text-muted-foreground">{row.from}</td>
                    <td className="px-3 py-2 font-mono font-medium">{row.to}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{row.provider}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.reason}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{row.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sub-10ms overhead</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Automatic fallback on 429/5xx</span>
            </div>
          </div>
        </div>

        {/* ── PROVIDERS ── */}
        <div>
          <RuledSectionLabel label="PROVIDERS" />
          <p className="mt-4 text-sm text-muted-foreground">
            Route to any major LLM provider through a single endpoint. Cross-protocol translation handled automatically.
          </p>
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-px border border-border bg-border">
            {providers.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center justify-center gap-2 bg-background p-3 sm:p-4"
              >
                <Icon size={24} />
                <span className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── AGENT FIREWALL ── */}
        <div>
          <RuledSectionLabel label="AGENT FIREWALL" />
          <p className="mt-4 text-sm text-muted-foreground">
            Inspect, filter, and control agent traffic at the proxy layer. No application-level changes required.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
            {firewallFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-background p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CONFIGURATION ── */}
        <div>
          <RuledSectionLabel label="CONFIGURATION" />
          <p className="mt-4 text-sm text-muted-foreground">
            One YAML file configures providers, routing rules, and firewall policies.
          </p>
          <div className="mt-4 border border-border">
            <div className="border-b border-border px-3 py-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">bitrouter.yaml</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono text-foreground/80">
              <code>{configCode}</code>
            </pre>
          </div>
        </div>

        {/* ── COMPARE ── */}
        <div>
          <RuledSectionLabel label="COMPARE" />
          <p className="mt-4 text-sm text-muted-foreground">
            How BitRouter stacks up against other LLM routing solutions.
          </p>
          <div className="mt-4 border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2.5 font-medium text-muted-foreground"></th>
                  <th className="px-3 py-2.5 font-mono font-semibold text-foreground">BitRouter</th>
                  <th className="px-3 py-2.5 font-mono font-medium text-muted-foreground">OpenRouter</th>
                  <th className="px-3 py-2.5 font-mono font-medium text-muted-foreground">LiteLLM</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-border/30">
                    <td className="px-3 py-2 text-muted-foreground">{row.feature}</td>
                    <td className="px-3 py-2"><ComparisonCell value={row.bitrouter} /></td>
                    <td className="px-3 py-2"><ComparisonCell value={row.openrouter} /></td>
                    <td className="px-3 py-2"><ComparisonCell value={row.litellm} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Proxy - BitRouter",
    description:
      "High-performance Rust proxy for LLM routing. Single binary, zero dependencies, sub-10ms overhead. Built for autonomous agents.",
  };
}
