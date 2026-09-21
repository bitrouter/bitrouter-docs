"use client";

import { Check, Copy } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { INSTALL_CMD } from "./data";

const INSTALL_METHODS = [
  {
    id: "curl",
    label: "curl",
    command: INSTALL_CMD,
    note: "Install the binary, then run bitrouter to configure a provider and route.",
  },
  {
    id: "powershell",
    label: "PowerShell",
    command:
      'powershell -ExecutionPolicy Bypass -Command "irm https://github.com/bitrouter/bitrouter/releases/download/v1.0.0-alpha.31/bitrouter-installer.ps1 | iex"',
    note: "Install the native Windows binary, then run bro to configure a provider and route.",
  },
  {
    id: "npm",
    label: "npm",
    command: "npm install -g bitrouter",
    note: "Install the binary, then run bitrouter to configure a provider and route.",
  },
  {
    id: "brew",
    label: "brew",
    command: "brew install bitrouter/tap/bitrouter",
    note: "Install the binary, then run bitrouter to configure a provider and route.",
  },
  {
    id: "agent-skill",
    label: "Agent Skill",
    command: "npx skills add bitrouter/bitrouter",
    note: 'Then ask your agent: "Set up BitRouter for this project."',
  },
] as const;

export function HeroQuickstart() {
  const [activeId, setActiveId] = useState<(typeof INSTALL_METHODS)[number]["id"]>("curl");
  const [copied, setCopied] = useState(false);
  const active = INSTALL_METHODS.find((method) => method.id === activeId) ?? INSTALL_METHODS[0];

  const copy = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(active.command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % INSTALL_METHODS.length;
    if (event.key === "ArrowLeft") next = (index - 1 + INSTALL_METHODS.length) % INSTALL_METHODS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = INSTALL_METHODS.length - 1;
    if (next === index) return;

    event.preventDefault();
    const method = INSTALL_METHODS[next];
    setActiveId(method.id);
    document.getElementById(`install-tab-${method.id}`)?.focus();
  };

  return (
    <div className="zed-install">
      <div className="zed-install-tabs" role="tablist" aria-label="Install BitRouter">
        {INSTALL_METHODS.map((method, index) => {
          const selected = method.id === active.id;
          return (
            <button
              type="button"
              role="tab"
              id={`install-tab-${method.id}`}
              aria-controls="install-command"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={selected ? "active" : undefined}
              key={method.id}
              onClick={() => {
                setActiveId(method.id);
                setCopied(false);
              }}
              onKeyDown={(event) => moveTab(event, index)}
            >
              {method.label}
            </button>
          );
        })}
      </div>

      <div
        className="zed-install-command"
        id="install-command"
        role="tabpanel"
        aria-labelledby={`install-tab-${active.id}`}
      >
        <span className="zed-install-prompt">$</span>
        <div className="zed-install-code">
          <code>{active.command}</code>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Command copied" : "Copy command"}
          className={copied ? "zed-install-copy copied" : "zed-install-copy"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="zed-install-note">↳ {active.note}</div>
    </div>
  );
}
