"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { useNotebookLayout } from "fumadocs-ui/layouts/notebook";
import { WebHeaderBody } from "@/components/site-header-wired";
import { cn } from "@/lib/cn";

/**
 * Custom notebook header — replaces fumadocs' default header via
 * `slots.header`. Keeps the docs grid wiring (sticky + grid-area: header +
 * --fd-header-height for sidebar/toc offset) while rendering the shared site
 * navigation.
 *
 * Solid `bg-background` (not /80) so when the page scrolls under it, body
 * text can't bleed through. Backdrop blur isn't useful on a fully opaque
 * surface, so it's omitted.
 */
function NotebookHeader() {
  const { slots } = useNotebookLayout();
  const pathname = usePathname();
  const SidebarTrigger = slots.sidebar?.trigger;

  // The docs shell scrolls #nd-page instead of the window. Next.js resets the
  // window on navigation, so without this a newly opened page can inherit the
  // previous article's scroll offset and appear tucked under the header.
  useEffect(() => {
    document.getElementById("nd-page")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <header
      id="nd-subnav"
      className={cn(
        "sticky [grid-area:header] flex flex-col top-(--fd-docs-row-1) z-10",
        "border-b border-[var(--z-rule)] bg-background",
        // The `layout:` variant sets the var on the layout container so the
        // sidebar/TOC siblings (which read `--fd-docs-row-2`) get the right
        // offset. Setting it directly on the header would only scope it here.
        "layout:[--fd-header-height:62px]",
      )}
    >
      {/* Below `md` the sidebar becomes a drawer. Without this trigger the docs
          tree and changelog release list are unreachable on a phone. Native
          notebook headers render the same slot; ours has to opt in because it
          replaces the whole header. */}
      <WebHeaderBody
        leadingSlot={
          SidebarTrigger ? (
            <SidebarTrigger
              aria-label="Toggle docs navigation"
              className="-ms-1.5 flex items-center rounded-[9px] p-2 text-[var(--z-ink-4)] transition-colors hover:bg-white/[0.05] hover:text-[var(--z-ink)] md:hidden"
            >
              <PanelLeft className="size-[18px]" />
            </SidebarTrigger>
          ) : null
        }
      />
    </header>
  );
}

/** Notebook header for the unified documentation tree. */
export function DocsHeader() {
  return <NotebookHeader />;
}

/** Standalone top-level Changelog, retaining the native notebook shell. */
export function ChangelogHeader() {
  return <NotebookHeader />;
}
