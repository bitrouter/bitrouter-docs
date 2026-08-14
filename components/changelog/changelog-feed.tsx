"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  groupFeed,
  headlineOf,
  sortReleasesDesc,
  significanceOf,
  type ChangelogItem,
  type FeedRollup,
  type Significance,
} from "@/lib/changelog";
import {
  CHANGELOG_SEEN_EVENT,
  CHANGELOG_SEEN_KEY,
} from "@/components/changelog/use-changelog-unseen";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// A run of releases that all shipped the same day shouldn't read "X – X".
function fmtDateRange(from: string, to: string): string {
  return from === to ? fmtDate(to) : `${fmtDate(from)} – ${fmtDate(to)}`;
}

const ROW_BORDER = "1px solid var(--z-rule)";
const MONO = { fontFamily: "var(--font-mono)" } as const;

function LatestBadge() {
  return (
    <span
      style={{
        fontSize: 9.5,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--z-blue)",
        border: "1px solid #2a3550",
        borderRadius: 5,
        padding: "2px 6px",
      }}
    >
      latest
    </span>
  );
}

function BreakingBadge({ label = "Breaking" }: { label?: string }) {
  return (
    <span
      style={{
        color: "var(--z-red)",
        border: "1px solid rgba(224,108,108,0.35)",
        borderRadius: 5,
        padding: "2px 7px",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontSize: 10,
      }}
    >
      {label}
    </span>
  );
}

function TagChip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        color: "var(--z-ink-5)",
        border: ROW_BORDER,
        borderRadius: 5,
        padding: "2px 8px",
        fontSize: 11.5,
      }}
    >
      {children}
    </span>
  );
}

/**
 * One release, notes and all. The whole row used to be a single link to the
 * entry page; now that the notes render here, it can't be — they contain PR
 * links, and anchors can't nest. The version in the rail carries the permalink
 * instead, so sharing and deep-linking still work.
 *
 * `variant` sets the weight: a phase opening or a real release gets the display
 * serif, a routine bump gets mono, and both show their notes.
 */
function ReleaseSection({
  item,
  body,
  isLatest,
  variant,
}: {
  item: ChangelogItem;
  body?: ReactNode;
  isLatest: boolean;
  variant: Significance;
}) {
  const routine = variant === "routine";
  const highlight = variant === "highlight";
  // A routine entry's description is derived from its first bullet, so with the
  // notes rendered inline the headline restates the line directly beneath it —
  // and its tags restate the section labels. Drop both and let the notes speak.
  // Curated entries keep theirs: that prose is written, not derived.
  const showSummary = !routine || !body;

  return (
    <div
      className="zed-metagrid"
      style={{ borderBottom: ROW_BORDER, padding: routine ? "30px 8px" : "46px 8px" }}
    >
      <div style={{ position: "relative" }}>
        <div style={{ position: "sticky", top: 96 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={item.url}
              style={{
                ...MONO,
                fontSize: routine ? 13.5 : 15,
                fontWeight: 500,
                color: routine ? "var(--z-ink-3)" : "var(--z-ink)",
              }}
            >
              {item.version ?? fmtDate(item.date)}
            </Link>
            {isLatest && <LatestBadge />}
          </div>
          <div style={{ ...MONO, fontSize: 12, color: "var(--z-ink-6)", marginTop: 8 }}>
            {fmtDate(item.date)}
          </div>
        </div>
      </div>

      <div>
        {showSummary && (
        <h2
          style={
            routine
              ? { ...MONO, fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--z-ink-2)", margin: "0 0 10px", maxWidth: "62ch" }
              : {
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: highlight ? 34 : 26,
                  lineHeight: 1.18,
                  color: "var(--z-ink)",
                  margin: "0 0 14px",
                  maxWidth: "40ch",
                }
          }
        >
          {headlineOf(item)}
        </h2>
        )}

        {(item.breaking || (showSummary && item.tags.length > 0)) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              ...MONO,
              marginBottom: body ? 16 : 0,
            }}
          >
            {item.breaking && <BreakingBadge />}
            {showSummary &&
              item.tags.map((tag) => <TagChip key={tag}>{tag}</TagChip>)}
          </div>
        )}

        {body && <div className="zed-article zed-changelog-body">{body}</div>}
      </div>
    </div>
  );
}

/**
 * A train of routine releases under one header — the alpha run, a patch series.
 * The header names the train and totals it up; the releases below are listed
 * open, because while a product is in its alpha train the train *is* the news.
 * Collapsible for when the run gets long.
 */
function TrainGroup({
  group,
  bodies,
  latestUrl,
}: {
  group: FeedRollup;
  bodies: Record<string, ReactNode>;
  latestUrl?: string;
}) {
  const [open, setOpen] = useState(true);
  const isLatest = group.to.url === latestUrl;

  return (
    <div>
      <div
        className="zed-metagrid"
        style={{ borderBottom: ROW_BORDER, padding: "26px 8px 20px" }}
      >
        <div style={{ ...MONO, fontSize: 13.5, fontWeight: 500, color: "var(--z-ink-3)" }}>
          {group.line || "releases"}
          <div style={{ fontSize: 12, color: "var(--z-ink-6)", marginTop: 8, fontWeight: 400 }}>
            {fmtDateRange(group.from.date, group.to.date)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            ...MONO,
            fontSize: 12.5,
            color: "var(--z-ink-4)",
          }}
        >
          <span style={{ color: "var(--z-ink-3)" }}>{group.items.length} releases</span>
          {/* With the list open the badge belongs on the newest release below. */}
          {isLatest && !open && <LatestBadge />}
          {group.breaking && <BreakingBadge label="Contains breaking" />}
          {group.tagCounts.map(({ tag, count }) => (
            <TagChip key={tag}>
              {tag} ×{count}
            </TagChip>
          ))}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{
              marginLeft: "auto",
              ...MONO,
              fontSize: 12,
              color: "var(--z-blue)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            {open ? "Collapse ▴" : "Expand ▾"}
          </button>
        </div>
      </div>

      {open &&
        group.items.map((item) => (
          <ReleaseSection
            key={item.url}
            item={item}
            body={bodies[item.url]}
            isLatest={item.url === latestUrl}
            variant="routine"
          />
        ))}
    </div>
  );
}

/**
 * "Zed dark" changelog feed. Every release renders its notes inline — no
 * click-through to read what shipped — with weight set by significance: phase
 * openings and real releases in the display serif, routine bumps in mono under
 * a train header.
 */
export function ChangelogFeed({
  items,
  bodies = {},
}: {
  items: ChangelogItem[];
  bodies?: Record<string, ReactNode>;
}) {
  useEffect(() => {
    try {
      localStorage.setItem(CHANGELOG_SEEN_KEY, new Date().toISOString());
      window.dispatchEvent(new Event(CHANGELOG_SEEN_EVENT));
    } catch {
      // localStorage unavailable (SSR/private mode) — ignore.
    }
  }, []);

  const blocks = groupFeed(items);
  const latestUrl = sortReleasesDesc(items)[0]?.url;

  return (
    <div>
      {blocks.map((block) =>
        block.kind === "entry" ? (
          <ReleaseSection
            key={block.item.url}
            item={block.item}
            body={bodies[block.item.url]}
            isLatest={block.item.url === latestUrl}
            variant={significanceOf(block.item)}
          />
        ) : (
          <TrainGroup
            key={`${block.line}-${block.to.url}`}
            group={block}
            bodies={bodies}
            latestUrl={latestUrl}
          />
        ),
      )}
    </div>
  );
}
