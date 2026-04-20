import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { changelogSource } from "@/lib/source";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { RssIcon } from "@/components/icons";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export default async function ChangelogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";

  const pages = [...changelogSource.getPages(locale)].sort((a, b) => {
    const aDate = (a.data as { date?: string }).date ?? a.data.lastModified ?? "";
    const bDate = (b.data as { date?: string }).date ?? b.data.lastModified ?? "";
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <>
      <div className="flex min-h-[calc(100dvh-8rem)] flex-col lg:flex-row">
        {/* Left rail */}
        <div className="w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:w-[40%] lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r lg:flex lg:flex-col lg:justify-center">
          <div className="lg:max-w-md lg:mx-auto">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <GitBranch className="size-4" />
              <span className="font-mono text-xs uppercase tracking-widest">
                {isZh ? "更新日志" : "Changelog"}
              </span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {isZh ? "发布了什么，何时发布。" : "What shipped, when."}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isZh
                ? "BitRouter 的每一次可见变更都会在此留痕。"
                : "Every meaningful change to BitRouter gets a line here."}
            </p>

            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.slice(0, 3).map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
              <a
                href="https://github.com/bitrouter/bitrouter/releases.atom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RSS feed"
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <RssIcon className="size-4" />
              </a>
            </div>

            <div className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {isZh ? "条目" : "Entries"}
              <span className="ml-2 text-foreground">{pages.length}</span>
            </div>
          </div>
        </div>

        {/* Right: entries */}
        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <RuledSectionLabel
            label={isZh ? "版本" : "RELEASES"}
            className="mb-8"
          />

          {pages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {isZh ? "尚无条目。" : "No entries yet."}
            </p>
          ) : (
            <div className="flex flex-col">
              {pages.map((page) => {
                const data = page.data as {
                  title: string;
                  description?: string;
                  version?: string;
                  date?: string;
                  tags?: string[];
                  lastModified?: string | Date;
                };
                const dateStr = data.date ?? data.lastModified;
                return (
                  <Link
                    key={page.url}
                    href={page.url}
                    className="group flex flex-col gap-3 border-b border-border py-7 transition-colors first:pt-0 last:border-b-0 sm:flex-row sm:gap-8"
                  >
                    {/* Left: date + version */}
                    <div className="shrink-0 sm:w-40">
                      {dateStr && (
                        <time className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                          {new Date(dateStr).toLocaleDateString(
                            isZh ? "zh-CN" : "en-US",
                            { year: "numeric", month: "short", day: "2-digit" },
                          )}
                        </time>
                      )}
                      {data.version && (
                        <span className="mt-2 inline-block border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
                          {data.version}
                        </span>
                      )}
                    </div>

                    {/* Right: content */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-medium tracking-tight group-hover:text-foreground">
                        {data.title}
                      </h2>
                      {data.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {data.description}
                        </p>
                      )}
                      {data.tags && data.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {data.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <ArrowRight className="mt-1 hidden size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: `${isZh ? "更新日志" : "Changelog"} — BitRouter`,
    description: isZh
      ? "BitRouter 的发布记录与变更日志。"
      : "Release notes and meaningful changes to BitRouter.",
  };
}
