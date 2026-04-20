import { cn } from "@/lib/cn";

export function RuledSectionLabel({
  label,
  counter,
  className,
}: {
  label: string;
  counter?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="shrink-0 text-xs font-mono uppercase tracking-widest text-foreground">
        {label}
      </span>
      {counter && (
        <span className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 tabular-nums">
          {counter}
        </span>
      )}
      <div className="flex-1 border-t border-border" />
    </div>
  );
}
