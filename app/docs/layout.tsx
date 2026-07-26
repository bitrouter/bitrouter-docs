import "@/components/landing/zed/zed.css";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { FullSearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { DocsHeader } from "@/components/docs-header";
import { SiteProviders } from "@/components/site-providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProviders>
      <DocsLayout
        tree={source.pageTree}
        tabMode="navbar"
        nav={{ mode: "top" }}
        slots={{ header: DocsHeader }}
        sidebar={{
          defaultOpenLevel: 1,
          collapsible: false,
          banner: <FullSearchTrigger className="w-full" />,
        }}
      >
        {children}
      </DocsLayout>
    </SiteProviders>
  );
}
