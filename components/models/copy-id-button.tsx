"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";

export function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    posthog.capture("model_id_copied", { model_id: id });
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : "Copy model ID"}
      aria-label={copied ? "Copied" : "Copy model ID"}
      className={cn(
        "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center border border-[var(--z-rule)] transition-colors",
        copied
          ? "border-[var(--z-ink)] bg-[var(--z-ink)] text-[var(--z-bg)]"
          : "text-[var(--z-ink-6)] hover:border-[var(--z-rule-2)] hover:text-[var(--z-ink)]",
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}
