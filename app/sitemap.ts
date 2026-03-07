import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const BASE_URL = "https://bitrouter.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docPages = source.getPages().flatMap((page) => {
    const entries = [
      {
        url: `${BASE_URL}${page.url}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ];
    const zhPage = source.getPage(page.slugs, "zh");
    if (zhPage) {
      entries.push({
        url: `${BASE_URL}${zhPage.url}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      });
    }
    return entries;
  });

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...docPages,
  ];
}
