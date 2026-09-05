import "@/components/landing/zed/zed.css";
import { changelogSource, getChangelogItems } from "@/lib/source";
import { ChangelogFeed } from "@/components/changelog/changelog-feed";
import { PageHead } from "@/components/landing/zed/primitives";
import { getMDXComponents } from "@/mdx-components";
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
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-wrap" style={{ maxWidth: 1000 }}>
          <PageHead
            eyebrow="Changelog"
            title="What's new."
            sub="Every release, with the routing, tracing and policy changes that shipped in it."
            maxWidth="52ch"
            aside={
              <a className="zed-btn zed-btn-ghost" href="/changelog/rss.xml">
                RSS
              </a>
            }
          />

          {items.length === 0 ? (
            <p style={{ padding: "64px 0", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--z-ink-5)" }}>
              No entries yet. Check back soon.
            </p>
          ) : (
            <ChangelogFeed items={items} bodies={bodies} />
          )}
          <div style={{ height: "var(--z-sec)" }} />
        </div>
      </section>
    </div>
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
