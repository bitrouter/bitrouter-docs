"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // swallow clipboard errors silently
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--z-rule-2)] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--z-ink-5)] transition-colors hover:border-[var(--z-ink-6)] hover:text-[var(--z-ink)]"
      aria-label={label ?? `Copy ${value}`}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : label ?? "Copy"}
    </button>
  );
}
