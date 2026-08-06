"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Hero quickstart — one card: an underlined tab strip on top, the command for the
 * active tab below the rule. Four ways to point an agent at BitRouter; the CLI /
 * MCP / Agent Skills commands are carried over verbatim from the previous (main)
 * hero quickstart, and Wizard is the interactive `bitrouter init` setup.
 */
type Tab = { key: string; label: string; cmd: string; sub: string };

const TABS: Tab[] = [
  {
    key: "cli",
    label: "CLI",
    cmd: "curl -fsSL https://bitrouter.ai/install.sh | sh",
    sub: "then  bitrouter run claude-code",
  },
  {
    key: "mcp",
    label: "MCP",
    cmd: "npx bitrouter mcp install --client claude",
    sub: "registers bitrouter as an MCP server",
  },
  {
    key: "skills",
    label: "Agent Skills",
    cmd: "npx skills add bitrouter/bitrouter",
    sub: "drop-in skill for any agent",
  },
  {
    key: "wizard",
    label: "Wizard",
    cmd: "bitrouter init",
    sub: "interactive setup · scaffolds bitrouter.yaml",
  },
];

const MONO = "var(--font-mono)";

export function HeroQuickstart() {
  const [active, setActive] = useState("cli");
  const [copied, setCopied] = useState(false);
  const tab = TABS.find((t) => t.key === active) ?? TABS[0];

  const copy = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(tab.cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      style={{
        maxWidth: 580,
        margin: "36px auto 0",
        textAlign: "left",
        border: "1px solid var(--z-rule)",
        borderRadius: 10,
        background: "var(--z-inset)",
        overflow: "hidden",
      }}
    >
      {/* tab strip — inside the card, underline marks the active tab */}
      <div
        role="tablist"
        aria-label="Quickstart method"
        style={{
          display: "flex",
          gap: 4,
          padding: "0 8px",
          borderBottom: "1px solid var(--z-rule)",
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.key)}
              style={{
                position: "relative",
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 12.5,
                padding: "11px 12px",
                border: "none",
                background: "transparent",
                color: on ? "var(--z-ink)" : "var(--z-ink-5)",
                transition: "color .15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  bottom: -1,
                  height: 2,
                  background: on ? "var(--z-blue)" : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* command for the active tab */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px 4px" }}>
        <span style={{ color: "var(--z-green)", fontFamily: MONO, fontSize: 13.5, flex: "0 0 auto" }}>
          $
        </span>
        <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
          <code
            style={{
              fontFamily: MONO,
              fontSize: 13.5,
              color: "var(--z-ink-2)",
              whiteSpace: "nowrap",
            }}
          >
            {tab.cmd}
          </code>
        </div>
        <button
          onClick={copy}
          aria-label={copied ? "Command copied" : "Copy command"}
          style={{
            cursor: "pointer",
            flex: "0 0 auto",
            display: "inline-flex",
            background: "none",
            border: "none",
            padding: 2,
            color: copied ? "var(--z-green)" : "var(--z-ink-6)",
            transition: "color .15s ease",
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <div
        style={{
          padding: "0 15px 12px 33px",
          fontFamily: MONO,
          fontSize: 12.5,
          color: "var(--z-ink-6)",
        }}
      >
        ↳ {tab.sub}
      </div>
    </div>
  );
}
