import { getChangelogItems } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import { GitBranch } from "lucide-react";
import { ChangelogFeed } from "@/components/changelog/changelog-feed";
import type { Metadata } from "next";

export default async function ChangelogIndexPage() {
  setRequestLocale("en");

  const items = getChangelogItems("en");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* ── Compact header ── */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <GitBranch className="size-4" />
        <span className="font-mono text-xs uppercase tracking-widest">
          Changelog
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
        Product updates &amp; releases
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        New providers, models, routing improvements, and breaking changes — as
        they ship.
      </p>
      <div className="mt-4 flex items-center gap-4 font-mono text-xs text-muted-foreground/70">
        <a
          href="/changelog/rss.xml"
          className="transition-colors hover:text-foreground"
        >
          RSS
        </a>
        <a
          href="/changelog/atom.xml"
          className="transition-colors hover:text-foreground"
        >
          Atom
        </a>
        <span className="ml-auto uppercase tracking-widest">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="mt-6 h-px bg-border" />

      {/* ── Feed ── */}
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No entries yet. Check back soon.
        </p>
      ) : (
        <ChangelogFeed items={items} />
      )}
    </main>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Changelog - BitRouter",
    description: "Product updates and release notes for BitRouter.",
    alternates: {
      canonical: "https://bitrouter.ai/changelog",
      types: {
        "application/rss+xml": [
          { url: "/changelog/rss.xml", title: "BitRouter Changelog" },
        ],
        "application/atom+xml": [
          { url: "/changelog/atom.xml", title: "BitRouter Changelog" },
        ],
      },
    },
  };
}
