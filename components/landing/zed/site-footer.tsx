import Link from "next/link";
import { FOOTER_LINKS, LEGAL_LINKS } from "@/components/landing/footer-nav";

const STATUS_URL = "https://status.bitrouter.ai";

// Six across on one row from sm up, two rows of three on phones. The strip is
// full-bleed, so the container draws the top and bottom rules and each cell
// carries only the divider to its right — dropped wherever a cell ends a row and
// would otherwise double up against the viewport edge.
const CELL =
  "flex items-center justify-center border-r border-[var(--z-rule)] " +
  "px-2 py-6 text-center font-mono text-[12px] text-[var(--z-ink-3)] " +
  "transition-colors hover:bg-[var(--z-wash)] hover:text-[var(--z-ink)] " +
  "sm:px-3 sm:py-7 sm:text-[13px] lg:text-[14px]";
const GRID =
  "grid grid-cols-3 border-y border-[var(--z-rule)] " +
  // phones: rule between the two rows, no right border on the 3rd or 6th cell
  "[&>*:nth-child(-n+3)]:border-b [&>*:nth-child(3n)]:border-r-0 " +
  // sm+: one row, so no row rule and only the 6th cell meets the edge. Each
  // override repeats its :nth-child() — a bare `sm:[&>*]:border-b-0` loses to
  // the base rule above, which the pseudo-class makes more specific.
  "sm:grid-cols-6 sm:[&>*:nth-child(-n+3)]:border-b-0 " +
  "sm:[&>*:nth-child(3n)]:border-r sm:[&>*:nth-child(6n)]:border-r-0";
const LEGAL =
  "transition-colors hover:text-[var(--z-ink-3)]";

/**
 * Site-wide v3 dark footer: a full-bleed strip of bordered cells over a centred
 * bottom line — one row of six from sm up, two rows of three on phones. The six-column directory grid was retired in 2026-09 — the
 * links that repeated the header earned nothing there, and the column headings
 * were taller than the links they labelled.
 *
 * Server component; dark-only, so no theme switch. The GitHub star count is not
 * repeated here — the header badge already fetches and shows it, and a second
 * instance would be a second request per pageview (the API route sets
 * `s-maxage`, which is CDN-only and does not dedupe in the browser).
 */
export function SiteZedFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--z-bg)] pt-16 pb-14">
      <nav aria-label="Footer" className={GRID}>
        {FOOTER_LINKS.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label === "X" ? "BitRouter on X" : undefined}
              className={CELL}
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className={CELL}>
              {link.label}
            </Link>
          ),
        )}
      </nav>

      <div className="mx-auto mt-14 flex max-w-[1180px] flex-wrap items-center justify-center gap-x-7 gap-y-3 px-[22px] font-mono text-[12px] text-[var(--z-ink-6)] sm:px-10">
        <span>© {year} BitRouter, Inc.</span>
        {LEGAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={LEGAL}>
            {link.label}
          </Link>
        ))}
        <a
          href={STATUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${LEGAL}`}
        >
          <span
            className="inline-block size-1.5 rounded-full bg-[var(--z-green-dot)]"
            aria-hidden
          />
          Operational
        </a>
      </div>
    </footer>
  );
}
