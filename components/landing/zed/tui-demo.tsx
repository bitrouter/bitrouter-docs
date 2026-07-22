"use client";

import { useEffect, useRef, useState } from "react";
import { SESSIONS, TRACE_KIND, FOOTER_STAT } from "./data";
import { Cursor, highlightYamlLine } from "./primitives";

const REVEAL_MS = 360;

export function TuiDemo() {
  const [sel, setSel] = useState(0);
  const [reveal, setReveal] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cur = SESSIONS[sel];
  const traceLen = cur.trace.length;

  useEffect(() => {
    setReveal(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setReveal((r) => {
        if (r > traceLen) {
          if (timer.current) clearInterval(timer.current);
          return r;
        }
        return r + 1;
      });
    }, REVEAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [sel, traceLen]);

  const shown = cur.trace.slice(0, Math.min(reveal, traceLen));
  const streaming = reveal <= traceLen;
  const showResult = reveal > traceLen;

  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "48px 34px 40px" }}>
        <div style={{ overflowX: "auto" }}>
          <div className="zed-term" style={{ minWidth: 780, fontFamily: "var(--font-mono)" }}>
            {/* titlebar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 14px",
                background: "var(--z-panel-header)",
                borderBottom: "1px solid var(--z-rule)",
                fontSize: 12,
                color: "var(--z-ink-5)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 15,
                  height: 15,
                  border: "1px solid var(--z-blue)",
                  borderRadius: 4,
                  color: "var(--z-blue)",
                  fontSize: 9,
                }}
              >
                ≋
              </span>
              <span style={{ color: "var(--z-ink-2)" }}>bitrouter</span>
              <span style={{ color: "var(--z-ink-7)" }}>v0.7</span>
              <span style={{ color: "var(--z-ink-7)" }}>⑂ main</span>
              <span
                style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  color: "var(--z-ink-6)",
                }}
              >
                <span>{cur.objTag}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--z-green)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--z-green-dot)" }} />
                  live
                </span>
              </span>
            </div>

            {/* body */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "222px minmax(0,1.02fr) minmax(0,1.05fr)",
                minHeight: 474,
              }}
            >
              {/* sessions rail */}
              <div
                style={{
                  background: "var(--z-panel-header)",
                  borderRight: "1px solid var(--z-rule)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 9.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--z-ink-7)",
                    padding: "12px 14px 10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  sessions <span style={{ marginLeft: "auto", color: "var(--z-ink-8)" }}>{SESSIONS.length}</span>
                </div>
                {SESSIONS.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setSel(i)}
                    style={{
                      textAlign: "left",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 14px",
                      background: i === sel ? "var(--z-panel-sel)" : "transparent",
                      boxShadow: i === sel ? "inset 2px 0 0 var(--z-blue)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: i === sel ? "#eef1f4" : "#a7adb8" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flex: "0 0 auto" }} />
                      <span style={{ flex: "1 1 auto" }}>{s.name}</span>
                      <span style={{ fontSize: 10, color: s.costColor }}>{s.cost}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--z-ink-7)", marginTop: 3, paddingLeft: 13 }}>{s.sub}</div>
                  </button>
                ))}
                <div
                  style={{
                    marginTop: "auto",
                    padding: "11px 14px",
                    borderTop: "1px solid var(--z-rule)",
                    fontSize: 10,
                    color: "var(--z-ink-7)",
                  }}
                >
                  registry <span style={{ color: "var(--z-ink-6)" }}>12 models · 6 mcp · 9 skills</span>
                </div>
              </div>

              {/* routed trace */}
              <div style={{ borderRight: "1px solid var(--z-rule)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "11px 15px", borderBottom: "1px solid var(--z-rule-faint)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--z-ink-2)" }}>{cur.name}</span>
                  <span style={{ fontSize: 10, color: "var(--z-blue)", border: "1px solid #2d3a55", borderRadius: 4, padding: "2px 7px" }}>{cur.objTag}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--z-ink-6)" }}>{cur.calls}</span>
                </div>
                <div style={{ padding: "12px 15px 4px", fontSize: 11.5, color: "var(--z-ink-5)" }}>{cur.goal}</div>

                <div style={{ padding: "8px 15px", fontSize: 12, lineHeight: 1.9, flex: 1 }}>
                  <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--z-ink-7)", marginBottom: 9 }}>
                    routed trace
                  </div>
                  {shown.map((t, i) => {
                    const k = TRACE_KIND[t.kind];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap" }}>
                        <span style={{ color: k.color, fontSize: 10, letterSpacing: "0.04em", flex: "0 0 auto" }}>{k.tag}</span>
                        <span style={{ color: "var(--z-ink-5)", flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{t.action}</span>
                        <span style={{ color: "var(--z-ink-7)", flex: "0 0 auto" }}>→</span>
                        <span style={{ color: t.esc ? "var(--z-amber)" : "var(--z-ink-2)", flex: "0 0 auto" }}>{t.target}</span>
                        <span style={{ color: "var(--z-ink-7)", fontSize: 11, flex: "0 0 auto", marginLeft: 6 }}>
                          {t.esc ? "↑ " : ""}
                          {t.meta}
                        </span>
                      </div>
                    );
                  })}
                  {streaming && (
                    <div>
                      <Cursor style={{ transform: "translateY(0.12em)" }} />
                    </div>
                  )}
                  {showResult && <div style={{ color: "var(--z-green)", marginTop: 7 }}>{cur.result}</div>}
                </div>

                <div style={{ borderTop: "1px solid var(--z-rule-faint)", padding: "12px 15px 14px" }}>
                  <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--z-ink-7)", marginBottom: 10 }}>
                    resources · this run
                  </div>
                  {cur.ledger.map((r) => (
                    <div key={r.label} style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 8, fontSize: 11 }}>
                      <span style={{ width: 58, flex: "0 0 auto", color: "var(--z-blue)", fontSize: 10, letterSpacing: "0.06em" }}>{r.label}</span>
                      <span style={{ color: "var(--z-ink-4)" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* policy pane */}
              <div style={{ display: "flex", flexDirection: "column", fontSize: 12.5, lineHeight: 1.9 }}>
                <div style={{ padding: "11px 16px", fontSize: 11, color: "var(--z-ink-6)", borderBottom: "1px solid var(--z-rule-faint)", display: "flex", alignItems: "center" }}>
                  policy.yaml <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>{cur.policyVer}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "30px 1fr", padding: "10px 0 6px", flex: 1 }}>
                  <div style={{ textAlign: "right", paddingRight: 10, color: "var(--z-ink-8)", userSelect: "none" }}>
                    {cur.policy.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <div style={{ paddingRight: 16 }}>{cur.policy.map((l, i) => highlightYamlLine(l, i))}</div>
                </div>
                <div style={{ borderTop: "1px solid var(--z-rule-faint)", padding: "12px 16px 14px" }}>
                  <div style={{ color: "var(--z-ink-bright)", fontSize: 12, marginBottom: 10 }}>{cur.summary}</div>
                  <div style={{ fontSize: 10, color: "var(--z-ink-6)", marginBottom: 5 }}>{cur.beforeLabel}</div>
                  <div style={{ height: 5, background: "var(--z-rule-faint)" }}>
                    <i style={{ display: "block", height: "100%", width: cur.beforeW, background: "#5b626d" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--z-ink-2)", margin: "9px 0 5px" }}>{cur.afterLabel}</div>
                  <div style={{ height: 5, background: "var(--z-rule-faint)" }}>
                    <i style={{ display: "block", height: "100%", width: cur.afterW, background: "var(--z-blue)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* footer keybinds */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "var(--z-panel-header)",
                borderTop: "1px solid var(--z-rule)",
                padding: "7px 14px",
                fontSize: 11,
                color: "var(--z-ink-6)",
                flexWrap: "wrap",
              }}
            >
              <span><span style={{ color: "var(--z-ink-4)" }}>↑↓</span> session</span>
              <span><span style={{ color: "var(--z-ink-4)" }}>enter</span> inspect</span>
              <span><span style={{ color: "var(--z-ink-4)" }}>tab</span> pane</span>
              <span><span style={{ color: "var(--z-ink-4)" }}>o</span> objective</span>
              <span><span style={{ color: "var(--z-ink-4)" }}>/</span> filter</span>
              <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>{FOOTER_STAT}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--z-ink-7)", marginTop: 14 }}>
          ↑ click a session — watch how BitRouter routed models, MCP tools, skills &amp; harness for that workflow
        </div>
      </div>
    </section>
  );
}
