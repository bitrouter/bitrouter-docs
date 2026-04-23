import { setRequestLocale } from "next-intl/server";
import { Terminal, ArrowUpRight, Shield, Zap, RefreshCw, Ban, Eye, ShieldAlert, Check, ArrowRight, ArrowLeft, Sparkles, Network, Inbox, Send } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Button } from "@/components/ui/button";
import { ProxyInstallTabs } from "@/components/landing/sections/ProxyInstallTabs";
import { ProxyBackground } from "@/components/landing/sections/ProxyBackground";
import type { Metadata } from "next";

import OpenAI from "@lobehub/icons/es/OpenAI";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Google from "@lobehub/icons/es/Google";
import OpenRouter from "@lobehub/icons/es/OpenRouter";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import Minimax from "@lobehub/icons/es/Minimax";
import Moonshot from "@lobehub/icons/es/Moonshot";
import Qwen from "@lobehub/icons/es/Qwen";
import type { ComponentType } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

const routingRows = [
  { from: "smart", to: "claude-sonnet-4", provider: "Anthropic", reason: "priority (primary)", latency: "8ms" },
  { from: "smart", to: "gpt-4o", provider: "OpenAI", reason: "priority (fallback on 429)", latency: "9ms" },
  { from: "fast", to: "gpt-4o-mini", provider: "OpenAI", reason: "load_balance (pool A)", latency: "6ms" },
  { from: "coding", to: "gemini-2.5-pro", provider: "Google", reason: "priority (tertiary)", latency: "9ms" },
  { from: "smart", to: "claude-sonnet-4", provider: "peer:ed25519:7f3a…b41", reason: "p2p ($2.40/Mtok)", latency: "142ms" },
  { from: "fast", to: "qwen2.5-72b", provider: "peer:ed25519:c41b…2af0", reason: "p2p ($0.18/Mtok)", latency: "98ms" },
];

const upgoingPatterns = [
  { id: "api_keys", description: "OpenAI / Anthropic / AWS / GCP / GitHub / Stripe keys" },
  { id: "private_keys", description: "PEM-encoded RSA, EC, Ed25519 keys" },
  { id: "credentials", description: "Inline passwords, basic-auth, DB connection strings" },
  { id: "pii_emails", description: "Email addresses" },
  { id: "pii_phone_numbers", description: "Phone numbers" },
  { id: "ip_addresses", description: "Non-localhost IPv4 addresses" },
];

const downgoingPatterns = [
  { id: "suspicious_commands", description: "rm -rf /, curl | sh, fork bombs, and similar" },
];

const configCode = `# bitrouter.yaml
server:
  listen: 127.0.0.1:8787

providers:
  openai:
    api_key: \${OPENAI_API_KEY}
  anthropic:
    api_key: \${ANTHROPIC_API_KEY}
  google:
    api_key: \${GOOGLE_API_KEY}

models:
  smart:
    strategy: priority
    endpoints:
      - provider: anthropic
        service_id: claude-sonnet-4-20250514
      - provider: openai
        service_id: gpt-4o

  fast:
    strategy: load_balance
    endpoints:
      - provider: openai
        service_id: gpt-4o-mini

guardrails:
  enabled: true
  upgoing:
    api_keys: redact
    private_keys: block
    credentials: block
    pii_emails: warn
  downgoing:
    suspicious_commands: block`;

const providers: { name: string; icon: ComponentType<{ size?: number }> }[] = [
  { name: "OpenAI", icon: OpenAI },
  { name: "Anthropic", icon: Anthropic },
  { name: "Google", icon: Google },
  { name: "OpenRouter", icon: OpenRouter },
  { name: "DeepSeek", icon: DeepSeek },
  { name: "MiniMax", icon: Minimax },
  { name: "Moonshot", icon: Moonshot },
  { name: "Qwen", icon: Qwen },
];

