import { cn } from "@/lib/cn";

function Cell({
  k,
  v,
  divide,
  accent,
}: {
  k: string;
  v: string;
  divide?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={cn("px-3 py-2", divide && "border-r border-ink")}>
      <div className="text-ink-dim mb-1">{k}</div>
      <div className={cn("text-[12px]", accent && "text-amber")}>{v}</div>
    </div>
  );
}

export function TitleBlock({
  project,
  drawing,
  scale,
  rev,
  sheet,
  className,
}: {
  project: string;
  drawing: string;
  scale: string;
  rev: string;
  sheet: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-[360px] border border-ink font-mono text-[9px] uppercase tracking-label text-ink",
        className,
      )}
    >
      <div className="grid grid-cols-2 border-b border-ink">
        <Cell k="Project" v={project} divide />
        <Cell k="Drawing" v={drawing} />
      </div>
      <div className="grid grid-cols-3">
        <Cell k="Scale" v={scale} divide />
        <Cell k="Rev" v={rev} accent divide />
        <Cell k="Sheet" v={sheet} />
      </div>
    </div>
  );
}
