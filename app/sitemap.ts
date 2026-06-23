import type { MetadataRoute } from "next";
import { execSync } from "child_process";
import {
  source,
  blogSource,
  legalSource,
  getChangelogItems,
} from "@/lib/source";
import { fetchModels } from "@/lib/models-server";
import { fetchProviders } from "@/lib/providers-server";

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

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Docs (EN + ZH), git-dated per source file ──
  const docPages = source.getPages().flatMap((page) => {
    const mdxPath = `content/docs/${page.slugs.join("/")}.mdx`;
    const entries: Entry[] = [
      {
        url: `${BASE_URL}${page.url}`,
        lastModified: getGitLastModified(mdxPath),
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
    const zhPage = source.getPage(page.slugs, "zh");
    if (zhPage) {
      entries.push({
        url: `${BASE_URL}${zhPage.url}`,
        lastModified: getGitLastModified(
          `content/docs/${page.slugs.join("/")}.zh.mdx`,
        ),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
    return entries;
  });

  // ── Programmatic model + provider pages (data fetched at build) ──
  const [models, providers] = await Promise.all([
    fetchModels(),
    fetchProviders(),
  ]);
  const modelPages: Entry[] = models.map((m) => ({
    url: `${BASE_URL}/models/${m.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const providerPages: Entry[] = providers.map((p) => ({
    url: `${BASE_URL}/providers/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ── Blog posts (English-only; auto-populates as posts land) ──
  const blogPages: Entry[] = blogSource.getPages("en").map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: page.data.lastModified
      ? new Date(page.data.lastModified)
      : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // ── Changelog posts ──
  const changelogPages: Entry[] = getChangelogItems("en").map((item) => ({
    url: `${BASE_URL}${item.url}`,
    lastModified: item.date ? new Date(item.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // ── Legal pages (English-only) ──
  const legalPages: Entry[] = legalSource.getPages("en").map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: page.data.lastModified
      ? new Date(page.data.lastModified)
      : undefined,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  // ── Static marketing/index pages, git-dated by their source file ──
  const staticPages: Entry[] = (
    [
      { url: BASE_URL, file: "app/(home)/page.tsx", priority: 1.0, changeFrequency: "weekly" },
      { url: `${BASE_URL}/models`, file: "app/(home)/models/page.tsx", priority: 0.9, changeFrequency: "weekly" },
      { url: `${BASE_URL}/providers`, file: "app/(home)/providers/page.tsx", priority: 0.8, changeFrequency: "weekly" },
      { url: `${BASE_URL}/pricing`, file: "app/(home)/pricing/page.tsx", priority: 0.8, changeFrequency: "monthly" },
      { url: `${BASE_URL}/compare/bitrouter-vs-openrouter`, file: "app/(home)/compare/bitrouter-vs-openrouter/page.tsx", priority: 0.9, changeFrequency: "monthly" },
      { url: `${BASE_URL}/compare/bitrouter-vs-litellm`, file: "app/(home)/compare/bitrouter-vs-litellm/page.tsx", priority: 0.9, changeFrequency: "monthly" },
      { url: `${BASE_URL}/compare/bitrouter-vs-portkey`, file: "app/(home)/compare/bitrouter-vs-portkey/page.tsx", priority: 0.9, changeFrequency: "monthly" },
      { url: `${BASE_URL}/enterprise`, file: "app/(home)/enterprise/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/about`, file: "app/(home)/about/page.tsx", priority: 0.5, changeFrequency: "monthly" },
      { url: `${BASE_URL}/brand`, file: "app/(home)/brand/page.tsx", priority: 0.4, changeFrequency: "yearly" },
      { url: `${BASE_URL}/blog`, file: "app/blog/(index)/page.tsx", priority: 0.6, changeFrequency: "weekly" },
      { url: `${BASE_URL}/changelog`, file: "app/changelog/(index)/page.tsx", priority: 0.6, changeFrequency: "weekly" },
    ] as const
  ).map(({ url, file, priority, changeFrequency }) => ({
    url,
    lastModified: getGitLastModified(file),
    changeFrequency: changeFrequency as Entry["changeFrequency"],
    priority,
  }));

  // ── Chinese landing (site pages are EN-only except this entry point) ──
  const zhLanding: Entry = {
    url: `${BASE_URL}/zh`,
    lastModified: getGitLastModified("app/(home)/page.tsx"),
    changeFrequency: "monthly",
    priority: 0.5,
  };

  return [
    ...staticPages,
    zhLanding,
    ...modelPages,
    ...providerPages,
    ...blogPages,
    ...changelogPages,
    ...legalPages,
    ...docPages,
  ];
}
