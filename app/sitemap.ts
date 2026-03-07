import type { MetadataRoute } from "next";
import { execSync } from "child_process";
import { source } from "@/lib/source";

export const dynamic = "force-static";

const BASE_URL = "https://bitrouter.ai";

function getGitLastModified(filePath: string): Date {
  try {
    const date = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: "utf-8",
    }).trim();
    return date ? new Date(date) : new Date();
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docPages = source.getPages().flatMap((page) => {
    const mdxPath = `content/docs/${page.slugs.join("/")}.mdx`;
    const lastModified = getGitLastModified(mdxPath);

    const entries = [
      {
        url: `${BASE_URL}${page.url}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ];
    const zhPage = source.getPage(page.slugs, "zh");
    if (zhPage) {
      const zhMdxPath = `content/docs/${page.slugs.join("/")}.zh.mdx`;
      entries.push({
        url: `${BASE_URL}${zhPage.url}`,
        lastModified: getGitLastModified(zhMdxPath),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      });
    }
    return entries;
  });

  return [
    {
      url: BASE_URL,
      lastModified: getGitLastModified("app/[locale]/(home)/page.tsx"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/zh`,
      lastModified: getGitLastModified("app/[locale]/(home)/page.tsx"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...docPages,
  ];
}
