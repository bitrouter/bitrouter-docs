// Pure, dependency-free presentation logic for the changelog. Unit-tested in
// lib/changelog.test.ts. Operates on flat ChangelogItem objects so the same
// helpers work server-side (route/page) and client-side (feed component).
import {
  compareVersionsDesc,
  releaseLineOf,
  significanceFor,
} from "./release-version.mjs";

/** How much of the page a release earns. See significanceFor() for the default. */
export type Significance = "highlight" | "notable" | "routine";

export type ChangelogItem = {
  url: string;
  title: string;
  description?: string;
  date: string; // ISO YYYY-MM-DD
  version?: string;
  tags: string[];
  breaking: boolean;
  significance?: Significance; // absent → derived from the version
};

/**
 * Newest first. Date alone is not a total order — a release train can ship
 * several versions in a day — so ties fall through to semver and finally to the
 * URL, making the order deterministic (and the "latest" badge correct).
 */
export function sortReleasesDesc(items: ChangelogItem[]): ChangelogItem[] {
  return [...items].sort((a, b) => {
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    const byVersion = compareVersionsDesc(a.version, b.version);
    if (byVersion !== 0) return byVersion;
    return b.url < a.url ? -1 : b.url > a.url ? 1 : 0;
  });
}

export function significanceOf(item: ChangelogItem): Significance {
  return item.significance ?? (significanceFor(item.version) as Significance);
}

export function allTags(items: ChangelogItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) for (const tag of item.tags) set.add(tag);
  return [...set].sort();
}

/** A release that carries the page on its own. */
export type FeedEntry = { kind: "entry"; item: ChangelogItem };

/**
 * A run of consecutive routine releases from one train, collapsed into a single
 * row. The individual releases stay reachable (and stay in the feed data) — they
 * just stop each claiming a full-width slot.
 */
export type FeedRollup = {
  kind: "rollup";
  line: string; // e.g. "v1.0.0-alpha"
  items: ChangelogItem[]; // newest first
  from: ChangelogItem; // oldest in the run
  to: ChangelogItem; // newest in the run
  tagCounts: { tag: string; count: number }[];
  breaking: boolean; // true if any release in the run is breaking
};

export type FeedBlock = FeedEntry | FeedRollup;

function rollup(items: ChangelogItem[]): FeedRollup {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return {
    kind: "rollup",
    line: releaseLineOf(items[0].version),
    items,
    from: items[items.length - 1],
    to: items[0],
    tagCounts: [...counts]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || (a.tag < b.tag ? -1 : 1)),
    breaking: items.some((i) => i.breaking),
  };
}

/**
 * Sort the feed and collapse consecutive routine releases from the same train
 * into rollups. A run of one stays a normal entry — a "group" wrapping a single
 * release would be more chrome than the release itself.
 */
export function groupFeed(items: ChangelogItem[]): FeedBlock[] {
  const blocks: FeedBlock[] = [];
  let run: ChangelogItem[] = [];

  const flush = () => {
    if (run.length === 0) return;
    if (run.length === 1) blocks.push({ kind: "entry", item: run[0] });
    else blocks.push(rollup(run));
    run = [];
  };

  for (const item of sortReleasesDesc(items)) {
    if (significanceOf(item) !== "routine") {
      flush();
      blocks.push({ kind: "entry", item });
      continue;
    }
    // An unparseable version has no line, so it never merges with a real train.
    const line = releaseLineOf(item.version);
    if (run.length > 0 && (line === "" || releaseLineOf(run[0].version) !== line)) {
      flush();
    }
    run.push(item);
  }
  flush();

  return blocks;
}

/**
 * The human-readable headline for an entry. Changelog titles are often just the
 * version string (that's what the sync writes), so the description carries the
 * meaning and the version is shown separately as a chip. Shared by the index,
 * the entry page, and its metadata so the three can't drift apart.
 */
export function headlineOf(item: {
  title: string;
  description?: string;
}): string {
  return item.description?.trim() || item.title;
}

const SITE = "https://bitrouter.ai";

/**
 * Entry bodies carry an MDX provenance comment telling a maintainer whether the
 * sync will overwrite the file. It is build bookkeeping, invisible on the
 * rendered page — and it must stay invisible on the Markdown surfaces too,
 * where it would otherwise be the first thing an agent reads about a release.
 */
export function stripMdxComments(text: string): string {
  return text.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").trim();
}

/** `## v1.0.0-alpha.28 — What shipped`, with no trailing sentence period. */
export function releaseHeading(item: ChangelogItem): string {
  const headline = headlineOf(item).replace(/\.$/, "");
  return item.version && headline !== item.version
    ? `## ${item.version} — ${headline}`
    : `## ${headline}`;
}

/**
 * One release as a Markdown section: heading, the facts a reader needs to place
 * it in time, then the notes. Used for /changelog.md and the changelog tail of
 * llms-full.txt.
 */
export function releaseSection(item: ChangelogItem, notes: string): string {
  const meta = [
    `Released: ${item.date}`,
    `Permalink: ${SITE}${item.url}`,
    item.breaking ? "Breaking: yes" : null,
  ]
    .filter(Boolean)
    .join("  \n");
  return [releaseHeading(item), meta, stripMdxComments(notes)]
    .filter(Boolean)
    .join("\n\n");
}
