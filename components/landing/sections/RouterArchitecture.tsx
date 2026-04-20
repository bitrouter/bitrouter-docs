import { getTranslations } from "next-intl/server";
import type { ComponentType } from "react";
import { Marquee } from "@/components/ui/marquee";

import OpenAI from "@lobehub/icons/es/OpenAI";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Google from "@lobehub/icons/es/Google";
import Mistral from "@lobehub/icons/es/Mistral";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import Meta from "@lobehub/icons/es/Meta";
import Groq from "@lobehub/icons/es/Groq";
import Cohere from "@lobehub/icons/es/Cohere";
import ClaudeCode from "@lobehub/icons/es/ClaudeCode";
import OpenClaw from "@lobehub/icons/es/OpenClaw";
import OpenCode from "@lobehub/icons/es/OpenCode";
import Cursor from "@lobehub/icons/es/Cursor";
import Exa from "@lobehub/icons/es/Exa";
import Github from "@lobehub/icons/es/Github";
import Figma from "@lobehub/icons/es/Figma";
import Notion from "@lobehub/icons/es/Notion";
import Perplexity from "@lobehub/icons/es/Perplexity";
import Tavily from "@lobehub/icons/es/Tavily";
import HuggingFace from "@lobehub/icons/es/HuggingFace";
import Vercel from "@lobehub/icons/es/Vercel";

interface LogoEntry {
  name: string;
  icon: ComponentType<{ size?: number }>;
}

const agents: LogoEntry[] = [
  { name: "Claude Code", icon: ClaudeCode.Color },
  { name: "OpenClaw", icon: OpenClaw.Color },
  { name: "OpenCode", icon: OpenCode },
  { name: "Cursor", icon: Cursor },
];

const tools: LogoEntry[] = [
  { name: "Exa", icon: Exa.Color },
  { name: "GitHub", icon: Github },
  { name: "Notion", icon: Notion },
  { name: "Perplexity", icon: Perplexity.Color },
  { name: "Tavily", icon: Tavily.Color },
  { name: "Figma", icon: Figma.Color },
  { name: "Hugging Face", icon: HuggingFace.Color },
  { name: "Vercel", icon: Vercel },
];

const providers: LogoEntry[] = [
  { name: "OpenAI", icon: OpenAI },
  { name: "Anthropic", icon: Anthropic },
  { name: "Google", icon: Google },
  { name: "Mistral", icon: Mistral.Color },
  { name: "DeepSeek", icon: DeepSeek.Color },
  { name: "Meta", icon: Meta.Color },
  { name: "Groq", icon: Groq },
  { name: "Cohere", icon: Cohere.Color },
];

function LogoTile({ entry }: { entry: LogoEntry }) {
  const { name, icon: Icon } = entry;
  return (
    <div className="flex items-center gap-2 border border-border bg-background px-2.5 py-1.5 w-[124px]">
      <Icon size={14} />
      <span className="font-mono text-[10.5px] text-foreground/80 truncate">
        {name}
      </span>
    </div>
  );
}

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
      {children}
    </span>
  );
}

function LogoColumn({
  items,
  reverse = false,
  duration,
}: {
  items: LogoEntry[];
  reverse?: boolean;
  duration: string;
}) {
  return (
    <div className="relative h-[300px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
      <Marquee
        vertical
        reverse={reverse}
        pauseOnHover
        repeat={3}
        className={`h-full [--gap:0.45rem] p-0 ${duration}`}
      >
        {items.map((e) => (
          <LogoTile key={e.name} entry={e} />
        ))}
      </Marquee>
    </div>
  );
}

function CenterNode({ metaLabel }: { metaLabel: string }) {
  const layers = ["PROTOCOL", "ROUTING", "FIREWALL", "WALLET"];
  return (
    <div className="relative flex flex-col items-center">
      {/* Active-layer pulse ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-[40px] opacity-40 bg-foreground/20"
      />

      {/* Header — inverted wordmark */}
      <div className="relative border border-foreground bg-foreground text-background px-3 py-1.5 min-w-[136px] text-center tracking-[0.18em] font-mono text-[10px] uppercase">
        BitRouter
      </div>

      {/* Layer stack */}
      <div className="relative border-x border-b border-foreground bg-background min-w-[136px]">
        {layers.map((layer, i) => {
          const active = i === 1; // ROUTING is the "lit" plate
          return (
            <div
              key={layer}
              className={`flex items-center gap-2 px-3 py-2 border-t border-foreground/20 first:border-t-0 ${
                active ? "bg-foreground/[0.08]" : ""
              }`}
            >
              <span
                className={`h-1 w-1 ${active ? "bg-foreground" : "bg-foreground/30"}`}
                style={
                  active
                    ? { animation: "float 1.4s ease-in-out infinite" }
                    : undefined
                }
              />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-foreground/85">
                {layer}
              </span>
            </div>
          );
        })}
        {/* Meta footer */}
        <div className="flex items-center justify-center border-t border-foreground/20 px-3 py-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {metaLabel}
          </span>
        </div>
      </div>

      {/* Faux stack shadows — subtle plates peeking from behind */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1 -z-10 h-full w-[136px] -translate-x-[calc(50%+3px)] translate-y-1 border border-foreground/15 bg-background/40"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1 -z-20 h-full w-[136px] -translate-x-[calc(50%+6px)] translate-y-2 border border-foreground/10 bg-background/20"
      />
    </div>
  );
}

function Beam({
  side,
  offsetY = 0,
  delay = 0,
}: {
  side: "left" | "right";
  offsetY?: number;
  delay?: number;
}) {
  const positionClass =
    side === "left"
      ? "right-[calc(100%+2px)]"
      : "left-[calc(100%+2px)]";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${positionClass} h-px w-8 sm:w-10 overflow-hidden`}
      style={{ top: `calc(50% + ${offsetY}px)` }}
    >
      <div className="absolute inset-0 bg-border" />
      <div
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/70 to-transparent"
        style={{
          animation: "bitrouter-beam 2.4s linear infinite",
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}

export async function RouterArchitecture() {
  const t = await getTranslations("Architecture");

  return (
    <div className="relative border border-border bg-background/50 overflow-hidden">
      {/* Column labels */}
      <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2 px-3 pt-3 sm:gap-3 sm:px-4">
        <div className="text-center"><ColumnLabel>agents</ColumnLabel></div>
        <div className="min-w-[136px] text-center"><ColumnLabel>proxy</ColumnLabel></div>
        <div className="text-center"><ColumnLabel>models</ColumnLabel></div>
        <div className="text-center"><ColumnLabel>tools</ColumnLabel></div>
      </div>

      {/* Main diagram — 4 columns */}
      <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2 px-3 py-4 sm:gap-3 sm:px-4">
        {/* Column 1 — Agent Frameworks */}
        <LogoColumn items={agents} duration="[--duration:22s]" />

        {/* Column 2 — BitRouter layered stack */}
        <div className="relative flex items-center justify-center">
          <Beam side="left" offsetY={0} delay={0} />
          <Beam side="right" offsetY={-18} delay={0.3} />
          <Beam side="right" offsetY={18} delay={0.9} />
          <CenterNode metaLabel={t("proxyMeta")} />
        </div>

        {/* Column 3 — LLM Providers (primary right target) */}
        <LogoColumn items={providers} reverse duration="[--duration:30s]" />

        {/* Column 4 — MCP Tools */}
        <LogoColumn items={tools} duration="[--duration:26s]" />
      </div>

      {/* Footer caption */}
      <div className="border-t border-border/60 px-3 py-2 text-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {t("caps")}
        </span>
      </div>
    </div>
  );
}
