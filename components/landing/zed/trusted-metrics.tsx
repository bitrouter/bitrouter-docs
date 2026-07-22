import { TRUSTED, METRICS } from "./data";

export function TrustedBy() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "48px 34px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--z-ink-6)",
          }}
        >
          Trusted by teams shipping agents in production
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px 48px",
            marginTop: 26,
          }}
        >
          {TRUSTED.map((name) => (
            <span
              key={name}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "#8a93a0",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Metrics() {
  return (
    <section className="zed-section">
      <div className="zed-wrap">
        <div className="zed-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {METRICS.map((m, i) => (
            <div
              key={m.stat}
              style={{
                padding: "32px 26px",
                borderRight: i === METRICS.length - 1 ? "none" : "1px solid var(--z-rule)",
              }}
            >
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 18 }}>{m.stat}</div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--z-ink-4)",
                  marginTop: 8,
                }}
              >
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
