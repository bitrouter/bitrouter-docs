import { docs, blog, legal, changelog } from "@/.source/server";
import { loader, type InferPageType } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/plugins/lucide-icons";
import { renderPlaceholder } from "fumadocs-core/mdx-plugins/remark-llms.runtime";
import type { ChangelogItem } from "@/lib/changelog";
import { isCanonicalDoc } from "@/lib/docs-visibility";
import type { OpenAPIV3_1 } from "fumadocs-openapi";
import { apiDocument } from "@/lib/openapi";
import { indexOperationMarkdown } from "@/lib/docs-sync/operation-markdown";

export const source = loader(docs.toFumadocsSource(), {
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()],
});

export const blogSource = loader(blog.toFumadocsSource(), {
  baseUrl: "/blog",
});

export const legalSource = loader(legal.toFumadocsSource(), {
  baseUrl: "/legal",
});

export const changelogSource = loader(changelog.toFumadocsSource(), {
  baseUrl: "/changelog",
});

export type DocsPage = InferPageType<typeof source>;
export type BlogPage = InferPageType<typeof blogSource>;
export type LegalPage = InferPageType<typeof legalSource>;
export type ChangelogPage = InferPageType<typeof changelogSource>;

export function getCanonicalDocs() {
  return source.getPages().filter(isCanonicalDoc);
}

const operationMarkdown = indexOperationMarkdown(apiDocument as unknown as OpenAPIV3_1.Document);

const markdownComponents: Parameters<typeof renderPlaceholder>[1] = {
  Callout: ({ attributes, children }) => {
    const label = String(attributes.title ?? attributes.type ?? "Note");
    return `> **${label}**\n>\n${children.trim().split("\n").map((line) => `> ${line}`).join("\n")}`;
  },
  Tab: ({ attributes, children }) => `\n\n**${attributes.value}**\n\n${children.trim()}\n\n`,
  Card: ({ attributes }) => {
    const { title, href, description } = attributes;
    return `\n- [${title}](${href})${description ? ` — ${description}` : ""}\n`;
  },
};

export async function getLLMText(page: DocsPage) {
  const [reference, , operationId] = page.slugs;
  const operation = reference === "reference" && page.slugs.length === 3 && operationId
    ? operationMarkdown.get(operationId)
    : undefined;
  const processed = operation ?? await renderPlaceholder(await page.data.getText("processed"), markdownComponents);
  return `# ${page.data.title} (${page.url})\n\n${processed.trim()}`;
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
