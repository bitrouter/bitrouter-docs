// Regenerates the committed catalog snapshot:
//   .models-snapshot.json     — the live /v1/models catalog (routable supply)
//
// This script owns all network access for the catalog pipeline;
// `generate-supported-tables.mjs` renders the docs table from this snapshot
// offline, so its `--check` drift gate is deterministic in CI.
//
// Usage: node scripts/generate-models.mjs
// Env: BITROUTER_API_URL (default https://api.bitrouter.ai)
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BITROUTER_API_URL ?? "https://api.bitrouter.ai";
const OUT = join(process.cwd(), ".models-snapshot.json");
// Open-weight licensing is editorial metadata owned by the registry. `/v1/models`
// serves it, but older deployments predate that field, so the registry's own
// published artifact is the backstop — it is the same source the API reads.
const REGISTRY_MODELS_URL =
  process.env.BITROUTER_REGISTRY_MODELS_URL ??
  "https://raw.githubusercontent.com/bitrouter/bitrouter/main/dist/registry/models.json";

// Pick the headline (non-cache) output price. The live catalog keys output
// pricing under `text` (and may use `audio`/`image`/etc.), so fall back through
// the common keys, then to the first numeric value present.
function outputPrice(out) {
  if (!out) return null;
  for (const k of ["no_cache", "text"]) {
    if (typeof out[k] === "number") return out[k];
  }
  const first = Object.values(out).find((v) => typeof v === "number");
  return first ?? null;
}

function normalize(model, registryOpenWeights) {
  const p = model.pricing ?? null;
  const inUsd = p?.input_tokens?.no_cache ?? null;
  const outUsd = outputPrice(p?.output_tokens);
  return {
    id: model.id,
    name: model.name ?? model.id,
    inputModalities: model.input_modalities ?? [],
    outputModalities: model.output_modalities ?? [],
    maxInputTokens: model.max_input_tokens ?? null,
    capabilities: model.capabilities ?? [],
    providers: model.providers?.total_online ?? 0,
    inputUsdPerM: inUsd,
    // Cached-input reads are a separate line on every bill and the price an
    // agent loop actually pays on turn two onward, so the catalog carries it
    // beside the uncached rate. Null where the model prices no cache tier.
    cacheReadUsdPerM: p?.input_tokens?.cache_read ?? null,
    outputUsdPerM: outUsd,
    openWeights:
      typeof model.open_weights === "boolean"
        ? model.open_weights
        : (registryOpenWeights.get(model.id) ?? null),
  };
}

// Licensing by model id, straight from the registry. Failure is non-fatal: the
// API may already carry `open_weights`, and a snapshot without licensing is
// better than no snapshot at all.
async function fetchRegistryOpenWeights() {
  try {
    const res = await fetch(REGISTRY_MODELS_URL, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    return new Map(
      (body.data ?? [])
        .filter((m) => typeof m.open_weights === "boolean")
        .map((m) => [m.id, m.open_weights]),
    );
  } catch (err) {
    console.warn(`[generate-models] registry licensing fetch failed (${err.message}).`);
    return new Map();
  }
}

async function main() {
  let models;
  const registryOpenWeights = await fetchRegistryOpenWeights();
  try {
    const res = await fetch(`${BASE}/v1/models`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    models = (body.data ?? [])
      .map((m) => normalize(m, registryOpenWeights))
      .sort((a, b) => a.id.localeCompare(b.id));
  } catch (err) {
    console.warn(`[generate-models] fetch failed (${err.message}); keeping committed snapshot.`);
    if (!existsSync(OUT)) {
      console.warn("[generate-models] no snapshot present; writing empty catalog.");
      writeFileSync(OUT, JSON.stringify({ count: 0, models: [] }, null, 2) + "\n");
    }
    return;
  }
  writeFileSync(OUT, JSON.stringify({ count: models.length, models }, null, 2) + "\n");
  console.log(`[generate-models] wrote ${models.length} models to .models-snapshot.json`);
}

main();
