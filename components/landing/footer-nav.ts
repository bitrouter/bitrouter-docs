export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { title: string; links: FooterLink[] };

const PRODUCT: FooterLink[] = [
  { label: "Models", href: "/models" },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Startup", href: "/startup" },
];
const DEVELOPERS: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Integrations", href: "/integrations" },
  { label: "API", href: "/docs/reference" },
  { label: "CLI", href: "/docs/get-started" },
  { label: "MCP", href: "/docs/ai-resources/mcp" },
];
const RESOURCES: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Status", href: "https://status.bitrouter.ai", external: true },
];
const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Open Startup", href: "/open" },
  { label: "Subprocessors", href: "/subprocessors" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
];
const COMPARE: FooterLink[] = [
  { label: "vs OpenRouter", href: "/compare/bitrouter-vs-openrouter" },
  { label: "vs LiteLLM", href: "/compare/bitrouter-vs-litellm" },
  { label: "vs Portkey", href: "/compare/bitrouter-vs-portkey" },
  { label: "All comparisons", href: "/compare" },
];

// Text columns only. The Community column (social links, which carry icons) is
// rendered separately in the footer component from SOCIAL_LINKS. Together they
// make the six sections of the 3×2 footer grid.
export function buildFooterColumns(): FooterColumn[] {
  return [
    { title: "Product", links: PRODUCT },
    { title: "Developers", links: DEVELOPERS },
    { title: "Resources", links: RESOURCES },
    { title: "Company", links: COMPANY },
    { title: "Compare", links: COMPARE },
  ];
}
