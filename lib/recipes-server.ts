import "server-only";

import type {
  Recipe,
  RecipeDelta,
  RecipeEvaluation,
  RecipeMeasurement,
  RecipeProvider,
} from "@/lib/recipes-types";

/**
 * The recipe gallery reads the OSS repo's committed catalog directly, the same
 * way `lib/providers-server.ts` reads the provider registry: no build step and
 * no cross-repo dispatch, so a recipe merged upstream appears here within one
 * revalidation window instead of waiting for a docs deploy.
 */
const REPO = process.env.BITROUTER_RECIPES_REPO ?? "bitrouter/bitrouter";
const REF = process.env.BITROUTER_RECIPES_REF ?? "main";
const CATALOG_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/dist/recipes/index.json`;

/**
 * Local sibling checkout, for previewing a recipe before it is merged:
 * `BITROUTER_REPO=../bitrouter pnpm dev`. Unset in production, where the
 * published catalog on `main` is the only source.
 */
const LOCAL_REPO = process.env.BITROUTER_REPO;

const REVALIDATE_SECONDS = 600;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** `{ en, zh }` from the catalog. The marketing routes are English-only today. */
function localized(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  return str((value as Record<string, unknown>).en);
}

function measurement(value: unknown): RecipeMeasurement {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    label: str(raw.label),
    accuracy: num(raw.accuracy),
    costPerTask: num(raw.cost_per_task),
    timePerTask: num(raw.time_per_task),
  };
}

function delta(value: unknown): RecipeDelta {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    accuracyPoints: num(raw.accuracy_points),
    costPerTaskPct: num(raw.cost_per_task_pct),
    timePerTaskPct: num(raw.time_per_task_pct),
  };
}

function evaluation(value: unknown): RecipeEvaluation | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const name = str(raw.eval);
  const harness = str(raw.harness);
  const measuredBy = str(raw.measured_by);
  const asOf = str(raw.as_of);
  if (!name || !harness || !measuredBy || !asOf) return undefined;
  return {
    name,
    harness,
    config: str(raw.config),
    measuredBy,
    sourceUrl: str(raw.source_url),
    asOf,
    runs: num(raw.runs) ?? 1,
    baseline: measurement(raw.baseline),
    recipe: measurement(raw.recipe),
    delta: delta(raw.delta),
  };
}

function providers(value: unknown): RecipeProvider[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const raw = entry as Record<string, unknown>;
    const name = str(raw.name);
    return name ? [{ name, requires: strings(raw.requires) }] : [];
  });
}

function parseRecipe(value: unknown): Recipe | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const slug = str(raw.slug);
  const title = localized(raw.title);
  const config = str(raw.config);
  const body = localized(raw.body);
  if (!slug || !title || !config) return null;

  return {
    slug,
    title,
    description: localized(raw.description) ?? "",
    workflow: str(raw.workflow) ?? "",
    harness: strings(raw.harness),
    objectives: strings(raw.objectives),
    updatedAt: str(raw.updated_at) ?? "",
    providers: providers(raw.providers),
    models: strings(raw.models),
    env: strings(raw.env),
    config,
    policyLock: str(raw.policy_lock),
    body: body ?? "",
    sourceUrl:
      str(raw.source_url) ??
      `https://github.com/${REPO}/tree/${REF}/recipes/${slug}`,
    evaluation: evaluation(raw.evaluation),
  };
}

async function fetchCatalog(): Promise<unknown> {
  const res = await fetch(CATALOG_URL, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    console.error(`[recipes] catalog fetch failed: HTTP ${res.status}`);
    return null;
  }
  return res.json();
}

async function readLocalCatalog(repo: string): Promise<unknown> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const raw = await readFile(join(repo, "dist", "recipes", "index.json"), "utf8");
  return JSON.parse(raw);
}

/**
 * Every published recipe, newest first. An unreachable catalog yields an empty
 * gallery rather than a 500 — it is an upstream dependency, and the rest of
 * the site does not depend on it being reachable.
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  let payload: unknown;
  try {
    payload = LOCAL_REPO ? await readLocalCatalog(LOCAL_REPO) : await fetchCatalog();
  } catch (error) {
    console.error("[recipes] catalog read failed:", error);
    return [];
  }
  if (payload === null) return [];

  const data = (payload as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];

  return data
    .map(parseRecipe)
    .filter((recipe): recipe is Recipe => recipe !== null)
    .sort(
      (a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug),
    );
}

export async function fetchRecipeBySlug(slug: string): Promise<Recipe | null> {
  const recipes = await fetchRecipes();
  return recipes.find((recipe) => recipe.slug === slug) ?? null;
}
