// Pure transforms for the docs MCP tools. Keep these independent of
// server-only modules and path aliases so Vitest can exercise them directly.
import type { Model } from "../models-types";
import { PRODUCTION_SITE_ORIGIN } from "../site-origin";

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
  sectionUrl?: string;
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

/** Reduce a doc URL or path to fumadocs slug segments (no "docs" base). */
export function pathToSlug(input: string): string[] {
  let p = input.trim();
  p = p.replace(/^https?:\/\/[^/]+/i, ""); // drop scheme://host
  p = p.split(/[?#]/)[0]; // drop query/hash
  const segs = p.split("/").filter(Boolean);
  if (segs.length && segs[0] === "docs") segs.shift(); // drop the /docs base
  return segs;
}

/** Strip HTML tags (fumadocs wraps search matches in `<mark>…</mark>`). */
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

/** Map fumadocs search results to compact, page-deduplicated hits. */
export function formatSearchResults(
  results: RawSearchResult[],
  limit: number,
  siteOrigin = PRODUCTION_SITE_ORIGIN,
): DocHit[] {
  const hits: DocHit[] = [];
  const seen = new Map<string, DocHit>();
  for (const r of results) {
    const resultUrl = new URL(r.url, siteOrigin);
    const fragment = resultUrl.hash;
    resultUrl.hash = "";
    const url = resultUrl.origin === PRODUCTION_SITE_ORIGIN
      ? `${siteOrigin}${resultUrl.pathname}${resultUrl.search}`
      : resultUrl.href;
    const path = pathToSlug(url).join("/");
    const content = stripTags(r.content);
    const match = seen.get(url);
    if (match) {
      if (!match.sectionUrl && fragment) {
        match.sectionUrl = url + fragment;
        if (content) match.snippet = content;
      }
      continue;
    }
    if (hits.length >= limit) continue;
    const hit: DocHit = {
      title: content || path,
      url,
      path,
      ...(fragment ? { sectionUrl: url + fragment } : {}),
      ...(r.type !== "page" && content ? { snippet: content } : {}),
    };
    hits.push(hit);
    seen.set(url, hit);
  }
  return hits;
}

/** Extract a heading and its children, excluding headings inside code fences. */
export function selectMarkdownSection(markdown: string, anchor: string): string | undefined {
  const lines = markdown.split("\n");
  let fence: string | undefined;
  let start = -1;
  let level = 0;
  for (const [index, line] of lines.entries()) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    if (fence) continue;
    const heading = /^ {0,3}(#{1,6})\s+(.+?)(?:\s+\[#([^\]]+)\])?\s*$/.exec(line.replaceAll("\\[", "[").replaceAll("\\]", "]"));
    if (!heading) continue;
    if (start >= 0 && heading[1].length <= level) return lines.slice(start, index).join("\n").trim();
    if (start === -1 && heading[3] === anchor) {
      start = index;
      level = heading[1].length;
    }
  }
  return start === -1 ? undefined : lines.slice(start).join("\n").trim();
}

/**
 * Drop MDX `import` statement lines that fumadocs' processed text carries
 * (e.g. `import { Callout } from '…'`) — noise for an LLM. Imports inside
 * fenced code blocks are left intact so code examples are not corrupted.
 */
export function stripMdxNoise(markdown: string): string {
  const out: string[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence && /^\s*import\b[^\n]*\bfrom\b\s*['"][^'"]+['"];?\s*$/.test(line)) continue;
    if (!inFence && /^\s*import\s+['"][^'"]+['"];?\s*$/.test(line)) continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
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
    "#   local proxy:     http://127.0.0.1:4356/v1",
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
      note: `No routable model matches "${query}". Try a provider/model id like "anthropic/claude-sonnet-4.6" or a shorter name fragment.`,
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
