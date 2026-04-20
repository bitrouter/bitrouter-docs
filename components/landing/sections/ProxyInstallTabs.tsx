"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type InstallMethod = {
  key: string;
  label: string;
  recommended?: boolean;
  prefix: string;
  body: string;
  snippet: string;
  hint: string;
};

const methods: InstallMethod[] = [
  {
    key: "skills",
    label: "Skills",
    recommended: true,
    prefix: "npx",
    body: "skills add bitrouter/agent-skills",
    snippet: "npx skills add bitrouter/agent-skills",
    hint: "Let your agent handle install, key detection, and launch",
  },
  {
    key: "curl",
    label: "curl",
    prefix: "curl",
    body: "-fsSL https://install.bitrouter.ai | sh",
    snippet: "curl -fsSL https://install.bitrouter.ai | sh",
    hint: "One-liner install for macOS and Linux",
  },
  {
    key: "brew",
    label: "Homebrew",
    prefix: "brew",
    body: "install bitrouter/tap/bitrouter",
    snippet: "brew install bitrouter/tap/bitrouter",
    hint: "Tap-based install on macOS",
  },
  {
    key: "cargo",
    label: "Cargo",
    prefix: "cargo",
    body: "install bitrouter",
    snippet: "cargo install bitrouter",
    hint: "Build from crates.io (requires Rust 1.80+)",
  },
];

export function ProxyInstallTabs() {
  const [active, setActive] = useState<string>("skills");
  const [copied, setCopied] = useState(false);

  const current = methods.find((m) => m.key === active)!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(current.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-background">
      <div className="flex border-b border-border px-2 overflow-x-auto">
        {methods.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-xs font-mono transition-colors",
              active === m.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-1.5">
              {m.label}
              {m.recommended && (
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  recommended
                </span>
              )}
            </span>
            {active === m.key && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs sm:text-sm">
          <span className="text-purple-500 dark:text-purple-400">{current.prefix}</span>
          {" "}{current.body}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
          aria-label="Copy snippet"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>

      <div className="border-t border-border/60 px-4 py-2">
        <span className="text-[10px] font-mono text-muted-foreground/70">
          {current.hint}
        </span>
      </div>
    </div>
  );
}
