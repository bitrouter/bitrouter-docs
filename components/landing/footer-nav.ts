import { socialHref } from "./social-links";

export type FooterLink = { label: string; href: string; external?: boolean };

/**
 * The footer, as one row of cells.
 *
 * The compact strip keeps docs and releases close, gives team adopters a path
 * that does not imply a packaged enterprise suite, then points to the three
 * places to find the project and community.
 */
export const FOOTER_LINKS: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "For teams", href: "/pricing#teams" },
  { label: "GitHub", href: socialHref("github"), external: true },
  { label: "Discord", href: socialHref("discord"), external: true },
  { label: "X", href: socialHref("x"), external: true },
];

/** Compliance links for the bottom row — these are not navigation. */
export const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "Subprocessors", href: "/subprocessors" },
];
