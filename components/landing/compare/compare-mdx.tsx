"use client";

import * as React from "react";
import Link from "next/link";
import { Terminal } from "../mono/terminal";
import { COMPARE_REGISTRY } from "./compare-programs";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";

function CompareCell({ text }: { text: string }) {
  const m = text.match(/^([✓✗⚠—])\s*(.*)$/);
  if (!m) return <span className="compare-mark-text">{text}</span>;
  const mark = m[1];
  const rest = m[2];
  const cls =
    mark === "✓" ? "compare-mark-yes"
    : mark === "✗" ? "compare-mark-no"
    : mark === "⚠" ? "compare-mark-partial"
    : "compare-mark-na";
  return (
    <>
      <span className={`compare-mark ${cls}`}>{mark}</span>
      {rest && <span className="compare-mark-text">{rest}</span>}
    </>
  );
}

export function CompareTerminal({ slug, step }: { slug: string; step: string }) {
  const t = COMPARE_REGISTRY[slug]?.terminals[step];
  if (!t) return null;
  return (
    <div className="mech-vis">
      <Terminal title={t.term} program={t.prog as never} accentPrompt={false} className="mech-term" />
    </div>
  );
}

export function CompareTable({ slug }: { slug: string }) {
  const entry = COMPARE_REGISTRY[slug];
  if (!entry) return null;
  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th className="compare-th compare-th-feat">Feature</th>
            <th className="compare-th compare-th-prod">{entry.competitor}</th>
            <th className="compare-th compare-th-prod">
              <span className="compare-th-brand">BitRouter</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entry.rows.map((r) => (
            <tr className="compare-row" key={r.feat}>
              <th className="compare-feat" scope="row">{r.feat}</th>
              <td className="compare-cell"><CompareCell text={r.them} /></td>
              <td className="compare-cell br"><CompareCell text={r.br} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="compare-legend">
        <span><span className="compare-mark compare-mark-yes">✓</span> yes</span>
        <span><span className="compare-mark compare-mark-no">✗</span> no</span>
        <span><span className="compare-mark compare-mark-partial">⚠</span> partial</span>
        <span><span className="compare-mark compare-mark-na">—</span> n/a</span>
      </div>
    </div>
  );
}

export function CompareTradeoffs({ slug }: { slug: string }) {
  const entry = COMPARE_REGISTRY[slug];
  if (!entry) return null;
  return (
    <ul className="cmpg-tradeoffs-list">
      {entry.tradeoffs.map((t) => (
        <li key={t} className="cmpg-tradeoff-item"><span className="prob-dot">└</span>{t}</li>
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
    <div className="cta-actions">
      <a href={SIGN_IN_URL} className="btn btn-primary">Get API key →</a>
      <Link href={href} className="btn btn-ghost">{label}</Link>
    </div>
  );
}
