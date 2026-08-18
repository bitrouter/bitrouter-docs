import { CopyPageButton, ViewOptions } from "@/components/page-actions";

/**
 * The rule under a docs page title: when it was last touched, how long it is,
 * and the two ways to take it elsewhere.
 *
 * fumadocs' own `editOnGithub` / `lastUpdate` props on `fumadocs-ui/page`
 * render this pair in a fixed row at the *bottom* of the article, so the design
 * placement is reached by composing the pieces here instead — the documented
 * route for custom placement. The clipboard behaviour still comes from
 * fumadocs' `useCopyButton` (see `CopyPageButton`).
 *
 * `ViewOptions` is the "Open in…" menu (GitHub, raw Markdown, ChatGPT, Claude).
 * The design file has no such control, but the site leans on LLM-facing
 * surfaces elsewhere (`/llms.txt`, `/api/docs/llms-mdx`, `/mcp`), so it keeps
 * its place here rather than being retired with the TOC footer it used to
 * live in.
 */
// `zed-chrome-link` opts the row out of the `#nd-page a` prose-link recolour
// in globals.css — this is page chrome, not body copy.
const ROW_LINK =
  "zed-chrome-link border-b border-[var(--z-rule-2)] pb-0.5 text-[var(--z-ink-5)] transition-colors hover:border-[var(--z-ink-3)] hover:text-[var(--z-ink-2)]";

/**
 * Reading time in whole minutes at 200 wpm, floored at 1. Counting whitespace
 * runs over the processed Markdown overcounts code fences a little, which is
 * the honest direction to be wrong in for a docs page.
 */
export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatUpdated(value: Date | string | number): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DocsMeta({
  lastModified,
  minutes,
  githubUrl,
  markdownUrl,
}: {
  /** Git-derived; absent on shallow CI clones, in which case the cell is skipped. */
  lastModified?: Date | string | number;
  minutes: number;
  githubUrl: string;
  markdownUrl: string;
}) {
  const updated = lastModified ? formatUpdated(lastModified) : null;

  return (
    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--z-rule)] pt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--z-ink-6)]">
      {updated && (
        <>
          <span>Updated {updated}</span>
          <span className="text-[var(--z-rule-2)]" aria-hidden>
            ·
          </span>
        </>
      )}
      <span>{minutes} min read</span>
      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer noopener"
        className={`${ROW_LINK} sm:ml-auto`}
      >
        Edit this page
      </a>
      <CopyPageButton markdownUrl={markdownUrl} />
      <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
    </div>
  );
}
