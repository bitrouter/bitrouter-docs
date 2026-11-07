import { changelogSource, getChangelogItems } from "@/lib/source";
import { significanceOf, sortReleasesDesc } from "@/lib/changelog";
import { getMDXComponents } from "@/mdx-components";
import {
  ChangelogTimeline,
  type ChangelogTimelineEntry,
} from "@/components/changelog";
import type { TOCItemType } from "fumadocs-core/toc";
import {
  createElement,
  type ElementType,
  type ComponentProps,
  type ComponentType,
} from "react";

// The generated single-page TOC is the authority for historical heading IDs.
// Individual release MDX is compiled separately, so remap its heading IDs to
// the aggregate IDs rather than introducing duplicate “Features” anchors.
export function DocsChangelog({ toc }: { toc: TOCItemType[] }) {
  const pages = new Map(changelogSource.getPages().map((p) => [p.url, p]));
  const boundaries = toc
    .map((h, i) => (h.depth === 2 ? i : -1))
    .filter((i) => i >= 0);
  const entries: ChangelogTimelineEntry[] = sortReleasesDesc(
    getChangelogItems(),
  ).map((item, index) => {
    const page = pages.get(item.url)!;
    const MDX = page.data.body;
    const start = boundaries[index];
    const headings = toc.slice(start + 1, boundaries[index + 1] ?? toc.length);
    const ids = new Map(
      page.data.toc.map((h, i) => [h.url.slice(1), headings[i]?.url.slice(1)]),
    );
    const components = getMDXComponents();
    const headingComponents = Object.fromEntries(
      ([1, 2, 3, 4, 5, 6] as const).map((level) => {
        const key = `h${level}` as "h1";
        const Heading = components[
          `h${Math.max(3, level)}` as "h3"
        ] as ComponentType<ComponentProps<"h3">>;
        return [
          key,
          (props: ComponentProps<"h3">) => (
            <Heading {...props} id={ids.get(props.id ?? "") ?? props.id} />
          ),
        ];
      }),
    );
    const blockComponents = Object.fromEntries(
      (["p", "li", "img"] as const).map((tag) => [
        tag,
        (props: ComponentProps<"p">) =>
          createElement((components[tag] ?? tag) as ElementType, {
            ...props,
            id: props.id ? `${page.slugs.at(-1)}-${props.id}` : undefined,
          }),
      ]),
    );
    const significance = significanceOf(item);
    return {
      id: page.slugs.at(-1)!,
      anchor: toc[start]?.url.slice(1),
      title: item.version ?? item.title,
      date: new Date(item.date),
      url: `/docs/changelog#${page.slugs.at(-1)}`,
      breaking: item.breaking,
      significance,
      body: (
        <>
          {significance !== "routine" && item.description && (
            <p>{item.description}</p>
          )}
          <MDX
            components={{
              ...components,
              ...headingComponents,
              ...blockComponents,
            }}
          />
        </>
      ),
    };
  });
  return (
    <>
      <p>
        Every release on one page. Subscribe with{" "}
        <a href="/changelog/rss.xml">RSS</a> or{" "}
        <a href="/changelog/atom.xml">Atom</a>.
      </p>
      <ChangelogTimeline entries={entries} />
    </>
  );
}
