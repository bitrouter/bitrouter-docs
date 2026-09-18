"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { INSTALL_CMD } from "./data";

/**
 * One recommended self-host path. Alternate package managers and agent-specific
 * setup live in the quickstart instead of competing for attention in the hero.
 */
const MONO = "var(--font-mono)";

export function HeroQuickstart() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "58px auto 0", textAlign: "left" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
          background: "var(--z-wash)",
        }}
      >
        <span style={{ color: "var(--z-ink-6)", fontFamily: MONO, fontSize: 13, flex: "0 0 auto" }}>
          $
        </span>
        <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
          <code style={{ fontFamily: MONO, fontSize: 13, color: "var(--z-ink)", whiteSpace: "nowrap" }}>
            {INSTALL_CMD}
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
        ↳ install the binary, then run <span style={{ color: "var(--z-ink-3)" }}>bitrouter</span> to configure a provider and route
      </div>
    </div>
  );
}
