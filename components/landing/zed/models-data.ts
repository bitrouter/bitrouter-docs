/* ============================================================================
 * Zed /models — presentation constants + view-model mapping.
 *
 * The catalog itself is live: `lib/models-catalog.ts` fetches `/v1/models` and
 * the page maps it through `toModelRows` below. Nothing in this file describes
 * a specific model — add one to the registry, not here.
 * ========================================================================== */

export type Modality = "TXT" | "IMG" | "AUD";

export type ModelRow = {
  p: string; // provider display label
  id: string;
  ctx: string; // formatted context window, e.g. "131K"
  ctxTokens: number;
  in: number; // $ / 1M in
  out: number; // $ / 1M out
  mods: Modality[];
  /** `null` when the catalog does not declare licensing — shown as neither. */
  oss: boolean | null;
};

/** Catalog shape consumed here — structurally the `ModelRow` of models-catalog. */
export type CatalogModel = {
  id: string;
  name: string;
  maxInputTokens: number | null;
  inputUsdPerM: number | null;
  outputUsdPerM: number | null;
  inputModalities: string[];
  openWeights: boolean | null;
};

/**
 * Registry id prefix → display label. A prefix with no entry falls back to its
 * capitalized self, so a newly registered lab renders sanely before anyone
 * touches this file.
 */
const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  qwen: "Qwen",
  deepseek: "DeepSeek",
  minimax: "Minimax",
  moonshotai: "Moonshot",
  "z-ai": "Z.ai",
  xiaomi: "Xiaomi",
  stepfun: "Stepfun",
  "x-ai": "Grok",
  meituan: "Meituan",
  tencent: "Tencent",
};

/** Provider identity is conveyed by its name; dots stay neutral. */
export const PDOT: Record<string, string> = Object.fromEntries(
  Object.values(PROVIDER_LABELS).map((label) => [label, "var(--muted-foreground)"]),
);

export const MODC: Record<Modality, string> = {
  TXT: "var(--muted-foreground)",
  IMG: "var(--foreground)",
  AUD: "var(--muted-foreground)",
};

export function providerLabel(id: string): string {
  const prefix = id.includes("/") ? id.slice(0, id.indexOf("/")) : id;
  return PROVIDER_LABELS[prefix] ?? prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function modalities(input: string[]): Modality[] {
  const out: Modality[] = [];
  if (input.some((m) => m === "text")) out.push("TXT");
  if (input.some((m) => m === "image")) out.push("IMG");
  if (input.some((m) => m === "audio")) out.push("AUD");
  return out.length ? out : ["TXT"];
}

export function formatCtx(tokens: number): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

/**
 * Live catalog → table rows. Models with no per-token price are dropped: the
 * whole surface is a price comparison, and a row whose two price columns read
 * `—` compares nothing. They remain listed in the docs catalog table.
 */
export function toModelRows(models: CatalogModel[]): ModelRow[] {
  return models
    .filter((m) => m.inputUsdPerM !== null && m.outputUsdPerM !== null)
    .map((m) => ({
      p: providerLabel(m.id),
      id: m.id,
      ctxTokens: m.maxInputTokens ?? 0,
      ctx: formatCtx(m.maxInputTokens ?? 0),
      in: m.inputUsdPerM as number,
      out: m.outputUsdPerM as number,
      mods: modalities(m.inputModalities),
      oss: m.openWeights,
    }));
}

/** Provider labels present in the catalog, busiest first then alphabetical. */
export function providersOf(rows: ModelRow[]): string[] {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.p, (counts.get(r.p) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([p]) => p);
}

// ── helpers ──────────────────────────────────────────────────────────────
export function barW(v: number, max: number): string {
  if (!max) return "6%";
  return Math.round(Math.max(6, Math.sqrt(v / max) * 100)) + "%";
}
export function pColor(v: number, hi: number): string {
  return v < hi * 0.06 ? "var(--foreground)" : v < hi * 0.22 ? "var(--chart-1)" : v < hi * 0.6 ? "var(--chart-2)" : "var(--chart-3)";
}
export function fmtUsd(v: number): string {
  return "$" + (v < 1 ? v.toFixed(2) : v.toFixed(2).replace(/\.00$/, ".0"));
}

// ── token-usage chart ────────────────────────────────────────────────────
/** Plot height in px. The series itself comes from `/v1/stats/usage`. */
export const CHART_H = 240;

/** Stable per-model colors for the usage chart, cycled by rank. */
export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--foreground)"];
export const CHART_OTHER_COLOR = "var(--muted)";
