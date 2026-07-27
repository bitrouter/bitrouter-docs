/**
 * Wire types for `GET /v1/stats/usage` plus the shared token formatter.
 *
 * Deliberately free of `server-only` so the client chart component can import
 * the shape it renders; the fetch itself lives in `lib/usage-stats.ts`, which
 * is server-only and must stay that way.
 */

export type UsageDay = {
  date: string;
  total_tokens: number;
  request_count: number;
  by_model: Record<string, number>;
};

export type UsageStats = {
  window: { from: string; to: string; days: number; bucket: string };
  totals: {
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens: number;
    total_tokens: number;
    request_count: number;
  };
  open_weight_token_share: number | null;
  models: {
    id: string;
    open_weights?: boolean;
    total_tokens: number;
    request_count: number;
    token_share: number;
  }[];
  series: UsageDay[];
};

/** `16.7M` / `912K` / `840` — chart axis and headline formatting. */
export function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
