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
        "inline-flex items-center gap-1.5 border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
        copied
          ? "border-foreground bg-foreground text-background"
          : "text-muted-foreground hover:border-foreground hover:text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
