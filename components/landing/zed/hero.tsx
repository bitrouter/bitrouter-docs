import { HERO } from "./data";
import { CornerTicks, ZED_LINKS } from "./primitives";
import { HeroQuickstart } from "./hero-quickstart";

export function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(70% 44% at 50% 0%, rgba(107,155,255,0.08), transparent 60%)",
        }}
      />
      <CornerTicks />

      <div className="zed-wrap">
        <div style={{ textAlign: "center", padding: "52px 0 60px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            <span style={{ color: "var(--z-blue)" }}>New:</span>{" "}
            <span style={{ color: "var(--z-ink-2)" }}>{HERO.announcement}</span>{" "}
            <span style={{ color: "var(--z-blue)" }}>→</span>
          </div>

          <h1
            className="zed-display"
            style={{
              fontSize: "clamp(40px, 7vw, 74px)",
              lineHeight: 1.0,
              color: "var(--z-blue)",
              margin: "0 auto",
              maxWidth: "16ch",
            }}
          >
            {HERO.headline}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--z-ink-4)",
              margin: "26px auto 0",
              maxWidth: "54ch",
            }}
          >
            {HERO.sub}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginTop: 34,
              flexWrap: "wrap",
            }}
          >
            <a className="zed-btn zed-btn-primary" href={ZED_LINKS.apiKey}>
              Get API key <span className="zed-key on-primary">K</span>
            </a>
            <a className="zed-btn zed-btn-ghost" href={ZED_LINKS.docs}>
              Read the docs <span className="zed-key on-ghost">D</span>
            </a>
          </div>

          <HeroQuickstart />
        </div>
      </div>
    </section>
  );
}
