import { BYO, type ByoGroup } from "./data";
import { BrandIcon } from "./brand-icon";

function Column({ g, last }: { g: ByoGroup; last: boolean }) {
  const logos = [...g.logos, ...g.logos]; // duplicate for a seamless marquee
  return (
    <div
      style={{
        minWidth: 0,
        padding: "26px 26px",
        borderRight: last ? "none" : "1px solid var(--z-rule)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--z-ink)",
        }}
      >
        <span style={{ color: "var(--z-blue)", fontSize: 9 }}>●</span> {g.title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          color: "var(--z-ink-4)",
          marginTop: 5,
        }}
      >
        {g.desc}
      </div>
      <div className="zed-marq-mask">
        <div className="zed-marq-track" style={{ animationDuration: g.duration }}>
          {logos.map((name, i) => (
            <span className="zed-marq-logo" key={i}>
              <BrandIcon name={name} size={15} color="var(--z-ink-4)" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BringYourOwn() {
  return (
    <section className="zed-section">
      <div className="zed-wrap">
        <div
          className="zed-grid-3"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}
        >
          {BYO.map((g, i) => (
            <Column key={g.title} g={g} last={i === BYO.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
