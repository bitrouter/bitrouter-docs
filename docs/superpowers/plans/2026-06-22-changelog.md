# Changelog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reverse-chronological `/changelog` on the marketing surface, backed by an in-repo MDX collection, with a grouped feed + per-entry pages, RSS/Atom feeds, and a "new" indicator in the nav.

**Architecture:** A new fumadocs `changelog` content collection mirrors the existing `blog` wiring. Pure presentation logic (sort, month-grouping, tags) lives in `lib/changelog.ts` and feed construction in `lib/changelog-feed.ts` — both unit-tested with vitest. Pages clone the `app/blog/` route-group shape (`(index)` + `(posts)`). A build-time script writes the latest entry date to `lib/changelog-latest.ts`, which a client hook compares against a `localStorage` last-seen timestamp to show a nav dot.

**Tech Stack:** Next.js 16 App Router, fumadocs-mdx 14.2.9 / fumadocs-ui 16.8.8, next-intl (English-only entries), `feed` (new), vitest (new, dev), Zod 4, Tailwind 4 with the `.br-mono` theme.

**Testing note:** Pure logic (`lib/changelog.ts`, `lib/changelog-feed.ts`) is built TDD with vitest — the repo has no harness today, so Task 1 adds a minimal one. Pages, routes, and the nav badge are verified via `pnpm build` + `curl` (I/O/render concerns with no isolated pure logic).

---

## File Structure

- **Create:** `lib/changelog.ts` — pure: `ChangelogItem` type, `sortByDateDesc`, `groupByMonth`, `allTags`.
- **Create:** `lib/changelog-feed.ts` — pure: `buildChangelogFeed(items)` → `Feed`.
- **Create:** `lib/changelog.test.ts`, `lib/changelog-feed.test.ts` — vitest tests.
- **Create:** `vitest.config.ts` — test config.
- **Create:** `app/changelog/layout.tsx`, `app/changelog/(index)/layout.tsx`, `app/changelog/(index)/page.tsx`, `app/changelog/(posts)/layout.tsx`, `app/changelog/(posts)/[slug]/page.tsx` — pages.
- **Create:** `app/changelog/rss.xml/route.ts`, `app/changelog/atom.xml/route.ts` — feeds.
- **Create:** `components/changelog/changelog-feed.tsx` — client feed + tag filter; marks visit.
- **Create:** `components/changelog/use-changelog-unseen.ts` — client hook + shared keys.
- **Create:** `scripts/generate-changelog-latest.mjs` → writes `lib/changelog-latest.ts`.
- **Create:** `content/changelog/*.mdx` — seed entries.
- **Modify:** `source.config.ts`, `lib/source.ts` — collection + `getChangelogItems`.
- **Modify:** `app/layout.tsx` — feed autodiscovery.
- **Modify:** `components/landing/resources-menu.tsx`, `components/site-footer.tsx` — link to `/changelog` + nav dot.
- **Modify:** `package.json` — deps + scripts.
- **Delete:** `content/docs/reference/changelog/` — redundant stub.

---

## Task 1: Add dependencies and the vitest harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime + dev deps**

Run:
```bash
pnpm add feed
pnpm add -D vitest
```
Expected: `feed` appears under `dependencies`, `vitest` under `devDependencies`.

- [ ] **Step 2: Add a test script**

In `package.json`, add to the `"scripts"` object (after `"start"`):

```json
    "test": "vitest run",
```

- [ ] **Step 3: Create the vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

// Pure-logic tests only (lib/*.test.ts). They use relative imports, so no
// path-alias resolution is needed here.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 4: Verify the runner works (no tests yet)**

Run: `pnpm test`
Expected: vitest runs and reports "No test files found" (exit 0 or a benign no-files message). This confirms the harness is wired.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: add feed dep and vitest harness"
```

---

## Task 2: Pure changelog logic (TDD)

**Files:**
- Create: `lib/changelog.ts`
- Test: `lib/changelog.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/changelog.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  sortByDateDesc,
  groupByMonth,
  allTags,
  type ChangelogItem,
} from "./changelog";

