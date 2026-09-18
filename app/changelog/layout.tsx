import "@/components/landing/zed/zed.css";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { ChangelogHeader } from "@/components/docs-header";
import { SiteProviders } from "@/components/site-providers";
import { getChangelogTree } from "@/lib/docs-tabs";

// Changelog is a standalone top-level section that keeps the native Fumadocs
// notebook shell. Its page tree is assembled from release metadata so the
// sidebar can use version tags instead of file names; it intentionally receives
// no documentation-family tabs.
export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <DocsLayout
        tree={getChangelogTree()}
        tabs={false}
        nav={{ mode: "top" }}
        slots={{ header: ChangelogHeader }}
      >
        {children}
      </DocsLayout>
    </SiteProviders>
  );
}
