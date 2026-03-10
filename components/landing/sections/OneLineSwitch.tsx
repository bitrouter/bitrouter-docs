"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
  {
    key: "human",
    label: "For human",
    snippet: 'base_url = "https://api.bitrouter.ai/v1"',
    tag: "openai-compatible" as string | null,
  },
  {
    key: "agent",
    label: "For agent",
    snippet: "npx skills add BitRouterAI/agent-skills",
    tag: "agent-skills" as string | null,
  },
] as const;

type Mode = (typeof modes)[number]["key"];

export function OneLineSwitch() {
  const [mode, setMode] = useState<Mode>("human");
  const [copied, setCopied] = useState(false);

  const active = modes.find((m) => m.key === mode)!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex flex-col items-stretch gap-1.5 rounded-md border border-border bg-card px-2 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-1.5 sm:py-1.5">
      {/* Segmented toggle */}
      <div className="flex gap-0.5 rounded-sm bg-muted/50 p-0.5 text-xs">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "rounded-sm px-2 py-1 transition-colors",
              mode === m.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Snippet + tag + copy */}
      <div className="flex items-center gap-2 min-w-0">
        <code className="min-w-0 break-all text-xs text-muted-foreground sm:break-normal sm:text-sm">
          {mode === "human" ? (
            <>base_url = &quot;https://api.bitrouter.ai/v1&quot;</>
          ) : (
            <>npx skills add BitRouterAI/agent-skills</>
          )}
        </code>

        {/* Tag */}
        {active.tag && <span className="hidden text-xs text-muted-foreground/50 sm:inline">{active.tag}</span>}

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
          aria-label="Copy snippet"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
