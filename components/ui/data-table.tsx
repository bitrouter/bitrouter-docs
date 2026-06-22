"use client";

import * as React from "react";
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialSorting?: SortingState;
  onRowClick?: (row: TData) => void;
  rowAriaLabel?: (row: TData) => string;
  rowKey: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialSorting = [],
  onRowClick,
  rowAriaLabel,
  rowKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table className="text-sm">
      <TableHeader className="bg-foreground/[0.015]">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="hover:bg-transparent">
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "h-11 px-4 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
                  header.column.columnDef.meta?.headerClassName,
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          const original = row.original;
          const interactive = !!onRowClick;
          return (
            <TableRow
              key={rowKey(original)}
              onClick={
                interactive
                  ? (e) => {
                      // Inner <Link> in the first cell handles modifier-clicks
                      // and middle-click natively; bail when it already did.
                      if (e.defaultPrevented) return;
                      if (
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey ||
                        e.button !== 0
                      ) {
                        return;
                      }
                      onRowClick(original);
                    }
                  : undefined
              }
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(original);
                      }
                    }
                  : undefined
              }
              tabIndex={interactive ? 0 : undefined}
              aria-label={
                interactive && rowAriaLabel ? rowAriaLabel(original) : undefined
              }
              className={cn(
                "border-b border-border last:border-0 outline-none transition-colors",
                interactive &&
                  "cursor-pointer hover:bg-foreground/[0.015] focus-visible:bg-foreground/[0.03]",
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "px-4 py-2.5",
                    cell.column.columnDef.meta?.cellClassName,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
