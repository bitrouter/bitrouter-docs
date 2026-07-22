import { STEPS, type Step } from "./data";

function SmallTicks() {
  const base: React.CSSProperties = { position: "absolute", width: 9, height: 9, pointerEvents: "none" };
  return (
    <>
      <span style={{ ...base, top: 7, left: 7, borderTop: "1px solid var(--z-rule-2)", borderLeft: "1px solid var(--z-rule-2)" }} />
      <span style={{ ...base, top: 7, right: 7, borderTop: "1px solid var(--z-rule-2)", borderRight: "1px solid var(--z-rule-2)" }} />
      <span style={{ ...base, bottom: 7, left: 7, borderBottom: "1px solid var(--z-rule-2)", borderLeft: "1px solid var(--z-rule-2)" }} />
      <span style={{ ...base, bottom: 7, right: 7, borderBottom: "1px solid var(--z-rule-2)", borderRight: "1px solid var(--z-rule-2)" }} />
    </>
  );
}

function StepRow({ s }: { s: Step }) {
  const visual = (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--z-rule)",
        borderRadius: 8,
        overflow: "hidden",
        order: s.reverse ? 2 : 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(100% 60% at 50% 0%, rgba(255,255,255,0.05), transparent 60%)",
        }}
      />
      <SmallTicks />
      <div
        style={{
          position: "relative",
          background: "var(--z-panel)",
          margin: 14,
          border: "1px solid var(--z-rule)",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 16px 40px -24px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 12px",
            background: "var(--z-panel-header)",
            borderBottom: "1px solid var(--z-rule)",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--z-ink-6)",
          }}
        >
          <span className="zed-lights">
            <span className="r" />
            <span className="y" />
            <span className="g" />
          </span>
          <span style={{ marginLeft: 4 }}>{s.paneTitle}</span>
        </div>
        <div style={{ padding: "13px 14px", fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.85, color: "var(--z-ink-2)" }}>
          {s.lines.map((ln, i) => (
            <div key={i} style={{ whiteSpace: "pre", color: ln.color ?? "var(--z-ink-2)" }}>
              {ln.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const copy = (
    <div style={{ order: s.reverse ? 1 : 2 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--z-ink-6)",
        }}
      >
        <span style={{ color: "var(--z-blue)" }}>{s.n}</span> &nbsp;{s.kicker}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "normal",
          fontWeight: 500,
          fontSize: 26,
          lineHeight: 1.2,
          color: "var(--z-ink)",
          margin: "12px 0",
          maxWidth: "22ch",
        }}
      >
        {s.title}
      </h3>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.65, color: "var(--z-ink-4)", maxWidth: "46ch" }}>
        {s.body}
      </p>
    </div>
  );

  return (
    <div
      className="zed-grid-2 zed-loop-row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)",
        gap: 44,
        alignItems: "center",
        borderTop: "1px solid var(--z-rule)",
        padding: "44px 0",
      }}
    >
      {visual}
      {copy}
    </div>
  );
}

export function Loop() {
  return (
    <section className="zed-section">
      <div className="zed-wrap" style={{ padding: "88px 34px" }}>
        <div style={{ maxWidth: 640, marginBottom: 52 }}>
          <h2 className="zed-display" style={{ fontSize: 46, lineHeight: 1.06 }}>
            Act. Observe. Evaluate. <span style={{ color: "var(--z-blue)" }}>Learn.</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--z-ink-4)",
              margin: "18px 0 0",
            }}
          >
            Not a static router that decides once and rots. BitRouter runs a closed loop on every
            decision — which model, which MCP tool or skill, which agent harness — so it gets cheaper and
            sharper each lap, with no tuning by you.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {STEPS.map((s) => (
            <StepRow key={s.n} s={s} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 13.5,
            color: "var(--z-ink-4)",
            borderTop: "1px solid var(--z-rule)",
            paddingTop: 24,
          }}
        >
          <span style={{ color: "var(--z-blue)", fontSize: 20 }}>↻</span> self-tuning — every lap folds
          traces back into the policy across{" "}
          <span style={{ color: "var(--z-ink-2)" }}>models, tools &amp; agents</span>, cheaper each run
        </div>
      </div>
    </section>
  );
}
