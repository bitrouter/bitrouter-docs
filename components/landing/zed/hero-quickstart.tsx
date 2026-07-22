"use client";

import { useState } from "react";

/**
 * Hero quickstart — a compact tabbed command switcher that replaces the old
 * "Works with …" line. Four ways to point an agent at BitRouter; the CLI / MCP /
 * Agent Skills commands are carried over verbatim from the previous (main) hero
 * quickstart, and Wizard is the interactive `bitrouter init` setup.
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
    <div style={{ maxWidth: 580, margin: "36px auto 0", textAlign: "left" }}>
      {/* tabs — centered segmented control */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <div
          role="tablist"
          aria-label="Quickstart method"
          style={{
            display: "inline-flex",
            border: "1px solid var(--z-rule)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {TABS.map((t, i) => {
            const on = t.key === active;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.key)}
                style={{
                  cursor: "pointer",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  padding: "7px 15px",
                  border: "none",
                  borderLeft: i === 0 ? "none" : "1px solid var(--z-rule)",
                  background: on ? "#12161d" : "transparent",
                  color: on ? "#8fb4ff" : "var(--z-ink-5)",
                  transition: "color .15s ease, background .15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* command box */}
      <div
        style={{
          border: "1px solid var(--z-rule)",
          borderRadius: 10,
          background: "var(--z-inset)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px" }}>
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
            aria-label="Copy command"
            style={{
              cursor: "pointer",
              flex: "0 0 auto",
              background: "none",
              border: "none",
              fontFamily: MONO,
              fontSize: 11.5,
              color: copied ? "var(--z-green)" : "var(--z-ink-6)",
              transition: "color .15s ease",
            }}
          >
            {copied ? "✓ copied" : "copy"}
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
    </div>
  );
}
