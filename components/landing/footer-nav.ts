export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { title: string; links: FooterLink[] };

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
  { label: "Compare", href: "/compare" },
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
