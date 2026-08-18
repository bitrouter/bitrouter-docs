import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import { SOCIAL_LINKS } from "@/components/landing/social-links";

const FOUNDERS_CONTACT = "mailto:contact@bitrouter.ai";
const STATUS_URL = "https://status.bitrouter.ai";

const COL_HEAD =
  "mb-[18px] font-mono text-[10.5px] font-normal uppercase tracking-[0.16em] text-[var(--z-ink-6)]";
const FOOT_LINK =
  "w-fit font-mono text-[13px] text-[var(--z-ink-3)] transition-colors hover:text-[var(--z-ink)]";
const COL_LINKS = "flex flex-col items-start gap-3";

/**
 * Site-wide v3 dark footer. A 3×2 grid of nav columns (Product / Developers /
 * Resources / Company / Integrations / Community) over a slim bottom bar.
 *
 * v3 drops the brand-mark row that used to head the footer and moves the links
 * from sans to mono — the footer is a directory, so it reads as one column of
 * labels rather than a block of prose. Server component; dark-only, so no
 * theme switch.
 */
export function SiteZedFooter() {
  const columns = buildFooterColumns();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--z-rule)] bg-[var(--z-bg)]">
      <div className="mx-auto max-w-[1180px] px-[22px] pb-11 pt-16 sm:px-10">
        {/* nav columns — 3×2 grid, collapsing to a single column on phones */}
        <div className="grid grid-cols-1 gap-x-14 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => (
            <nav className="min-w-0" key={col.title} aria-label={col.title}>
              <h2 className={COL_HEAD}>{col.title}</h2>
              <div className={COL_LINKS}>
                {col.links.map((link) =>
                  link.external ? (
                    <a
                      key={`${col.title}:${link.href}:${link.label}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={FOOT_LINK}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={`${col.title}:${link.href}:${link.label}`}
                      href={link.href}
                      className={FOOT_LINK}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </nav>
          ))}

          {/* Community — same plain label rows as the other columns. v3 drops
              the per-network icons so all six columns share one texture. */}
          <nav className="min-w-0" aria-label="Community">
            <h2 className={COL_HEAD}>Community</h2>
            <div className={COL_LINKS}>
              {SOCIAL_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={FOOT_LINK}
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* bottom bar */}
        <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11.5px] text-[var(--z-ink-6)]">
          <span>© {year} BitRouter, Inc.</span>
          <a
            href={FOUNDERS_CONTACT}
            className="text-[var(--z-ink-3)] transition-colors hover:text-[var(--z-ink)] sm:ml-auto"
          >
            Talk to the founders
          </a>
          <a
            href={STATUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-[var(--z-ink-3)]"
          >
            <span
              className="inline-block size-1.5 rounded-full bg-[var(--z-green-dot)]"
              aria-hidden
            />
            Operational
          </a>
        </div>
      </div>
    </footer>
  );
}
