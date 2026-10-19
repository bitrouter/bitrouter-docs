"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const methods = [
  { id: "macos", label: "macOS", command: "curl -fsSL https://bitrouter.ai/install.sh | sh" },
  { id: "linux", label: "Linux", command: "curl -fsSL https://bitrouter.ai/install.sh | sh" },
  { id: "windows", label: "Windows", command: "irm https://bitrouter.ai/install.ps1 | iex" },
  { id: "agent", label: "Set up with an agent", command: "npx skills add bitrouter/bitrouter" },
] as const;

export function InstallTabs() {
  const [selected, setSelected] = useState(0);
  const [copyStatus, setCopyStatus] = useState<{ id: string; state: "copied" | "error" } | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = methods[selected];
  const status = copyStatus?.id === active.id ? copyStatus.state : null;

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(null), 2500);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  function select(index: number) {
    setSelected(index);
    setCopyStatus(null);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(active.command);
      setCopyStatus({ id: active.id, state: "copied" });
    } catch {
      setCopyStatus({ id: active.id, state: "error" });
    }
  }

  return <div className="ws-install">
    <div className="ws-install-header">
      <span className="ws-install-title">Install</span>
      <div className="ws-install-tabs" role="tablist" aria-label="Install BitRouter">
        {methods.map((method, index) => <button
          key={method.id}
          ref={element => { tabs.current[index] = element; }}
          type="button" role="tab" id={`hero-install-tab-${method.id}`}
          aria-controls="hero-install-command" aria-selected={selected === index}
          tabIndex={selected === index ? 0 : -1}
          onClick={() => select(index)}
          onKeyDown={event => {
            const next = event.key === "ArrowRight" ? (index + 1) % methods.length
              : event.key === "ArrowLeft" ? (index + methods.length - 1) % methods.length
              : event.key === "Home" ? 0 : event.key === "End" ? methods.length - 1 : null;
            if (next === null) return;
            event.preventDefault();
            select(next);
            tabs.current[next]?.focus();
          }}
        >{method.label}</button>)}
      </div>
    </div>
    <div id="hero-install-command" role="tabpanel" aria-labelledby={`hero-install-tab-${active.id}`} tabIndex={0}>
      <div className="ws-install-command">
        <span className="ws-install-prompt" aria-hidden="true">{active.id === "windows" ? ">" : "$"}</span>
        <pre><code>{active.command}</code></pre>
        <button type="button" className="ws-install-copy" onClick={copy}
          aria-label={status === "copied" ? "Command copied" : `Copy ${active.label} install command`}>
          {status === "copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
        </button>
      </div>
      <div className="ws-install-hint" role="status">
        {status === "error" ? "Could not copy. Select the command above to copy it manually."
          : status === "copied" ? "Command copied."
          : active.id === "agent" ? <>Then ask your agent: “Set up BitRouter for me.”</>
          : <>Then run <code>bro</code> to finish setup.</>}
      </div>
    </div>
  </div>;
}
