// lib/footer-data.ts
import "server-only";
import { blogSource } from "@/lib/source";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import { FOOTER_COMPARE } from "@/lib/footer-compare.generated";
import { deriveCompareLabel, type FooterLink } from "@/components/landing/footer-nav";

export function getCompareLinks(): FooterLink[] {
  return FOOTER_COMPARE.map((slug) => ({
    label: deriveCompareLabel(slug),
    href: `/compare/${slug}`,
  }));
}

export function getLatestBlogLinks(limit = 5): FooterLink[] {
  const pages = blogSource.getPages("en");
  const sorted = [...pages].sort((a, b) => {
    const da = (a.data as { date?: string }).date ?? "";
    const db = (b.data as { date?: string }).date ?? "";
    return db.localeCompare(da);
  });
  const links = sorted
    .slice(0, limit)
    .map((p) => ({ label: p.data.title, href: p.url }));
  // Empty-safe: content/blog may be unsynced in dev. Fall back to the index.
  return links.length ? links : [{ label: "Blog", href: "/blog" }];
}

export function getCommunityLinks(): FooterLink[] {
  return SOCIAL_LINKS.map(({ label, href }) => ({ label, href, external: true }));
}
