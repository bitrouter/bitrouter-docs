import { docs, blog, legal, changelog } from "@/.source/server";
import { loader, type InferPageType } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import type { ChangelogItem } from "@/lib/changelog";
import { isCanonicalDoc } from "@/lib/docs-visibility";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const blogSource = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource(),
});

export const legalSource = loader({
  baseUrl: "/legal",
  source: legal.toFumadocsSource(),
});

export const changelogSource = loader({
  baseUrl: "/changelog",
  source: changelog.toFumadocsSource(),
});

export type DocsPage = InferPageType<typeof source>;
export type BlogPage = InferPageType<typeof blogSource>;
export type LegalPage = InferPageType<typeof legalSource>;
export type ChangelogPage = InferPageType<typeof changelogSource>;

export function getCanonicalDocs() {
  return source.getPages().filter(isCanonicalDoc);
}

export async function getLLMText(page: DocsPage) {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}

// Release metadata for RSS/Atom. Keep the original URLs as subscriber GUIDs;
// buildChangelogFeed points readers at the single-page docs anchors.
export function getChangelogItems(): ChangelogItem[] {
  return changelogSource.getPages().map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    date: page.data.date,
    version: page.data.version,
    tags: page.data.tags ?? [],
    breaking: page.data.breaking ?? false,
    significance: page.data.significance,
  }));
}
