import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import { BrandMark } from "./primitives";

const FOUNDERS_CONTACT = "mailto:contact@bitrouter.ai";
const STATUS_URL = "https://status.bitrouter.ai";

const COL_HEAD =
  "mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--z-ink-7)]";
const FOOT_LINK =
  "mb-[11px] flex w-fit items-center gap-2 font-sans text-[13.5px] text-[var(--z-ink-4)] transition-colors hover:text-[var(--z-ink-2)]";

/**
 * Site-wide "Zed dark" footer. Brand mark + wordmark, a 3×2 grid of nav columns
 * (Product / Developers / Resources / Company / Integrations / Community), then a
 * slim bottom bar. Server component — dark-only, so no theme switch. Replaces the
 * legacy SiteMonoFooter on the home, blog and changelog surfaces.
 */
export function SiteZedFooter() {
  const columns = buildFooterColumns();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--z-rule)] bg-[var(--z-bg)]">
      <div className="mx-auto max-w-[1180px] px-5 pb-10 pt-16 sm:px-[34px]">
        {/* brand */}
        <Link href="/" className="mb-[52px] flex w-fit items-center gap-2.5" aria-label="BitRouter home">
          <BrandMark size={24} />
          <span className="font-sans text-base font-semibold tracking-[-0.01em] text-[var(--z-ink)]">
            bitrouter.
          </span>
        </Link>

        {/* nav columns — 3×2 grid */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-[52px] sm:grid-cols-3">
          {columns.map((col) => (
            <nav className="min-w-0" key={col.title} aria-label={col.title}>
              <h2 className={COL_HEAD}>{col.title}</h2>
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
            </nav>
          ))}

          {/* Community — social links as labeled icon+name rows */}
          <nav className="min-w-0" aria-label="Community">
            <h2 className={COL_HEAD}>Community</h2>
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={FOOT_LINK}
              >
                <Icon aria-hidden className="size-3.5 shrink-0 opacity-80" />
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--z-rule)] pt-[22px] font-mono text-xs text-[var(--z-ink-7)]">
          <span>© {year} BitRouter, Inc.</span>
          <a
            href={FOUNDERS_CONTACT}
            className="font-medium text-[var(--z-ink-4)] transition-colors hover:text-[var(--z-ink-2)] sm:ml-auto"
          >
            Talk to the founders
          </a>
          <a
            href={STATUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[7px] transition-colors hover:text-[var(--z-ink-4)]"
          >
            <span
              className="inline-block size-[7px] rounded-full bg-[var(--z-green-dot)]"
              aria-hidden
            />
            Operational
          </a>
        </div>
      </div>
    </footer>
  );
}
