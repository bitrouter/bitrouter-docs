import "@/components/landing/zed/zed.css";
import { blogSource } from "@/lib/source";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMDXComponents } from "@/mdx-components";
import { AUTHORS, blogDate, blogSortKey } from "@/components/landing/zed/blog-meta";
import type { BlogPage } from "@/lib/source";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const page = blogSource.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;
  const author = AUTHORS[(page.data as { author?: string }).author ?? ""];
  const date = blogDate(page as BlogPage);

  // Previous / next by date (newest first list).
  const sorted = [...blogSource.getPages()].sort(
    (a, b) => blogSortKey(b as BlogPage) - blogSortKey(a as BlogPage),
  );
  const idx = sorted.findIndex((p) => p.url === page.url);
  const newer = idx > 0 ? sorted[idx - 1] : null;
  const older = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-wrap" style={{ maxWidth: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "48px 0 0", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--z-ink-6)" }}>
            <Link href="/blog" style={{ color: "var(--z-ink-6)" }}>
              Blog
            </Link>
            <span style={{ color: "var(--z-rule-2)" }}>/</span>
            <span style={{ color: "var(--z-ink-3)" }}>Post</span>
          </div>

          <h1
            className="zed-display"
            style={{ fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.06, margin: "26px 0 0" }}
          >
            {page.data.title}
          </h1>
          {page.data.description && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14.5, lineHeight: 1.75, color: "var(--z-ink-5)", margin: "20px 0 0", maxWidth: "68ch", textWrap: "pretty" }}>
              {page.data.description}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "28px 0 0",
              paddingTop: 20,
              borderTop: "1px solid var(--z-rule)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
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
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--z-wash)",
                    color: "var(--z-ink-2)",
                    fontSize: 10,
                    letterSpacing: 0,
                  }}
                >
                  {author.initials}
                </span>
                <span style={{ color: "var(--z-ink-2)" }}>{author.name}</span>
                <span>·</span>
              </>
            )}
            {date && <time>{date}</time>}
          </div>

          <div className="zed-article" style={{ marginTop: 32 }}>
            <MDX components={getMDXComponents({})} />
          </div>

          {(newer || older) && (
            <div
              className="zed-grid-2"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--z-rule)", borderTop: "1px solid var(--z-rule)", margin: "80px 0 var(--z-sec)" }}
            >
              {older ? (
                <Link href={older.url} style={navCard()}>
                  <div style={navKick()}>← Previous</div>
                  <div style={navTitle()}>{older.data.title}</div>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link href={newer.url} style={{ ...navCard(), textAlign: "right" }}>
                  <div style={navKick()}>Next →</div>
                  <div style={navTitle()}>{newer.data.title}</div>
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function navCard(): React.CSSProperties {
  return { background: "var(--z-bg)", padding: "24px 0", display: "block" };
}
function navKick(): React.CSSProperties {
  return { fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--z-ink-6)" };
}
function navTitle(): React.CSSProperties {
  return { fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--z-ink-2)", marginTop: 10 };
}

export function generateStaticParams() {
  return blogSource.generateParams().map((p) => ({ slug: p.slug[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: `https://bitrouter.ai${page.url}` },
  };
}