const item = (over: Partial<ChangelogItem>): ChangelogItem => ({
  url: "/changelog/x",
  title: "x",
  date: "2026-01-01",
  tags: [],
  breaking: false,
  ...over,
});

describe("sortByDateDesc", () => {
  it("orders newest first", () => {
    const out = sortByDateDesc([
      item({ title: "old", date: "2026-01-01" }),
      item({ title: "new", date: "2026-06-01" }),
      item({ title: "mid", date: "2026-03-01" }),
    ]);
    expect(out.map((i) => i.title)).toEqual(["new", "mid", "old"]);
  });

  it("does not mutate the input array", () => {
    const input = [item({ date: "2026-01-01" }), item({ date: "2026-02-01" })];
    const before = input.map((i) => i.date);
    sortByDateDesc(input);
    expect(input.map((i) => i.date)).toEqual(before);
  });
});

describe("groupByMonth", () => {
  it("groups same month and keeps months in desc order", () => {
    const groups = groupByMonth([
      item({ title: "a", date: "2026-06-02" }),
      item({ title: "b", date: "2026-06-20" }),
      item({ title: "c", date: "2026-05-10" }),
    ]);
    expect(groups.map((g) => g.label)).toEqual(["June 2026", "May 2026"]);
    expect(groups[0].items.map((i) => i.title)).toEqual(["b", "a"]);
    expect(groups[1].items.map((i) => i.title)).toEqual(["c"]);
  });
});

