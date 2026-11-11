import "@/components/landing/zed/zed.css";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { DocsHeader } from "@/components/docs-header";
import { SiteProviders } from "@/components/site-providers";
import { createDocsLayoutTree } from "@/lib/docs-navigation.mjs";
import { DocsSidebarItem } from "@/components/docs-sidebar-item";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProviders>
      <DocsLayout
        tree={createDocsLayoutTree(source.pageTree, source.getPages())}
        tabMode="navbar"
        sidebar={{ prefetch: false, components: { Item: DocsSidebarItem } }}
        nav={{ mode: "top" }}
        slots={{ header: DocsHeader, themeSwitch: false }}
      >
        {children}
      </DocsLayout>
    </SiteProviders>
  );
}
