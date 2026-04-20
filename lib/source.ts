import { docs, blog, changelog, legal } from "@/.source/server";
import { loader, type InferPageType } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { i18n } from "./fumadocs-i18n";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [lucideIconsPlugin()],
});

export const blogSource = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource(),
  i18n,
});

export const changelogSource = loader({
  baseUrl: "/changelog",
  source: changelog.toFumadocsSource(),
  i18n,
});

export const legalSource = loader({
  baseUrl: "/legal",
  source: legal.toFumadocsSource(),
  i18n,
});

export type DocsPage = InferPageType<typeof source>;
export type BlogPage = InferPageType<typeof blogSource>;
export type ChangelogPage = InferPageType<typeof changelogSource>;
export type LegalPage = InferPageType<typeof legalSource>;

export async function getLLMText(page: DocsPage) {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}
