import { socialHref } from "./social-links";

export type FooterLink = { label: string; href: string; external?: boolean };

/**
 * The footer, as one row of cells.
 *
 * The compact strip keeps docs and releases close, then points to the three
 * places to find the project, datasets, and community.
 */
export const FOOTER_LINKS: FooterLink[] = [
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "GitHub", href: socialHref("github"), external: true },
  { label: "Discord", href: socialHref("discord"), external: true },
  { label: "X", href: socialHref("x"), external: true },
  { label: "Hugging Face", href: socialHref("huggingface"), external: true },
];

/** Compliance links for the bottom row — these are not navigation. */
export const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "Subprocessors", href: "/subprocessors" },
];
