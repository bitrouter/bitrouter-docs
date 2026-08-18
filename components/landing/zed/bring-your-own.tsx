import { BYO } from "./data";

/**
 * "Bring your own …" — three claims about what BitRouter is agnostic to.
 *
 * v3 strips this back to type: no bordered columns, no logo marquee. Each
 * column is a label, a one-line claim, and the roster as a dot-separated run
 * of names, so the section reads at a glance instead of animating.
 */
export function BringYourOwn() {
  return (
    <section className="zed-wrap zed-sec">
      <div
        className="zed-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 56,
          rowGap: 30,
        }}
      >
        {BYO.map((g) => (
          <div key={g.title}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--z-ink-6)",
              }}
            >
              {g.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "var(--z-ink-2)",
                marginTop: 12,
              }}
            >
              {g.desc}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                lineHeight: 1.9,
                color: "var(--z-ink-6)",
                marginTop: 12,
              }}
            >
              {g.logos.join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
