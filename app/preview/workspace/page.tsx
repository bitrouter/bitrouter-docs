import type { Metadata } from "next";
import { Homepage } from "@/components/landing/homepage/homepage";
import { SiteProviders } from "@/components/site-providers";
import { WebHeader } from "@/components/site-header-wired";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Homepage preview",
  robots: { index: false, follow: false },
};

export default function WorkspacePreview() {
  return <SiteProviders><WebHeader /><Homepage /><SiteFooter /></SiteProviders>;
}
