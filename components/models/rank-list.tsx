/* RankList — the right-hand "ranked · this week" panel. Each row links to the
   model page and shows rank · color swatch · provider · id · share % · WoW
   delta (the ▲▼ that gives the "trending" feel). */

import * as React from "react";
import Link from "next/link";
import { ProviderIcon } from "./provider-icon";
import { type RankedRow } from "@/lib/model-usage";

export function RankList({ ranked, total }: { ranked: RankedRow[]; total: number }) {
  if (!ranked.length) {
    return <div className="usage-empty">no routed traffic yet</div>;
  }
  return (
    <>
      <div className="ranklist">
        {ranked.map((r) => {
          const up = r.delta >= 0;
          return (
            <Link href={`/models/${r.id}`} className="rankrow" key={r.id}>
              <span className="rankrow-n">{r.rank}</span>
              <span className="rankrow-sw" style={{ background: r.color }} />
              <ProviderIcon provider={r.provider} size={14} className="mrow-ico" />
              <span className="rankrow-id">{r.id}</span>
              <span className="rankrow-share">{r.share.toFixed(0)}%</span>
              <span className={"rankrow-delta " + (up ? "up" : "down")}>
                {up ? "▲" : "▼"} {Math.abs(r.delta).toFixed(1)}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="ranklist-foot">
        top {ranked.length} of {total} routed models · share of calls
      </div>
    </>
  );
}
