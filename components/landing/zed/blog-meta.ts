import type { BlogPage } from "@/lib/source";

/** Blog author display map (frontmatter `author` enum → name + avatar initials). */
export const AUTHORS: Record<string, { name: string; initials: string }> = {
  kelsen: { name: "Kelsen", initials: "K" },
  archer: { name: "Archer", initials: "A" },
};

function rawDate(page: BlogPage): string | Date | undefined {
  const d = page.data as { date?: string; lastModified?: string | Date };
  return d.date ?? d.lastModified;
}

/** Sort key (ms) — frontmatter `date`, else git `lastModified`. */
export function blogSortKey(page: BlogPage): number {
  const d = rawDate(page);
  return d ? new Date(d).getTime() : 0;
}

/** "Jul 21, 2026" — UTC-stable so server/client agree. */
export function blogDate(page: BlogPage): string {
  const d = rawDate(page);
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
