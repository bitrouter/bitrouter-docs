/* ============================================================================
 * Zed /models — illustrative catalog + token-usage chart data
 * Transcribed from the design file. Mock-first (matches the design); can be
 * wired to the live registry (lib/models-server) in a later pass.
 * ========================================================================== */

export type Modality = "TXT" | "IMG" | "AUD";
export type ModelRow = {
  p: string; // provider
  id: string;
  ctx: string;
  in: number; // $ / 1M in
  out: number; // $ / 1M out
  p50: number; // ms
  mods: Modality[];
  oss: boolean;
};

export const MODELS: ModelRow[] = [
  { p: "OpenAI", id: "openai/gpt-oss-120b", ctx: "131K", in: 0.04, out: 0.18, p50: 120, mods: ["TXT"], oss: true },
  { p: "Stepfun", id: "stepfun/step-3.5-flash", ctx: "262K", in: 0.07, out: 0.22, p50: 90, mods: ["TXT"], oss: true },
  { p: "DeepSeek", id: "deepseek/deepseek-v4-flash", ctx: "262K", in: 0.09, out: 0.18, p50: 88, mods: ["TXT"], oss: true },
  { p: "Qwen", id: "qwen/qwen3.6-flash", ctx: "1M", in: 0.19, out: 1.13, p50: 95, mods: ["TXT"], oss: true },
  { p: "Grok", id: "x-ai/grok-4.1-fast", ctx: "131K", in: 0.2, out: 0.5, p50: 70, mods: ["TXT", "IMG"], oss: false },
  { p: "OpenAI", id: "openai/gpt-5.1-codex-mini", ctx: "400K", in: 0.25, out: 2.0, p50: 130, mods: ["TXT", "IMG"], oss: false },
  { p: "Google", id: "google/gemini-3.1-flash-lite", ctx: "1M", in: 0.25, out: 1.5, p50: 82, mods: ["TXT", "IMG"], oss: false },
  { p: "Minimax", id: "minimax/minimax-m3", ctx: "1M", in: 0.3, out: 1.2, p50: 140, mods: ["TXT", "IMG"], oss: true },
  { p: "Qwen", id: "qwen/qwen3.7-plus", ctx: "1M", in: 0.32, out: 1.28, p50: 150, mods: ["TXT", "IMG"], oss: true },
  { p: "Moonshot", id: "moonshotai/kimi-k2.5", ctx: "262K", in: 0.38, out: 2.02, p50: 160, mods: ["TXT", "IMG"], oss: true },
  { p: "DeepSeek", id: "deepseek/deepseek-v4-pro", ctx: "256K", in: 0.43, out: 0.87, p50: 175, mods: ["TXT"], oss: true },
  { p: "Z.ai", id: "z-ai/glm-5", ctx: "203K", in: 0.6, out: 1.92, p50: 150, mods: ["TXT"], oss: true },
  { p: "Moonshot", id: "moonshotai/kimi-k2.6", ctx: "256K", in: 0.71, out: 3.0, p50: 180, mods: ["TXT"], oss: true },
  { p: "Xiaomi", id: "xiaomi/mimo-v2-pro", ctx: "1M", in: 0.75, out: 2.25, p50: 165, mods: ["TXT"], oss: true },
  { p: "Anthropic", id: "anthropic/claude-haiku-4.5", ctx: "200K", in: 1.0, out: 5.0, p50: 110, mods: ["TXT", "IMG"], oss: false },
  { p: "Z.ai", id: "z-ai/glm-5.2", ctx: "1M", in: 1.0, out: 4.0, p50: 190, mods: ["TXT"], oss: true },
  { p: "OpenAI", id: "openai/gpt-5.1", ctx: "400K", in: 1.07, out: 8.5, p50: 240, mods: ["TXT", "IMG"], oss: false },
  { p: "Grok", id: "x-ai/grok-4.3", ctx: "1M", in: 1.25, out: 2.5, p50: 260, mods: ["TXT", "IMG"], oss: false },
  { p: "Qwen", id: "qwen/qwen3.7-max", ctx: "1M", in: 1.25, out: 3.75, p50: 210, mods: ["TXT"], oss: true },
  { p: "Google", id: "google/gemini-3.5-flash", ctx: "1M", in: 1.5, out: 9.0, p50: 120, mods: ["TXT", "IMG", "AUD"], oss: false },
  { p: "Anthropic", id: "anthropic/claude-sonnet-4.6", ctx: "1M", in: 3.0, out: 15.0, p50: 320, mods: ["TXT", "IMG"], oss: false },
  { p: "Anthropic", id: "anthropic/claude-opus-4.8", ctx: "1M", in: 5.0, out: 25.0, p50: 480, mods: ["TXT", "IMG"], oss: false },
  { p: "OpenAI", id: "openai/gpt-5.5", ctx: "128K", in: 5.0, out: 30.0, p50: 520, mods: ["TXT", "IMG"], oss: false },
  { p: "Anthropic", id: "anthropic/claude-fable-5", ctx: "1M", in: 10.0, out: 50.0, p50: 610, mods: ["TXT", "IMG"], oss: false },
];

