"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Hero quickstart — four ways to point an agent at BitRouter.
 *
 * v3 drops the bordered card: the tab strip is bare uppercase labels marked by
 * an underline, the command sits in a flat --z-wash well with no border or
 * radius, and the hint line hangs below the well rather than inside it.
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
    <div style={{ maxWidth: 560, margin: "64px auto 0", textAlign: "left" }}>
      <div
        role="tablist"
        aria-label="Quickstart method"
        style={{ display: "flex", gap: 26, justifyContent: "center", flexWrap: "wrap" }}
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
                cursor: "pointer",
                border: "none",
                background: "transparent",
                padding: "0 0 6px",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: on ? "var(--z-ink)" : "var(--z-ink-6)",
                borderBottom: `1px solid ${on ? "var(--z-ink)" : "transparent"}`,
                transition: "color .15s ease, border-color .15s ease",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 26,
          padding: "16px 18px",
          background: "var(--z-wash)",
        }}
      >
        <span style={{ color: "var(--z-ink-6)", fontFamily: MONO, fontSize: 13, flex: "0 0 auto" }}>
          $
        </span>
        <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
          <code style={{ fontFamily: MONO, fontSize: 13, color: "var(--z-ink)", whiteSpace: "nowrap" }}>
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
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingLeft: 2,
          fontFamily: MONO,
          fontSize: 12,
          color: "var(--z-ink-6)",
        }}
      >
        ↳ {tab.sub}
      </div>
    </div>
  );
}
