import { SiteProviders } from "@/components/site-providers";
import { WebHeader } from "@/components/site-header-wired";
import { SiteFooter } from "@/components/landing/site-footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <SiteProviders><WebHeader />{children}<SiteFooter /></SiteProviders>;
}
