"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { providerFromId } from "@/lib/models-filter";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import type { Model } from "@/lib/models-data";
import { ProviderIcon } from "./provider-icon";
import { CopyIdButton } from "./copy-id-button";

function formatTokens(tokens: number): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

function formatScore(score: number | undefined, isPercentage = false): string {
  if (score === undefined || score === null) return "—";
  if (isPercentage) return `${Math.round(score * 100)}%`;
  return score.toFixed(1);
}

function getScoreColor(score: number | undefined, max: number): string {
  if (!score) return "text-muted-foreground";
  const pct = score / max;
  if (pct >= 0.8) return "text-green-600 dark:text-green-400";
  if (pct >= 0.6) return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

export function ModelTable({ models }: { models: Model[] }) {
  const router = useRouter();
  const t = useTranslations("Models");

  const columns = React.useMemo<ColumnDef<Model>[]>(
    () => [
      {
        id: "model",
        accessorFn: (m) => m.id,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderModel")}
          />
        ),
        cell: ({ row }) => {
          const model = row.original;
          const provider = providerFromId(model.id);
          return (
            <div className="flex items-center gap-2.5">
              <ProviderIcon
                provider={provider}
                size={16}
                className="shrink-0 text-foreground"
              />
              <Link
                href={`/models/${model.id}`}
                className="min-w-0 flex-1 truncate outline-none focus-visible:underline"
              >
                <code className="font-mono text-[12px] text-foreground/90">
                  {model.id}
                </code>
              </Link>
              <CopyIdButton id={model.id} />
            </div>
          );
        },
        sortingFn: "alphanumeric",
      },
      {
        id: "context",
        accessorFn: (m) => m.maxInputTokens,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderContext")}
          />
        ),
        cell: ({ getValue }) => formatTokens(getValue<number>()),
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName:
            "hidden font-mono text-xs tabular-nums text-muted-foreground md:table-cell",
        },
      },
      {
        id: "maxOutput",
        accessorFn: (m) => m.maxOutputTokens,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderMaxOutput")}
          />
        ),
        cell: ({ getValue }) => formatTokens(getValue<number>()),
        meta: {
          headerClassName: "hidden lg:table-cell",
          cellClassName:
            "hidden font-mono text-xs tabular-nums text-muted-foreground lg:table-cell",
        },
      },
      {
        id: "input",
        accessorFn: (m) => m.pricing.input,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderInput")}
            align="end"
          />
        ),
        cell: ({ getValue }) =>
          formatCompactPricePerMillionTokens(getValue<number>()),
        meta: {
          headerClassName: "hidden md:table-cell text-right",
          cellClassName:
            "hidden text-right font-mono text-xs tabular-nums text-muted-foreground md:table-cell",
        },
      },
      {
        id: "output",
        accessorFn: (m) => m.pricing.output,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderOutput")}
            align="end"
          />
        ),
        cell: ({ getValue }) =>
          formatCompactPricePerMillionTokens(getValue<number>()),
        meta: {
          headerClassName: "hidden lg:table-cell text-right",
          cellClassName:
            "hidden lg:table-cell text-right font-mono text-xs tabular-nums text-muted-foreground",
        },
      },
      {
        id: "intelligence",
        accessorFn: (m) => m.benchmarks?.intelligenceIndex,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderIntelligence")}
            align="end"
          />
        ),
        cell: ({ row }) => {
          const score = row.original.benchmarks?.intelligenceIndex;
          return (
            <span className={getScoreColor(score, 100)}>
              {formatScore(score)}
            </span>
          );
        },
        meta: {
          headerClassName: "hidden xl:table-cell text-right",
          cellClassName:
            "hidden xl:table-cell text-right font-mono text-xs tabular-nums",
        },
      },
      {
        id: "coding",
        accessorFn: (m) => m.benchmarks?.codingIndex,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderCoding")}
            align="end"
          />
        ),
        cell: ({ row }) => {
          const score = row.original.benchmarks?.codingIndex;
          return (
            <span className={getScoreColor(score, 100)}>
              {formatScore(score)}
            </span>
          );
        },
        meta: {
          headerClassName: "hidden xl:table-cell text-right",
          cellClassName:
            "hidden xl:table-cell text-right font-mono text-xs tabular-nums",
        },
      },
      {
        id: "speed",
        accessorFn: (m) => m.benchmarks?.outputTokensPerSecond,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("tableHeaderSpeed")}
            align="end"
          />
        ),
        cell: ({ row }) => {
          const speed = row.original.benchmarks?.outputTokensPerSecond;
          if (!speed) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="text-muted-foreground">
              {Math.round(speed)} tok/s
            </span>
          );
        },
        meta: {
          headerClassName: "hidden xl:table-cell text-right",
          cellClassName:
            "hidden xl:table-cell text-right font-mono text-xs tabular-nums text-muted-foreground",
        },
      },
    ],
    [t],
  );

  return (
    <DataTable<Model, unknown>
      columns={columns}
      data={models}
      initialSorting={[{ id: "model", desc: false }]}
      onRowClick={(model) => router.push(`/models/${model.id}`)}
      rowAriaLabel={(model) => `View details for ${model.id}`}
      rowKey={(model) => model.id}
    />
  );
}

