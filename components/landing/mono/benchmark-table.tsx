"use client";

/* Terminal-Bench 2.1 leaderboard as a shadcn/TanStack data table — vals.ai
   columns (model / harness / score / cost / latency), sortable + filterable.
   The projected "GPT-5.5 + BitRouter" row keeps the purple accent highlight and
   a ‡ on its projected fields (see benchmark.tsx for the projection basis). */

import * as React from "react";
import {
  type ColumnDef,
  type Column,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProviderIcon } from "../../models/provider-icon";

export type BenchRow = {
  name: string;
  prov: string;
  harness: string;
  score: number;
  cost: number;
  latency: number | null;
  kind: "base" | "bitrouter";
  projected?: boolean;
};

function SortHeader({ column, label, right }: { column: Column<BenchRow, unknown>; label: string; right?: boolean }) {
  const dir = column.getIsSorted();
  return (
    <button type="button" className={"bench-sort" + (right ? " right" : "")} onClick={() => column.toggleSorting(dir === "asc")}>
      {label}
      <span className="bench-sort-ind">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}</span>
    </button>
  );
}

const columns: ColumnDef<BenchRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortHeader column={column} label="model" />,
    cell: ({ row }) => {
      const r = row.original;
      const bit = r.kind === "bitrouter";
      return (
        <span className="bench-td setup">
          {bit ? <span className="bench-router-mark">▸</span> : <ProviderIcon provider={r.prov} size={14} />}
          <span className="bench-model">{r.name}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "harness",
    header: ({ column }) => <SortHeader column={column} label="harness" />,
    cell: ({ row }) => <span className="bench-harness plain">{row.original.harness}</span>,
  },
  {
    accessorKey: "score",
    header: ({ column }) => <SortHeader column={column} label="score" right />,
    cell: ({ row }) => (
      <span className="bench-num">
        {row.original.score.toFixed(2)}%{row.original.projected && <span className="bench-proj">‡</span>}
      </span>
    ),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => <SortHeader column={column} label="cost" right />,
    cell: ({ row }) => (
      <span className="bench-num">
        ${row.original.cost.toFixed(2)}
        {row.original.projected && <span className="bench-proj">‡</span>}
      </span>
    ),
  },
  {
    accessorKey: "latency",
    header: ({ column }) => <SortHeader column={column} label="latency" right />,
    cell: ({ row }) => <span className="bench-num bench-kimi">{row.original.latency == null ? "—" : `${Math.round(row.original.latency)}s`}</span>,
  },
];

export function BenchTable({ rows }: { rows: BenchRow[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "score", desc: true }]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters: filters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const nameFilter = (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const shown = table.getRowModel().rows.length;

  return (
    <div className="bench-dtwrap">
      <div className="bench-dttop">
        <input
          className="bench-filter"
          value={nameFilter}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          placeholder="filter models…"
          aria-label="Filter models"
        />
        <span className="bench-dtcount">{shown} systems</span>
      </div>

      <Table className="bench-dt">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bench-dt-hrow">
              {hg.headers.map((h) => {
                const num = h.column.id === "score" || h.column.id === "cost" || h.column.id === "latency";
                return (
                  <TableHead key={h.id} className={"bench-dt-th" + (num ? " num" : " setup")}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const r = row.original;
            return (
              <TableRow key={row.id} className={"bench-dt-row" + (r.kind === "bitrouter" ? " is-router" : "")}>
                {row.getVisibleCells().map((cell) => {
                  const num = cell.column.id === "score" || cell.column.id === "cost" || cell.column.id === "latency";
                  return (
                    <TableCell key={cell.id} className={"bench-dt-td" + (num ? " num" : " setup")}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="bench-foot">
        Base rows: <span className="bench-foot-base">vals.ai · Terminus 2 · pass@1</span> · ‡ projected
      </div>
    </div>
  );
}
