import { sortReleasesDesc } from "@/lib/changelog";
import { getChangelogItems } from "@/lib/source";
import type * as PageTree from "fumadocs-core/page-tree";

/** Native Fumadocs sidebar for the changelog, newest release first. */
export function getChangelogTree(): PageTree.Root {
  const releases = sortReleasesDesc(getChangelogItems());

  return {
    name: "Changelog",
    children: [
      {
        type: "page",
        name: "All releases",
        url: "/changelog",
      },
      {
        type: "separator",
        name: "Releases",
      },
      ...releases.map((release) => ({
        type: "page" as const,
        name: release.version ?? release.title,
        url: release.url,
      })),
    ],
  };
}
