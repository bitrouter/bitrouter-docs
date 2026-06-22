import { SiteProviders } from "@/components/site-providers";

// Changelog is English-only. Providers live here; the (index) and (posts)
// route groups each add their own fumadocs layout, mirroring app/blog.
export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteProviders>{children}</SiteProviders>;
}
