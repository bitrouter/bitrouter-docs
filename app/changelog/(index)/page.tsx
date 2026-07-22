import "@/components/landing/zed/zed.css";
import { getChangelogItems } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import { ChangelogFeed } from "@/components/changelog/changelog-feed";
import { Kicker } from "@/components/landing/zed/primitives";
import type { Metadata } from "next";

export default async function ChangelogIndexPage() {
  setRequestLocale("en");

  const items = getChangelogItems("en");

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(60% 36% at 50% 0%, rgba(107,155,255,0.06), transparent 60%)",
          }}
        />
        <div className="zed-wrap" style={{ maxWidth: 1000 }}>
          <div
            style={{
              padding: "56px 0 30px",
              borderBottom: "1px solid var(--z-rule)",
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Kicker>// changelog</Kicker>
              <h1
                className="zed-display"
                style={{ fontSize: "clamp(38px, 6vw, 56px)", lineHeight: 1.0, margin: "16px 0 0" }}
              >
                What&apos;s <span style={{ color: "var(--z-blue)" }}>new.</span>
              </h1>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "16px 0 0", maxWidth: "52ch" }}>
                Every release, with the routing, tracing and policy changes that shipped in it.
              </p>
            </div>
            <a
              href="/changelog/rss.xml"
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--z-ink)",
                padding: "8px 14px",
                borderRadius: 7,
                border: "1px solid var(--z-rule-2)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "var(--z-amber)" }}>◈</span> RSS
            </a>
          </div>

          {items.length === 0 ? (
            <p style={{ padding: "64px 0", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--z-ink-5)" }}>
              No entries yet. Check back soon.
            </p>
          ) : (
            <ChangelogFeed items={items} />
          )}
          <div style={{ height: 60 }} />
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
