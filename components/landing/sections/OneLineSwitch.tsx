"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
  {
    key: "cli",
    label: "CLI",
    prefix: "curl",
    body: "-fsSL https://install.bitrouter.ai | sh",
    snippet: "curl -fsSL https://install.bitrouter.ai | sh",
  },
  {
    key: "prompt",
    label: "Prompt",
    prefix: "@agent",
    body: "route all LLM calls through BitRouter at http://localhost:8787/v1",
    snippet:
      "@agent route all LLM calls through BitRouter at http://localhost:8787/v1",
  },
  {
    key: "skills",
    label: "Skills",
    prefix: "npx",
    body: "skills add BitRouterAI/agent-skills",
    snippet: "npx skills add BitRouterAI/agent-skills",
  },
] as const;

type Mode = (typeof modes)[number]["key"];

export function OneLineSwitch() {
  const [mode, setMode] = useState<Mode>("cli");
  const [copied, setCopied] = useState(false);

  const active = modes.find((m) => m.key === mode)!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Tab bar */}
      <div className="flex border-b border-border px-4">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "relative px-4 py-2.5 text-sm transition-colors",
              mode === m.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
            {mode === m.key && (
              <span className="absolute inset-x-4 -bottom-px h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Snippet + copy */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs sm:text-sm">
          <span className="text-purple-500 dark:text-purple-400">{active.prefix}</span>
          {" "}{active.body}
        </code>

        <button
          onClick={handleCopy}
          className="shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
          aria-label="Copy snippet"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}
