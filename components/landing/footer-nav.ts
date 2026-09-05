import { socialHref } from "./social-links";

export type FooterLink = { label: string; href: string; external?: boolean };

/**
 * The footer, as one row of cells.
 *
 * It carried six titled columns and 29 links; everything that repeats in the
 * header (Models, Pricing, Enterprise) came out, because a link already in the
 * sitewide nav is recognised as a link from across the site rather than as a
 * second, separately valuable one — so the footer copy earned nothing.
 *
 * What is left is what the header does NOT carry: the three reading surfaces
 * and the three places to find us. Blog stays even while it has no posts —
 * without it the page would have no internal links at all.
 */
export const FOOTER_LINKS: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "Blog", href: "/blog" },
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
