"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const REPO_URL = "https://github.com/bitrouter/bitrouter";

function formatStars(n: number): string {
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

interface GitHubStarsBadgeProps {
  className?: string;
  label?: string;
  compact?: boolean;
}

export function GitHubStarsBadge({ className, label, compact = true }: GitHubStarsBadgeProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/github-stars")
      .then((r) => r.json())
      .then((d: { stars?: number | null }) => {
        if (active && typeof d.stars === "number" && Number.isSafeInteger(d.stars) && d.stars >= 0) setStars(d.stars);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        stars !== null
          ? `Star BitRouter on GitHub — ${stars} stars`
          : "Star BitRouter on GitHub"
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-[var(--z-ink-4)] transition-colors hover:text-[var(--z-ink)]",
        className,
      )}
    >
      <GitHubIcon className={label ? "size-[16px]" : "size-[15px]"} aria-hidden="true" />
      {label && <span>{label}</span>}
      <Star aria-hidden="true" className="size-[13px]" strokeWidth={1.7} />
      {stars !== null && (
        <span className="font-mono text-[11px] tabular-nums">
          {compact ? formatStars(stars) : stars.toLocaleString("en-US")}
        </span>
      )}
    </a>
  );
}
