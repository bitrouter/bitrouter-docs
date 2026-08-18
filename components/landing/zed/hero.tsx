import { HERO } from "./data";
import { ZED_LINKS } from "./primitives";
import { HeroQuickstart } from "./hero-quickstart";

/**
 * v3 hero. Three changes from the previous cut, all from the design file:
 * the headline is Newsreader italic in ink (not blue), the eyebrow is a dim
 * uppercase label (not a blue "New: … →" line), and the CTA pair is one solid
 * button plus a ruled text link — the K/D keycaps are gone.
 *
 * No glow, no corner ticks: v3 sits on the flat page.
 */
export function Hero() {
  return (
    <section className="zed-wrap" style={{ padding: "120px 40px 0", textAlign: "center" }}>
      <div className="zed-eyebrow">New · {HERO.announcement}</div>

      <h1
        className="zed-display"
        style={{
          fontSize: "clamp(38px, 6.4vw, 68px)",
          lineHeight: 1.04,
          margin: "30px auto 0",
          maxWidth: "17ch",
          textWrap: "pretty",
        }}
      >
        {HERO.headline}
      </h1>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          lineHeight: 1.65,
          color: "var(--z-ink-5)",
          margin: "28px auto 0",
          maxWidth: "52ch",
          textWrap: "pretty",
        }}
      >
        {HERO.sub}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          marginTop: 40,
          flexWrap: "wrap",
        }}
      >
        <a className="zed-btn zed-btn-primary" href={ZED_LINKS.apiKey}>
          Get API key
        </a>
        <a className="zed-btn-underline" href={ZED_LINKS.docs}>
          Read the docs
        </a>
      </div>

      <HeroQuickstart />
    </section>
  );
}
