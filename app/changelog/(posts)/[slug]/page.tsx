import "@/components/landing/zed/zed.css";
import { changelogSource } from "@/lib/source";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export default async function ChangelogEntryPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const page = changelogSource.getPage([slug], "en");
  if (!page) notFound();

  const MDX = page.data.body;
  const date = new Date(page.data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

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
            <Link href="/changelog" className="zed-link" style={{ color: "var(--z-ink-4)" }}>
              Changelog
            </Link>
            <span>/</span>
            <span>{page.data.version ?? "release"}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, margin: "22px 0 0", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-6)" }}>
            <time>{date}</time>
            {page.data.version && (
              <span style={{ color: "var(--z-ink-3)", border: "1px solid var(--z-rule-2)", borderRadius: 5, padding: "2px 8px" }}>
                {page.data.version}
              </span>
            )}
            {page.data.breaking && (
              <span style={{ color: "var(--z-red)", border: "1px solid rgba(224,108,108,0.35)", borderRadius: 5, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>
                Breaking
              </span>
            )}
          </div>

          <h1 className="zed-display" style={{ fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.08, margin: "14px 0 0" }}>
            {page.data.title}
          </h1>
          {page.data.description && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 16, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "16px 0 0" }}>
              {page.data.description}
            </p>
          )}

          <div className="zed-article" style={{ marginTop: 28, paddingBottom: 76 }}>
            <MDX components={getMDXComponents({})} />
          </div>
        </div>
      </section>
    </div>
  );
}

export function generateStaticParams() {
  const seen = new Set<string>();
  return changelogSource
    .getPages("en")
    .map((page) => page.slugs[page.slugs.length - 1])
    .filter((s): s is string => Boolean(s) && !seen.has(s) && (seen.add(s), true))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = changelogSource.getPage([slug], "en");
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: `https://bitrouter.ai${page.url}` },
  };
}
