"use client";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export type ViewMode = "table" | "list";

interface FilterSidebarProps {
  /** Optional content rendered inside the sidebar header (e.g., type tabs) */
  banner?: React.ReactNode;
  children: React.ReactNode;
}

export function FilterSidebar({
  banner,
  children,
}: FilterSidebarProps) {
  return (
    <Sidebar collapsible="none">
      {banner && (
        <SidebarHeader className="p-0">
          {banner}
        </SidebarHeader>
      )}

      {/* Filter sections */}
      <SidebarContent>
        <SidebarGroup className="px-4 py-3">
          <SidebarGroupContent className="space-y-5">
            {children}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}
