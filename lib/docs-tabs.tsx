import { ChangelogTabLabel } from "@/components/changelog/changelog-tab-label";
import { sortReleasesDesc } from "@/lib/changelog";
import { getChangelogItems, source } from "@/lib/source";
import type * as PageTree from "fumadocs-core/page-tree";
import {
  getLayoutTabs,
  type LayoutTab,
} from "fumadocs-ui/layouts/shared";

/**
 * Fumadocs owns the four content-root tabs; Changelog is an explicit peer so it
 * can keep its established top-level route and separate content source.
 */
export function getDocsTabs(): LayoutTab[] {
  return [
    ...getLayoutTabs(source.pageTree),
    {
      title: <ChangelogTabLabel />,
      url: "/changelog",
    },
  ];
}

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
