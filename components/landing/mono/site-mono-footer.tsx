import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import {
  getCompareLinks,
  getLatestBlogLinks,
  getCommunityLinks,
} from "@/lib/footer-data";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import "./mono.css";

/**
 * Site-wide mono-themed mega-footer. Config-driven (single source of truth in
 * footer-nav.ts + footer-data.ts), rendered once per marketing route-group
 * layout. Self-contained: wraps itself in `.br-mono` so its terminal styling
 * applies on any page (mono or plain) without affecting the rest of the page.
 */
export async function SiteMonoFooter() {
  const columns = buildFooterColumns({
    compare: getCompareLinks(),
    blog: getLatestBlogLinks(5),
    community: getCommunityLinks(),
  });
  const year = new Date().getFullYear();

  return (
    <div className="br-mono">
      <footer className="footer footer-mega">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/">
              <img src="/logo.svg" alt="BitRouter" className="brand-logo" />
              <span className="brand-name">
                bitrouter<span className="brand-dot">.</span>
              </span>
            </Link>
            <p className="footer-tag">
              The open-source router that cost-optimizes your agentic workflows
              — routing as code, with control you keep.
            </p>
            <div className="footer-social">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-soc"
                    title={s.label}
                    aria-label={s.label}
                  >
                    <Icon className="footer-soc-ico" />
                  </a>
                );
              })}
            </div>
            <div className="footer-copy">© {year} BitRouter, Inc.</div>
          </div>

          <div className="footer-cols">
            {columns.map((col) => (
              <nav className="footer-col" key={col.title} aria-label={col.title}>
                <h2 className="footer-col-h">{col.title}</h2>
                {col.links.map((link) =>
                  link.external ? (
                    <a
                      key={`${col.title}:${link.href}:${link.label}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={`${col.title}:${link.href}:${link.label}`}
                      href={link.href}
                      className="footer-link"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
