"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useNotebookLayout } from "fumadocs-ui/layouts/notebook";
import { isLayoutTabActive } from "fumadocs-ui/layouts/shared";
import { WebHeaderBody } from "@/components/site-header-wired";
import { cn } from "@/lib/cn";

/**
 * Custom docs header — replaces fumadocs notebook's default header via
 * `slots.header`. Keeps the docs grid wiring (sticky + grid-area: header +
 * --fd-header-height for sidebar/toc offset) while letting us render
 * CustomNavBody on top and the section-tabs strip below.
 *
 * Solid `bg-background` (not /80) so when the page scrolls under it, body
 * text can't bleed through. Backdrop blur isn't useful on a fully opaque
 * surface, so it's omitted.
 */
export function DocsHeader() {
  const {
    props: { tabs, tabMode },
  } = useNotebookLayout();
  const pathname = usePathname();
  const showTabs = tabMode === "navbar" && tabs.length > 0;
  const selectedIdx = tabs.findLastIndex((tab) =>
    isLayoutTabActive(tab, pathname),
  );

  return (
    <header
      id="nd-subnav"
      className={cn(
        "sticky [grid-area:header] flex flex-col top-(--fd-docs-row-1) z-10",
        "border-b border-foreground/[0.08] bg-background",
        // The `layout:` variant sets the var on the layout container so the
        // sidebar/TOC siblings (which read `--fd-docs-row-2`) get the right
        // offset. Setting it directly on the header would only scope it here.
        "layout:[--fd-header-height:48px]",
        showTabs && "lg:layout:[--fd-header-height:88px]",
      )}
    >
      <WebHeaderBody />

      {showTabs && (
        <div className="flex h-10 flex-row items-end gap-6 overflow-x-auto border-t border-foreground/[0.06] px-6 max-lg:hidden">
          {tabs.map((tab, i) => {
            const isSelected = selectedIdx === i;
            return (
              <Link
                key={i}
                href={tab.url}
                className={cn(
                  "inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground",
                  tab.unlisted && !isSelected && "hidden",
                  isSelected && "border-fd-primary text-fd-primary",
                )}
              >
                {tab.title}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
