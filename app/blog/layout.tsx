import { SiteProviders } from "@/components/site-providers";
import { SiteZedFooter } from "@/components/landing/zed/site-footer";

// Blog is English-only. Providers live here; the (index) and (posts) route
// groups each add their own fumadocs layout (HomeLayout vs flux DocsLayout).
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      {children}
      <SiteZedFooter />
    </SiteProviders>
  );
}
