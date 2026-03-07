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
    snippet: "Read https://bitrouter.ai/skills/<SKILL>.md and follow the instructions",
    tag: null,
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
    <div className="terminal-frame inline-flex items-center gap-3 px-1.5 py-1.5">
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

      {/* Snippet */}
      <code className="text-sm text-muted-foreground">
        {mode === "human" ? (
          <>base_url = &quot;https://api.bitrouter.ai/v1&quot;</>
        ) : (
          <>
            Read bitrouter.ai/skills/
            <span className="text-foreground/60">&lt;SKILL&gt;</span>
            .md and follow the instructions
          </>
        )}
      </code>

      {/* Tag */}
      {active.tag && <span className="text-xs text-muted-foreground/50">{active.tag}</span>}

      {/* Copy */}
      <button
        onClick={handleCopy}
        className="text-muted-foreground/50 transition-colors hover:text-foreground"
        aria-label="Copy snippet"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
