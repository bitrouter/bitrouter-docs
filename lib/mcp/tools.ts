import "server-only";
import { searchServer } from "@/lib/search-server";
import { getLLMText, source } from "@/lib/source";
import { fetchModels } from "@/lib/models-server";
import {
  formatSearchResults,
  pathToSlug,
  truncateMarkdown,
  matchModels,
  formatModelAnswer,
  SITE_ORIGIN,
  type DocHit,
  type ModelAnswer,
  type RawSearchResult,
} from "@/lib/mcp/format";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;
const DOC_CHAR_CAP = 16_000; // ~4k tokens

export async function searchDocs(
  query: string,
  opts: { locale?: string; limit?: number } = {},
): Promise<DocHit[]> {
  const limit = Math.min(Math.max(1, opts.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const results = await searchServer.search(query, { locale: opts.locale ?? "en" });
  if (!Array.isArray(results)) return [];
  return formatSearchResults(results as unknown as RawSearchResult[], limit);
}

export type GetDocResult =
  | { ok: true; markdown: string; url: string }
  | { ok: false; error: string };

export async function getDoc(path: string, locale = "en"): Promise<GetDocResult> {
  const slug = pathToSlug(path);
  const page = source.getPage(slug, locale);
  if (!page) {
    return {
      ok: false,
      error: `No doc found for "${path}". Use search_docs to find a valid path.`,
    };
  }
  const url = page.url.startsWith("http") ? page.url : `${SITE_ORIGIN}${page.url}`;
  const text = await getLLMText(page);
  return { ok: true, markdown: truncateMarkdown(text, url, DOC_CHAR_CAP), url };
}

export async function lookupModel(query: string): Promise<ModelAnswer> {
  const models = await fetchModels();
  return formatModelAnswer(query, matchModels(models, query));
}
