import { FOOTER_LINKS, LEGAL_LINKS } from "./footer-nav";
import "./site-footer.css";

const AGENT_RESOURCE_LINKS = [
  { label: "llms.txt", href: "/llms.txt" },
  { label: "Docs MCP endpoint", href: "/mcp" },
  { label: "Cloud OpenAPI", href: "/openapi.json" },
];

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-main">
      <a className="site-footer-brand" href="/">bitrouter.</a>
      <nav aria-label="Footer">
        {[{ label: "Pricing", href: "/pricing" }, ...FOOTER_LINKS, ...AGENT_RESOURCE_LINKS].map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
        ))}
      </nav>
    </div>
    <div className="site-footer-meta"><span>© {new Date().getFullYear()} BitRouter, Inc.</span><nav aria-label="Legal">{LEGAL_LINKS.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}<a href="/status">Status</a></nav></div>
  </footer>;
}
