import type { ReactNode } from "react";

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

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="zed-kicker">{children}</div>;
}

/**
 * The v3 page header shared by the index surfaces (models, pricing, blog,
 * changelog): a dim uppercase eyebrow, a Newsreader-italic title, and a mono
 * standfirst — the same three-part opening the landing hero uses, one size down.
 *
 * The title stays monochrome. v3 spends blue on state and data, not on headline
 * fragments, so the "…in production." half-sentence highlights are gone.
 */
export function PageHead({
  eyebrow,
  title,
  sub,
  aside,
  maxWidth,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  /** Optional trailing cell, right-aligned on the title row (e.g. an RSS link). */
  aside?: ReactNode;
  /** Measure for the standfirst, in ch. */
  maxWidth?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 20,
        flexWrap: "wrap",
        padding: "72px 0 0",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="zed-eyebrow">{eyebrow}</div>
        <h1
          className="zed-display"
          style={{
            fontSize: "clamp(34px, 5.2vw, 48px)",
            lineHeight: 1.06,
            margin: "20px 0 0",
            maxWidth: "20ch",
            textWrap: "pretty",
          }}
        >
          {title}
        </h1>
        {sub && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14.5,
              lineHeight: 1.7,
              color: "var(--z-ink-5)",
              margin: "20px 0 0",
              maxWidth: maxWidth ?? "58ch",
              textWrap: "pretty",
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {aside ? <div style={{ marginLeft: "auto" }}>{aside}</div> : null}
    </div>
  );
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
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-rule-2)" }}>
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
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-5)" }}>
        {raw}
      </div>
    );
  }

  // Stat / summary line (no key:value, contains a middot).
  if (!rest.includes(":") && rest.includes("·")) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-2)" }}>
        {raw}
      </div>
    );
  }

  // key: value  # comment
  const colon = rest.indexOf(":");
  if (colon === -1) {
    return (
      <div key={key} style={{ whiteSpace: "pre", color: "var(--z-ink-5)" }}>
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
      {/* v3 renders config monochrome: the key/value split is carried by two
          steps of ink, not by hue. Only a threshold keeps its tan, because it
          is a number the reader is meant to hunt for. */}
      <span style={{ color: "var(--z-ink-2)" }}>{indent}</span>
      <span style={{ color: "var(--z-ink-2)" }}>{keyText}</span>
      <span style={{ color: "var(--z-ink-6)" }}>:</span>
      <span style={{ color: "var(--z-ink-6)" }}>{valSpace}</span>
      {value && (
        <span style={{ color: isThreshold(value) ? "var(--z-cost)" : "var(--z-ink)" }}>
          {value}
        </span>
      )}
      <span>{valTrail}</span>
      {comment && (
        <span style={{ color: "var(--z-ink-6)", fontStyle: "italic" }}>{comment}</span>
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
