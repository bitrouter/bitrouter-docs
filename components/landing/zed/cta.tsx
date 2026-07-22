import { INSTALL_CMD } from "./data";
import { CornerTicks, Cursor, ZED_LINKS } from "./primitives";

export function FinalCta() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "80px 34px" }}>
        <div
          style={{
            position: "relative",
            border: "1px solid var(--z-rule)",
            borderRadius: 14,
            overflow: "hidden",
            padding: "64px 34px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(60% 70% at 50% 0%, rgba(107,155,255,0.08), transparent 60%)",
            }}
          />
          <CornerTicks />
          <div style={{ position: "relative" }}>
            <h2
              className="zed-display"
              style={{ fontSize: "clamp(34px, 5.5vw, 52px)", lineHeight: 1.02, color: "var(--z-blue)", margin: "0 auto", maxWidth: "18ch" }}
            >
              Stop overpaying for tokens.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 15,
                color: "var(--z-ink-4)",
                margin: "22px auto 0",
                maxWidth: "48ch",
              }}
            >
              Point your agent at bitrouter and cut cost on the next run — quality held, nothing to
              rewrite.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 11,
                background: "var(--z-inset)",
                border: "1px solid var(--z-rule)",
                borderRadius: 8,
                padding: "14px 16px",
                maxWidth: 440,
                margin: "30px auto 0",
              }}
            >
              <span style={{ color: "var(--z-blue)", fontFamily: "var(--font-mono)", fontSize: 13 }}>$</span>
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--z-ink)",
                  flex: 1,
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {INSTALL_CMD}
              </code>
              <Cursor />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
              <a className="zed-btn zed-btn-primary" href={ZED_LINKS.apiKey}>
                Get API key <span className="zed-key on-primary">K</span>
              </a>
              <a className="zed-btn zed-btn-ghost" href={ZED_LINKS.cloneSource}>
                Clone source <span className="zed-key on-ghost">C</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
