import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({
  n,
  children,
  className,
}: {
  n?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-[10px] uppercase tracking-eyebrow text-amber",
        className,
      )}
    >
      ░ {n ? `${n} · ` : ""}
      {children}
    </div>
  );
}
