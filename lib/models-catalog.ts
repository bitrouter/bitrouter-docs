import "server-only";

import snapshot from "@/.models-snapshot.json";

export type ModelRow = {
  id: string;
  name: string;
  providers: number;
  maxInputTokens: number | null;
  inputUsdPerM: number | null;
  outputUsdPerM: number | null;
  inputModalities: string[];
  /**
   * Open-weight licensing, from the registry via `/v1/models`. `null` means the
   * catalog does not declare it — render that as unknown, never as proprietary.
   */
  openWeights: boolean | null;
};

const UPSTREAM = process.env.BITROUTER_API_URL ?? "https://api.bitrouter.ai";
// Match the /providers route cadence so both halves of the page refresh together.
const REVALIDATE_SECONDS = 600;

function outputPrice(out: Record<string, unknown> | undefined | null): number | null {
  if (!out) return null;
  for (const k of ["no_cache", "text"]) {
    if (typeof out[k] === "number") return out[k] as number;
  }
  const first = Object.values(out).find((v) => typeof v === "number");
  return (first as number) ?? null;
}

/**
 * Licensing by model id from the committed snapshot. Used as a fallback while
 * an API deployment that predates `open_weights` is still live — the snapshot
 * is generated with the registry as a backstop, so it carries the field even
 * when the running API does not.
 */
const SNAPSHOT_OPEN_WEIGHTS = new Map(
  (snapshot as { models: ModelRow[] }).models
    .filter((m) => typeof m.openWeights === "boolean")
    .map((m) => [m.id, m.openWeights as boolean]),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(m: any): ModelRow {
  const p = m.pricing ?? null;
  return {
    id: m.id,
    name: m.name ?? m.id,
    inputModalities: m.input_modalities ?? [],
    maxInputTokens: m.max_input_tokens ?? null,
    providers: m.providers?.total_online ?? 0,
    inputUsdPerM: p?.input_tokens?.no_cache ?? null,
    outputUsdPerM: outputPrice(p?.output_tokens),
    openWeights:
      typeof m.open_weights === "boolean"
        ? m.open_weights
        : (SNAPSHOT_OPEN_WEIGHTS.get(m.id) ?? null),
  };
}

/**
 * ISR-fresh model catalog. Fetches the live `/v1/models` catalog (revalidated
 * every 10 min); falls back to the build-time snapshot if the API is
 * unreachable, so pages never render empty.
 *
 * Shared by the docs Models & Providers table and the `/models` registry page —
 * both read the same live catalog so they cannot drift apart.
 */
export async function getDocsModels(): Promise<ModelRow[]> {
  try {
    const res = await fetch(`${UPSTREAM}/v1/models`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const rows: ModelRow[] = (body.data ?? [])
      .map(normalize)
      .sort((a: ModelRow, b: ModelRow) => a.id.localeCompare(b.id));
    if (!rows.length) throw new Error("empty catalog");
    return rows;
  } catch {
    return (snapshot as { models: ModelRow[] }).models;
  }
}
