export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { title: string; links: FooterLink[] };

const BRAND_CASING: Record<string, string> = {
  openrouter: "OpenRouter",
  litellm: "LiteLLM",
  portkey: "Portkey",
};

export function deriveCompareLabel(slug: string): string {
  const competitor = slug.replace(/^bitrouter-vs-/, "");
  const label =
    BRAND_CASING[competitor] ??
    competitor
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return `vs ${label}`;
}

// Third-party tools you plug BitRouter into. Links bridge to anchors on the
// /integrations stub index until per-tool pages ship (separate content spec),
// then repoint to /integrations/<slug>.
const INTEGRATIONS: FooterLink[] = [
  { label: "Claude Code", href: "/integrations#claude-code" },
  { label: "Codex", href: "/integrations#codex" },
  { label: "OpenCode", href: "/integrations#opencode" },
  { label: "OpenClaw", href: "/integrations#openclaw" },
  { label: "Hermes Agent", href: "/integrations#hermes-agent" },
];

// Populated by the Use Cases content spec. Empty => column is hidden.
const USE_CASES: FooterLink[] = [];

// NOTE: API/CLI/MCP hrefs point at real docs routes; confirm CLI target
// (no dedicated CLI page today — using get-started).
const PRODUCTS: FooterLink[] = [
  { label: "Models", href: "/models" },
  { label: "Providers", href: "/providers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Status", href: "https://bitrouter.openstatus.dev", external: true },
];
const DEVELOPERS: FooterLink[] = [
  { label: "API", href: "/docs/reference" },
  { label: "CLI", href: "/docs/get-started" },
  { label: "MCP", href: "/docs/ai-resources/mcp" },
];
const RESOURCES: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Quickstart", href: "/docs/get-started/quickstart" },
  { label: "AI Resources", href: "/docs/ai-resources" },
  { label: "Changelog", href: "/changelog" },
];
const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Brand", href: "/brand" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
];

export function buildFooterColumns(dynamic: {
  compare: FooterLink[];
  blog: FooterLink[];
  community: FooterLink[];
  includeEmpty?: boolean;
}): FooterColumn[] {
  const columns: FooterColumn[] = [
    { title: "Products", links: PRODUCTS },
    { title: "Developers", links: DEVELOPERS },
    { title: "Integrations", links: INTEGRATIONS },
    { title: "Resources", links: RESOURCES },
    { title: "Compare", links: dynamic.compare },
    { title: "Use Cases", links: USE_CASES },
    { title: "Blog", links: dynamic.blog },
    { title: "Community", links: dynamic.community },
    { title: "Company", links: COMPANY },
  ];
  return dynamic.includeEmpty
    ? columns
    : columns.filter((c) => c.links.length > 0);
}
