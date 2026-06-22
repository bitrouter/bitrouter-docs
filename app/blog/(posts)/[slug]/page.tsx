import { blogSource } from "@/lib/source";
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const page = blogSource.getPage([slug], "en");
  if (!page) notFound();

  const MDX = page.data.body;
  const date = page.data.lastModified
    ? new Date(page.data.lastModified).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Blog
      </Link>

      {date && (
        <div className="mt-6 font-mono text-xs text-muted-foreground">
          <time>{date}</time>
        </div>
      )}

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
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
    },
  };
}
