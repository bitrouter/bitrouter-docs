// Pure, dependency-free presentation logic for the changelog. Unit-tested in
// lib/changelog.test.ts. Operates on flat ChangelogItem objects so the same
// helpers work server-side (route/page) and client-side (feed component).
export type ChangelogItem = {
  url: string;
  title: string;
  description?: string;
  date: string; // ISO YYYY-MM-DD
  version?: string;
  tags: string[];
  breaking: boolean;
};

export function sortByDateDesc(items: ChangelogItem[]): ChangelogItem[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function groupByMonth(
  items: ChangelogItem[],
): { label: string; items: ChangelogItem[] }[] {
  const groups: { label: string; items: ChangelogItem[] }[] = [];
  for (const item of sortByDateDesc(items)) {
    const label = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      timeZone: "UTC", // deterministic regardless of machine timezone
    });
    const last = groups.at(-1);
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export function allTags(items: ChangelogItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) for (const tag of item.tags) set.add(tag);
  return [...set].sort();
}