describe("allTags", () => {
  it("returns unique tags sorted alphabetically", () => {
    expect(
      allTags([
        item({ tags: ["api", "models"] }),
        item({ tags: ["api", "cli"] }),
      ]),
    ).toEqual(["api", "cli", "models"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve `./changelog` / functions not defined.

- [ ] **Step 3: Implement the pure logic**

Create `lib/changelog.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test`
Expected: PASS (3 suites).

- [ ] **Step 5: Commit**

```bash
git add lib/changelog.ts lib/changelog.test.ts
git commit -m "feat: pure changelog sort/group/tag helpers"
```

---

## Task 3: Feed construction (TDD)

**Files:**
- Create: `lib/changelog-feed.ts`
- Test: `lib/changelog-feed.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/changelog-feed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildChangelogFeed } from "./changelog-feed";
import type { ChangelogItem } from "./changelog";

const item = (over: Partial<ChangelogItem>): ChangelogItem => ({
  url: "/changelog/x",
  title: "x",
  date: "2026-01-01",
  tags: [],
  breaking: false,
  ...over,
});

describe("buildChangelogFeed", () => {
  const feed = buildChangelogFeed([
    item({ url: "/changelog/a", title: "A", date: "2026-01-01" }),
    item({ url: "/changelog/b", title: "B", date: "2026-06-01" }),
  ]);

  it("adds one item per entry, newest first", () => {
    expect(feed.items.map((i) => i.title)).toEqual(["B", "A"]);
  });

  it("uses absolute links", () => {
    expect(feed.items[0].link).toBe("https://bitrouter.ai/changelog/b");
  });

  it("emits rss2 and atom1 XML containing the entries", () => {
    const rss = feed.rss2();
    expect(rss).toContain("<rss");
    expect(rss).toContain("https://bitrouter.ai/changelog/b");
    expect(feed.atom1()).toContain("<feed");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve `./changelog-feed`.

- [ ] **Step 3: Implement the feed builder**

Create `lib/changelog-feed.ts`:

```ts
import { Feed } from "feed";
import { sortByDateDesc, type ChangelogItem } from "./changelog";

const SITE = "https://bitrouter.ai";

// Builds an RSS/Atom/JSON-capable Feed from changelog items (newest first).
export function buildChangelogFeed(items: ChangelogItem[]): Feed {
  const feed = new Feed({
    title: "BitRouter Changelog",
    description: "Product updates and release notes for BitRouter.",
    id: `${SITE}/changelog`,
    link: `${SITE}/changelog`,
    language: "en",
    copyright: `© ${new Date().getUTCFullYear()} BitRouter`,
    feedLinks: {
      rss: `${SITE}/changelog/rss.xml`,
      atom: `${SITE}/changelog/atom.xml`,
    },
  });

  for (const item of sortByDateDesc(items)) {
    feed.addItem({
      id: `${SITE}${item.url}`,
      title: item.title,
      link: `${SITE}${item.url}`,
      description: item.description,
      date: new Date(item.date),
    });
  }

  return feed;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test`
Expected: PASS (both suites: changelog + changelog-feed).

- [ ] **Step 5: Commit**

```bash
git add lib/changelog-feed.ts lib/changelog-feed.test.ts
git commit -m "feat: build RSS/Atom changelog feed from items"
```

---

## Task 4: Register the `changelog` content collection

**Files:**
- Modify: `source.config.ts`
- Modify: `lib/source.ts`

- [ ] **Step 1: Add the collection to `source.config.ts`**

In `source.config.ts`, add this export immediately after the existing `blog` export:

```ts
export const changelog = defineDocs({
  dir: "content/changelog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(), // ISO YYYY-MM-DD (required)
      version: z.string().optional(),
      tags: z.array(z.string()).optional(),
      breaking: z.boolean().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});
```

- [ ] **Step 2: Wire the source loader + `getChangelogItems` in `lib/source.ts`**

In `lib/source.ts`, change the first import line to add `changelog`:

```ts
import { docs, blog, legal, changelog } from "@/.source/server";
```

Add a type-only import near the top (after the existing imports):

```ts
import type { ChangelogItem } from "@/lib/changelog";
```

Add the loader after `blogSource` (before `legalSource` is fine):

```ts
export const changelogSource = loader({
  baseUrl: "/changelog",
  source: changelog.toFumadocsSource(),
  i18n,
});
```

Add the page type next to the other `InferPageType` exports:

```ts
export type ChangelogPage = InferPageType<typeof changelogSource>;
```

Add this helper at the end of the file:

```ts
// Flatten changelog pages into the pure ChangelogItem shape used by the index
// page, the client feed component, and the RSS/Atom routes.
export function getChangelogItems(locale = "en"): ChangelogItem[] {
  return changelogSource.getPages(locale).map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    date: page.data.date,
    version: page.data.version,
    tags: page.data.tags ?? [],
    breaking: page.data.breaking ?? false,
  }));
}
```

- [ ] **Step 3: Create the content dir with one seed entry so generation succeeds**

Create `content/changelog/v0-4-0.mdx`:

```mdx
---
title: "v0.4.0 — Fable 5 on the balanced route"
description: "Added Anthropic Fable 5 to the balanced route and cut cold-start latency."
date: "2026-06-20"
version: "v0.4.0"
tags: ["models", "routing"]
---

We added **Fable 5** to the `bitrouter-balanced` route. Routine calls keep going to
open models; Fable 5 now handles the harder calls that earn frontier pricing.

- Faster cold starts on first request after idle.
- No harness changes required.
```

- [ ] **Step 4: Regenerate the fumadocs source and typecheck**

Run:
```bash
pnpm fumadocs-mdx
pnpm build
```
Expected: `.source/server` now exports `changelog`; build succeeds with `changelogSource` and `getChangelogItems` resolving. (If the type for `page.data.date`/`version`/`tags`/`breaking` is reported as `unknown`, the schema export didn't regenerate — re-run `pnpm fumadocs-mdx` before `pnpm build`.)

- [ ] **Step 5: Commit**

```bash
git add source.config.ts lib/source.ts content/changelog/v0-4-0.mdx
git commit -m "feat: register changelog content collection"
```

---

## Task 5: Seed a second (breaking) entry and remove the docs stub

**Files:**
- Create: `content/changelog/v0-3-0.mdx`
- Delete: `content/docs/reference/changelog/`

- [ ] **Step 1: Add a breaking-change entry**

Create `content/changelog/v0-3-0.mdx`:

```mdx
---
title: "v0.3.0 — Unified /v1 endpoint"
description: "All routes consolidated under /v1; legacy /api completion paths removed."
date: "2026-05-12"
version: "v0.3.0"
tags: ["api"]
breaking: true
---

All completion routes now live under `/v1`. The legacy `/api/*` completion paths
have been **removed**.

Update your base URL to `https://api.bitrouter.ai/v1`.
```

- [ ] **Step 2: Remove the redundant docs changelog stub**

Run:
```bash
git rm -r content/docs/reference/changelog
```
Expected: `content/docs/reference/changelog/meta.json` is staged for deletion.

- [ ] **Step 3: Regenerate and verify the build still passes**

Run:
```bash
pnpm fumadocs-mdx
pnpm build
```
Expected: build succeeds; the docs sidebar no longer shows a `Changelog` reference section.

- [ ] **Step 4: Commit**

```bash
git add content/changelog/v0-3-0.mdx content/docs/reference/changelog
git commit -m "feat: seed breaking changelog entry; remove docs stub"
```

---

## Task 6: Changelog layouts and pages

**Files:**
- Create: `app/changelog/layout.tsx`
- Create: `app/changelog/(index)/layout.tsx`
- Create: `app/changelog/(posts)/layout.tsx`
- Create: `app/changelog/(posts)/[slug]/page.tsx`
- Create: `components/changelog/changelog-feed.tsx`
- Create: `app/changelog/(index)/page.tsx`

- [ ] **Step 1: Create the outer layout (providers)**

Create `app/changelog/layout.tsx`:

```tsx
import { SiteProviders } from "@/components/site-providers";

// Changelog is English-only. Providers live here; the (index) and (posts)
// route groups each add their own fumadocs layout, mirroring app/blog.
export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteProviders>{children}</SiteProviders>;
}
```

- [ ] **Step 2: Create the index group layout (HomeLayout)**

Create `app/changelog/(index)/layout.tsx`:

```tsx
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

export default function ChangelogIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
```

- [ ] **Step 3: Create the posts group layout (DocsLayout)**

Create `app/changelog/(posts)/layout.tsx`:

```tsx
import { DocsLayout } from "fumadocs-ui/layouts/flux";
import { changelogSource } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { setRequestLocale } from "next-intl/server";

export default function ChangelogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("en");

  return (
    <DocsLayout tree={changelogSource.getPageTree("en")} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
```

- [ ] **Step 4: Create the per-entry page**

Create `app/changelog/(posts)/[slug]/page.tsx`:

```tsx
import { changelogSource } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/flux/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ChangelogEntryPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const page = changelogSource.getPage([slug], "en");
  if (!page) notFound();

  const MDX = page.data.body;
  const date = new Date(page.data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="mb-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <time>{date}</time>
        {page.data.version && (
          <span className="rounded border border-border px-1.5 py-0.5">
            {page.data.version}
          </span>
        )}
        {page.data.breaking && (
          <span className="rounded border border-red-500/40 px-1.5 py-0.5 text-red-500">
            BREAKING
          </span>
        )}
      </div>
      <DocsBody>
        <MDX components={getMDXComponents({})} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  const seen = new Set<string>();
  return changelogSource
    .generateParams()
    .filter((p) => !("lang" in p) || (p as { lang?: string }).lang === "en")
    .map((p) => p.slug[0])
    .filter((s): s is string => Boolean(s) && !seen.has(s) && (seen.add(s), true))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const page = changelogSource.getPage([slug], "en");
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
    },
  };
}
```

- [ ] **Step 5: Create the client feed component**

Create `components/changelog/changelog-feed.tsx`:

```tsx
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
```

> Note: `use-changelog-unseen.ts` (with `CHANGELOG_SEEN_KEY` / `CHANGELOG_SEEN_EVENT`) is created in Task 9. This component compiles against it; if you implement strictly in order, do Task 9 Step 1 before `pnpm build` here, or accept that the build at Step 7 below depends on Task 9 Step 1.

- [ ] **Step 6: Create the index page**

Create `app/changelog/(index)/page.tsx`:

```tsx
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
```

- [ ] **Step 7: Verify the build (after Task 9 Step 1 exists)**

Run: `pnpm build`
Expected: build succeeds; `/changelog` and `/changelog/[slug]` routes appear in the build output.

- [ ] **Step 8: Commit**

```bash
git add app/changelog components/changelog/changelog-feed.tsx
git commit -m "feat: changelog index feed and per-entry pages"
```

---

## Task 7: RSS and Atom feed routes

**Files:**
- Create: `app/changelog/rss.xml/route.ts`
- Create: `app/changelog/atom.xml/route.ts`

- [ ] **Step 1: Create the RSS route**

Create `app/changelog/rss.xml/route.ts`:

```ts
import { getChangelogItems } from "@/lib/source";
import { buildChangelogFeed } from "@/lib/changelog-feed";

export const revalidate = false; // static at build time

export function GET() {
  const feed = buildChangelogFeed(getChangelogItems("en"));
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 2: Create the Atom route**

Create `app/changelog/atom.xml/route.ts`:

```ts
import { getChangelogItems } from "@/lib/source";
import { buildChangelogFeed } from "@/lib/changelog-feed";

export const revalidate = false; // static at build time

export function GET() {
  const feed = buildChangelogFeed(getChangelogItems("en"));
  return new Response(feed.atom1(), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: build succeeds; `/changelog/rss.xml` and `/changelog/atom.xml` appear as routes.

- [ ] **Step 4: Commit**

```bash
git add app/changelog/rss.xml/route.ts app/changelog/atom.xml/route.ts
git commit -m "feat: changelog RSS and Atom feeds"
```

---

## Task 8: Feed autodiscovery in the root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add `alternates` to the root metadata**

In `app/layout.tsx`, inside the `export const metadata: Metadata = { ... }` object, add this property (e.g. directly after the `description:` field, before `openGraph:`):

```ts
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/changelog/rss.xml", title: "BitRouter Changelog" },
      ],
      "application/atom+xml": [
        { url: "/changelog/atom.xml", title: "BitRouter Changelog" },
      ],
    },
  },
