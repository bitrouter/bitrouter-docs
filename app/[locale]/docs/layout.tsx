import "@/components/landing/zed/zed.css";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { FullSearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { DocsHeader } from "@/components/docs-header";
import { SidebarFooterControls } from "@/components/sidebar-footer-controls";
import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DocsLayout
      tree={source.getPageTree(locale)}
      tabMode="navbar"
      nav={{ mode: "top" }}
      slots={{ header: DocsHeader }}
      sidebar={{
        defaultOpenLevel: 1,
        collapsible: false,
        banner: <FullSearchTrigger className="w-full" />,
        footer: <SidebarFooterControls />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
