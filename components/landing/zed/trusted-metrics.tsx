import { METRICS } from "./data";

/**
 * The three-up outcome band — cheaper / faster / more accurate.
 *
 * v3 puts the numbers in Newsreader italic at 34px and drops the column rules,
 * so the row reads as three claims rather than a table. The former "trusted by"
 * logo strip above it is gone.
 */
export function Metrics() {
  return (
    <section className="zed-wrap zed-sec">
      <div
        className="zed-grid-3"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: 56, rowGap: 30 }}
      >
        {METRICS.map((m) => (
          <div key={m.stat}>
            <div className="zed-display" style={{ fontSize: 34, lineHeight: 1 }}>
              {m.stat}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "var(--z-ink-5)",
                marginTop: 14,
                maxWidth: "34ch",
              }}
            >
              {m.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
