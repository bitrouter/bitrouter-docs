import "@/components/landing/zed/zed.css";
import { changelogSource } from "@/lib/source";
import { headlineOf } from "@/lib/changelog";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { DocsBody, DocsPage, DocsTitle } from "fumadocs-ui/page";
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
    <DocsPage toc={page.data.toc} breadcrumb={{ includePage: true }}>
      <DocsTitle className="zed-doc-title">{headlineOf(page.data)}</DocsTitle>
      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-fd-muted-foreground">
        <time>{date}</time>
        {page.data.breaking ? (
          <span className="border border-red-400/40 px-2 py-0.5 uppercase tracking-wider text-red-400">
            Breaking
          </span>
        ) : null}
      </div>
      <DocsBody className="zed-docs mt-8">
        <MDX components={getMDXComponents({})} />
      </DocsBody>
    </DocsPage>
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
