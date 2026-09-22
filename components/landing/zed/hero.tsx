import { HERO } from "./data";
import { HeroQuickstart } from "./hero-quickstart";

/** A compact introduction followed by a copyable installation command. */
export function Hero() {
  return (
    <section className="zed-wrap zed-hero" style={{ textAlign: "center" }}>
      <h1
        aria-label={HERO.headline}
        className="zed-hero-title"
        style={{
          fontSize: "clamp(38px, 6.4vw, 68px)",
          lineHeight: 1.04,
          margin: "0 auto",
          textWrap: "balance",
        }}
      >
        <span style={{ fontWeight: 400 }}>The open-source</span>{" "}
        <span className="zed-display">model router</span>{" "}
        <span style={{ fontWeight: 400 }}>for</span>{" "}
        <span className="zed-display">your</span>{" "}
        <span style={{ fontWeight: 400 }}>workflow</span>
      </h1>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          lineHeight: 1.65,
          color: "var(--muted-foreground)",
          margin: "22px auto 0",
          maxWidth: "52ch",
          textWrap: "pretty",
        }}
      >
        {HERO.sub}
      </p>

      <div className="zed-outcomes" aria-label="BitRouter product outcomes">
        {HERO.outcomes.map((outcome, index) => (
          <span className="zed-outcome" key={outcome.label}>
            {index > 0 ? (
              <span aria-hidden="true" className="zed-outcome-separator">
                ·
              </span>
            ) : null}
            {outcome.href ? <a href={outcome.href}>{outcome.label}</a> : outcome.label}
          </span>
        ))}
      </div>

      <HeroQuickstart />

      <div className="zed-proofline" aria-label="Try the BitRouter CLI and TUI">
        <span>
          Install, then run <code>bro</code>.
        </span>
      </div>
    </section>
  );
}
