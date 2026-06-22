"use client";

/* Agent-harness logos for the hero / trusted-by strip, via @lobehub/icons
   (Mono variants → currentColor, so they sit right in the mono theme).
   BitRouter works with any harness; these are the recognizable ones. */

import type { ComponentType, SVGProps } from "react";

import ClaudeCode from "@lobehub/icons/es/ClaudeCode/components/Mono";
import Codex from "@lobehub/icons/es/Codex/components/Mono";
import GithubCopilot from "@lobehub/icons/es/GithubCopilot/components/Mono";
import Cursor from "@lobehub/icons/es/Cursor/components/Mono";
import Cline from "@lobehub/icons/es/Cline/components/Mono";
import Windsurf from "@lobehub/icons/es/Windsurf/components/Mono";
import GeminiCLI from "@lobehub/icons/es/GeminiCLI/components/Mono";
import RooCode from "@lobehub/icons/es/RooCode/components/Mono";
import KiloCode from "@lobehub/icons/es/KiloCode/components/Mono";
import OpenCode from "@lobehub/icons/es/OpenCode/components/Mono";
import OpenClaw from "@lobehub/icons/es/OpenClaw/components/Mono";
import HermesAgent from "@lobehub/icons/es/HermesAgent/components/Mono";
import Goose from "@lobehub/icons/es/Goose/components/Mono";
import Amp from "@lobehub/icons/es/Amp/components/Mono";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

// Keyed by cookbook integration slug (and a few generic aliases). Pi has no
// brand mark in @lobehub/icons → falls back to the ▸ glyph.
const HARNESS_ICONS: Record<string, IconComponent> = {
  "claude-code": ClaudeCode,
  codex: Codex,
  "github-copilot": GithubCopilot,
  hermes: HermesAgent,
  kilocode: KiloCode,
  openclaw: OpenClaw,
  opencode: OpenCode,
  // generic aliases
  cursor: Cursor,
  cline: Cline,
  windsurf: Windsurf,
  "gemini-cli": GeminiCLI,
  "roo-code": RooCode,
  goose: Goose,
  amp: Amp,
};

export function HarnessIcon({
  name,
  size = 15,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = HARNESS_ICONS[name.toLowerCase()];
  if (!Icon) {
    // fallback glyph for harnesses without a brand mark
    return (
      <span className={className} aria-hidden>
        ▸
      </span>
    );
  }
  return <Icon size={size} className={className} aria-hidden />;
}
