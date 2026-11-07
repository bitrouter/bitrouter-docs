import { SiteProviders } from "@/components/site-providers";
import { WebHeader } from "@/components/site-header-wired";
import { SiteFooter } from "@/components/landing/site-footer";
import { PlaygroundProvider } from "@/components/landing/playground/playground";
import { isPlaygroundPreviewEnabled } from "@/lib/playground-preview";

export default function HomeGroupLayout({ children }: { children: React.ReactNode }) {
  const preview = isPlaygroundPreviewEnabled();
  return <SiteProviders><WebHeader />{preview ? <PlaygroundProvider>{children}</PlaygroundProvider> : children}<SiteFooter /></SiteProviders>;
}
