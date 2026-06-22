import { getChangelogItems } from "@/lib/source";
import { buildChangelogFeed } from "@/lib/changelog-feed";

export const revalidate = false; // static at build time

export function GET() {
  const feed = buildChangelogFeed(getChangelogItems("en"));
  return new Response(feed.atom1(), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
