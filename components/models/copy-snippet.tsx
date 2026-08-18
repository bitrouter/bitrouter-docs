"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";

export function CopySnippet({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    posthog.capture("code_snippet_copied", { label });
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 border-b border-[var(--z-rule-2)] pb-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
        copied
          ? "border-[var(--z-ink)] text-[var(--z-ink)]"
          : "text-[var(--z-ink-5)] hover:border-[var(--z-ink-3)] hover:text-[var(--z-ink-2)]",
        className,
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
