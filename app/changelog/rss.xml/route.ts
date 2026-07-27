import { getChangelogItems } from "@/lib/source";
import { buildChangelogFeed } from "@/lib/changelog-feed";

export const revalidate = false; // static at build time

export function GET() {
  const feed = buildChangelogFeed(getChangelogItems());
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
