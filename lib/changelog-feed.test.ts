import { describe, it, expect } from "vitest";
import { buildChangelogFeed } from "./changelog-feed";
import type { ChangelogItem } from "./changelog";

const item = (over: Partial<ChangelogItem>): ChangelogItem => ({
  url: "/changelog/x",
  title: "x",
  date: "2026-01-01",
  tags: [],
  breaking: false,
  ...over,
});

describe("buildChangelogFeed", () => {
  const feed = buildChangelogFeed([
    item({ url: "/changelog/a", title: "A", date: "2026-01-01" }),
    item({ url: "/changelog/b", title: "B", date: "2026-06-01" }),
  ]);

  it("adds one item per entry, newest first", () => {
    expect(feed.items.map((i) => i.title)).toEqual(["B", "A"]);
  });

  it("uses absolute links", () => {
    expect(feed.items[0].link).toBe("https://bitrouter.ai/changelog/b");
  });

  it("emits rss2 and atom1 XML containing the entries", () => {
    const rss = feed.rss2();
    expect(rss).toContain("<rss");
    expect(rss).toContain("https://bitrouter.ai/changelog/b");
    expect(feed.atom1()).toContain("<feed");
  });
});
