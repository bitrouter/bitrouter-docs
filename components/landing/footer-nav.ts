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
  { label: "API", href: "/docs/reference" },
  { label: "CLI", href: "/docs/concepts/cli" },
  { label: "MCP", href: "/docs/concepts/mcp" },
  { label: "Agent Skills", href: "/docs/ai-resources/skills" },
];
const RESOURCES: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Compare", href: "/compare" },
  { label: "Status", href: "https://status.bitrouter.ai", external: true },
];
const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Brand", href: "/brand" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
];
const INTEGRATIONS: FooterLink[] = [
  { label: "Claude Code", href: "/claude-code" },
  { label: "Codex", href: "/codex" },
  { label: "OpenClaw", href: "/openclaw" },
  { label: "Hermes Agent", href: "/hermes-agent" },
  { label: "OpenCode", href: "/opencode" },
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
    { title: "Integrations", links: INTEGRATIONS },
  ];
}