/**
 * List view — one full-width row per model with the metadata laid out
 * inline beneath the name (OpenRouter-style), instead of in columns.
 */
export function ModelList({ models }: { models: Model[] }) {
  return (
    <ul className="divide-y divide-border border-t border-border">
      {models.map((model) => (
        <ModelListRow key={model.id} model={model} />
      ))}
    </ul>
  );
}

function ModelListRow({ model }: { model: Model }) {
  const t = useTranslations("Models");
  const provider = providerFromId(model.id);
  const intelligence = model.benchmarks?.intelligenceIndex;
  const coding = model.benchmarks?.codingIndex;
  const speed = model.benchmarks?.outputTokensPerSecond;

  return (
    <li className="transition-colors hover:bg-foreground/[0.015]">
      <div className="flex items-start gap-2.5 px-4 py-3">
        <ProviderIcon
          provider={provider}
          size={16}
          className="mt-0.5 shrink-0 text-foreground"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/models/${model.id}`}
              className="min-w-0 truncate outline-none focus-visible:underline"
            >
              <code className="font-mono text-[13px] font-medium text-foreground">
                {model.id}
              </code>
            </Link>
            <CopyIdButton id={model.id} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <MetaItem label={t("tableHeaderContext")}>
              {formatTokens(model.maxInputTokens)}
            </MetaItem>
            <MetaItem label={t("tableHeaderMaxOutput")}>
              {formatTokens(model.maxOutputTokens)}
            </MetaItem>
            <MetaItem label={t("tableHeaderInput")}>
              {formatCompactPricePerMillionTokens(model.pricing.input)}
            </MetaItem>
            <MetaItem label={t("tableHeaderOutput")}>
              {formatCompactPricePerMillionTokens(model.pricing.output)}
            </MetaItem>
            {intelligence !== undefined && (
              <MetaItem label={t("tableHeaderIntelligence")}>
                <span className={getScoreColor(intelligence, 100)}>
                  {formatScore(intelligence)}
                </span>
              </MetaItem>
            )}
            {coding !== undefined && (
              <MetaItem label={t("tableHeaderCoding")}>
                <span className={getScoreColor(coding, 100)}>
                  {formatScore(coding)}
                </span>
              </MetaItem>
            )}
            {speed ? (
              <MetaItem label={t("tableHeaderSpeed")}>
                {Math.round(speed)} tok/s
              </MetaItem>
            ) : null}
            {model.modalities.length > 0 && (
              <span className="text-muted-foreground/70">
                {model.modalities.join(" · ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <span className="uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
      <span className="text-foreground/80">{children}</span>
    </span>
  );
}

export function ModelTableSkeleton() {
  const t = useTranslations("Models");
  return (
    <Table className="text-sm">
      <TableHeader className="bg-foreground/[0.015]">
        <TableRow className="hover:bg-transparent">
          <SkeletonTh>{t("tableHeaderModel")}</SkeletonTh>
          <SkeletonTh className="hidden md:table-cell">
            {t("tableHeaderContext")}
          </SkeletonTh>
          <SkeletonTh className="hidden md:table-cell text-right">
            {t("tableHeaderInput")}
          </SkeletonTh>
          <SkeletonTh className="text-right">
            {t("tableHeaderOutput")}
          </SkeletonTh>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRow key={i} className="hover:bg-transparent">
            <TableCell className="px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4 shrink-0 rounded-none" />
                <Skeleton className="h-3 w-56 rounded-none" />
              </div>
            </TableCell>
            <TableCell className="hidden px-4 py-2.5 md:table-cell">
              <Skeleton className="h-3 w-12 rounded-none" />
            </TableCell>
            <TableCell className="hidden px-4 py-2.5 text-right md:table-cell">
              <Skeleton className="ml-auto h-3 w-12 rounded-none" />
            </TableCell>
            <TableCell className="px-4 py-2.5 text-right">
              <Skeleton className="ml-auto h-3 w-12 rounded-none" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SkeletonTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableHead
      className={`h-11 px-4 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground ${className ?? ""}`}
    >
      {children}
    </TableHead>
  );
}
