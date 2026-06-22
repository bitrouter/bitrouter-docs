// Regenerates web/.models-snapshot.json from the live /v1/models catalog.
// Usage: node scripts/generate-models.mjs
// Env: BITROUTER_API_URL (default https://api.bitrouter.ai)
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BITROUTER_API_URL ?? "https://api.bitrouter.ai";
const OUT = join(process.cwd(), ".models-snapshot.json");

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

function normalize(model) {
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
    outputUsdPerM: outUsd,
  };
}

async function main() {
  let models;
  try {
    const res = await fetch(`${BASE}/v1/models`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    models = (body.data ?? []).map(normalize).sort((a, b) => a.id.localeCompare(b.id));
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
