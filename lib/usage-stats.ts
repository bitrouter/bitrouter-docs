import "server-only";

import type { UsageStats } from "@/lib/usage-stats-types";

export type { UsageStats, UsageDay } from "@/lib/usage-stats-types";

const UPSTREAM = process.env.BITROUTER_API_URL ?? "https://api.bitrouter.ai";
const REVALIDATE_SECONDS = 600;
const WINDOW_DAYS = 14;
/** Models broken out per day before the API folds the tail into `other`. */
const TOP_MODELS = 5;

/**
 * Below this the chart is noise dressed up as a trend — a handful of requests
 * rendered as a two-week usage graph reads as a claim the data cannot support.
 * Under the floor the page renders the registry alone and says nothing.
 */
const MIN_TOKENS_TO_PUBLISH = 1_000_000;

/**
 * Platform-wide routed-token usage for the last 14 days, from
 * `GET /v1/stats/usage`.
 *
 * Returns `null` — meaning "render no chart" — when the endpoint is
 * unavailable (an API deployment predating it), when the window is empty, or
 * when volume is below [`MIN_TOKENS_TO_PUBLISH`]. Every caller must handle
 * `null`; there is no placeholder data behind this, by design.
 */
export async function getUsageStats(): Promise<UsageStats | null> {
  try {
    const res = await fetch(
      `${UPSTREAM}/v1/stats/usage?days=${WINDOW_DAYS}&top=${TOP_MODELS}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return null;
    const stats = (await res.json()) as UsageStats;
    if (!stats?.series?.length) return null;
    if ((stats.totals?.total_tokens ?? 0) < MIN_TOKENS_TO_PUBLISH) return null;
    return stats;
  } catch {
    return null;
  }
}
