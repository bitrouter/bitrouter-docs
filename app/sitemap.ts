import type { MetadataRoute } from "next";
import { execSync } from "child_process";
import {
  source,
  blogSource,
  legalSource,
  getChangelogItems,
} from "@/lib/source";
import { fetchModels } from "@/lib/models-server";

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
  // ── Docs, git-dated per source file ──
  const docPages = source.getPages().map((page) => {
    // Real file path, not the slugs: the `(guide)/` folder group is stripped
    // from URLs, and pages are a mix of `.md`, `.mdx`, and `<name>/index.mdx`.
    const mdxPath = `content/docs/${page.path}`;
    return {
      url: `${BASE_URL}${page.url}`,
      lastModified: getGitLastModified(mdxPath),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  // ── Programmatic model pages (data fetched at build) ──
  const models = await fetchModels();
  const modelPages: Entry[] = models.map((m) => ({
    url: `${BASE_URL}/models/${m.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ── Blog posts (English-only; auto-populates as posts land) ──
  const blogPages: Entry[] = blogSource.getPages().map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: page.data.lastModified
      ? new Date(page.data.lastModified)
      : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // ── Changelog posts ──
  const changelogPages: Entry[] = getChangelogItems().map((item) => ({
    url: `${BASE_URL}${item.url}`,
    lastModified: item.date ? new Date(item.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // ── Legal pages (English-only) ──
  // The legal MDX source has baseUrl "/legal", but each page is served at its
  // own top-level route, so map slugs to their real URLs.
  const LEGAL_ROUTES: Record<string, string> = {
    privacy: "/privacy-policy",
    terms: "/terms-of-service",
    subprocessors: "/subprocessors",
  };
  const legalPages: Entry[] = legalSource.getPages().map((page) => {
    const slug = page.slugs[page.slugs.length - 1] ?? "";
    return {
      url: `${BASE_URL}${LEGAL_ROUTES[slug] ?? page.url}`,
      lastModified: page.data.lastModified
        ? new Date(page.data.lastModified)
        : undefined,
      changeFrequency: slug === "subprocessors" ? "monthly" : "yearly",
      priority: 0.3,
    };
  });

  // ── Static marketing/index pages, git-dated by their source file ──
  const staticPages: Entry[] = (
    [
      { url: BASE_URL, file: "app/(home)/page.tsx", priority: 1.0, changeFrequency: "weekly" },
      { url: `${BASE_URL}/models`, file: "app/(home)/models/page.tsx", priority: 0.9, changeFrequency: "weekly" },
      { url: `${BASE_URL}/pricing`, file: "app/(home)/pricing/page.tsx", priority: 0.8, changeFrequency: "monthly" },
      { url: `${BASE_URL}/enterprise`, file: "app/(home)/enterprise/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/startup`, file: "app/(home)/startup/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/claude-code`, file: "app/(home)/claude-code/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/codex`, file: "app/(home)/codex/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/openclaw`, file: "app/(home)/openclaw/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/hermes-agent`, file: "app/(home)/hermes-agent/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/opencode`, file: "app/(home)/opencode/page.tsx", priority: 0.6, changeFrequency: "monthly" },
      { url: `${BASE_URL}/about`, file: "app/(home)/about/page.tsx", priority: 0.5, changeFrequency: "monthly" },
      { url: `${BASE_URL}/open`, file: "app/(home)/open/page.tsx", priority: 0.5, changeFrequency: "monthly" },
      { url: `${BASE_URL}/blog`, file: "app/blog/(index)/page.tsx", priority: 0.6, changeFrequency: "weekly" },
      { url: `${BASE_URL}/changelog`, file: "app/changelog/(index)/page.tsx", priority: 0.6, changeFrequency: "weekly" },
    ] as const
  ).map(({ url, file, priority, changeFrequency }) => ({
    url,
    lastModified: getGitLastModified(file),
    changeFrequency: changeFrequency as Entry["changeFrequency"],
    priority,
  }));

  return [
    ...staticPages,
    ...modelPages,
    ...blogPages,
    ...changelogPages,
    ...legalPages,
    ...docPages,
  ];
}
