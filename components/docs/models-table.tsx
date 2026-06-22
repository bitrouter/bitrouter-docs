"use client";
import { useMemo, useState } from "react";
import snapshot from "@/.models-snapshot.json";

type Row = {
  id: string; name: string; providers: number;
  maxInputTokens: number | null;
  inputUsdPerM: number | null; outputUsdPerM: number | null;
  inputModalities: string[];
};

const fmtUsd = (v: number | null) => (v == null ? "—" : `$${v.toFixed(2)}`);
const fmtCtx = (v: number | null) =>
  v == null ? "—" : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;

export function ModelsTable() {
  const rows = (snapshot as { models: Row[] }).models;
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? rows.filter((r) => r.id.toLowerCase().includes(t) || r.name.toLowerCase().includes(t)) : rows;
  }, [q, rows]);

  return (
    <div>
      <input
        type="search"
        placeholder={`Filter ${rows.length} models…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">Model</th>
              <th className="py-2 pr-4">Context</th>
              <th className="py-2 pr-4">Input $/M</th>
              <th className="py-2 pr-4">Output $/M</th>
              <th className="py-2 pr-4">Providers</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-fd-border/50">
                <td className="py-2 pr-4 font-mono text-xs">{r.id}</td>
                <td className="py-2 pr-4">{fmtCtx(r.maxInputTokens)}</td>
                <td className="py-2 pr-4">{fmtUsd(r.inputUsdPerM)}</td>
                <td className="py-2 pr-4">{fmtUsd(r.outputUsdPerM)}</td>
                <td className="py-2 pr-4">{r.providers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="py-4 text-sm text-fd-muted-foreground">No models match “{q}”.</p>}
    </div>
  );
}
