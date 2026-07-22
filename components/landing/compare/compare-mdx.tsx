"use client";

import * as React from "react";
import Link from "next/link";
import "@/components/landing/zed/zed.css";
import { Terminal } from "../zed/terminal";
import { COMPARE_REGISTRY } from "./compare-programs";
import { ZED_LINKS } from "../zed/primitives";

function CompareCell({ text }: { text: string }) {
  const m = text.match(/^([✓✗⚠—])\s*(.*)$/);
  if (!m) return <span style={{ color: "var(--z-ink-2)" }}>{text}</span>;
  const mark = m[1];
  const rest = m[2];
  const color =
    mark === "✓" ? "var(--z-blue)" : mark === "✗" ? "var(--z-ink-8)" : mark === "⚠" ? "var(--z-amber)" : "var(--z-ink-8)";
  return (
    <>
      <span style={{ color, marginRight: rest ? 6 : 0 }}>{mark}</span>
      {rest && <span style={{ color: "var(--z-ink-4)" }}>{rest}</span>}
    </>
  );
}

export function CompareTerminal({ slug, step }: { slug: string; step: string }) {
  const t = COMPARE_REGISTRY[slug]?.terminals[step];
  if (!t) return null;
  return (
    <div style={{ margin: "22px 0" }}>
      <Terminal title={t.term} program={t.prog as never} accentPrompt={false} />
    </div>
  );
}

export function CompareTable({ slug }: { slug: string }) {
  const entry = COMPARE_REGISTRY[slug];
  if (!entry) return null;
  const COLS = "1.6fr 1.1fr 1.1fr";
  return (
    <div style={{ margin: "22px 0", overflowX: "auto" }}>
      <div style={{ minWidth: 620, border: "1px solid var(--z-rule)", borderRadius: 11, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: COLS, background: "var(--z-inset)", borderBottom: "1px solid var(--z-rule)", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
          <div style={{ padding: "13px 18px", color: "var(--z-ink-6)" }}>Feature</div>
          <div style={{ padding: "13px 14px", color: "var(--z-ink-2)" }}>{entry.competitor}</div>
          <div style={{ padding: "13px 14px", color: "var(--z-blue)" }}>BitRouter</div>
        </div>
        {entry.rows.map((r) => (
          <div key={r.feat} style={{ display: "grid", gridTemplateColumns: COLS, borderBottom: "1px solid var(--z-rule-faint)" }}>
            <div style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--z-ink-4)" }}>{r.feat}</div>
            <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5 }}><CompareCell text={r.them} /></div>
            <div style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5, borderLeft: "1px solid var(--z-rule-faint)" }}><CompareCell text={r.br} /></div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--z-ink-6)", flexWrap: "wrap" }}>
        <span><span style={{ color: "var(--z-blue)" }}>✓</span> yes</span>
        <span><span style={{ color: "var(--z-ink-8)" }}>✗</span> no</span>
        <span><span style={{ color: "var(--z-amber)" }}>⚠</span> partial</span>
        <span><span style={{ color: "var(--z-ink-8)" }}>—</span> n/a</span>
      </div>
    </div>
  );
}

export function CompareTradeoffs({ slug }: { slug: string }) {
  const entry = COMPARE_REGISTRY[slug];
  if (!entry) return null;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "18px 0" }}>
      {entry.tradeoffs.map((t) => (
        <li key={t} style={{ display: "flex", gap: 10, fontFamily: "var(--font-mono)", fontSize: 13.5, lineHeight: 1.6, color: "var(--z-ink-3)", marginBottom: 10 }}>
          <span style={{ color: "var(--z-ink-7)", flex: "0 0 auto" }}>└</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const COMPARE_MIGRATION: Record<string, { href: string; label: string }> = {
  "bitrouter-vs-litellm": { href: "/docs/guides/migrate-from-litellm", label: "Read the migration guide →" },
  "bitrouter-vs-openrouter": { href: "/docs/guides/migrate-from-openrouter", label: "Read the migration guide →" },
  "bitrouter-vs-portkey": { href: "/docs/get-started/comparison", label: "Read the full comparison →" },
};

export function CompareCTA({ slug }: { slug: string }) {
  const href = COMPARE_MIGRATION[slug]?.href ?? "/docs";
  const label = COMPARE_MIGRATION[slug]?.label ?? "Read the docs →";
  return (
    <div style={{ display: "flex", gap: 14, margin: "22px 0", flexWrap: "wrap" }}>
      <a href={ZED_LINKS.apiKey} className="zed-btn zed-btn-primary">Get API key →</a>
      <Link href={href} className="zed-btn zed-btn-ghost">{label}</Link>
    </div>
  );
}
