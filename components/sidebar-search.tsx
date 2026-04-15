"use client";

import { Search } from "lucide-react";
import { useCommandPalette } from "@/components/command-palette";

export function SidebarSearch() {
  const { setOpen } = useCommandPalette();

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex w-full items-center gap-2 border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 text-left text-xs">Search...</span>
      <kbd className="hidden font-mono text-[10px] text-muted-foreground/60 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
