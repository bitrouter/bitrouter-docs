import Link from "next/link";
import { buildFooterColumns } from "@/components/landing/footer-nav";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import { MonoThemeSwitch } from "./theme-switch";
import "./mono.css";

const FOUNDERS_CONTACT = "mailto:contact@bitrouter.ai";
const STATUS_URL = "https://status.bitrouter.ai";

/**
 * Site-wide mono-themed footer (condensed, Option A). Brand + social-icon row
 * on top, four nav columns, then a slim legal bar. Self-contained: wraps itself
 * in `.br-mono` so its terminal styling applies on any page.
 */
export function SiteMonoFooter() {
  const columns = buildFooterColumns();
  const year = new Date().getFullYear();

  return (
    <div className="br-mono">
      <footer className="footer footer-mega">
        <div className="wrap">
          <div className="footer-head">
            <Link className="brand footer-bar-brand" href="/">
              <img src="/logo.svg" alt="BitRouter" className="brand-logo" />
              <span className="brand-name">
                bitrouter<span className="brand-dot">.</span>
              </span>
            </Link>
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

            {/* Community — the sixth section: social links rendered as labeled
                icon+name rows, so they read clearly instead of as tiny icons. */}
            <nav className="footer-col" aria-label="Community">
              <h2 className="footer-col-h">Community</h2>
              <div className="footer-social-col">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-item"
                  >
                    <Icon aria-hidden />
                    {label}
                  </a>
                ))}
              </div>
            </nav>
          </div>

          <div className="footer-bar">
            <div className="footer-bar-left">
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
