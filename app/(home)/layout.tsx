import { SiteProviders } from "@/components/site-providers";
import { WebHeader } from "@/components/site-header-wired";
import { SiteFooter } from "@/components/landing/site-footer";
import { PlaygroundProvider } from "@/components/landing/playground/playground";

export default function HomeGroupLayout({ children }: { children: React.ReactNode }) {
  return <SiteProviders><WebHeader /><PlaygroundProvider>{children}</PlaygroundProvider><SiteFooter /></SiteProviders>;
}
