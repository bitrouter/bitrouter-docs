import "server-only";
import { searchServer } from "@/lib/search-server";
import { getLLMText, source } from "@/lib/source";
import { fetchModels } from "@/lib/models-server";
import { getSiteOrigin } from "@/lib/site-origin";
import {
  formatSearchResults,
  pathToSlug,
  truncateMarkdown,
  stripMdxNoise,
  selectMarkdownSection,
  matchModels,
  formatModelAnswer,
  type DocHit,
  type ModelAnswer,
  type RawSearchResult,
} from "@/lib/mcp/format";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;
const DOC_CHAR_CAP = 16_000; // ~4k tokens

export async function searchDocs(
  query: string,
  opts: { limit?: number } = {},
): Promise<DocHit[]> {
  const limit = Math.min(Math.max(1, opts.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const results = await searchServer.search(query);
  if (!Array.isArray(results)) return [];
  return formatSearchResults(results as unknown as RawSearchResult[], limit, getSiteOrigin());
}

export type GetDocResult =
  | { ok: true; markdown: string; url: string }
  | { ok: false; error: string };

export async function getDoc(path: string, section?: string): Promise<GetDocResult> {
  const slug = pathToSlug(path);
  const page = source.getPage(slug);
  if (!page) {
    return {
      ok: false,
      error: `No doc found for "${path}". Use search_docs to find a valid path.`,
    };
  }
  const url = new URL(page.url, getSiteOrigin());
  const text = stripMdxNoise(await getLLMText(page));
  const anchor = section?.replace(/^#/, "") ?? path.split("#", 2)[1];
  if (anchor) {
    const content = selectMarkdownSection(text, anchor);
    if (!content) return { ok: false, error: `No section "#${anchor}" found in ${url.href}.` };
    url.hash = anchor;
    return { ok: true, markdown: truncateMarkdown(content, url.href, DOC_CHAR_CAP), url: url.href };
  }
  return { ok: true, markdown: truncateMarkdown(text, url.href, DOC_CHAR_CAP), url: url.href };
}

export async function lookupModel(query: string): Promise<ModelAnswer> {
  const models = await fetchModels();
  return formatModelAnswer(query, matchModels(models, query));
}
