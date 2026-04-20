import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { legalSource } from "@/lib/source";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function LegalDocPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = legalSource.getPage([slug], locale);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Link
          href="/legal"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          {locale === "zh" ? "所有法律文件" : "All legal documents"}
        </Link>

        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          {page.data.title}
        </h1>
        {page.data.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {page.data.description}
          </p>
        )}

        {page.data.lastModified && (
          <div className="mt-6 border-t border-border pt-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              {locale === "zh" ? "最后更新 " : "Last updated "}
              {new Date(page.data.lastModified).toLocaleDateString(
                locale === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </span>
          </div>
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
  return legalSource.generateParams().map((p) => ({ ...p, slug: p.slug[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = legalSource.getPage([slug], locale);
  if (!page) notFound();
  return {
    title: `${page.data.title} — BitRouter`,
    description: page.data.description,
  };
}
