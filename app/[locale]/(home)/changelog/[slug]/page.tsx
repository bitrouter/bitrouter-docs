import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { changelogSource } from "@/lib/source";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ChangelogEntryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";

  const page = changelogSource.getPage([slug], locale);
  if (!page) notFound();

  const data = page.data as {
    title: string;
    description?: string;
    version?: string;
    date?: string;
    tags?: string[];
    lastModified?: string | Date;
    body: React.ComponentType<{ components?: Record<string, unknown> }>;
  };
  const MDX = data.body;
  const dateStr = data.date ?? data.lastModified;

  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Link
          href="/changelog"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          {isZh ? "全部版本" : "All releases"}
        </Link>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3">
          {dateStr && (
            <time className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {new Date(dateStr).toLocaleDateString(
                isZh ? "zh-CN" : "en-US",
                { year: "numeric", month: "short", day: "2-digit" },
              )}
            </time>
          )}
          {data.version && (
            <span className="border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
              {data.version}
            </span>
          )}
          {data.tags?.map((tag) => (
            <span
              key={tag}
              className="border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-6 text-3xl font-medium tracking-tight sm:text-4xl">
          {data.title}
        </h1>
        {data.description && (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {data.description}
          </p>
        )}

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4">
          <MDX components={{}} />
        </div>
      </article>
      <SiteFooter />
    </>
  );
}

export function generateStaticParams() {
  return changelogSource
    .generateParams()
    .map((p) => ({ ...p, slug: p.slug[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = changelogSource.getPage([slug], locale);
  if (!page) notFound();
  return {
    title: `${page.data.title} — BitRouter`,
    description: page.data.description,
  };
}
