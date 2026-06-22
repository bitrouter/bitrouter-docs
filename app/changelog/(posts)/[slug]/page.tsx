import { changelogSource } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/flux/page";
import { notFound } from "next/navigation";
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
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="mb-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
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
      <DocsBody>
        <MDX components={getMDXComponents({})} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  const seen = new Set<string>();
  return changelogSource
    .generateParams()
    .filter((p) => !("lang" in p) || (p as { lang?: string }).lang === "en")
    .map((p) => p.slug[0])
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
