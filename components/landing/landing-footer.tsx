import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import {
  getCompareLinks,
  getLatestBlogLinks,
  getCommunityLinks,
} from "@/lib/footer-data";
import { ThemeToggleIcon } from "@/components/landing/sections/ThemeToggleIcon";

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

export async function LandingFooter() {
  const columns = buildFooterColumns({
    compare: getCompareLinks(),
    blog: getLatestBlogLinks(5),
    community: getCommunityLinks(),
  });
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {col.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}:${link.href}:${link.label}`}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider"
          >
            <img src="/logo.svg" alt="BitRouter" className="h-4 w-4 dark:invert" />
            <span>
              BitRouter<span className="text-foreground/30">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground/70">
              © {year} BitRouter
            </span>
            <span className="h-3 w-px bg-border" />
            <ThemeToggleIcon label="Toggle theme" />
          </div>
        </div>
      </div>
    </footer>
  );
}
