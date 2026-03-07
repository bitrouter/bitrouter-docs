export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export const footerLinks: FooterLinkGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Chat", href: "#" },
      { label: "Ranking", href: "#" },
      { label: "Models", href: "#" },
      { label: "Enterprise", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "SDK", href: "#" },
      { label: "GitHub", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
];
