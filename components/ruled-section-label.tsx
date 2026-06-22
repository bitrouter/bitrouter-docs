import { cn } from "@/lib/cn";

/**
 * Drafting-board section rule (DS-001 sheet 05).
 * `░ {counter} — {LABEL} ─────────── Sheet {counter} / {total}`
 */
export function RuledSectionLabel({
  label,
  counter,
  total,
  className,
}: {
  label: string;
  counter?: string;
  total?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <span className="shrink-0 font-mono text-[11px] uppercase tracking-hud text-amber tabular-nums">
        ░ {counter ? `${counter} — ` : ""}
        {label}
      </span>
      <span className="h-px flex-1 bg-rule" />
      {total && counter && (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-label text-ink-dim tabular-nums">
          Sheet {counter} / {total}
        </span>
      )}
    </div>
  );
}
