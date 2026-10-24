import { notFound } from "next/navigation";
import { legalSource } from "@/lib/source";
import type { Metadata } from "next";
import type { MDXComponents } from "mdx/types";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

// Renderer for the standalone /subprocessors page. Privacy Policy and Terms
// of Service live in the docs tree. Subprocessors keeps its custom tables and
// landing-page styling through the legal collection.
export function renderLegalPage(slug: string, components: MDXComponents = {}) {
  const page = legalSource.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <main className="zed-bg" id="main">
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
                fontFamily: "var(--font-sans)",
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

                fontFamily: "var(--font-sans)",
                fontSize: 10,
                letterSpacing: "0",
                textTransform: "none",
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
    </main>
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
