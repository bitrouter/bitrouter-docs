import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { legalSource } from "@/lib/source";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export default async function LegalDocPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const page = legalSource.getPage([slug], "en");
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
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
              Last updated{" "}
              {new Date(page.data.lastModified).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
  return ["privacy", "terms"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = legalSource.getPage([slug], "en");
  if (!page) notFound();
  return {
    title: `${page.data.title} — BitRouter`,
    description: page.data.description,
  };
}
