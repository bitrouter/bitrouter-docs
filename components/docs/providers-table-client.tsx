"use client";
import { useMemo, useState } from "react";

export type ProviderRow = {
  slug: string;
  name: string;
  status: string;
  models: number;
  registryUrl: string;
};

export function ProvidersTableClient({ rows }: { rows: ProviderRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? rows.filter((r) => r.name.toLowerCase().includes(t) || r.slug.toLowerCase().includes(t))
      : rows;
  }, [q, rows]);

  return (
    <div>
      <input
        type="search"
        placeholder={`Filter ${rows.length} providers…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">Provider</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Models</th>
              <th className="py-2 pr-4">Registry</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.slug} className="border-t border-fd-border/50">
                <td className="py-2 pr-4">
                  <a href={`/providers/${r.slug}`} className="text-fd-primary hover:underline">
                    {r.name}
                  </a>
                </td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">{r.models}</td>
                <td className="py-2 pr-4">
                  <a
                    href={r.registryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-fd-muted-foreground hover:underline"
                  >
                    manifest ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="py-4 text-sm text-fd-muted-foreground">No providers match “{q}”.</p>
      )}
    </div>
  );
}
