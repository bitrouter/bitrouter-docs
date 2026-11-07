import { Feed } from "feed";
import { sortReleasesDesc, type ChangelogItem } from "./changelog";

const SITE = "https://bitrouter.ai";

// Builds an RSS/Atom/JSON-capable Feed from changelog items (newest first).
export function buildChangelogFeed(items: ChangelogItem[]): Feed {
  const feed = new Feed({
    title: "BitRouter Changelog",
    description: "Product updates and release notes for BitRouter.",
    id: `${SITE}/changelog`,
    link: `${SITE}/docs/changelog`,
    language: "en",
    copyright: `© ${new Date().getUTCFullYear()} BitRouter`,
    feedLinks: {
      rss: `${SITE}/changelog/rss.xml`,
      atom: `${SITE}/changelog/atom.xml`,
    },
  });

  // Every release stays in the feed, routine ones included — RSS is the
  // developer channel, where the collapsing the page does would only hide things.
  for (const item of sortReleasesDesc(items)) {
    const link = item.url.startsWith("/changelog/")
      ? `/docs/changelog#${item.url.slice("/changelog/".length)}`
      : item.url;
    feed.addItem({
      // Keep subscriber GUIDs stable while moving links to the single docs page.
      id: `${SITE}${item.url}`,
      title: item.title,
      link: `${SITE}${link}`,
      description: item.description,
      date: new Date(item.date),
    });
  }

  return feed;
}
