import "@/components/landing/zed/zed.css";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { DocsHeader } from "@/components/docs-header";
import { SiteProviders } from "@/components/site-providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProviders>
      <DocsLayout
        tree={source.pageTree}
        tabs={false}
        sidebar={{ prefetch: false }}
        nav={{ mode: "top" }}
        slots={{ header: DocsHeader }}
      >
        {children}
      </DocsLayout>
    </SiteProviders>
  );
}
