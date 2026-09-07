import "@/components/landing/zed/zed.css";
import { changelogSource, getChangelogItems } from "@/lib/source";
import { ChangelogFeed } from "@/components/changelog/changelog-feed";
import { getMDXComponents } from "@/mdx-components";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export default async function ChangelogIndexPage() {
  const items = getChangelogItems();

  // Render every entry's notes here, on the server, and hand them to the feed as
  // elements keyed by URL. The feed is a client component (it clears the nav's
  // unseen dot), and MDX bodies can't be compiled there — but a server component
  // may pass already-rendered elements down as props. The per-release pages stay
  // as permalinks for sharing, RSS, and search.
  const bodies: Record<string, ReactNode> = {};
  for (const page of changelogSource.getPages()) {
    const MDX = page.data.body;
    bodies[page.url] = <MDX components={getMDXComponents({})} />;
  }

  return (
    <DocsPage toc={[]} full breadcrumb={{ includePage: true }}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <DocsTitle className="zed-doc-title">Changelog</DocsTitle>
          <DocsDescription className="zed-doc-desc">
            Every release, with the routing, tracing and policy changes that shipped in it.
          </DocsDescription>
        </div>
        <a
          className="mt-2 shrink-0 font-mono text-xs text-fd-muted-foreground hover:text-fd-foreground"
          href="/changelog/rss.xml"
        >
          RSS
        </a>
      </div>

      <DocsBody>
        {items.length === 0 ? (
          <p>No entries yet. Check back soon.</p>
        ) : (
          <ChangelogFeed items={items} bodies={bodies} />
        )}
      </DocsBody>
    </DocsPage>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Changelog - BitRouter",
    description: "Product updates and release notes for BitRouter.",
    alternates: {
      canonical: "https://bitrouter.ai/changelog",
      types: {
        "application/rss+xml": [{ url: "/changelog/rss.xml", title: "BitRouter Changelog" }],
        "application/atom+xml": [{ url: "/changelog/atom.xml", title: "BitRouter Changelog" }],
      },
    },
  };
}
