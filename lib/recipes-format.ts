import type { Recipe, RecipeDelta } from "./recipes-types";

/**
 * A rendered delta. `tone` is direction-aware rather than sign-aware: −32.8%
 * cost is good news, −1.1 accuracy points is not, and the card must not paint
 * them the same colour.
 */
export interface FormattedDelta {
  /** Which metric moved, e.g. `cost/task`. */
  metric: string;
  /** Signed, unit-suffixed value, e.g. `−32.8%`. */
  value: string;
  tone: "good" | "bad" | "neutral";
}

const MINUS = "−"; // typographic minus, so −32.8% aligns with tabular nums

function signed(value: number, suffix: string): string {
  const rounded = Math.abs(value).toFixed(1);
  if (value > 0) return `+${rounded}${suffix}`;
  if (value < 0) return `${MINUS}${rounded}${suffix}`;
  return `0${suffix}`;
}

/** Lower is better: a negative move is the win. */
function lowerIsBetter(value: number): FormattedDelta["tone"] {
  if (value < 0) return "good";
  if (value > 0) return "bad";
  return "neutral";
}

/** Higher is better: a positive move is the win. */
function higherIsBetter(value: number): FormattedDelta["tone"] {
  if (value > 0) return "good";
  if (value < 0) return "bad";
  return "neutral";
}

/** Every metric that moved, in a stable order. */
export function formatDeltas(delta: RecipeDelta): FormattedDelta[] {
  const out: FormattedDelta[] = [];
  if (delta.costPerTaskPct !== undefined) {
    out.push({
      metric: "cost/task",
      value: signed(delta.costPerTaskPct, "%"),
      tone: lowerIsBetter(delta.costPerTaskPct),
    });
  }
  if (delta.timePerTaskPct !== undefined) {
    out.push({
      metric: "time/task",
      value: signed(delta.timePerTaskPct, "%"),
      tone: lowerIsBetter(delta.timePerTaskPct),
    });
  }
  if (delta.accuracyPoints !== undefined) {
    out.push({
      metric: "accuracy",
      value: signed(delta.accuracyPoints, " pts"),
      tone: higherIsBetter(delta.accuracyPoints),
    });
  }
  return out;
}

/**
 * The one number a card leads with: the movement on the objective the recipe
 * claims to optimize, so a cost recipe is never advertised by its accuracy.
 */
export function headlineDelta(recipe: Recipe): FormattedDelta | null {
  const delta = recipe.evaluation?.delta;
  if (!delta) return null;

  const objective = recipe.objectives[0];
  const all = formatDeltas(delta);
  const preferred =
    objective === "latency"
      ? "time/task"
      : objective === "accuracy"
        ? "accuracy"
        : "cost/task";

  return all.find((entry) => entry.metric === preferred) ?? all[0] ?? null;
}

/** `api_key` → `API key`, for the prerequisites list. */
export function formatRequirement(requirement: string): string {
  switch (requirement) {
    case "api_key":
      return "API key";
    case "base_url":
      return "base URL";
    case "local_oauth":
    case "local_pkce":
      return "sign-in";
    default:
      return requirement.replaceAll("_", " ");
  }
}

/** Metric rows shown side by side on a recipe's detail page. */
export const METRIC_ROWS = [
  { key: "accuracy", label: "accuracy" },
  { key: "costPerTask", label: "cost / task" },
  { key: "timePerTask", label: "time / task" },
] as const;

export type MetricKey = (typeof METRIC_ROWS)[number]["key"];

/** Render one raw measurement in its own unit. */
export function formatMetric(key: MetricKey, value: number | undefined): string {
  if (value === undefined) return "—";
  switch (key) {
    case "accuracy":
      return `${value.toFixed(1)}%`;
    case "costPerTask":
      return `$${value.toFixed(2)}`;
    case "timePerTask":
      return `${value.toFixed(1)} min`;
  }
}

/** The delta belonging to a metric row, already signed and unit-suffixed. */
export function metricDelta(key: MetricKey, delta: RecipeDelta): FormattedDelta | null {
  const metric =
    key === "accuracy" ? "accuracy" : key === "costPerTask" ? "cost/task" : "time/task";
  return formatDeltas(delta).find((entry) => entry.metric === metric) ?? null;
}