```

- [ ] **Step 2: Verify the build and the emitted `<link>` tags**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: advertise changelog feeds via metadata alternates"
```

---

## Task 9: Nav "new" indicator + link updates

**Files:**
- Create: `scripts/generate-changelog-latest.mjs`
- Create: `lib/changelog-latest.ts` (generated)
- Create: `components/changelog/use-changelog-unseen.ts`
- Modify: `package.json`
- Modify: `components/landing/resources-menu.tsx`
- Modify: `components/site-footer.tsx`

- [ ] **Step 1: Create the shared client hook**

Create `components/changelog/use-changelog-unseen.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import { LATEST_CHANGELOG_DATE } from "@/lib/changelog-latest";

export const CHANGELOG_SEEN_KEY = "lastSeenChangelog";
export const CHANGELOG_SEEN_EVENT = "changelog-seen";

// True when there is a changelog entry newer than the user's last visit
// (or they have never visited). Updates live when the changelog is opened.
export function useChangelogUnseen(): boolean {
  const [unseen, setUnseen] = useState(false);

  useEffect(() => {
    const compute = () => {
      if (!LATEST_CHANGELOG_DATE) {
        setUnseen(false);
        return;
      }
      const seen = localStorage.getItem(CHANGELOG_SEEN_KEY);
      setUnseen(
        !seen || new Date(LATEST_CHANGELOG_DATE) > new Date(seen),
      );
    };
    compute();
    window.addEventListener(CHANGELOG_SEEN_EVENT, compute);
    return () => window.removeEventListener(CHANGELOG_SEEN_EVENT, compute);
  }, []);

  return unseen;
}
```