const comparison = [
  { feature: "Open source", bitrouter: true, openrouter: false, litellm: true },
  { feature: "Self-hostable", bitrouter: true, openrouter: false, litellm: true },
  { feature: "Routing overhead", bitrouter: "< 10ms", openrouter: "25–40ms", litellm: "15–30ms" },
  { feature: "Agent-native (KYA/ACP)", bitrouter: true, openrouter: false, litellm: false },
  { feature: "Zero dependencies", bitrouter: true, openrouter: "N/A", litellm: false },
  { feature: "Agent firewall", bitrouter: true, openrouter: false, litellm: false },
  { feature: "402/MPP payments", bitrouter: true, openrouter: false, litellm: false },
  { feature: "Peer-to-peer routing", bitrouter: true, openrouter: false, litellm: false },
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
      <div className="relative w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:w-[40%] lg:sticky lg:top-12 lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r lg:overflow-clip lg:flex lg:flex-col lg:justify-center">
        <ProxyBackground />
        <div className="relative lg:max-w-md lg:mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Terminal className="size-4" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Proxy
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            One binary.{" "}
            <span className="text-muted-foreground">
              Two sides of the wire.
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A high-performance Rust proxy that routes LLM requests across providers through a single OpenAI-compatible endpoint — and the same binary serves inbound traffic from the network. Built for autonomous agents, not chatbots.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a href="/docs/overview/manual-guide">
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

          <div className="mt-6 border border-border/60 bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3" />
              Drop-in endpoint
            </div>
            <code className="mt-1 block font-mono text-xs text-foreground/90 break-all">
              http://localhost:8787/v1
            </code>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              OpenAI-compatible. Point any agent runtime at this URL.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right 60%: scrollable content ── */}
      <div className="flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 space-y-12">
        {/* ── INSTALL ── */}
        <div>
          <RuledSectionLabel label="INSTALL" counter="01" />
          <p className="mt-4 text-sm text-muted-foreground">
            No Postgres. No Redis. No Docker orchestration. One command to start routing.
          </p>
          <div className="mt-4">
            <ProxyInstallTabs />
          </div>

          <div className="mt-4 border border-dashed border-border bg-muted/10 p-4">
            <div className="flex items-center gap-2">
              <Zap className="size-3.5 text-foreground" />
              <h3 className="text-xs font-mono uppercase tracking-widest">Zero-config mode</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Export provider keys (<code className="font-mono text-foreground/80">OPENAI_API_KEY</code>,{" "}
              <code className="font-mono text-foreground/80">ANTHROPIC_API_KEY</code>, …) and run{" "}
              <code className="font-mono text-foreground/80">bitrouter serve</code>. No config file required —
              300+ models across built-in providers are routable immediately.
            </p>
          </div>

          <p className="mt-3 text-xs text-muted-foreground/60">
            Runs on macOS, Linux, and Docker. Windows via WSL.
          </p>
        </div>

        {/* ── ROUTING ── */}
        <div>
          <RuledSectionLabel label="ROUTING" counter="02" />
          <p className="mt-4 text-sm text-muted-foreground">
            Requests arrive in OpenAI format. BitRouter selects the optimal provider and model based on task type, cost, and availability — then translates the protocol automatically.
          </p>
          <div className="mt-4 border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Alias</th>
                  <th className="px-3 py-2 font-medium">Routed to</th>
                  <th className="px-3 py-2 font-medium hidden sm:table-cell">Provider</th>
                  <th className="px-3 py-2 font-medium">Strategy</th>
                  <th className="px-3 py-2 font-medium text-right">Overhead</th>
                </tr>
              </thead>
              <tbody>
                {routingRows.map((row, i) => {
                  const isPeer = row.provider.startsWith("peer:");
                  return (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="px-3 py-2 font-mono text-muted-foreground">{row.from}</td>
                      <td className="px-3 py-2 font-mono font-medium">{row.to}</td>
                      <td
                        className={`px-3 py-2 hidden sm:table-cell ${isPeer ? "font-mono text-foreground/80" : "text-muted-foreground"}`}
                      >
                        {row.provider}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{row.reason}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">{row.latency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Zap className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sub-10ms overhead</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Automatic fallback on 429/5xx</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cross-protocol (OpenAI ↔ Anthropic ↔ Google)</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Local + peer candidates in one pool</span>
            </div>
          </div>
        </div>

        {/* ── PROVIDERS ── */}
        <div>
          <RuledSectionLabel label="PROVIDERS" counter="03" />
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

        {/* ── NETWORK ── */}
        <div>
          <RuledSectionLabel label="NETWORK" counter="04" />
          <p className="mt-4 text-sm text-muted-foreground">
            The same binary is symmetric. Outbound, it consumes inference from peer nodes through the registry. Inbound, it accepts QUIC requests on the <code className="font-mono text-foreground/80">bitrouter/p2p/0</code> ALPN and serves them through the same Local Router pipeline as your local agents.
          </p>

          {/* Two-column: Consumer mode | Provider mode */}
          <div className="mt-4 grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-2">
            <div className="bg-background p-5">
              <div className="mb-3 flex items-center gap-2">
                <Send className="size-3.5 text-foreground" />
                <h3 className="text-xs font-mono uppercase tracking-widest">
                  Consumer mode · outbound
                </h3>
              </div>
              <ol className="space-y-2 text-xs leading-relaxed">
                <li className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">01</span>
                  <span className="text-muted-foreground">
                    Query Registry for <code className="font-mono text-foreground/80">model + price ceiling</code>; receive permitted EndpointIDs.
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">02</span>
                  <span className="text-muted-foreground">
                    Dial peer by Ed25519 public key — iroh handles UDP hole-punching with relay fallback.
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">03</span>
                  <span className="text-muted-foreground">
                    Send request + payment intent (MPP / x402). Settle on response trailer.
                  </span>
                </li>
              </ol>
            </div>

            <div className="bg-background p-5">
              <div className="mb-3 flex items-center gap-2">
                <Inbox className="size-3.5 text-foreground" />
                <h3 className="text-xs font-mono uppercase tracking-widest">
                  Provider mode · inbound
                </h3>
              </div>
              <ol className="space-y-2 text-xs leading-relaxed">
                <li className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">01</span>
                  <span className="text-muted-foreground">
                    Accept QUIC on ALPN <code className="font-mono text-foreground/80">bitrouter/p2p/0</code> — no public IP or DNS needed.
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">02</span>
                  <span className="text-muted-foreground">
                    Verify payment, then hand request to your local router — same pipeline as local agents.
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">03</span>
                  <span className="text-muted-foreground">
                    Stream tokens back; settle in MPP / x402 on stream close.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* Identity + enable snippet */}
          <div className="mt-4 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-[1fr_auto]">
            <div className="bg-background p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                EndpointID · Ed25519 public key
              </div>
              <code className="mt-1 block break-all font-mono text-xs text-foreground/90">
                ed25519:7f3ac1d2a98b…b41e
              </code>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Generated on first run. Decoupled from IP, port, and hostname — your node keeps its identity wherever it runs.
              </p>
            </div>
            <div className="bg-background p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Enable network · bitrouter.yaml
              </div>
              <pre className="mt-1 overflow-x-auto font-mono text-xs leading-relaxed text-foreground/80">
{`network:
  enabled: true
  registry: https://registry.bitrouter.ai
  serve_inbound: true   # become a Provider`}
              </pre>
            </div>
          </div>

          {/* Footer link to registry */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-dashed border-border bg-muted/10 p-4">
            <div className="flex items-start gap-3">
              <Network className="size-3.5 shrink-0 translate-y-0.5 text-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                v0 is permissioned: the Registry is a single git repository.
                Provider entries are reviewed PRs — no self-announce, no DHT,
                no chain.
              </p>
            </div>
            <a
              href="https://github.com/bitrouter/bitrouter-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-foreground hover:opacity-70"
            >
              bitrouter-registry <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>

        {/* ── AGENT FIREWALL ── */}
        <div>
          <RuledSectionLabel label="AGENT FIREWALL" counter="05" />
          <p className="mt-4 text-sm text-muted-foreground">
            Proxy-layer guardrails inspect traffic in both directions. Each pattern is assigned one action — warn, redact, or block. Enabled by default, no application changes.
          </p>

          {/* Bidirectional flow diagram: Agent ↔ Guardrails ↔ Provider */}
          <div className="mt-5 border border-border bg-background p-4 sm:p-6">
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="shrink-0 min-w-[92px] border border-foreground bg-background px-3 py-2 text-center font-mono text-[11px]">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Source</div>
                <div className="mt-0.5">Agent</div>
              </div>

              <div className="flex min-w-[60px] flex-1 flex-col items-center justify-center gap-1">
                <div className="relative h-px w-full bg-foreground/60">
                  <ArrowRight className="absolute -right-1 top-1/2 size-3 -translate-y-1/2 text-foreground" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">upgoing</span>
                <div className="relative h-px w-full bg-foreground/60">
                  <ArrowLeft className="absolute -left-1 top-1/2 size-3 -translate-y-1/2 text-foreground" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">downgoing</span>
              </div>

              <div className="shrink-0 min-w-[120px] border-2 border-foreground bg-background px-3 py-3 text-center font-mono text-[11px]">
                <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                  <Eye className="size-3" />
                  Guardrails
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="size-3" />
                    <span>warn</span>
                  </div>
                </div>
                <div className="mt-0.5 flex items-center justify-center gap-1">
                  <Shield className="size-3" />
                  <span>redact</span>
                </div>
                <div className="mt-0.5 flex items-center justify-center gap-1">
                  <Ban className="size-3" />
                  <span>block</span>
                </div>
              </div>

              <div className="flex min-w-[60px] flex-1 flex-col items-center justify-center gap-1">
                <div className="relative h-px w-full bg-foreground/60">
                  <ArrowRight className="absolute -right-1 top-1/2 size-3 -translate-y-1/2 text-foreground" strokeWidth={2} />
                </div>
                <div className="relative h-px w-full bg-foreground/60">
                  <ArrowLeft className="absolute -left-1 top-1/2 size-3 -translate-y-1/2 text-foreground" strokeWidth={2} />
                </div>
              </div>

              <div className="shrink-0 min-w-[92px] border border-foreground bg-foreground px-3 py-2 text-center font-mono text-[11px] text-background">
                <div className="text-[9px] uppercase tracking-widest opacity-60">Dest</div>
                <div className="mt-0.5">Provider</div>
              </div>
            </div>
          </div>

          {/* Patterns grouped by direction */}
          <div className="mt-4 grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-2">
            {/* Upgoing */}
            <div className="bg-background p-5">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="size-3.5 text-foreground" />
                <h3 className="text-xs font-mono uppercase tracking-widest">Upgoing · agent → provider</h3>
              </div>
              <ul className="space-y-2">
                {upgoingPatterns.map((p) => (
                  <li key={p.id} className="flex items-baseline gap-2 text-xs">
                    <code className="shrink-0 font-mono text-foreground/90">{p.id}</code>
                    <span className="text-muted-foreground leading-relaxed">— {p.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Downgoing */}
            <div className="bg-background p-5">
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeft className="size-3.5 text-foreground" />
                <h3 className="text-xs font-mono uppercase tracking-widest">Downgoing · provider → agent</h3>
              </div>
              <ul className="space-y-2">
                {downgoingPatterns.map((p) => (
                  <li key={p.id} className="flex items-baseline gap-2 text-xs">
                    <code className="shrink-0 font-mono text-foreground/90">{p.id}</code>
                    <span className="text-muted-foreground leading-relaxed">— {p.description}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground/70">
                Custom regex patterns supported via <code className="font-mono">custom_patterns</code>.
              </p>
            </div>
          </div>

        </div>

        {/* ── CONFIGURATION ── */}
        <div>
          <RuledSectionLabel label="CONFIGURATION" counter="06" />
          <p className="mt-4 text-sm text-muted-foreground">
            One YAML file configures providers, model routing, and guardrail policies. Works alongside zero-config env detection.
          </p>
          <div className="mt-4 border border-border">
            <div className="border-b border-border px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">bitrouter.yaml</span>
              <span className="text-[10px] font-mono text-muted-foreground/60">YAML</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono text-foreground/80">
              <code>
                {configCode.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="inline-block w-7 shrink-0 select-none text-muted-foreground/40 tabular-nums text-right pr-3">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre">{line || "\u00A0"}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* ── COMPARE ── */}
        <div>
          <RuledSectionLabel label="COMPARE" counter="07" />
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
