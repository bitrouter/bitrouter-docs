"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sortByDateDesc, type ChangelogItem } from "@/lib/changelog";
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

/**
 * "Zed dark" changelog feed — a release list with a sticky version+date rail and
 * a Newsreader title per release. Preserves the localStorage "seen" side-effect
 * that clears the nav's changelog dot.
 */
export function ChangelogFeed({ items }: { items: ChangelogItem[] }) {
  useEffect(() => {
    try {
      localStorage.setItem(CHANGELOG_SEEN_KEY, new Date().toISOString());
      window.dispatchEvent(new Event(CHANGELOG_SEEN_EVENT));
    } catch {
      // localStorage unavailable (SSR/private mode) — ignore.
    }
  }, []);

  const releases = sortByDateDesc(items);

  return (
    <div>
      {releases.map((r, i) => (
        <Link
          key={r.url}
          href={r.url}
          className="zed-metagrid zed-release-row"
          style={{ borderBottom: "1px solid var(--z-rule)", padding: "44px 8px" }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ position: "sticky", top: 96 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--z-ink)",
                }}
              >
                {r.version ?? fmtDate(r.date)}
                {i === 0 && (
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
                )}
              </div>
              {r.version && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--z-ink-6)", marginTop: 8 }}>
                  {fmtDate(r.date)}
                </div>
              )}
            </div>
          </div>

          <div>
            {/* Changelog titles are the version string (shown in the rail);
                the human-readable summary is the description — use it as the
                headline, falling back to the title only when absent. */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 26,
                lineHeight: 1.18,
                color: "var(--z-ink)",
                margin: "0 0 16px",
                maxWidth: "40ch",
              }}
            >
              {r.description ?? r.title}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
              {r.breaking && (
                <span style={{ color: "var(--z-red)", border: "1px solid rgba(224,108,108,0.35)", borderRadius: 5, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>
                  Breaking
                </span>
              )}
              {r.tags.map((tag) => (
                <span key={tag} style={{ color: "var(--z-ink-4)", border: "1px solid var(--z-rule)", borderRadius: 5, padding: "2px 8px" }}>
                  {tag}
                </span>
              ))}
              <span style={{ marginLeft: "auto", color: "var(--z-blue)" }}>Read →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