- [ ] **Step 2: Create the generator script**

Create `scripts/generate-changelog-latest.mjs`:

```js
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "js-yaml";

const DIR = "content/changelog";
const OUT = "lib/changelog-latest.ts";

function readFrontmatter(src) {
  const match = src.match(/^---\n([\s\S]*?)\n---/);
  return match ? yaml.load(match[1]) ?? {} : {};
}

let files = [];
try {
  files = (await readdir(DIR)).filter((f) => f.endsWith(".mdx"));
} catch {
  // No changelog dir yet — emit an empty date.
}

let latest = "";
for (const file of files) {
  const fm = readFrontmatter(await readFile(join(DIR, file), "utf8"));
  // ISO YYYY-MM-DD strings compare correctly lexicographically.
  if (typeof fm.date === "string" && fm.date > latest) latest = fm.date;
}

await writeFile(
  OUT,
  `// Generated by scripts/generate-changelog-latest.mjs — do not edit.\n` +
    `export const LATEST_CHANGELOG_DATE = ${JSON.stringify(latest)};\n`,
);
console.log(`Wrote ${OUT} (latest=${latest || "none"})`);
```

- [ ] **Step 3: Wire the script into package.json scripts**

In `package.json`, update `prebuild` and add a standalone script:

Change:
```json
    "prebuild": "node scripts/generate-openapi.mjs && node scripts/generate-models.mjs",
