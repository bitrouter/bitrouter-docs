import "@/components/landing/zed/zed.css";
import { blogSource } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Kicker } from "@/components/landing/zed/primitives";
import { AUTHORS, blogDate, blogSortKey } from "@/components/landing/zed/blog-meta";
import type { Metadata } from "next";
import type { BlogPage } from "@/lib/source";

export default async function BlogIndexPage() {
  setRequestLocale("en");

  const pages = [...blogSource.getPages("en")].sort(
    (a, b) => blogSortKey(b as BlogPage) - blogSortKey(a as BlogPage),
  );

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 1180 }}>
          <div style={{ padding: "56px 0 30px", borderBottom: "1px solid var(--z-rule)" }}>
            <Kicker>// blog</Kicker>
            <h1
              className="zed-display"
              style={{ fontSize: "clamp(38px, 6vw, 56px)", lineHeight: 1.0, margin: "16px 0 0" }}
            >
              Field notes from <span style={{ color: "var(--z-blue)" }}>production.</span>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--z-ink-4)",
                margin: "16px 0 0",
                maxWidth: "58ch",
              }}
            >
              How the router actually decides — routing, evals, cost and the self-tuning loop, written
              by the people building it.
            </p>
          </div>

          {pages.length === 0 ? (
            <p style={{ padding: "64px 0", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--z-ink-5)" }}>
              No posts yet. Check back soon.
            </p>
          ) : (
            <div style={{ marginBottom: 76 }}>
              {pages.map((page) => {
                const author = AUTHORS[(page.data as { author?: string }).author ?? ""];
                return (
                  <Link
                    key={page.url}
                    href={page.url}
                    className="zed-metagrid zed-post-row"
                    style={{ borderBottom: "1px solid var(--z-rule)", padding: "34px 8px" }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)" }}>
                        {blogDate(page as BlogPage)}
                      </div>
                      {author && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-7)", marginTop: 6 }}>
                          {author.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontWeight: 500,
                          fontSize: 27,
                          lineHeight: 1.12,
                          color: "var(--z-ink)",
                          margin: "0 0 10px",
                          maxWidth: "26ch",
                        }}
                      >
                        {page.data.title}
                      </h2>
                      {page.data.description && (
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 13.5,
                            lineHeight: 1.65,
                            color: "var(--z-ink-4)",
                            margin: 0,
                            maxWidth: "64ch",
                          }}
                        >
                          {page.data.description}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 18,
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--z-ink-6)",
                        }}
                      >
                        {author && (
                          <>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "var(--z-rule)",
                                color: "var(--z-ink-2)",
                                fontSize: 10,
                              }}
                            >
                              {author.initials}
                            </span>
                            <span style={{ color: "var(--z-ink-2)" }}>{author.name}</span>
                          </>
                        )}
                        <span style={{ marginLeft: "auto", color: "var(--z-blue)" }}>Read →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Blog - BitRouter",
    description:
      "Field notes from production — routing, evals, cost and the self-tuning loop, from the BitRouter team.",
    alternates: { canonical: "https://bitrouter.ai/blog" },
  };
}
