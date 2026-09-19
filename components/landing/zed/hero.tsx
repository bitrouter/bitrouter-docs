import { HERO } from "./data";
import { HeroQuickstart } from "./hero-quickstart";

/**
 * v3 hero. Three changes from the previous cut, all from the design file:
 * the headline is Newsreader italic in ink (not blue), the eyebrow is a dim
 * uppercase label (not a blue "New: … →" line), and the CTA pair is one solid
 * install-method tabs — the deployment decision stays out of the first action.
 *
 * No glow, no corner ticks: v3 sits on the flat page.
 */
export function Hero() {
  return (
    <section className="zed-wrap" style={{ padding: "120px 40px 0", textAlign: "center" }}>
      <div className="zed-eyebrow">{HERO.announcement}</div>

      <h1
        className="zed-display"
        style={{
          fontSize: "clamp(38px, 6.4vw, 68px)",
          lineHeight: 1.04,
          margin: "30px auto 0",
          maxWidth: "15ch",
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

      <HeroQuickstart />

      <div className="zed-proofline" aria-label="Open-source product attributes">
        <span>Apache-2.0</span>
        <span>Your provider keys</span>
        <span>Cloud optional</span>
      </div>
    </section>
  );
}
