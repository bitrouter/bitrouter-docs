import { cn } from "@/lib/cn";

export function SectionRule({
  n,
  total,
  label,
  className,
}: {
  n: string;
  total?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("my-14 flex items-center gap-3.5", className)}>
      <span className="font-mono text-[11px] uppercase tracking-hud text-amber">
        ░ {n} — {label}
      </span>
      <span className="h-px flex-1 bg-rule" />
      {total && (
        <span className="font-mono text-[10px] uppercase tracking-label text-ink-dim">
          Sheet {n} / {total}
        </span>
      )}
    </div>
  );
}
