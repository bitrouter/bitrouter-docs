import { BENCH_STATS, BENCH_ROWS } from "./data";

const COLS = "1.6fr 1fr 0.8fr 0.7fr";

export function Benchmark() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "88px 34px" }}>
        <div
          className="zed-grid-2"
          style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 56, alignItems: "center" }}
        >
          <div>
            <h2 className="zed-display" style={{ fontSize: 46, lineHeight: 1.06, color: "var(--z-ink)" }}>
              Proof, <span style={{ color: "var(--z-blue)" }}>not promises.</span>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "var(--z-ink-4)",
                margin: "18px 0 26px",
                maxWidth: "46ch",
              }}
            >
              Every number here is a real routed run against an all-frontier baseline on the same
              workload — not a projection.
            </p>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {BENCH_STATS.map((s) => (
                <div key={s.label}>
                  <div
                    className="zed-display"
                    style={{ fontSize: 44, lineHeight: 1, color: s.blue ? "var(--z-blue)" : "var(--z-ink)" }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--z-ink-6)", marginTop: 6 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="zed-term"
            style={{ boxShadow: "0 24px 60px -30px rgba(0,0,0,0.7)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                background: "var(--z-panel-header)",
                borderBottom: "1px solid var(--z-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--z-ink-6)",
              }}
            >
              ┌ run #1428 · coding agent
              <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>12 calls</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  padding: "10px 15px",
                  color: "var(--z-ink-7)",
                  borderBottom: "1px solid var(--z-rule-faint)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <span>request</span>
                <span>routed</span>
                <span>cost</span>
                <span>lat</span>
              </div>
              {BENCH_ROWS.map((b) => (
                <div
                  key={b.req}
                  style={{
                    display: "grid",
                    gridTemplateColumns: COLS,
                    padding: "9px 15px",
                    borderBottom: "1px solid var(--z-rule-faint)",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--z-ink-2)" }}>{b.req}</span>
                  <span style={{ color: b.frontier ? "var(--z-amber)" : "var(--z-ink-2)" }}>{b.model}</span>
                  <span style={{ color: "var(--z-cost)" }}>{b.cost}</span>
                  <span style={{ color: "var(--z-ink-4)" }}>{b.lat}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 16, padding: "12px 15px", color: "var(--z-ink-4)", flexWrap: "wrap" }}>
                <span>total <b style={{ color: "var(--z-green)" }}>$0.026</b></span>
                <span>p50 <b style={{ color: "var(--z-ink-bright)" }}>88ms</b></span>
                <span style={{ marginLeft: "auto", color: "var(--z-blue)" }}>saved −80%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
