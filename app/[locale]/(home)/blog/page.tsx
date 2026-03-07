import { blogSource } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const pages = blogSource.getPages(locale);
  const [featured, ...rest] = pages;

  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      {/* Header */}
      <header className="mb-16">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          / blog
        </p>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Engineering &amp; Announcements
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Deep dives into routing architecture, benchmark methodology, and
          product updates from the BitRouter team.
        </p>
      </header>

      {/* Featured post */}
      {featured && (
        <a href={featured.url} className="group block mb-16">
          <div className="relative border border-border rounded-sm p-8 sm:p-10 transition-colors hover:border-foreground/20">
            {/* Index marker */}
            <span className="absolute top-4 right-4 text-[10px] tracking-widest text-muted-foreground/50 uppercase">
              Latest
            </span>

            <div className="flex items-start gap-6">
              <span className="hidden sm:block text-5xl font-light text-muted-foreground/20 leading-none select-none">
                01
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-medium tracking-tight group-hover:text-foreground transition-colors sm:text-2xl">
                  {featured.data.title}
                </h2>
                {featured.data.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {featured.data.description}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 mt-5 text-xs tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                  Read article
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </a>
      )}

      {/* Remaining posts — horizontal rule separated list */}
      {rest.length > 0 && (
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
            All posts
          </p>
          <div className="divide-y divide-border">
            {rest.map((page, i) => (
              <a
                key={page.url}
                href={page.url}
                className="group flex items-start gap-6 py-7 transition-colors first:pt-0"
              >
                <span className="hidden sm:block text-3xl font-light text-muted-foreground/20 leading-none select-none tabular-nums pt-0.5">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium tracking-tight group-hover:text-foreground transition-colors">
                    {page.data.title}
                  </h3>
                  {page.data.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {page.data.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="hidden sm:block size-4 text-muted-foreground/30 group-hover:text-foreground transition-all group-hover:translate-x-0.5 mt-1 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Blog - BitRouter",
    description:
      "Engineering deep dives and announcements from the BitRouter team.",
  };
}
