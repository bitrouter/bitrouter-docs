import { changelogSource } from "@/lib/source";
import { DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/changelog"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Changelog
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
        <time>{date}</time>
        {page.data.version && (
          <span className="rounded border border-border px-1.5 py-0.5">
            {page.data.version}
          </span>
        )}
        {page.data.breaking && (
          <span className="rounded border border-red-500/40 px-1.5 py-0.5 text-red-500">
            BREAKING
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        {page.data.title}
      </h1>
      {page.data.description && (
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {page.data.description}
        </p>
      )}

      <DocsBody className="mt-8">
        <MDX components={getMDXComponents({})} />
      </DocsBody>
    </main>
  );
}

export function generateStaticParams() {
  // English-only, flat collection — derive slugs directly from the pages
  // (getPages is what the index/feed use, so it reliably returns entries).
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
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
    },
  };
}
