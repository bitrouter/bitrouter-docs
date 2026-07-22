import type { ComponentType, CSSProperties, SVGProps } from "react";

import Anthropic from "@lobehub/icons/es/Anthropic/components/Mono";
import ClaudeCode from "@lobehub/icons/es/ClaudeCode/components/Mono";
import Cline from "@lobehub/icons/es/Cline/components/Mono";
import Codex from "@lobehub/icons/es/Codex/components/Mono";
import Cursor from "@lobehub/icons/es/Cursor/components/Mono";
import DeepSeek from "@lobehub/icons/es/DeepSeek/components/Mono";
import Gemini from "@lobehub/icons/es/Gemini/components/Mono";
import Github from "@lobehub/icons/es/Github/components/Mono";
import Grok from "@lobehub/icons/es/Grok/components/Mono";
import Hunyuan from "@lobehub/icons/es/Hunyuan/components/Mono";
import Kimi from "@lobehub/icons/es/Kimi/components/Mono";
import MCP from "@lobehub/icons/es/MCP/components/Mono";
import Meta from "@lobehub/icons/es/Meta/components/Mono";
import Minimax from "@lobehub/icons/es/Minimax/components/Mono";
import Mistral from "@lobehub/icons/es/Mistral/components/Mono";
import Moonshot from "@lobehub/icons/es/Moonshot/components/Mono";
import Notion from "@lobehub/icons/es/Notion/components/Mono";
import OpenAI from "@lobehub/icons/es/OpenAI/components/Mono";
import Qwen from "@lobehub/icons/es/Qwen/components/Mono";
import Stepfun from "@lobehub/icons/es/Stepfun/components/Mono";
import Windsurf from "@lobehub/icons/es/Windsurf/components/Mono";
import XiaomiMiMo from "@lobehub/icons/es/XiaomiMiMo/components/Mono";
import ZAI from "@lobehub/icons/es/ZAI/components/Mono";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

/**
 * Shared brand-glyph resolver for the Zed surfaces. Maps a model / lab / agent /
 * tool name (any casing/punctuation) to its @lobehub/icons monochrome mark, which
 * renders in `currentColor` — so callers tint it by setting `color`. Names lobehub
 * doesn't carry (Playwright, Postgres, Slack, …) fall back to a lettered monogram
 * tile that matches the mono aesthetic, so every row still gets a real glyph.
 */
const ICONS: Record<string, IconComponent> = {
  // ── model providers / labs ──
  openai: OpenAI,
  gpt: OpenAI,
  anthropic: Anthropic,
  claude: Anthropic,
  google: Gemini,
  gemini: Gemini,
  qwen: Qwen,
  alibaba: Qwen,
  deepseek: DeepSeek,
  mistral: Mistral,
  mistralai: Mistral,
  meta: Meta,
  llama: Meta,
  metallama: Meta,
  moonshot: Moonshot,
  moonshotai: Moonshot,
  kimi: Kimi,
  zai: ZAI,
  glm: ZAI,
  xiaomi: XiaomiMiMo,
  mimo: XiaomiMiMo,
  minimax: Minimax,
  stepfun: Stepfun,
  grok: Grok,
  xai: Grok,
  hunyuan: Hunyuan,
  tencent: Hunyuan,
  tencenthunyuan: Hunyuan,
  // ── coding agents / harnesses ──
  claudecode: ClaudeCode,
  cursor: Cursor,
  codex: Codex,
  cline: Cline,
  windsurf: Windsurf,
  // ── capabilities / tools ──
  github: Github,
  notion: Notion,
  mcp: MCP,
};

/** Normalise "Z.ai", "Claude Code", "x-ai" → "zai", "claudecode", "xai". */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface Props {
  /** Display name — provider, lab, agent or tool (e.g. "Claude Code", "Z.ai"). */
  name: string;
  size?: number;
  /** CSS color applied to the mark (Mono icons inherit `currentColor`). */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function BrandIcon({ name, size = 14, color, className, style }: Props) {
  const Icon = ICONS[normalize(name)];

  if (Icon) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", color, flex: "0 0 auto", ...style }}
      >
        <Icon size={size} aria-hidden />
      </span>
    );
  }

  // Fallback monogram — first alphanumeric char in a subtle bordered tile.
  const letter = (name.match(/[a-z0-9]/i)?.[0] ?? "•").toUpperCase();
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.max(2, Math.round(size * 0.2)),
        border: "1px solid var(--z-rule-2)",
        color: color ?? "var(--z-ink-5)",
        fontFamily: "var(--font-mono)",
        fontSize: Math.round(size * 0.64),
        lineHeight: 1,
        flex: "0 0 auto",
        ...style,
      }}
    >
      {letter}
    </span>
  );
}
