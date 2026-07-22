import type { ReactNode } from "react";

/** Four L-shaped corner brackets, absolutely positioned in a `position:relative` parent. */
export function CornerTicks() {
  return (
    <>
      <span className="zed-tick tl" />
      <span className="zed-tick tr" />
      <span className="zed-tick bl" />
      <span className="zed-tick br" />
    </>
  );
}

/** macOS-style traffic lights for terminal titlebars. */
export function TrafficLights() {
  return (
    <span className="zed-lights">
      <span className="r" />
      <span className="y" />
      <span className="g" />
    </span>
  );
}

/** Blinking block cursor. */
export function Cursor({ style }: { style?: React.CSSProperties }) {
  return <span className="zed-ck" style={style} />;
}

/**
 * The official BitRouter mark (two-way routing arrow) in a blue app-icon tile.
 * Used in the nav + footer. The mark is the brand artwork served from
 * `/bitrouter-mark.png`, painted via CSS mask so it inherits `currentColor`
 * (blue here) and stays crisp at any tile size.
 */
export function BrandMark({ size = 26 }: { size?: number }) {
  const glyph = Math.round(size * 0.62);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        border: "1px solid var(--z-blue)",
        borderRadius: 6,
        color: "var(--z-blue)",
        flex: "0 0 auto",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "block",
          width: glyph,
          height: glyph,
          background: "currentColor",
          WebkitMaskImage: "url(/bitrouter-mark.png)",
          maskImage: "url(/bitrouter-mark.png)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </span>
  );
}

/** `// section` mono kicker. */
export function Kicker({ children }: { children: ReactNode }) {
  return <div className="zed-kicker">{children}</div>;
}

// ── YAML / policy syntax highlighter ────────────────────────────────────────
// Lightweight, faithful to the design's colouring: keys blue, separators muted,
// numeric/threshold values amber, other values green, comments dim, dividers &
// stat lines their own tones.

function isThreshold(v: string): boolean {
  return /[0-9]/.test(v) || /[<>]/.test(v) || /\bms\b/.test(v) || v === "true" || v === "false";
}

/** Highlight a single YAML line into coloured spans (indentation preserved). */
export function highlightYamlLine(raw: string, key: number): ReactNode {
  // Divider row.
  if (/^\s*─+\s*$/.test(raw)) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-8)" }}>
        {raw}
      </div>
    );
  }
  const indentMatch = raw.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : "";
  const rest = raw.slice(indent.length);

  // Full-line comment.
  if (rest.startsWith("#")) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-6)", fontStyle: "italic" }}>
        {raw}
      </div>
    );
  }

  // List item.
  if (rest.startsWith("- ")) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-4)" }}>
        {raw}
      </div>
    );
  }

  // Stat / summary line (no key:value, contains a middot).
  if (!rest.includes(":") && rest.includes("·")) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-bright)" }}>
        {raw}
      </div>
    );
  }

  // key: value  # comment
  const colon = rest.indexOf(":");
  if (colon === -1) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-4)" }}>
        {raw}
      </div>
    );
  }
  const keyText = rest.slice(0, colon);
  let after = rest.slice(colon + 1);
  let comment = "";
  const hash = after.indexOf("#");
  if (hash !== -1) {
    comment = after.slice(hash);
    after = after.slice(0, hash);
  }
  const value = after.trim();
  const valSpace = after.slice(0, after.length - after.trimStart().length);
  const valTrail = after.slice(valSpace.length + value.length);

  return (
    <div key={key} style={{ whiteSpace: "pre" }}>
      <span style={{ color: "var(--z-ink-8)" }}>{indent}</span>
      <span style={{ color: "var(--z-blue)" }}>{keyText}</span>
      <span style={{ color: "var(--z-ink-7)" }}>:</span>
      <span style={{ color: "var(--z-ink-7)" }}>{valSpace}</span>
      {value && (
        <span style={{ color: isThreshold(value) ? "var(--z-cost)" : "var(--z-green)" }}>
          {value}
        </span>
      )}
      <span>{valTrail}</span>
      {comment && (
        <span style={{ color: "var(--z-ink-8)", fontStyle: "italic" }}>{comment}</span>
      )}
    </div>
  );
}

/** Render a whole YAML block (array of lines or a multiline string). */
export function YamlBlock({
  lines,
  numbered = false,
  style,
}: {
  lines: string[] | string;
  numbered?: boolean;
  style?: React.CSSProperties;
}) {
  const arr = Array.isArray(lines) ? lines : lines.split("\n");
  if (!numbered) {
    return (
      <div style={{ fontFamily: "var(--font-mono)", ...style }}>
        {arr.map((l, i) => highlightYamlLine(l, i))}
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr",
        fontFamily: "var(--font-mono)",
        ...style,
      }}
    >
      <div
        style={{
          textAlign: "right",
          paddingRight: 12,
          color: "var(--z-ink-8)",
          userSelect: "none",
        }}
      >
        {arr.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div>{arr.map((l, i) => highlightYamlLine(l, i))}</div>
    </div>
  );
}

// ── Shared landing link targets ─────────────────────────────────────────────
export const ZED_LINKS = {
  apiKey: "https://cloud.bitrouter.ai/sign-in",
  bookDemo: "https://cal.com/bitrouter/founder-call",
  docs: "/docs",
  models: "/models",
  pricing: "/pricing",
  blog: "/blog",
  changelog: "/changelog",
  github: "https://github.com/bitrouter/bitrouter",
  cloneSource: "https://github.com/bitrouter/bitrouter",
};
