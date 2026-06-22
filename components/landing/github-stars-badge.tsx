"use client";

import { useEffect, useState } from "react";
import { GitHubIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const REPO_URL = "https://github.com/bitrouter/bitrouter";

function formatStars(n: number): string {
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

export function GitHubStarsBadge({ className }: { className?: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/github-stars")
      .then((r) => r.json())
      .then((d: { stars?: number | null }) => {
        if (active && typeof d.stars === "number") setStars(d.stars);
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
          ? `BitRouter on GitHub — ${stars} stars`
          : "BitRouter on GitHub"
      }
      className={cn(
        "inline-flex items-center gap-1.5 px-2 text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <GitHubIcon className="size-4" />
      {stars !== null && (
        <span className="font-mono text-[11px] tabular-nums">
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}
