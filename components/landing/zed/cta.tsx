import { INSTALL_CMD } from "./data";
import { Cursor, ZED_LINKS } from "./primitives";

/**
 * Closing CTA.
 *
 * v3 drops the bordered, glowing card: the section sits directly on the page,
 * centred, with the install command in a flat --z-wash well. It's the same
 * shape as the hero, which is the point — the page opens and closes on it.
 */
export function FinalCta() {
  return (
    <section className="zed-wrap zed-sec zed-sec-b" style={{ textAlign: "center" }}>
      <h2
        className="zed-display"
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          lineHeight: 1.06,
          margin: "0 auto",
          maxWidth: "18ch",
        }}
      >
        Stop overpaying for tokens.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 14.5,
          lineHeight: 1.7,
          color: "var(--z-ink-5)",
          margin: "24px auto 0",
          maxWidth: "46ch",
          textWrap: "pretty",
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
          gap: 12,
          padding: "16px 18px",
          background: "var(--z-wash)",
          maxWidth: 420,
          margin: "36px auto 0",
        }}
      >
        <span style={{ color: "var(--z-ink-6)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          $
        </span>
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          marginTop: 32,
          flexWrap: "wrap",
        }}
      >
        <a className="zed-btn zed-btn-primary" href={ZED_LINKS.apiKey}>
          Get API key
        </a>
        <a className="zed-btn-underline" href={ZED_LINKS.cloneSource}>
          Clone source
        </a>
      </div>
    </section>
  );
}
