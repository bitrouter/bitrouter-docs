import type { MetadataRoute } from "next";

// Crawler policy. Everything public is open; only the app's POST/JSON API
// routes are withheld (except /api/docs/* — the markdown + llms-full feeds we
// *want* crawlers and agents to ingest).
const ALLOW = ["/", "/docs/", "/api/docs/"];
const DISALLOW = ["/api/"];

// AI answer engines + search crawlers we explicitly welcome (GEO/SEO). All are
// already covered by `*`, but listing them records intent and keeps them open
// if the `*` group is ever tightened. Grouped by operator for maintainability.
const AI_AND_SEARCH_BOTS = [
  // OpenAI
  "GPTBot", // training
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // live fetch when a user asks ChatGPT about a page
  // Anthropic
  "ClaudeBot", // training
  "anthropic-ai",
  "Claude-User", // live fetch for Claude
  "Claude-SearchBot",
  // Google / Bing search + AI
  "Googlebot",
  "Google-Extended", // Gemini / Vertex grounding
  "Bingbot",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Others
  "Amazonbot",
  "Applebot",
  "Applebot-Extended",
  "cohere-ai",
  "CCBot", // Common Crawl — feeds many open models
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ALLOW,
        disallow: DISALLOW,
      },
      {
        userAgent: AI_AND_SEARCH_BOTS,
        allow: ALLOW,
        disallow: DISALLOW,
      },
      // Stripe's merchant/compliance crawler. Not an SEO/GEO bot — this keeps
      // Stripe's account-review crawl unthrottled. See:
      // https://docs.stripe.com/stripebot-crawler
      {
        userAgent: "Stripebot",
        allow: ALLOW,
        disallow: DISALLOW,
      },
    ],
    sitemap: "https://bitrouter.ai/sitemap.xml",
  };
}
