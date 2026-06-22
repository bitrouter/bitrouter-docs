import { Feed } from "feed";
import { sortByDateDesc, type ChangelogItem } from "./changelog";

const SITE = "https://bitrouter.ai";

// Builds an RSS/Atom/JSON-capable Feed from changelog items (newest first).
export function buildChangelogFeed(items: ChangelogItem[]): Feed {
  const feed = new Feed({
    title: "BitRouter Changelog",
    description: "Product updates and release notes for BitRouter.",
    id: `${SITE}/changelog`,
    link: `${SITE}/changelog`,
    language: "en",
    copyright: `© ${new Date().getUTCFullYear()} BitRouter`,
    feedLinks: {
      rss: `${SITE}/changelog/rss.xml`,
      atom: `${SITE}/changelog/atom.xml`,
    },
  });

  for (const item of sortByDateDesc(items)) {
    feed.addItem({
      id: `${SITE}${item.url}`,
      title: item.title,
      link: `${SITE}${item.url}`,
      description: item.description,
      date: new Date(item.date),
    });
  }

  return feed;
}
