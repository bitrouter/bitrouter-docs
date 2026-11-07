import { remark } from "remark";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

export const COMPLETE_DOCS_HEADING = "Complete documentation";

/**
 * Keep the curated task entries, then list every canonical page independently
 * of the sidebar. Markdown AST nodes preserve titles containing brackets/code.
 * @param {string} curated
 * @param {Array<{url: string, data: {title: string, description?: string}}>} pages
 * @param {string} origin
 */
export function renderDocumentationIndex(curated, pages, origin) {
  const processor = remark().use(remarkGfm);
  const tree = processor.parse(curated);
  const paths = new Set(pages.map((page) => page.url));
  if (paths.size !== pages.length) throw new Error("Duplicate canonical documentation URLs");

  visit(tree, "link", (node) => {
    const url = new URL(node.url, origin);
    if (url.origin === origin && paths.has(url.pathname)) url.pathname += ".md";
    node.url = url.href;
  });

  tree.children.push(
    { type: "heading", depth: 2, children: [{ type: "text", value: COMPLETE_DOCS_HEADING }] },
    { type: "paragraph", children: [{ type: "text", value: "Every canonical documentation page, including guides omitted from the sidebar. Model detail pages are available through the separate model catalog above." }] },
  );
  /** @type {Array<[string, boolean]>} */
  const groups = [["Guides", false], ["API reference", true]];
  for (const [title, reference] of groups) {
    const entries = pages.filter((page) => (page.url === "/docs/reference" || page.url.startsWith("/docs/reference/")) === reference)
      .sort((a, b) => a.url.localeCompare(b.url, "en"));
    if (!entries.length) continue;
    tree.children.push({ type: "heading", depth: 3, children: [{ type: "text", value: title }] });
    tree.children.push({
      type: "list", ordered: false, spread: false,
      children: entries.map((page) => ({
        type: "listItem", spread: false,
        children: [{ type: "paragraph", children: [
          { type: "link", url: new URL(`${page.url}.md`, origin).href, children: [{ type: "text", value: page.data.title }] },
          ...(page.data.description ? [{ type: "text", value: `: ${page.data.description.replace(/\s+/g, " ").trim()}` }] : []),
        ] }],
      })),
    });
  }
  return processor.stringify(tree);
}

/** @param {string} markdown */
export function indexLinks(markdown) {
  /** @type {string[]} */
  const links = [];
  visit(remark().use(remarkGfm).parse(markdown), "link", (node) => links.push(node.url));
  return links;
}

/** Compare canonical docs exhaustively; report other site surfaces separately.
 * @param {string} index
 * @param {string[]} sitemapUrls
 */
export function checkDocumentationCoverage(index, sitemapUrls) {
  if (!sitemapUrls.length) throw new Error("Sitemap contains no pages");
  const origin = new URL(sitemapUrls[0]).origin;
  const urls = indexLinks(index).map((link) => new URL(link));
  const sitePaths = new Set(sitemapUrls.map((url) => {
    const parsed = new URL(url);
    if (parsed.origin !== origin) throw new Error("Mixed sitemap origins");
    return parsed.pathname;
  }));
  const docPaths = [...sitePaths].filter((path) => path.startsWith("/docs/"));
  const localLinks = urls.filter((url) => url.origin === origin);
  const docLinks = localLinks.filter((url) => url.pathname.startsWith("/docs/"));
  const pathOf = (url) => url.pathname === "/index.md" ? "/" : url.pathname.replace(/\.md$/, "");
  const linkedPaths = new Set(localLinks.map(pathOf));
  const complete = index.split(`\n## ${COMPLETE_DOCS_HEADING}\n`)[1];
  const completePaths = complete ? indexLinks(complete).map((url) => new URL(url)) : [];
  const missing = docPaths.filter((path) => !completePaths.some((url) => url.origin === origin && pathOf(url) === path));
  const duplicate = docPaths.filter((path) => completePaths.filter((url) => url.origin === origin && pathOf(url) === path).length > 1);
  const invalid = docLinks.filter((url) => !url.pathname.endsWith(".md") || !docPaths.includes(pathOf(url))).map((url) => url.href);
  const extra = completePaths.filter((url) => url.origin !== origin || !docPaths.includes(pathOf(url))).map((url) => url.href);
  const modelPaths = [...sitePaths].filter((path) => path.startsWith("/models/"));
  const otherPaths = [...sitePaths].filter((path) => !path.startsWith("/docs/") && !path.startsWith("/models/"));
  const catalogUrl = `${origin}/api/bitrouter/models`;
  const catalogLinked = urls.some((url) => url.href === catalogUrl);
  const issues = [
    ...(!docPaths.length ? ["Sitemap contains no canonical documentation pages"] : []),
    ...(!complete ? ["Complete documentation section is missing"] : []),
    ...missing.map((path) => `Missing canonical doc: ${path}`),
    ...duplicate.map((path) => `Duplicate complete-index doc: ${path}`),
    ...invalid.map((url) => `Invalid or noncanonical doc link: ${url}`),
    ...extra.map((url) => `Unexpected complete-index link: ${url}`),
    ...(!catalogLinked ? ["Model catalog JSON entry is missing"] : []),
  ];
  return {
    issues,
    docLinks: [...new Set(docLinks.map((url) => url.href))],
    report: {
      origin,
      documentation: { total: docPaths.length, indexed: docPaths.length - missing.length, missing, duplicate },
      modelDetails: { total: modelPaths.length, directlyLinked: modelPaths.filter((path) => linkedPaths.has(path)).length, catalogUrl, catalogLinked },
      otherPages: { total: otherPaths.length, directlyLinked: otherPaths.filter((path) => linkedPaths.has(path)).length, unlinked: otherPaths.filter((path) => !linkedPaths.has(path)) },
      wholeSite: { total: sitePaths.size, directlyLinked: [...sitePaths].filter((path) => linkedPaths.has(path)).length },
    },
  };
}
