import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import {
  getCompareLinks,
  getLatestBlogLinks,
  getCommunityLinks,
} from "@/lib/footer-data";
import { MonoThemeSwitch } from "./theme-switch";
import "./mono.css";

const FOUNDERS_CONTACT = "mailto:contact@bitrouter.ai";
const STATUS_URL = "https://status.bitrouter.ai";

/**
 * Site-wide mono-themed mega-footer. Config-driven (single source of truth in
 * footer-nav.ts + footer-data.ts), rendered once per marketing route-group
 * layout. Self-contained: wraps itself in `.br-mono` so its terminal styling
 * applies on any page (mono or plain) without affecting the rest of the page.
 *
 * Layout: a 3-wide compact column grid over a bottom bar (brand + copyright,
 * "talk to the founders", status pill, theme switch) — openstatus-style.
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
        <div className="wrap">
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

          <div className="footer-bar">
            <div className="footer-bar-left">
              <Link className="brand footer-bar-brand" href="/">
                <img src="/logo.svg" alt="BitRouter" className="brand-logo" />
                <span className="brand-name">
                  bitrouter<span className="brand-dot">.</span>
                </span>
              </Link>
              <span className="footer-copy">© {year} BitRouter, Inc.</span>
            </div>

            <div className="footer-bar-right">
              <a href={FOUNDERS_CONTACT} className="footer-founders">
                Talk to the founders
              </a>
              <a
                href={STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-status"
              >
                <span className="footer-status-dot" aria-hidden />
                Operational
              </a>
              <MonoThemeSwitch />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
