import { blogSource } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, FileText } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { DiscordIcon, XIcon, GitHubIcon } from "@/components/icons";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const pages = blogSource.getPages(locale);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* ── Left 40%: sticky sidebar ── */}
      <div className="w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:w-[40%] lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r lg:flex lg:flex-col lg:justify-center">
        <div className="lg:max-w-md lg:mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <FileText className="size-4" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Blog
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            News, releases, and insights
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Follow along as we build the open intelligence router for LLM
            agents.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://github.com/bitrouter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <GitHubIcon className="size-4" />
            </a>
            <a
              href="https://x.com/BitRouterAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <XIcon className="size-4" />
            </a>
            <a
              href="https://discord.gg/G3zVrZDa5C"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <DiscordIcon className="size-4" />
            </a>
          </div>

          <div className="mt-8 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Posts{" "}
            <span className="ml-2 text-foreground">{pages.length}</span>
          </div>
        </div>
      </div>

      {/* ── Right 60%: post list ── */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <RuledSectionLabel label="BLOGS" className="mb-8" />

        {pages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="flex flex-col">
            {pages.map((page) => (
              <a
                key={page.url}
                href={page.url}
                className="group flex items-start gap-5 border-b border-border py-6 transition-colors first:pt-0 last:border-b-0"
              >
                {/* Thumbnail placeholder */}
                <div className="hidden sm:block shrink-0 w-40 h-24 bg-muted/30 border border-border" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-medium tracking-tight group-hover:text-foreground transition-colors">
                    {page.data.title}
                  </h2>
                  {page.data.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {page.data.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
                    {page.data.lastModified && (
                      <time>
                        {new Date(page.data.lastModified).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </time>
                    )}
                  </div>
                </div>
                <ArrowRight className="hidden sm:block size-4 text-muted-foreground/30 group-hover:text-foreground transition-all group-hover:translate-x-0.5 mt-1 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Blog - BitRouter",
    description:
      "Engineering deep dives and announcements from the BitRouter team.",
  };
}
