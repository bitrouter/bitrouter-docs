// Pure transforms for the docs MCP tools. NO value imports of `@/lib/*` or
// `server-only` — only erased `import type` — so vitest (node env, no path
// aliases) can exercise these directly. See vitest.config.ts.
import type { Model } from "../models-types";

const SITE_ORIGIN = "https://bitrouter.ai";
const LOCALES = ["en", "zh"];
const DEFAULT_MODEL_MATCH_LIMIT = 5;

/** The fields we use from fumadocs-core's `SortedResult`. */
export interface RawSearchResult {
  id: string;
  url: string;
  type: "page" | "heading" | "text";
  content: string;
}

/** One hit returned by `search_docs`. */
export interface DocHit {
  title: string;
  url: string;
  /** Slug path to hand back to `get_doc`, e.g. "guides/routing/model-fallback". */
  path: string;
  snippet?: string;
}

/** A compact, agent-friendly answer for `lookup_model`. */
export interface ModelAnswer {
  query: string;
  matched: boolean;
  models: Array<{
    id: string;
    name: string;
    routable: true;
    pricingPer1M: { input: number; output: number };
    contextTokens: number;
    configSnippet: string;
  }>;
  note?: string;
}

/** Reduce a doc URL or path to fumadocs slug segments (no locale, no "docs"). */
export function pathToSlug(input: string): string[] {
  let p = input.trim();
  p = p.replace(/^https?:\/\/[^/]+/i, ""); // drop scheme://host
  p = p.split(/[?#]/)[0]; // drop query/hash
  const segs = p.split("/").filter(Boolean);
  if (segs.length && LOCALES.includes(segs[0])) segs.shift(); // drop leading locale
  if (segs.length && segs[0] === "docs") segs.shift(); // drop the /docs base
  return segs;
}

/** Map fumadocs search results to compact, page-deduplicated hits. */
export function formatSearchResults(results: RawSearchResult[], limit: number): DocHit[] {
  const hits: DocHit[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    const baseUrl = r.url.split("#")[0];
    if (seen.has(baseUrl)) continue;
    seen.add(baseUrl);
    const path = pathToSlug(baseUrl).join("/");
    hits.push({
      title: r.content || path,
      url: baseUrl.startsWith("http") ? baseUrl : `${SITE_ORIGIN}${baseUrl}`,
      path,
      ...(r.type !== "page" && r.content ? { snippet: r.content } : {}),
    });
    if (hits.length >= limit) break;
  }
  return hits;
}

/** Truncate markdown to a char cap, appending a deep-link footer when cut. */
export function truncateMarkdown(text: string, url: string, cap: number): string {
  if (text.length <= cap) return text;
  return `${text.slice(0, cap).trimEnd()}\n\n… (truncated) full page: ${url}`;
}

/** Copy-paste snippet showing how to route a model through BitRouter. */
export function buildConfigSnippet(id: string): string {
  return [
    "# Route through BitRouter (OpenAI-compatible).",
    "#   hosted base URL: https://api.bitrouter.ai/v1",
    "#   local proxy:     http://localhost:8787/v1",
    "curl https://api.bitrouter.ai/v1/chat/completions \\",
    '  -H "Authorization: Bearer $BITROUTER_API_KEY" \\',
    '  -H "Content-Type: application/json" \\',
    `  -d '{"model":"${id}","messages":[{"role":"user","content":"Hello!"}]}'`,
  ].join("\n");
}

/** Match a query against the catalog: exact id wins, else id/name substring. */
export function matchModels(models: Model[], query: string, limit = DEFAULT_MODEL_MATCH_LIMIT): Model[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [];
  const exact = models.find((m) => m.id.toLowerCase() === q);
  if (exact) return [exact];
  return models
    .filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
    .slice(0, limit);
}

/**
 * Build the `lookup_model` answer from already-matched catalog entries.
 * Callers pass the result of `matchModels(...)`; the two are composed in
 * `lib/mcp/tools.ts` so both stay pure and unit-testable.
 */
export function formatModelAnswer(query: string, matches: Model[]): ModelAnswer {
  if (matches.length === 0) {
    return {
      query,
      matched: false,
      models: [],
      note: `No routable model matches "${query}". Try a provider/model id like "anthropic/claude-sonnet-4" or a shorter name fragment.`,
    };
  }
  return {
    query,
    matched: true,
    models: matches.map((m) => ({
      id: m.id,
      name: m.name,
      routable: true,
      pricingPer1M: { input: m.pricing.input, output: m.pricing.output },
      contextTokens: m.maxInputTokens,
      configSnippet: buildConfigSnippet(m.id),
    })),
  };
}
