import "@/components/landing/zed/zed.css";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { DocsHeader } from "@/components/docs-header";
import { SiteProviders } from "@/components/site-providers";
import { getChangelogTree, getDocsTabs } from "@/lib/docs-tabs";

// Changelog keeps its established top-level URLs, but uses the same native
// Fumadocs notebook shell as the documentation. Its page tree is assembled from
// release metadata so the sidebar can use version tags instead of file names.
export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <DocsLayout
        tree={getChangelogTree()}
        tabs={getDocsTabs()}
        tabMode="navbar"
        nav={{ mode: "top" }}
        slots={{ header: DocsHeader }}
        sidebar={{ defaultOpenLevel: 1, collapsible: false }}
      >
        {children}
      </DocsLayout>
    </SiteProviders>
  );
}
