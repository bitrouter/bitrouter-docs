import { describe, expect, it } from "vitest";
import { checkDocumentationCoverage, indexLinks, renderDocumentationIndex } from "./documentation-index.mjs";
import { isCanonicalDoc } from "../docs-visibility";

const origin = "https://staging.example.com";
const catalog = `${origin}/api/bitrouter/models`;
const pages = [
  { url: "/docs/self-hosting", data: { title: "Self-hosting", description: "A supporting guide outside the sidebar." } },
  { url: "/docs/reference", data: { title: "API reference" } },
  { url: "/docs/routing/configuration", data: { title: "Configuration [YAML]", description: "Line one.\nLine two." } },
  { url: "/docs/reference/responses/createResponse", data: { title: "Create response" } },
];
const curated = `# BitRouter\n\n## Cloud tasks\n\n- [Sign in](${origin}/docs/reference#get-a-cloud-credential)\n- [Catalog](${catalog})\n`;
const sitemap = [...pages.map((page) => origin + page.url), `${origin}/models/provider/model`, `${origin}/pricing`];

describe("complete agent documentation index", () => {
  it("includes supporting guides, normalizes curated docs URLs, and preserves titles", () => {
    const text = renderDocumentationIndex(curated, pages, origin);
    const links = indexLinks(text);
    expect(links).toContain(`${origin}/docs/self-hosting.md`);
    expect(links).toContain(`${origin}/docs/reference.md#get-a-cloud-credential`);
    expect(text).toContain("Configuration \\[YAML\\]");
    expect(text).toContain("Line one. Line two.");
    expect(text.match(/^# /gm)).toHaveLength(1);
    expect(checkDocumentationCoverage(text, sitemap).issues).toEqual([]);
    expect(renderDocumentationIndex(curated, [...pages].reverse(), origin)).toBe(text);
  });

  it("uses the shared canonical policy instead of sidebar visibility", () => {
    const sourcePages = [...pages, { url: "/docs/integration/coding-agents", data: { title: "Compatibility guide" } }];
    const text = renderDocumentationIndex(curated, sourcePages.filter(isCanonicalDoc), origin);
    expect(indexLinks(text)).toContain(`${origin}/docs/self-hosting.md`);
    expect(indexLinks(text)).not.toContain(`${origin}/docs/integration/coding-agents.md`);
  });

  it("fails coverage when a new public page is omitted, even if curated links still work", () => {
    const text = renderDocumentationIndex(curated, pages, origin);
    const newPage = { url: "/docs/new-guide", data: { title: "New guide" } };
    const expanded = [...sitemap, origin + newPage.url];
    expect(checkDocumentationCoverage(text, expanded).issues).toContain("Missing canonical doc: /docs/new-guide");
    expect(checkDocumentationCoverage(renderDocumentationIndex(curated, [...pages, newPage], origin), expanded).issues).toEqual([]);
  });

  it("detects duplicate entries, stale links, and the wrong deployment origin", () => {
    const text = renderDocumentationIndex(curated, pages, origin);
    expect(checkDocumentationCoverage(`${text}\n- [Again](${origin}/docs/self-hosting.md)\n`, sitemap).issues)
      .toContain("Duplicate complete-index doc: /docs/self-hosting");
    const stale = text.replace(`${origin}/docs/self-hosting.md`, `${origin}/docs/retired.md`);
    expect(checkDocumentationCoverage(stale, sitemap).issues).toContain(`Invalid or noncanonical doc link: ${origin}/docs/retired.md`);
    const wrongOrigin = text.replaceAll(origin, "https://production.example.com");
    expect(checkDocumentationCoverage(wrongOrigin, sitemap).report.documentation.indexed).toBe(0);
    expect(() => renderDocumentationIndex(curated, [...pages, pages[0]], origin)).toThrow("Duplicate canonical");
  });

  it("reports model and other site coverage separately without relaxing docs requirements", () => {
    const { report, issues } = checkDocumentationCoverage(renderDocumentationIndex(curated, pages, origin), sitemap);
    expect(issues).toEqual([]);
    expect(report.documentation).toMatchObject({ total: 4, indexed: 4, missing: [] });
    expect(report.modelDetails).toMatchObject({ total: 1, directlyLinked: 0, catalogLinked: true, catalogUrl: catalog });
    expect(report.otherPages).toMatchObject({ total: 1, directlyLinked: 0, unlinked: ["/pricing"] });
    expect(report.wholeSite).toEqual({ total: 6, directlyLinked: 4 });
    const absentCatalog = renderDocumentationIndex(curated, pages, origin).replace(catalog, `${origin}/api/absent-catalog`);
    expect(checkDocumentationCoverage(absentCatalog, sitemap).issues).toContain("Model catalog JSON entry is missing");
  });
});
