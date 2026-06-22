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
        "inline-flex size-6 shrink-0 items-center justify-center border border-border transition-colors",
        copied
          ? "border-foreground bg-foreground text-background"
          : "text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}
