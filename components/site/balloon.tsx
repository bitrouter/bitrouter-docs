import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Balloon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full border border-amber bg-paper font-mono text-[11px] text-amber",
        className,
      )}
    >
      {children}
    </span>
  );
}
