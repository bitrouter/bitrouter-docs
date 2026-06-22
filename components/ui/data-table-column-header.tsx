"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface Props<TData, TValue> {
  column: Column<TData, TValue>;
  label: string;
  align?: "start" | "end";
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  align = "start",
}: Props<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <span
        className={cn(
          "inline-flex w-full",
          align === "end" ? "justify-end" : "justify-start",
        )}
      >
        {label}
      </span>
    );
  }

  const sort = column.getIsSorted();
  const Icon =
    sort === "asc" ? ChevronUp : sort === "desc" ? ChevronDown : ChevronsUpDown;
  const active = sort !== false;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sort === "asc")}
      className={cn(
        "group inline-flex w-full items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest outline-none transition-colors",
        align === "end" ? "justify-end" : "justify-start",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <Icon
        className={cn(
          "size-3 transition-opacity",
          active ? "opacity-100" : "opacity-50 group-hover:opacity-100",
        )}
      />
    </button>
  );
}
