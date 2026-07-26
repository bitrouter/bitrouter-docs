import type { FormattedDelta } from "@/lib/recipes-format";

/**
 * Delta colours. Green/amber track *direction of benefit*, not sign — a
 * −32.8% cost delta and a −1.1 pt accuracy delta must not read the same.
 */
export const TONE_COLOR: Record<FormattedDelta["tone"], string> = {
  good: "var(--z-green)",
  bad: "var(--z-amber)",
  neutral: "var(--z-ink-3)",
};
