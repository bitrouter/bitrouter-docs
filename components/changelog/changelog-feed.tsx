"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { allTags, groupByMonth, type ChangelogItem } from "@/lib/changelog";
import {
  CHANGELOG_SEEN_EVENT,
  CHANGELOG_SEEN_KEY,
} from "@/components/changelog/use-changelog-unseen";
import { cn } from "@/lib/cn";

export function ChangelogFeed({ items }: { items: ChangelogItem[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(() => allTags(items), [items]);

  // Visiting the changelog clears the nav "new" dot.
  useEffect(() => {
    try {
      localStorage.setItem(CHANGELOG_SEEN_KEY, new Date().toISOString());
      window.dispatchEvent(new Event(CHANGELOG_SEEN_EVENT));
    } catch {
      // localStorage unavailable (SSR/private mode) — ignore.
    }
  }, []);

  const filtered = activeTag
    ? items.filter((i) => i.tags.includes(activeTag))
    : items;
  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <TagChip
            label="All"
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            />
          ))}
        </div>
      )}

      {groups.map((group) => (
        <section key={group.label} className="mb-10">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {group.label}
          </h2>
          <div className="flex flex-col">
            {group.items.map((entry) => (
              <a
                key={entry.url}
                href={entry.url}
                className="group flex items-start gap-5 border-b border-border py-6 transition-colors first:pt-0 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium tracking-tight transition-colors group-hover:text-foreground">
                      {entry.title}
                    </h3>
                    {entry.breaking && (
                      <span className="rounded border border-red-500/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-red-500">
                        Breaking
                      </span>
                    )}
                  </div>
                  {entry.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground/60">
                    {entry.version && <span>{entry.version}</span>}
                    {entry.tags.map((tag) => (
                      <span key={tag} className="rounded bg-muted/40 px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="mt-1 hidden size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TagChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors",
        active
          ? "border-foreground/40 bg-foreground/[0.06] text-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
