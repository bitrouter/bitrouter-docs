import { BENCH_STATS, BENCH_ROWS } from "./data";

const COLS = "1.6fr 1fr 0.8fr 0.7fr";
const MONO = "var(--font-mono)";

/** Uppercase micro-label used by the stat captions and the table head. */
const microLabel = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--z-ink-6)",
};

/**
 * "Proof, not promises" — the headline outcome numbers beside the run that
 * produced them.
 *
 * v3 takes the terminal chrome off the run: it's a plain ruled table with a
 * bright top rule, which puts the numbers rather than the window first. Blue is
 * spent once, on the cost saving.
 */
export function Benchmark() {
  return (
    <section className="zed-wrap zed-sec" id="benchmark">
      <div
        className="zed-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          columnGap: 72,
          rowGap: 44,
          alignItems: "start",
        }}
      >
        <div>
          <h2 className="zed-display" style={{ fontSize: 40, lineHeight: 1.08 }}>
            Proof, not promises.
          </h2>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--z-ink-5)",
              margin: "22px 0 34px",
              maxWidth: "44ch",
            }}
          >
            Every number here is a real routed run against an all-frontier baseline on the same
            workload — not a projection.
          </p>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {BENCH_STATS.map((s) => (
              <div key={s.label}>
                <div
                  className="zed-display"
                  style={{
                    fontSize: 42,
                    lineHeight: 1,
                    color: s.blue ? "var(--z-blue)" : "var(--z-ink)",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ ...microLabel, marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ ...microLabel, display: "flex", alignItems: "center", paddingBottom: 12 }}>
            run #1428 · coding agent
            <span style={{ marginLeft: "auto" }}>12 calls</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12.5, borderTop: "1px solid var(--z-ink)" }}>
            <div
              style={{
                ...microLabel,
                display: "grid",
                gridTemplateColumns: COLS,
                padding: "12px 0",
                borderBottom: "1px solid var(--z-rule)",
                fontSize: 10.5,
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
                  padding: "13px 0",
                  borderBottom: "1px solid var(--z-rule)",
                }}
              >
                <span style={{ color: "var(--z-ink)" }}>{b.req}</span>
                {/* Frontier picks read one step brighter than the economy ones —
                    enough to spot the escalation without spending a hue on it. */}
                <span style={{ color: b.frontier ? "var(--z-ink-2)" : "var(--z-ink-3)" }}>
                  {b.model}
                </span>
                <span style={{ color: "var(--z-ink-3)" }}>{b.cost}</span>
                <span style={{ color: "var(--z-ink-5)" }}>{b.lat}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                gap: 20,
                padding: "16px 0 0",
                color: "var(--z-ink-5)",
                flexWrap: "wrap",
              }}
            >
              <span>
                total <b style={{ color: "var(--z-ink)", fontWeight: 500 }}>$0.026</b>
              </span>
              <span>
                p50 <b style={{ color: "var(--z-ink)", fontWeight: 500 }}>88ms</b>
              </span>
              <span style={{ marginLeft: "auto", color: "var(--z-ink-2)" }}>saved −80%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
