import { describe, it, expect } from "vitest";
import {
  sortReleasesDesc,
  significanceOf,
  groupFeed,
  allTags,
  headlineOf,
  type ChangelogItem,
  type FeedRollup,
} from "./changelog";

const item = (over: Partial<ChangelogItem>): ChangelogItem => ({
  url: "/changelog/x",
  title: "x",
  date: "2026-01-01",
  tags: [],
  breaking: false,
  ...over,
});

// A release from the alpha train, keyed by its alpha number.
const alpha = (n: number, date: string, over: Partial<ChangelogItem> = {}) =>
  item({
    url: `/changelog/v1-0-0-alpha-${n}`,
    title: `v1.0.0-alpha.${n}`,
    version: `v1.0.0-alpha.${n}`,
    date,
    ...over,
  });

describe("sortReleasesDesc", () => {
  it("orders newest first", () => {
    const out = sortReleasesDesc([
      item({ title: "old", date: "2026-01-01" }),
      item({ title: "new", date: "2026-06-01" }),
      item({ title: "mid", date: "2026-03-01" }),
    ]);
    expect(out.map((i) => i.title)).toEqual(["new", "mid", "old"]);
  });

  it("breaks a same-day tie by version, newest first", () => {
    // The live bug: alpha.18 and alpha.19 both shipped 2026-06-23, and the
    // date-only sort left alpha.18 first — so it wore the "latest" badge.
    const out = sortReleasesDesc([
      alpha(18, "2026-06-23"),
      alpha(19, "2026-06-23"),
    ]);
    expect(out.map((i) => i.version)).toEqual([
      "v1.0.0-alpha.19",
      "v1.0.0-alpha.18",
    ]);
  });

  it("falls back to url when date and version both tie", () => {
    const out = sortReleasesDesc([
      item({ url: "/changelog/a", date: "2026-01-01" }),
      item({ url: "/changelog/b", date: "2026-01-01" }),
    ]);
    expect(out.map((i) => i.url)).toEqual(["/changelog/b", "/changelog/a"]);
  });

  it("does not mutate the input array", () => {
    const input = [item({ date: "2026-01-01" }), item({ date: "2026-02-01" })];
    const before = input.map((i) => i.date);
    sortReleasesDesc(input);
    expect(input.map((i) => i.date)).toEqual(before);
  });
});

describe("significanceOf", () => {
  it("derives from the version when unset", () => {
    expect(significanceOf(alpha(18, "2026-06-23"))).toBe("routine");
    expect(significanceOf(item({ version: "v0.33.0" }))).toBe("notable");
  });

  it("lets frontmatter override the derived value", () => {
    expect(
      significanceOf(alpha(18, "2026-06-23", { significance: "highlight" })),
    ).toBe("highlight");
  });
});

describe("groupFeed", () => {
  it("collapses a run of routine releases from one train", () => {
    const blocks = groupFeed([
      alpha(10, "2026-06-08", { tags: ["features", "fixes"] }),
      alpha(11, "2026-06-09", { tags: ["features"] }),
      alpha(12, "2026-06-11", { tags: ["features"] }),
    ]);
    expect(blocks).toHaveLength(1);
    const group = blocks[0] as FeedRollup;
    expect(group.kind).toBe("rollup");
    expect(group.line).toBe("v1.0.0-alpha");
    expect(group.to.version).toBe("v1.0.0-alpha.12"); // newest
    expect(group.from.version).toBe("v1.0.0-alpha.10"); // oldest
    expect(group.tagCounts).toEqual([
      { tag: "features", count: 3 },
      { tag: "fixes", count: 1 },
    ]);
  });

  it("keeps a notable release as its own entry and splits the runs around it", () => {
    const blocks = groupFeed([
      alpha(2, "2026-05-22"),
      alpha(3, "2026-05-25"),
      item({ url: "/changelog/v0-33-0", version: "v0.33.0", date: "2026-06-01" }),
      alpha(10, "2026-06-08"),
      alpha(11, "2026-06-09"),
    ]);
    expect(blocks.map((b) => b.kind)).toEqual(["rollup", "entry", "rollup"]);
    expect((blocks[1] as { item: ChangelogItem }).item.version).toBe("v0.33.0");
  });

  it("leaves a lone routine release as a full entry", () => {
    const blocks = groupFeed([alpha(10, "2026-06-08")]);
    expect(blocks.map((b) => b.kind)).toEqual(["entry"]);
  });

  it("does not merge releases from different trains", () => {
    const blocks = groupFeed([
      alpha(2, "2026-06-01"),
      alpha(3, "2026-06-02"),
      item({ url: "/changelog/v0-31-2", version: "v0.31.2", date: "2026-05-06" }),
      item({ url: "/changelog/v0-31-1", version: "v0.31.1", date: "2026-05-05" }),
    ]);
    expect(blocks.map((b) => b.kind)).toEqual(["rollup", "rollup"]);
    expect((blocks[0] as FeedRollup).line).toBe("v1.0.0-alpha");
    expect((blocks[1] as FeedRollup).line).toBe("v0.x");
  });

  it("surfaces a breaking release inside a rollup", () => {
    const blocks = groupFeed([
      alpha(7, "2026-06-03", { breaking: true }),
      alpha(8, "2026-06-06"),
    ]);
    expect((blocks[0] as FeedRollup).breaking).toBe(true);
  });
});

describe("allTags", () => {
  it("returns unique tags sorted alphabetically", () => {
    expect(
      allTags([
        item({ tags: ["api", "models"] }),
        item({ tags: ["api", "cli"] }),
      ]),
    ).toEqual(["api", "cli", "models"]);
  });
});

describe("headlineOf", () => {
  it("prefers the description, which carries the meaning", () => {
    expect(
      headlineOf({ title: "v1.0.0-alpha.18", description: "Route Claude Code." }),
    ).toBe("Route Claude Code.");
  });

  it("falls back to the title when there is no description", () => {
    expect(headlineOf({ title: "v1.0.0-alpha.18" })).toBe("v1.0.0-alpha.18");
    expect(headlineOf({ title: "t", description: "  " })).toBe("t");
  });
});
