import { HERO } from "./data";
import { HeroQuickstart } from "./hero-quickstart";

/** A compact introduction followed by a copyable installation command. */
export function Hero() {
  return (
    <section className="zed-wrap zed-hero" style={{ textAlign: "center" }}>
      <div className="zed-eyebrow">{HERO.announcement}</div>

      <h1
        aria-label={HERO.headline}
        style={{
          fontSize: "clamp(38px, 6.4vw, 68px)",
          lineHeight: 1.04,
          margin: "30px auto 0",
          maxWidth: "19ch",
          textWrap: "balance",
        }}
      >
        <span style={{ display: "block", fontWeight: 400 }}>Your router.</span>
        <span className="zed-display" style={{ display: "block" }}>
          Your rules.
        </span>
      </h1>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          lineHeight: 1.65,
          color: "var(--muted-foreground)",
          margin: "28px auto 0",
          maxWidth: "52ch",
          textWrap: "pretty",
        }}
      >
        {HERO.sub}
      </p>

      <HeroQuickstart />

      <div className="zed-proofline" aria-label="Open-source product attributes">
        <span>Apache-2.0</span>
        <span>Your provider keys</span>
        <span>Cloud optional</span>
      </div>
    </section>
  );
}
