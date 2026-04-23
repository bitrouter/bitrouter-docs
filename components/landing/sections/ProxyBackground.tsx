type Direction = "rtl" | "ltr";

interface BusRow {
  glyph: string;
  spacing: string;
  direction: Direction;
  duration: number;
  opacity: number;
  topPct: number;
  fontSize: number;
}

// Upper half = outbound (agent → providers/peers): glyphs flow rightward.
// Lower half = inbound (providers/peers → agent):  glyphs flow leftward.
const ROWS: BusRow[] = [
  { glyph: "▸", spacing: "  ", direction: "ltr", duration: 32, opacity: 0.07, topPct: 6, fontSize: 11 },
  { glyph: "·", spacing: " ", direction: "ltr", duration: 24, opacity: 0.10, topPct: 14, fontSize: 10 },
  { glyph: "▸", spacing: "   ", direction: "ltr", duration: 44, opacity: 0.06, topPct: 22, fontSize: 12 },
  { glyph: "▹", spacing: "  ", direction: "ltr", duration: 28, opacity: 0.08, topPct: 30, fontSize: 11 },
  { glyph: "·", spacing: "  ", direction: "ltr", duration: 36, opacity: 0.09, topPct: 38, fontSize: 10 },

  { glyph: "·", spacing: "  ", direction: "rtl", duration: 34, opacity: 0.09, topPct: 56, fontSize: 10 },
  { glyph: "◃", spacing: "  ", direction: "rtl", duration: 30, opacity: 0.08, topPct: 64, fontSize: 11 },
  { glyph: "◂", spacing: "   ", direction: "rtl", duration: 46, opacity: 0.06, topPct: 72, fontSize: 12 },
  { glyph: "·", spacing: " ", direction: "rtl", duration: 22, opacity: 0.10, topPct: 80, fontSize: 10 },
  { glyph: "◂", spacing: "  ", direction: "rtl", duration: 38, opacity: 0.07, topPct: 88, fontSize: 11 },
];

function buildBand(glyph: string, spacing: string, repeat = 80): string {
  return Array.from({ length: repeat }, () => glyph).join(spacing);
}

export function ProxyBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden text-foreground"
    >
      {/* Bidirectional bus — bands of mono characters drifting in two directions */}
      {ROWS.map((row, i) => {
        const band = buildBand(row.glyph, row.spacing);
        const animation = row.direction === "rtl" ? "proxy-bus-rtl" : "proxy-bus-ltr";
        return (
          <div
            key={i}
            data-proxy-bus-row
            className="absolute left-0 whitespace-nowrap font-mono leading-none select-none"
            style={{
              top: `${row.topPct}%`,
              opacity: row.opacity,
              fontSize: `${row.fontSize}px`,
              width: "200%",
              animation: `${animation} ${row.duration}s linear infinite`,
              willChange: "transform",
            }}
          >
            {band}
            <span className="ml-0">{band}</span>
          </div>
        );
      })}

      {/* Vertical membrane — the "proxy" in the middle */}
      <div
        data-proxy-membrane
        className="absolute top-[4%] bottom-[4%] left-1/2 w-px -translate-x-1/2 bg-foreground"
        style={{
          opacity: 0.18,
          animation: "proxy-membrane-pulse 5.6s ease-in-out infinite",
        }}
      />

      {/* Soft vignette — fades the bus toward the edges so text breathes */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30" />
    </div>
  );
}
