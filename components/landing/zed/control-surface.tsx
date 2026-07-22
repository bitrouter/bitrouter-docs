import { CAPABILITIES, POLICY_LOCK } from "./data";
import { Kicker, TrafficLights, YamlBlock } from "./primitives";

export function ControlSurface() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "88px 34px" }}>
        <div style={{ maxWidth: 760 }}>
          <Kicker>// the policy</Kicker>
          <h2 className="zed-display" style={{ fontSize: 46, lineHeight: 1.06, margin: "16px 0 0" }}>
            One policy.{" "}
            <span style={{ color: "var(--z-blue)" }}>Every routing decision under your control.</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--z-ink-4)",
              margin: "18px 0 0",
              maxWidth: "64ch",
            }}
          >
            One versioned <span style={{ color: "var(--z-ink-2)" }}>policy-lock.yaml</span> decides every
            model, tool and agent call — deterministic, no LLM in the path, off by default. Declare the
            tiers; the adequacy ledger learns the cheap routes online and escalates the moment one fails.
          </p>
        </div>

        <div
          className="zed-grid-2"
          style={{
            border: "1px solid var(--z-rule)",
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "0.92fr 1.08fr",
          }}
        >
          {/* policy-lock.yaml panel */}
          <div style={{ padding: 28, background: "var(--z-inset)", borderRight: "1px solid var(--z-rule)" }}>
            <div
              style={{
                background: "var(--z-panel)",
                border: "1px solid var(--z-rule)",
                borderRadius: 9,
                overflow: "hidden",
                boxShadow: "0 20px 50px -30px rgba(0,0,0,0.8)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 13px",
                  background: "var(--z-panel-header)",
                  borderBottom: "1px solid var(--z-rule)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--z-ink-6)",
                }}
              >
                <TrafficLights />
                <span style={{ marginLeft: 4 }}>policy-lock.yaml</span>
              </div>
              <YamlBlock
                lines={POLICY_LOCK}
                numbered
                style={{ padding: "14px 16px", fontSize: 12, lineHeight: 1.85 }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                lineHeight: 1.6,
                color: "var(--z-ink-6)",
                marginTop: 16,
              }}
            >
              A deterministic table plus an opt-in adequacy ledger — the same file the act → observe →
              evaluate → learn loop writes back to.
            </div>
          </div>

          {/* capability groups */}
          <div style={{ padding: "34px 34px 22px" }}>
            {CAPABILITIES.map((grp) => (
              <div key={grp.group} style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 1, background: grp.tint }} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--z-ink-2)",
                    }}
                  >
                    {grp.group}
                  </span>
                  <span style={{ flex: 1, height: 1, background: "var(--z-rule)" }} />
                </div>
                <div
                  className="zed-grid-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px" }}
                >
                  {grp.features.map((f) => (
                    <div key={f.name}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#e8eaed" }}>
                          {f.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            color: "var(--z-blue)",
                            background: "var(--z-blue-chip-bg)",
                            border: "1px solid var(--z-blue-chip-border)",
                            borderRadius: 3,
                            padding: "1px 5px",
                          }}
                        >
                          {f.knob}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: "var(--z-ink-5)",
                          marginTop: 5,
                        }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
