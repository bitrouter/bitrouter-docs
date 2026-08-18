import "@/components/landing/zed/zed.css";
import { changelogSource } from "@/lib/source";
import { headlineOf } from "@/lib/changelog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export default async function ChangelogEntryPage({ params }: Props) {
  const { slug } = await params;

  const page = changelogSource.getPage([slug]);
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
              <span style={{ color: "var(--z-ink-2)", border: "1px solid var(--z-rule-2)", padding: "2px 8px" }}>
                {page.data.version}
              </span>
            )}
            {page.data.breaking && (
              <span style={{ color: "var(--z-red)", border: "1px solid rgba(224,108,108,0.35)", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>
                Breaking
              </span>
            )}
          </div>

          {/* Headline = description, matching the index. The sync writes the
              version string as the title, so using it here gave entry pages a
              headline of "v1.0.0-alpha.18"; the version is already the chip above. */}
          <h1 className="zed-display" style={{ fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.08, margin: "14px 0 0" }}>
            {headlineOf(page.data)}
          </h1>

          <div className="zed-article" style={{ marginTop: 28, paddingBottom: "var(--z-sec)" }}>
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
    .getPages()
    .map((page) => page.slugs[page.slugs.length - 1])
    .filter((s): s is string => Boolean(s) && !seen.has(s) && (seen.add(s), true))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = changelogSource.getPage([slug]);
  if (!page) notFound();
  // Keep the version in the <title> — it's what people search for — but don't
  // repeat it when the headline already is the version string.
  const headline = headlineOf(page.data);
  return {
    title:
      page.data.version && headline !== page.data.version
        ? `${page.data.version} — ${headline}`
        : headline,
    description: page.data.description,
    alternates: { canonical: `https://bitrouter.ai${page.url}` },
  };
}
