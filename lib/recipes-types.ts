/**
 * Shapes for the recipe catalog published by the OSS repo at
 * `dist/recipes/index.json` (built and validated there by
 * `dist-helper recipes build`).
 *
 * The catalog stores **measurements**; the comparative claim a card shows is
 * the `delta`, which the builder computes from `baseline` vs `recipe` so a
 * quoted percentage can never disagree with the numbers under it.
 */

/** One side of a comparison. Every metric is optional but both sides agree. */
export interface RecipeMeasurement {
  label?: string;
  /** Percent of tasks passed (0–100). */
  accuracy?: number;
  /** USD per task. */
  costPerTask?: number;
  /** Minutes per task. */
  timePerTask?: number;
}

/** Computed at build time from the two measurements — never hand-written. */
export interface RecipeDelta {
  /** Accuracy moves in points, not percent. */
  accuracyPoints?: number;
  costPerTaskPct?: number;
  timePerTaskPct?: number;
}

export interface RecipeEvaluation {
  /** The evaluation the numbers come from, e.g. `terminal-bench-2.1`. */
  name: string;
  harness: string;
  /** Reasoning-effort / configuration label the run used. */
  config?: string;
  /** `bitrouter` for our own runs, otherwise the third-party source. */
  measuredBy: string;
  /** Citation, required upstream whenever `measuredBy` isn't `bitrouter`. */
  sourceUrl?: string;
  /** YYYY-MM-DD. */
  asOf: string;
  /** How many times the evaluation was repeated — 1 means single-attempt noise. */
  runs: number;
  baseline: RecipeMeasurement;
  recipe: RecipeMeasurement;
  delta: RecipeDelta;
}

/** A provider the recipe turns on, and what the reader must supply for it. */
export interface RecipeProvider {
  name: string;
  /** `api_key` | `base_url` | `local_oauth` | `local_pkce`, from the registry. */
  requires: string[];
}

export interface Recipe {
  slug: string;
  title: string;
  description: string;
  /** Task type the recipe routes, e.g. `coding`. */
  workflow: string;
  harness: string[];
  /** `cost` | `latency` | `accuracy`. */
  objectives: string[];
  /** YYYY-MM-DD. */
  updatedAt: string;
  providers: RecipeProvider[];
  /** Canonical model ids the config routes to. */
  models: string[];
  /** Environment variables the config interpolates. */
  env: string[];
  /** The drop-in `bitrouter.yaml`, verbatim. */
  config: string;
  /** The sibling `policy-lock.yaml`, when the recipe ships one. */
  policyLock?: string;
  /** Long-form body, Markdown. */
  body: string;
  /** The recipe's directory on GitHub. */
  sourceUrl: string;
  evaluation?: RecipeEvaluation;
}
