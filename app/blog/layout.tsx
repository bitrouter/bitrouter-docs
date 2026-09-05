import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteProviders } from "@/components/site-providers";
import { baseOptions } from "@/lib/layout.shared";
import { SiteZedFooter } from "@/components/landing/zed/site-footer";

// Blog is English-only. The index and post routes render the same chrome, so
// they share this one layout — the old (index)/(posts) route groups existed
// only to give each half its own fumadocs layout, and both ended up on
// HomeLayout after the flux DocsLayout was dropped.
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <HomeLayout {...baseOptions()}>{children}</HomeLayout>
      <SiteZedFooter />
    </SiteProviders>
  );
}
