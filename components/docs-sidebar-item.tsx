"use client";

import type { Item } from "fumadocs-core/page-tree";
import { usePathname } from "next/navigation";
import { SidebarItem, useFolderDepth } from "fumadocs-ui/components/sidebar/base";
import { HIDDEN_SIDEBAR_SECTIONS } from "@/lib/docs-navigation.mjs";

/** Supporting pages still activate their native layout tab when opened directly. */
export function DocsSidebarItem({ item }: { item: Item }) {
  const pathname = usePathname();
  const depth = useFolderDepth();
  if (Object.hasOwn(HIDDEN_SIDEBAR_SECTIONS, item.url)) return null;
  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={pathname === item.url}
      icon={item.icon}
      className="relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary [&_svg]:size-4 [&_svg]:shrink-0"
      style={{ paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }}
    >
      {item.name}
    </SidebarItem>
  );
}
