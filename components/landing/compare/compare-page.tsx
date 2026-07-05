"use client";

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import "../mono/mono.css";
import { Terminal } from "../mono/terminal";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";

export interface CompareDiff {
  n: string;
  kicker: string;
  title: string;
  body: string;
  powered: string[];
  term: string;
  prog: () => any[];
}

export interface CompareRow {
  feat: string;
  them: string; // competitor — left column
  br: string;   // BitRouter  — right column (highlighted)
}

export interface ComparePageData {
  competitor: string;
  angle: string;
  migrationHref: string;
  migrationLabel: string;
  differentiators: CompareDiff[];
  tableRows: CompareRow[];
  tradeoffs: string[];
  ctaTitle?: string;  // defaults to "Ready to switch?"
  ctaBody?: string;   // defaults to the migration blurb
}

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

export function ComparePageTemplate({ data }: { data: ComparePageData }) {
  React.useEffect(() => {
    posthog.capture("compare_page_viewed", { competitor: data.competitor });
  }, [data.competitor]);

  return (
    <>
      {/* HERO */}
      <section className="cmpg-hero">
        <div className="wrap">
          <h1 className="h-display cmpg-title">
            BitRouter vs {data.competitor}
          </h1>
          <p className="cmpg-angle">{data.angle}</p>
          <div className="hero-actions">
            <a href={SIGN_IN_URL} className="btn btn-primary">
              Get API key →
            </a>
            <Link href={data.migrationHref} className="btn btn-ghost">
              {data.migrationLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS — reuses .mech-* classes from the landing page */}
      <section className="sec mechs">
        <div className="wrap">
          <div className="mech-rows">
            {data.differentiators.map((d, i) => (
              <div className={"mech-row" + (i % 2 !== 0 ? " rev" : "")} key={d.n}>
                <div className="mech-copy">
                  <div className="eyebrow">
                    <span className="idx">{d.n}</span> {d.kicker}
                  </div>
                  <h3 className="h-display mech-h">{d.title}</h3>
                  <p className="mech-body">{d.body}</p>
                  <div className="mech-powered">
                    <span className="mech-powered-label">Powered by</span>
                    {d.powered.map((p) => (
                      <span className="chip mech-chip" key={p}>{p}</span>
                    ))}
                  </div>
                </div>
                <div className="mech-vis">
                  <Terminal
                    title={d.term}
                    program={d.prog as never}
                    accentPrompt={false}
                    className="mech-term"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE TABLE */}
      <section className="sec compare" id="compare">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h-display sec-title">Feature comparison.</h2>
            <p className="sec-lead">
              BitRouter vs {data.competitor} — side by side.
            </p>
          </div>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-th compare-th-feat">Feature</th>
                  <th className="compare-th compare-th-prod">{data.competitor}</th>
                  <th className="compare-th compare-th-prod">
                    <span className="compare-th-brand">BitRouter</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.tableRows.map((r) => (
                  <tr className="compare-row" key={r.feat}>
                    <th className="compare-feat" scope="row">{r.feat}</th>
                    <td className="compare-cell">
                      <CompareCell text={r.them} />
                    </td>
                    <td className="compare-cell br">
                      <CompareCell text={r.br} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="compare-legend">
            <span><span className="compare-mark compare-mark-yes">✓</span> yes</span>
            <span><span className="compare-mark compare-mark-no">✗</span> no</span>
            <span><span className="compare-mark compare-mark-partial">⚠</span> partial</span>
            <span><span className="compare-mark compare-mark-na">—</span> n/a</span>
          </div>
        </div>
      </section>

      {/* TRADE-OFFS */}
      <section className="sec cmpg-tradeoffs">
        <div className="wrap">
          <div className="cmpg-tradeoffs-head">
            <span className="mut">// When {data.competitor} is the right call</span>
          </div>
          <ul className="cmpg-tradeoffs-list">
            {data.tradeoffs.map((t) => (
              <li key={t} className="cmpg-tradeoff-item">
                <span className="prob-dot">└</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MIGRATION CTA */}
      <section className="sec cta">
        <div className="wrap cta-inner dotgrid">
          <div className="cta-copy">
            <h2 className="h-display cta-title">
              {data.ctaTitle ?? "Ready to switch?"}
            </h2>
            <p className="sec-lead">
              {data.ctaBody ?? "Drop-in replacement — change one URL and one key. The migration guide walks you through it in under five minutes."}
            </p>
            <div className="cta-actions">
              <a href={SIGN_IN_URL} className="btn btn-primary">
                Get API key →
              </a>
              <Link href={data.migrationHref} className="btn btn-ghost">
                {data.migrationLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