```
to:
```json
    "prebuild": "node scripts/generate-openapi.mjs && node scripts/generate-models.mjs && node scripts/generate-changelog-latest.mjs",
```

And add (after `"generate:models"`):
```json
    "generate:changelog": "node scripts/generate-changelog-latest.mjs",
```

- [ ] **Step 4: Generate the latest-date module now**

Run: `pnpm generate:changelog`
Expected: prints `Wrote lib/changelog-latest.ts (latest=2026-06-20)` and creates `lib/changelog-latest.ts`.

- [ ] **Step 5: Point the Changelog link at `/changelog` and add the dot in the resources menu**

In `components/landing/resources-menu.tsx`:

(a) Change the Changelog item's `href` (currently line 34) from `/docs/reference/changelog` to `/changelog`:

```ts
  { label: "Changelog", description: "Latest releases and improvements", href: "/changelog", icon: GitBranch },
```

(b) Add the hook import after the `cn` import (around line 21):

```ts
import { useChangelogUnseen } from "@/components/changelog/use-changelog-unseen";
```

(c) Inside `ResourcesTabCell`, after the `const isActive = ...` line (around line 52), add:

```ts
  const changelogUnseen = useChangelogUnseen();
```

(d) In the `PopoverTrigger`, just before the closing `</PopoverTrigger>` (after the `isActive && (...)` block, around line 107), add a dot:

```tsx
        {changelogUnseen && (
          <span className="absolute right-2 top-2.5 size-1.5 rounded-full bg-foreground" />
        )}
```

(e) Change the secondary-row map (around lines 124-126) to pass a dot flag to the Changelog cell:

```tsx
          {secondary.map((item) => (
            <SecondaryCell
              key={item.href}
              item={item}
              showDot={item.href === "/changelog" && changelogUnseen}
            />
          ))}
```

(f) Update the `SecondaryCell` signature and render the dot (replace the whole `function SecondaryCell(...)` definition, currently lines 167-178):

```tsx
function SecondaryCell({
  item,
  showDot = false,
}: {
  item: ResourceItem;
  showDot?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-2 rounded-none px-3 py-3 transition-colors hover:bg-foreground/[0.03]"
    >
      <Icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="text-xs font-medium text-foreground">{item.label}</span>
      {showDot && (
        <span className="size-1.5 rounded-full bg-foreground" aria-label="New" />
      )}
    </Link>
  );
}
```

- [ ] **Step 6: Update the footer link**

In `components/site-footer.tsx`, change the changelog link (currently line 32) from:

```tsx
            <FooterLink href="/docs/reference/changelog" label={t("links.changelog")} />
```
to:
```tsx
            <FooterLink href="/changelog" label={t("links.changelog")} />
