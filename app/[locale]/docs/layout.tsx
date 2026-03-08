import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { docsOptions } from "@/lib/layout.shared";
import { SidebarFooterControls } from "@/components/sidebar-footer-controls";
import { setRequestLocale } from "next-intl/server";
import { Bot } from "lucide-react";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/search";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AISearch>
      <DocsLayout
        tree={source.getPageTree(locale)}
        {...docsOptions()}
        themeSwitch={{ component: <SidebarFooterControls /> }}
      >
        {children}
        <AISearchPanel />
        <AISearchTrigger
          position="float"
          className={cn(
            buttonVariants({
              color: "primary",
              size: "icon",
            }),
            "rounded-full",
          )}
        >
          <Bot className="size-5" />
        </AISearchTrigger>
      </DocsLayout>
    </AISearch>
  );
}