export const PDOT: Record<string, string> = {
  OpenAI: "#74aa9c",
  Anthropic: "#d97757",
  Google: "#6b9bff",
  Qwen: "#a78bfa",
  DeepSeek: "#5b8def",
  Minimax: "#e0a955",
  Moonshot: "#9aa2af",
  "Z.ai": "#5bbf6a",
  Xiaomi: "#e0805b",
  Stepfun: "#7f8894",
  Grok: "#c8ccd4",
};

export const MODC: Record<Modality, string> = { TXT: "#8a93a0", IMG: "#6b9bff", AUD: "#e0a955" };

export const PROVIDERS = ["OpenAI", "Anthropic", "Google", "Qwen", "DeepSeek", "Moonshot", "Z.ai", "Xiaomi", "Minimax", "Grok", "Stepfun"];

// ── helpers ──────────────────────────────────────────────────────────────
export const maxIn = Math.max(...MODELS.map((m) => m.in));
export const maxOut = Math.max(...MODELS.map((m) => m.out));

export function barW(v: number, max: number): string {
  return Math.round(Math.max(6, Math.sqrt(v / max) * 100)) + "%";
}
export function pColor(v: number, hi: number): string {
  return v < hi * 0.06 ? "#a1c181" : v < hi * 0.22 ? "#6b9bff" : v < hi * 0.6 ? "#e0a955" : "#e06c6c";
}
export function fmtUsd(v: number): string {
  return "$" + (v < 1 ? v.toFixed(2) : v.toFixed(2).replace(/\.00$/, ".0"));
}
export function ctxNum(s: string): number {
  return s.endsWith("M") ? parseFloat(s) * 1000 : parseFloat(s);
}

// ── token-usage chart (14 days, stacked by model; frontier on top) ──
export const CHART_USE = [
  { key: "qwen", name: "qwen/qwen-3.7", color: "#a78bfa", share: 0.46, frontier: false },
  { key: "deepseek", name: "deepseek-v4-pro", color: "#5b8def", share: 0.21, frontier: false },
  { key: "kimi", name: "kimi-k2.6", color: "#7f8894", share: 0.15, frontier: false },
  { key: "opus", name: "claude-opus-4.8", color: "#d97757", share: 0.08, frontier: true },
  { key: "gpt", name: "gpt-5.1", color: "#74aa9c", share: 0.1, frontier: true },
];
export const CHART_TOTALS = [0.9, 1.1, 0.8, 1.3, 1.5, 0.7, 0.6, 1.2, 1.4, 1.6, 1.1, 1.35, 1.5, 1.7];
export const CHART_JIT = [0, 1, -1, 1, 2, -1, 0, 1, -1, 2, 0, 1, -1, 2];
export const CHART_MAX = 1.7;
export const CHART_H = 240;
export const CHART_STACK = ["gpt", "opus", "kimi", "deepseek", "qwen"]; // top -> bottom
export const CHART_YTICKS = ["1.7M", "1.1M", "0.6M", "0"];
export const CHART_OPEN_PCT = "82%";
export const CHART_FRONTIER_PCT = "18%";
