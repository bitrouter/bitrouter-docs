import { getChangelogItems } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import { GitBranch } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { ChangelogFeed } from "@/components/changelog/changelog-feed";
import type { Metadata } from "next";

export default async function ChangelogIndexPage() {
  setRequestLocale("en");

  const items = getChangelogItems("en");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* ── Left 40%: sticky sidebar ── */}
      <div className="w-full border-b border-border/40 px-5 py-8 sm:px-6 lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:w-[40%] lg:flex-col lg:justify-center lg:border-b-0 lg:border-r">
        <div className="lg:mx-auto lg:max-w-md">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <GitBranch className="size-4" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Changelog
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Product updates &amp; releases
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            New providers, models, routing improvements, and breaking changes —
            as they ship.
          </p>
          <div className="mt-5 flex items-center gap-3 font-mono text-xs text-muted-foreground/70">
            <a href="/changelog/rss.xml" className="transition-colors hover:text-foreground">
              RSS
            </a>
            <a href="/changelog/atom.xml" className="transition-colors hover:text-foreground">
              Atom
            </a>
          </div>
          <div className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Entries <span className="ml-2 text-foreground">{items.length}</span>
          </div>
        </div>
      </div>

      {/* ── Right 60%: feed ── */}
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <RuledSectionLabel label="CHANGELOG" className="mb-8" />
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No entries yet. Check back soon.
          </p>
        ) : (
          <ChangelogFeed items={items} />
        )}
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Changelog - BitRouter",
    description: "Product updates and release notes for BitRouter.",
    alternates: { canonical: "https://bitrouter.ai/changelog" },
  };
}
