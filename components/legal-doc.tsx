import { notFound } from "next/navigation";
import { legalSource } from "@/lib/source";
import type { Metadata } from "next";
import type { MDXComponents } from "mdx/types";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

// Shared renderer for the standalone legal pages (/privacy-policy,
// /terms-of-service, /subprocessors). Each route is a thin wrapper that passes
// its slug here; the MDX still lives in content/legal/{slug}.mdx. Routes that
// embed custom components in their MDX (e.g. the subprocessors tables) pass
// them in via `components`. Rendered on the "Zed dark" system — the MDX body
// reuses `.zed-article` (Newsreader headings + mono body + blue links).
export function renderLegalPage(slug: string, components: MDXComponents = {}) {
  const page = legalSource.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <article
          className="zed-wrap"
          style={{ maxWidth: 820, padding: "64px var(--z-gutter) 96px" }}
        >
          <Kicker>legal</Kicker>
          <h1
            className="zed-display"
            style={{
              fontSize: "clamp(32px, 5vw, 44px)",
              lineHeight: 1.06,
              margin: "20px 0 0",
            }}
          >
            {page.data.title}
          </h1>
          {page.data.description && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14.5,
                lineHeight: 1.75,
                color: "var(--z-ink-5)",
                margin: "20px 0 0",
                maxWidth: "68ch",
              }}
            >
              {page.data.description}
            </p>
          )}

          {page.data.lastModified && (
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid var(--z-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--z-ink-6)",
              }}
            >
              Last updated{" "}
              {new Date(page.data.lastModified).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}

          <div className="zed-article" style={{ marginTop: 32 }}>
            <MDX components={components} />
          </div>
        </article>
      </section>
    </div>
  );
}

export function legalMetadata(slug: string): Metadata {
  const page = legalSource.getPage([slug]);
  if (!page) notFound();
  return {
    title: `${page.data.title} — BitRouter`,
    description: page.data.description,
  };
}
