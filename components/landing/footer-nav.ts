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

const PRODUCT: FooterLink[] = [
  { label: "Models", href: "/models" },
  { label: "Providers", href: "/providers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Status", href: "https://status.bitrouter.ai", external: true },
];
const DEVELOPERS: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Quickstart", href: "/docs/get-started/quickstart" },
  { label: "API", href: "/docs/reference" },
  { label: "CLI", href: "/docs/get-started" },
  { label: "MCP", href: "/docs/ai-resources/mcp" },
];
const RESOURCES: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Compare", href: "/compare/bitrouter-vs-openrouter" },
  { label: "Changelog", href: "/changelog" },
];
const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Brand", href: "/brand" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
];

export function buildFooterColumns(): FooterColumn[] {
  return [
    { title: "Product", links: PRODUCT },
    { title: "Developers", links: DEVELOPERS },
    { title: "Resources", links: RESOURCES },
    { title: "Company", links: COMPANY },
  ];
}
