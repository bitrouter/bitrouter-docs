import { describe, it, expect } from "vitest";
import {
  sortByDateDesc,
  groupByMonth,
  allTags,
  type ChangelogItem,
} from "./changelog";

const item = (over: Partial<ChangelogItem>): ChangelogItem => ({
  url: "/changelog/x",
  title: "x",
  date: "2026-01-01",
  tags: [],
  breaking: false,
  ...over,
});

describe("sortByDateDesc", () => {
  it("orders newest first", () => {
    const out = sortByDateDesc([
      item({ title: "old", date: "2026-01-01" }),
      item({ title: "new", date: "2026-06-01" }),
      item({ title: "mid", date: "2026-03-01" }),
    ]);
    expect(out.map((i) => i.title)).toEqual(["new", "mid", "old"]);
  });

  it("does not mutate the input array", () => {
    const input = [item({ date: "2026-01-01" }), item({ date: "2026-02-01" })];
    const before = input.map((i) => i.date);
    sortByDateDesc(input);
    expect(input.map((i) => i.date)).toEqual(before);
  });
});

describe("groupByMonth", () => {
  it("groups same month and keeps months in desc order", () => {
    const groups = groupByMonth([
      item({ title: "a", date: "2026-06-02" }),
      item({ title: "b", date: "2026-06-20" }),
      item({ title: "c", date: "2026-05-10" }),
    ]);
    expect(groups.map((g) => g.label)).toEqual(["June 2026", "May 2026"]);
    expect(groups[0].items.map((i) => i.title)).toEqual(["b", "a"]);
    expect(groups[1].items.map((i) => i.title)).toEqual(["c"]);
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
