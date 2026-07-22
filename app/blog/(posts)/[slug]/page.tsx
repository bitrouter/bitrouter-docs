import "@/components/landing/zed/zed.css";
import { blogSource } from "@/lib/source";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import { AUTHORS, blogDate, blogSortKey } from "@/components/landing/zed/blog-meta";
import type { BlogPage } from "@/lib/source";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const page = blogSource.getPage([slug], "en");
  if (!page) notFound();

  const MDX = page.data.body;
  const author = AUTHORS[(page.data as { author?: string }).author ?? ""];
  const date = blogDate(page as BlogPage);

  // Previous / next by date (newest first list).
  const sorted = [...blogSource.getPages("en")].sort(
    (a, b) => blogSortKey(b as BlogPage) - blogSortKey(a as BlogPage),
  );
  const idx = sorted.findIndex((p) => p.url === page.url);
  const newer = idx > 0 ? sorted[idx - 1] : null;
  const older = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(60% 34% at 50% 0%, rgba(107,155,255,0.06), transparent 60%)",
          }}
        />
        <div className="zed-wrap" style={{ maxWidth: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "34px 0 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)" }}>
            <Link href="/blog" className="zed-link" style={{ color: "var(--z-ink-4)" }}>
              Blog
            </Link>
            <span>/</span>
            <span>post</span>
          </div>

          <h1
            className="zed-display"
            style={{ fontSize: "clamp(32px, 5vw, 46px)", lineHeight: 1.08, margin: "22px 0 0" }}
          >
            {page.data.title}
          </h1>
          {page.data.description && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 16, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "18px 0 0" }}>
              {page.data.description}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "26px 0",
              padding: "20px 0",
              borderTop: "1px solid var(--z-rule)",
              borderBottom: "1px solid var(--z-rule)",
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
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
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--z-rule)",
                    color: "var(--z-ink-2)",
                    fontSize: 12,
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
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "40px 0 76px" }}
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
  return { border: "1px solid var(--z-rule)", borderRadius: 9, padding: "18px 20px", display: "block" };
}
function navKick(): React.CSSProperties {
  return { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)" };
}
function navTitle(): React.CSSProperties {
  return { fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--z-ink)", marginTop: 6 };
}

export function generateStaticParams() {
  const seen = new Set<string>();
  return blogSource
    .generateParams()
    .filter((p) => !("lang" in p) || (p as { lang?: string }).lang === "en")
    .map((p) => p.slug[0])
    .filter((s): s is string => Boolean(s) && !seen.has(s) && (seen.add(s), true))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = blogSource.getPage([slug], "en");
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: `https://bitrouter.ai${page.url}` },
  };
}
