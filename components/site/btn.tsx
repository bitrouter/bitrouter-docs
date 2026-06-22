import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "mono";

const base =
  "inline-flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-button border transition-colors disabled:opacity-35 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-amber text-bg border-amber hover:bg-amber-hi hover:border-amber-hi",
  ghost:
    "bg-transparent text-ink border-ink hover:bg-ink hover:text-bg",
  mono:
    "bg-transparent text-ink-dim border-rule hover:text-ink hover:border-ink",
};

export function Btn({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button {...rest} className={cn(base, variants[variant], className)}>
      {children}
    </button>
  );
}
