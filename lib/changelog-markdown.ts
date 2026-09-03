/**
 * The whole release history as one plain-Markdown document, served at
 * /changelog.md and appended to /api/docs/llms-full.txt.
 *
 * RSS and Atom already exist, but assistants and coding agents fetch Markdown,
 * not feeds — and a feed carries only the descriptions, never the notes. One
 * file, chronological, an `##` per release, is the shape that survives every
 * retrieval pipeline intact and stays readable to a human who curls it.
 *
 * Formatting lives in lib/changelog.ts, which is pure and unit-tested; this
 * module is only the read of the entry bodies.
 */
import { changelogSource, getChangelogItems } from "./source";
import { releaseSection, sortReleasesDesc } from "./changelog";

const SITE = "https://bitrouter.ai";

const HEADER = [
  "# BitRouter Changelog",
  "Every BitRouter release, newest first.",
  [
    `Web: ${SITE}/changelog`,
    `Feeds: ${SITE}/changelog/rss.xml · ${SITE}/changelog/atom.xml`,
    "Source: https://github.com/bitrouter/bitrouter",
  ].join("  \n"),
].join("\n\n");

export async function buildChangelogMarkdown(): Promise<string> {
  const pages = new Map(changelogSource.getPages().map((page) => [page.url, page]));

  const sections = await Promise.all(
    sortReleasesDesc(getChangelogItems()).map(async (item) => {
      const page = pages.get(item.url);
      const notes = page ? await page.data.getText("processed") : "";
      return releaseSection(item, notes);
    }),
  );

  return `${[HEADER, ...sections].join("\n\n---\n\n")}\n`;
}