```

- [ ] **Step 7: Verify the build**

Run: `pnpm build`
Expected: build succeeds; `LATEST_CHANGELOG_DATE` resolves and the resources menu compiles.

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-changelog-latest.mjs lib/changelog-latest.ts components/changelog/use-changelog-unseen.ts package.json components/landing/resources-menu.tsx components/site-footer.tsx
git commit -m "feat: changelog nav 'new' dot and link updates"
```

---

## Task 10: Integration verification

**Files:** none (verification only)

- [ ] **Step 1: Run the unit tests**

Run: `pnpm test`
Expected: PASS — `lib/changelog.test.ts` and `lib/changelog-feed.test.ts` all green.

- [ ] **Step 2: Full production build**

Run: `pnpm build`
Expected: success. Routes present: `/changelog`, `/changelog/[slug]`, `/changelog/rss.xml`, `/changelog/atom.xml`.

- [ ] **Step 3: Start the server and check the feed page**

Run: `pnpm dev`
Then open `http://localhost:3000/changelog`.
Expected: two entries grouped by month (June 2026, May 2026), the v0.3.0 entry shows a `Breaking` badge, tag chips filter the list, and RSS/Atom links are present.

- [ ] **Step 4: Check the RSS feed is valid XML with entries newest-first**

Run:
```bash
curl -s http://localhost:3000/changelog/rss.xml | head -c 1500
```
Expected: starts with `<?xml` / `<rss`, contains `https://bitrouter.ai/changelog/v0-4-0` before `.../v0-3-0` (newest first), and `<title>BitRouter Changelog</title>`.

- [ ] **Step 5: Check the Atom feed**

Run:
```bash
curl -s http://localhost:3000/changelog/atom.xml | head -c 800
```
Expected: contains `<feed` and the entry links.

- [ ] **Step 6: Check feed autodiscovery + per-entry page**

- Open `http://localhost:3000` and view source — confirm a `<link rel="alternate" type="application/rss+xml" ... href="/changelog/rss.xml">` tag is present.
- Open `http://localhost:3000/changelog/v0-3-0` — confirm the entry renders with date, `v0.3.0`, and a `BREAKING` badge.
- In the top nav, open the **Resources** menu — confirm a "new" dot shows on Changelog before first visit, and disappears after visiting `/changelog` (reload the page after visiting).

- [ ] **Step 7: Confirm no stale references to the old changelog path**

Run: `grep -rn "docs/reference/changelog" app components content || echo "clean"`
Expected: prints `clean`.

---

## Self-Review checklist (done while writing)

- Spec coverage: marketing `/changelog` ✓ (Task 6); collection mirroring blog ✓ (Task 4); MDX one-file-per-entry, English-only ✓ (Tasks 4-5); frontmatter `{date,version,tags,breaking}` ✓ (Task 4 schema); reverse-chron + month grouping ✓ (`groupByMonth`, Tasks 2/6); `BREAKING` badge ✓ (Tasks 6); client tag-chip filter ✓ (Task 6 Step 5); per-entry permalink pages ✓ (Task 6 Step 4); RSS+Atom + autodiscovery ✓ (Tasks 7-8); localStorage "new" badge ✓ (Task 9); footer + resources-menu wiring ✓ (Task 9); remove docs stub ✓ (Task 5); seed entries ✓ (Tasks 4-5). Non-goals (email, GitHub-release linking, changesets) correctly excluded.
- Type consistency: `ChangelogItem` defined in Task 2, produced by `getChangelogItems` (Task 4), consumed by `buildChangelogFeed` (Task 3), `ChangelogFeed` and index page (Task 6), and feed routes (Task 7). `CHANGELOG_SEEN_KEY`/`CHANGELOG_SEEN_EVENT` defined in Task 9 Step 1, imported by the feed component (Task 6 Step 5) — cross-task dependency called out explicitly in Task 6 Step 5 and Step 7.
- No placeholders: every step has full code or exact commands + expected output.
- Ordering caveat surfaced: `components/changelog/changelog-feed.tsx` (Task 6) imports from `use-changelog-unseen.ts` (Task 9 Step 1); the build step in Task 6 notes this dependency.
