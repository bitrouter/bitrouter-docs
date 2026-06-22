"use client";

import * as React from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterGroupDef {
  id: string;
  label: string;
  options: FilterOption[];
}

export type FilterState = Record<string, Set<string>>;

interface PanelProps {
  groups: FilterGroupDef[];
  selected: FilterState;
  onToggle: (groupId: string, value: string) => void;
  onClearGroup: (groupId: string) => void;
  onResetAll: () => void;
  labels: {
    title: string;
    filtersOn: string;
    clearAll: string;
  };
}

export function FilterSidebar(props: PanelProps) {
  return (
    <aside className="sticky top-12 hidden max-h-[calc(100vh-3rem)] self-start overflow-y-auto md:block md:w-56 lg:w-64">
      <FilterPanel {...props} />
    </aside>
  );
}

export function FilterSheetTrigger({
  activeCount,
  triggerLabel,
  ...panel
}: PanelProps & {
  activeCount: number;
  triggerLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 font-mono text-[10px] uppercase tracking-widest md:hidden"
        >
          <SlidersHorizontal className="size-3" />
          {triggerLabel}
          {activeCount > 0 && (
            <span className="inline-flex size-4 items-center justify-center bg-foreground text-[9px] tabular-nums text-background">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetTitle className="sr-only">{panel.labels.title}</SheetTitle>
        <div className="h-full overflow-y-auto">
          <FilterPanel {...panel} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterPanel({
  groups,
  selected,
  onToggle,
  onClearGroup,
  onResetAll,
  labels,
}: PanelProps) {
  const totalActive = Object.values(selected).reduce(
    (n, s) => n + s.size,
    0,
  );

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {labels.title}
        </span>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3" />
            {labels.clearAll}
          </button>
        )}
      </div>

      <div>
        {groups.map((group) => {
          const sel = selected[group.id] ?? new Set<string>();
          return (
            <FilterGroup
              key={group.id}
              group={group}
              selected={sel}
              onToggle={(v) => onToggle(group.id, v)}
              onClear={() => onClearGroup(group.id)}
              clearLabel={labels.filtersOn}
            />
          );
        })}
      </div>
    </div>
  );
}

function FilterGroup({
  group,
  selected,
  onToggle,
  onClear,
  clearLabel,
}: {
  group: FilterGroupDef;
  selected: Set<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
  clearLabel: string;
}) {
  const hasSelection = selected.size > 0;
  return (
    <section className="border-b border-border last:border-b-0">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {group.label}
        </h3>
        {hasSelection && (
          <button
            type="button"
            onClick={onClear}
            className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-foreground"
            title={clearLabel}
          >
            <X className="size-3" />
          </button>
        )}
      </header>
      <ul className="pb-2">
        {group.options.length === 0 ? (
          <li className="px-4 py-1.5 font-mono text-[11px] text-muted-foreground/60">
            —
          </li>
        ) : (
          group.options.map((o) => {
            const checked = selected.has(o.value);
            const empty = o.count === 0 && !checked;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  disabled={empty}
                  onClick={() => onToggle(o.value)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-1.5 text-left transition-colors",
                    "hover:bg-foreground/[0.04] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                    checked ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <CheckboxBox checked={checked} />
                  <span className="flex-1 truncate text-[12px]">{o.label}</span>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
                    {o.count}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

function CheckboxBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center border transition-colors",
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background",
      )}
    >
      {checked && <Check className="size-2.5" strokeWidth={2.5} />}
    </span>
  );
}

export function toggleFilterValue(
  state: FilterState,
  groupId: string,
  value: string,
): FilterState {
  const current = new Set(state[groupId] ?? []);
  if (current.has(value)) current.delete(value);
  else current.add(value);
  const next = { ...state, [groupId]: current };
  if (current.size === 0) delete next[groupId];
  return next;
}

export function clearFilterGroup(
  state: FilterState,
  groupId: string,
): FilterState {
  if (!state[groupId]) return state;
  const next = { ...state };
  delete next[groupId];
  return next;
}

export function countActive(state: FilterState): number {
  return Object.values(state).reduce((n, s) => n + s.size, 0);
}
