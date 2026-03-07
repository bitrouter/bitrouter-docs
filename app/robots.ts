import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs/", "/api/docs/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://bitrouter.ai/sitemap.xml",
  };
}
