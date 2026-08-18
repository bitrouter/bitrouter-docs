import "@/components/landing/zed/zed.css";
import { blogSource } from "@/lib/source";
import Link from "next/link";
import { PageHead } from "@/components/landing/zed/primitives";
import { AUTHORS, blogDate, blogSortKey } from "@/components/landing/zed/blog-meta";
import type { Metadata } from "next";
import type { BlogPage } from "@/lib/source";

export default async function BlogIndexPage() {
  const pages = [...blogSource.getPages()].sort(
    (a, b) => blogSortKey(b as BlogPage) - blogSortKey(a as BlogPage),
  );

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-wrap" style={{ maxWidth: 1180 }}>
          <PageHead
            eyebrow="Blog"
            title="Field notes from production."
            sub="How the router actually decides — routing, evals, cost and the self-tuning loop, written by the people building it."
          />

          {pages.length === 0 ? (
            <p style={{ padding: "64px 0", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--z-ink-5)" }}>
              No posts yet. Check back soon.
            </p>
          ) : (
            <div style={{ marginTop: 64, borderTop: "1px solid var(--z-rule)", marginBottom: "var(--z-sec)" }}>
              {pages.map((page) => {
                const author = AUTHORS[(page.data as { author?: string }).author ?? ""];
                return (
                  <Link
                    key={page.url}
                    href={page.url}
                    className="zed-metagrid zed-post-row"
                    style={{ borderBottom: "1px solid var(--z-rule)", padding: "34px 0" }}
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
                            lineHeight: 1.7,
                            color: "var(--z-ink-5)",
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
                                background: "var(--z-wash)",
                                color: "var(--z-ink-2)",
                                fontSize: 10,
                              }}
                            >
                              {author.initials}
                            </span>
                            <span style={{ color: "var(--z-ink-2)" }}>{author.name}</span>
                          </>
                        )}
                        <span style={{ marginLeft: "auto", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 11 }}>
                          Read →
                        </span>
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
