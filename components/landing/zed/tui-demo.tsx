"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  HARNESSES,
  MASCOT,
  SHELL_PROMPT,
  TERM,
  type Harness,
  type Seg,
} from "./data";
import { DemoTerminal, TerminalWindow } from "./demo-terminal";

/* ============================================================================
 * Hero TUI demo — one macOS terminal, five native harnesses.
 *
 * The section makes a single claim: `bitrouter/auto` is configured once, and
 * inside the session BitRouter moves between five tiers that resolve to a
 * different model and/or reasoning effort. Nothing in a transcript is a user
 * action, and no transcript carries a tier badge — the BitRouter statusline
 * along the bottom is the only non-native element in the window.
 *
 * Everything inside the window uses real terminal colours (`TERM` in data.ts);
 * everything outside it stays on the `--z-*` tokens.
 * ========================================================================== */

/** Poll rate. Position comes from elapsed `Date.now()` deltas, never from tick
 *  count, so a throttled background tab doesn't stretch the prologue. */
const TICK_MS = 34;
/** Shell prologue, typed a character at a time. */
const CHAR_MS = 34;
/** Between the two shell lines, and before the harness's TUI appears. */
const LINE_HOLD_MS = 320;
const BOOT_HOLD_MS = 460;
/** One transcript row. */
const REVEAL_MS = 620;
/** Hold on the finished session before advancing. */
const DWELL_MS = 2600;

const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPIN_MS = 90;

/**
 * Below this the interior reflows to a phone-width layout — see `.zed-tui-*` in
 * zed.css, which owns every size that changes. Kept in sync with the media query
 * there; this copy exists because autoplay is a behaviour, not a style.
 */
const NARROW_MAX = 699;

/** `useLayoutEffect` has no server counterpart and warns if called during SSR. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatch(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    // `change` is the right event, but it is not always delivered when the
    // viewport is driven programmatically rather than by the user. Re-reading
    // on resize costs nothing and keeps JS in step with the CSS breakpoint —
    // without it the two disagree and the layout is sized for the wrong one.
    window.addEventListener("resize", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, [query]);
  return match;
}

/**
 * Shrink the window to whatever width it actually has. The layout box keeps its
 * natural size under a transform, so the wrapper is given the scaled box to
 * occupy — otherwise it would reserve full-size space and leave a gap.
 */
function useFitToWidth(deps: unknown[]) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ s: number; w: number; h: number } | null>(null);

  useIsoLayoutEffect(() => {
    const o = outer.current;
    const el = inner.current;
    if (!o || !el) return;
    const measure = () => {
      // offsetWidth/Height are the untransformed layout size.
      const natW = el.offsetWidth;
      const natH = el.offsetHeight;
      if (!natW) return;
      const s = Math.min(1, o.clientWidth / natW);
      setFit(s < 1 ? { s, w: natW * s, h: natH * s } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { outer, inner, fit };
}

const DESKTOP_COLS = 112;
const NARROW_COLS = 44;
const TERM_ROWS = 30;
// ANSI output uses literal RGB values; keep router-owned chrome neutral.
const STATUS_BG = "#202020";

type AnsiPart = {
  text: string;
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
};
type AnsiLine = AnsiPart[];

function rgbSequence(kind: 38 | 48, color: string): string {
  const hex = color.replace("#", "");
  const value = Number.parseInt(hex, 16);
  return `\x1b[${kind};2;${(value >> 16) & 255};${(value >> 8) & 255};${value & 255}m`;
}

function visibleLength(text: string): number {
  return Array.from(text).length;
}

function takeColumns(text: string, columns: number): string {
  return Array.from(text).slice(0, Math.max(0, columns)).join("");
}

function lineLength(line: AnsiLine): number {
  return line.reduce((length, part) => length + visibleLength(part.text), 0);
}

function renderPart(part: AnsiPart): string {
  let open = "";
  if (part.bold) open += "\x1b[1m";
  if (part.italic) open += "\x1b[3m";
  if (part.color) open += rgbSequence(38, part.color);
  if (part.background) open += rgbSequence(48, part.background);
  return `${open}${part.text}\x1b[0m`;
}

function renderLine(line: AnsiLine, columns: number): string {
  let remaining = columns;
  let output = "";
  for (const part of line) {
    if (remaining <= 0) break;
    const text = takeColumns(part.text, remaining);
    output += renderPart({ ...part, text });
    remaining -= visibleLength(text);
  }
  return output;
}

function fromSegments(segments: Seg[]): AnsiLine {
  return segments.map((segment) => ({
    text: segment.t,
    color: segment.c,
    bold: segment.b,
    italic: segment.i,
  }));
}

function withRight(left: AnsiLine, right: AnsiLine, columns: number): AnsiLine {
  const gap = Math.max(1, columns - lineLength(left) - lineLength(right));
  return [...left, { text: " ".repeat(gap) }, ...right];
}

function transcriptLine(harness: Harness, row: Harness["rows"][number], columns: number): AnsiLine {
  const bulletColor = row.user
    ? harness.accent
    : row.think
      ? TERM.amber
      : row.ok
        ? TERM.ok
        : TERM.faint;
  const left: AnsiLine = [{ text: `${row.bullet} `, color: bulletColor }];
  if (harness.labelW > 0 && !row.user) {
    left.push({ text: `${(row.label ?? "").padEnd(9)} `, color: TERM.dim });
  }
  left.push({
    text: row.text,
    color: row.user ? TERM.bright : TERM.body,
    italic: row.think,
  });
  const right: AnsiLine = row.meta
    ? [{ text: row.meta, color: row.ok ? TERM.ok : TERM.faint }]
    : [];
  return right.length ? withRight(left, right, columns - 1) : left;
}

function harnessHeader(harness: Harness, columns: number): AnsiLine[] {
  if (harness.mascot) {
    return Array.from({ length: Math.ceil(MASCOT.length / 2) }, (_, index) => {
      const upper = MASCOT[index * 2] ?? "0000000";
      const lower = MASCOT[index * 2 + 1] ?? "0000000";
      return [
        ...Array.from(upper, (pixel, column) => ({
          text: pixel === "1" ? (lower[column] === "1" ? "█" : "▀") : lower[column] === "1" ? "▄" : " ",
          color: harness.accent,
        })),
        { text: "  " },
        ...fromSegments(harness.header[index] ?? []),
      ];
    });
  }

  if (harness.boxedHeader) {
    const width = Math.min(76, columns - 1);
    const border = TERM.faint;
    return [
      [{ text: `┌${"─".repeat(width - 2)}┐`, color: border }],
      ...harness.header.map((segments) => {
        const content = fromSegments(segments);
        const padding = Math.max(0, width - 2 - lineLength(content));
        return [
          { text: "│", color: border },
          ...content,
          { text: " ".repeat(padding) },
          { text: "│", color: border },
        ];
      }),
      [{ text: `└${"─".repeat(width - 2)}┘`, color: border }],
    ];
  }

  return harness.header.map(fromSegments);
}

function inputLines(harness: Harness, last: Harness["rows"][number] | null, columns: number): AnsiLine[] {
  const lines: AnsiLine[] = [];
  if (harness.input.rule) lines.push([{ text: "─".repeat(columns - 1), color: TERM.ghost }]);

  const input: AnsiLine = [];
  if (harness.input.glyph) input.push({ text: `${harness.input.glyph} `, color: TERM.dim });
  input.push({ text: " ", background: TERM.dim });
  input.push({ text: ` ${harness.input.hint}`, color: TERM.faint });
  if (harness.input.boxed) {
    const background = harness.input.boxBg ?? harness.bg;
    for (const part of input) part.background = part.background ?? background;
    input.push({
      text: " ".repeat(Math.max(0, columns - 1 - lineLength(input))),
      background,
    });
  }
  lines.push(input);

  if (harness.input.ruleBelow) lines.push([{ text: "─".repeat(columns - 1), color: TERM.ghost }]);

  const after = harness.after.map((line) => [...line]);
  const afterRight = (harness.afterRight ?? []).map((line) => [...line]);
  if (harness.afterLive) {
    const live = last
      ? [last.model, last.effort === "—" ? "" : last.effort].join(" ").trim()
      : "bitrouter/auto";
    after.push([{ t: `  ${live} · ${harness.cwd}`, c: TERM.dim }]);
    afterRight.push([]);
  }
  if (harness.afterLiveRight) {
    afterRight[1] = [{ t: last ? last.model : "unknown", c: TERM.dim }];
  }
  after.forEach((line, index) => {
    const left = fromSegments(line);
    const right = fromSegments(afterRight[index] ?? []);
    lines.push(right.length ? withRight(left, right, columns - 1) : left);
  });
  return lines;
}

function fillStatus(line: AnsiLine, columns: number): AnsiLine {
  for (const item of line) item.background = STATUS_BG;
  line.push({
    text: " ".repeat(Math.max(0, columns - 1 - lineLength(line))),
    background: STATUS_BG,
  });
  return line;
}

function statusLines(harness: Harness, rows: Harness["rows"], switches: number, columns: number): AnsiLine[] {
  const last = rows.at(-1) ?? null;
  const background = STATUS_BG;
  const part = (text: string, color: string): AnsiPart => ({ text, color, background });
  const tiers: AnsiLine = [];
  harness.ladder.forEach((rung, index) => {
    const active = rung.name === last?.tier;
    const color = active
      ? {
          low: "#fafafa",
          medium: "#fafafa",
          high: "#fafafa",
          extra: "#fafafa",
          max: "#fafafa",
        }[rung.name]
      : "#a3a3a3";
    tiers.push(part(`${index ? " " : ""}${rung.name}`, color));
  });

  const rightText = switches ? `switched ${switches}× this session` : last ? "no switch yet" : "";
  if (columns < 70) {
    const identity = [part("bitrouter/auto", "#fafafa")];
    const right = rightText ? [part(rightText, "#a3a3a3")] : [];
    const model = [
      part(last ? last.model : "waiting for the session", "#d4d4d4"),
      part(" · ", "#a3a3a3"),
      part(last ? last.effort : "—", "#a3a3a3"),
    ];
    return [
      fillStatus(right.length ? withRight(identity, right, columns - 1) : identity, columns),
      fillStatus(tiers, columns),
      fillStatus(model, columns),
    ];
  }

  const left: AnsiLine = [
    part("bitrouter/auto", "#fafafa"),
    part(" │ ", "#737373"),
    ...tiers,
  ];
  left.push(
    part(" │ ", "#737373"),
    part(last ? last.model : "waiting for the session", "#d4d4d4"),
    part(" · ", "#a3a3a3"),
    part(last ? last.effort : "—", "#a3a3a3"),
  );
  const right = rightText ? [part(rightText, "#a3a3a3")] : [];
  return [fillStatus(right.length ? withRight(left, right, columns - 1) : left, columns)];
}

function renderTerminalFrame(harness: Harness, frame: Frame, columns: number): string {
  const inTui = frame.phase === "tui";
  const rows = harness.rows.slice(0, frame.reveal);
  const last = rows.at(-1) ?? null;
  const lines: AnsiLine[] = [];

  harness.boot.slice(0, frame.committed).forEach((command) => {
    lines.push([
      { text: SHELL_PROMPT, color: TERM.bright, bold: true },
      { text: ` ${command}`, color: TERM.bright },
    ]);
  });

  if (!inTui) {
    lines.push([
      { text: SHELL_PROMPT, color: TERM.bright, bold: true },
      { text: ` ${(harness.boot[frame.bootIdx] ?? "").slice(0, frame.typedLen)}`, color: TERM.bright },
      { text: " ", background: TERM.bright },
    ]);
  } else {
    lines.push([], ...harnessHeader(harness, columns));
    harness.notes.forEach((line) => lines.push(fromSegments(line)));
    lines.push([]);
    rows.forEach((row) => {
      lines.push(transcriptLine(harness, row, columns));
      if (row.sub) lines.push([{ text: `    ${row.sub.trimStart()}`, color: TERM.faint }]);
    });
    if (frame.reveal > 0 && frame.reveal < harness.rows.length) {
      lines.push([
        { text: `${SPIN[Math.max(0, spinAt(harness, frame))]} `, color: harness.accent },
        { text: harness.working, color: TERM.faint, italic: true },
      ]);
    }
  }

  let switches = 0;
  for (let index = 1; index < rows.length; index++) {
    if (rows[index].tier !== rows[index - 1].tier) switches++;
  }

  const status = statusLines(harness, rows, switches, columns);
  const bottom = inTui ? inputLines(harness, last, columns) : [];
  const available = Math.max(0, TERM_ROWS - status.length - bottom.length);
  const content = lines.slice(0, available);
  while (content.length < available) content.push([]);
  content.push(...bottom.slice(0, TERM_ROWS - status.length - content.length));

  const statusStart = content.length;
  const screen = [...content, ...status];
  const output = screen
    .map((line, index) =>
      `\x1b[${index + 1};1H${renderLine(line, columns)}${
        index >= statusStart ? `${rgbSequence(48, STATUS_BG)}\x1b[K\x1b[0m` : "\x1b[K"
      }`,
    )
    .join("");
  return `\x1b[?2026h\x1b[0m\x1b[2J\x1b[H\x1b[?25l${output}\x1b[?2026l`;
}

function WTermFrame({ harness, frame, narrow }: { harness: Harness; frame: Frame; narrow: boolean }) {
  const columns = narrow ? NARROW_COLS : DESKTOP_COLS;
  const output = useMemo(() => renderTerminalFrame(harness, frame, columns), [columns, harness, frame]);

  return (
    <DemoTerminal
      cols={columns}
      rows={TERM_ROWS}
      label={`${harness.tab} session routed through BitRouter`}
      output={output}
      background={harness.bg}
    />
  );
}

/* ── the clock ───────────────────────────────────────────────────────────── */

type Phase = "boot" | "tui";
type Frame = {
  /** Shell lines already committed, plus how much of the current one is typed. */
  bootIdx: number;
  typedLen: number;
  committed: number;
  phase: Phase;
  reveal: number;
};

const START: Frame = { bootIdx: 0, typedLen: 0, committed: 0, phase: "boot", reveal: 0 };

/**
 * Resolve the frame for a harness purely from elapsed milliseconds. Keeping this
 * a pure function of time (rather than accumulating per tick) is what makes a
 * backgrounded tab resume in the right place instead of replaying the prologue.
 */
function frameAt(h: Harness, elapsed: number): Frame & { done: boolean } {
  let t = elapsed;
  for (let i = 0; i < h.boot.length; i++) {
    const typing = h.boot[i].length * CHAR_MS;
    const hold = i + 1 < h.boot.length ? LINE_HOLD_MS : BOOT_HOLD_MS;
    if (t < typing) {
      return { ...START, bootIdx: i, committed: i, typedLen: Math.floor(t / CHAR_MS), done: false };
    }
    if (t < typing + hold) {
      // Line fully typed, still sitting at the prompt.
      return { ...START, bootIdx: i, committed: i, typedLen: h.boot[i].length, done: false };
    }
    t -= typing + hold;
  }
  const committed = h.boot.length;
  const reveal = Math.floor(t / REVEAL_MS);
  const n = h.rows.length;
  if (reveal < n) return { bootIdx: 0, typedLen: 0, committed, phase: "tui", reveal, done: false };
  return {
    bootIdx: 0,
    typedLen: 0,
    committed,
    phase: "tui",
    reveal: n,
    done: t >= n * REVEAL_MS + DWELL_MS,
  };
}

/** The spinner index, or -1 when nothing is streaming. */
function spinAt(cur: Harness, f: Frame): number {
  const streaming = f.phase === "tui" && f.reveal > 0 && f.reveal < cur.rows.length;
  return streaming ? Math.floor(Date.now() / SPIN_MS) % SPIN.length : -1;
}

function useDemoClock() {
  const [h, setH] = useState(0);
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const narrow = useMediaQuery(`(max-width: ${NARROW_MAX}px)`);
  /**
   * On a phone the window is small enough that a transcript advancing every
   * 620ms is noise, so the loop doesn't run: the section rests on a finished
   * session and a tab tap plays that harness once. `playing` is that latch.
   */
  const [playing, setPlaying] = useState(false);
  // Anchored on first render rather than in the effect, so the server and the
  // hydrating client both compute elapsed ≈ 0 and agree on an empty prompt —
  // instead of the server rendering a finished session that then snaps to boot.
  const startedAt = useRef(0);
  if (startedAt.current === 0) startedAt.current = Date.now();
  const hRef = useRef(0);
  hRef.current = h;
  /** Last frame pushed to React, so a tick that changes nothing doesn't re-render. */
  const lastKey = useRef("");

  /** Clicking a tab switches immediately and cancels the queued advance. On a
   *  phone it also starts that harness, since nothing is playing by default. */
  const select = useCallback(
    (i: number) => {
      startedAt.current = Date.now();
      lastKey.current = "";
      setH(i);
      if (narrow && !reduced) setPlaying(true);
    },
    [narrow, reduced],
  );

  const running = !reduced && (!narrow || playing);

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    lastKey.current = "";
    const id = setInterval(() => {
      const cur = HARNESSES[hRef.current];
      const f = frameAt(cur, Date.now() - startedAt.current);
      if (f.done) {
        lastKey.current = "";
        // A phone plays the harness the reader asked for, once, and stops.
        if (narrow) setPlaying(false);
        else {
          startedAt.current = Date.now();
          setH((i) => (i + 1) % HARNESSES.length);
        }
        return;
      }
      // The tick runs at typing resolution, but most ticks land on the frame
      // already on screen — only push the ones that actually change something.
      const key = `${f.phase}|${f.committed}|${f.bootIdx}|${f.typedLen}|${f.reveal}|${spinAt(cur, f)}`;
      if (key !== lastKey.current) {
        lastKey.current = key;
        bump();
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, narrow]);

  const cur = HARNESSES[h];
  // At rest — reduced motion, or a phone between taps — the window holds a
  // finished session. That is the frame worth showing statically: the whole
  // transcript, and a statusline that has actually switched.
  const frame: Frame = running
    ? frameAt(cur, Date.now() - startedAt.current)
    : { bootIdx: 0, typedLen: 0, committed: cur.boot.length, phase: "tui", reveal: cur.rows.length };

  return { h, cur, frame, narrow, select };
}

/* ── the section ─────────────────────────────────────────────────────────── */

export function TuiDemo() {
  const { h, cur, frame, narrow, select } = useDemoClock();
  // Re-measure when the harness changes: `dsh` and `claude` are different widths.
  const { outer, inner, fit } = useFitToWidth([h, narrow]);

  return (
    <section>
      {/* Vertical only — `.zed-wrap` owns the horizontal padding, and drops it
          to 22px under 900px. Hard-coding the gutter here cost the terminal
          width on a phone, which is width it does not have. */}
      <div className="zed-wrap zed-sec">
        <div className="zed-section-intro">
          <div className="zed-eyebrow">Illustrative workflow</div>
          <h2 className="zed-display">Keep your agent. Let BitRouter choose the route.</h2>
          <p>
            Connect your existing agent to BitRouter and use a routing policy to choose only the
            model and reasoning effort each step needs.
          </p>
        </div>
        <div ref={outer} style={{ overflowX: "auto" }}>
          {/* Occupies the scaled box so the transform doesn't leave a gap. */}
          <div style={fit ? { width: fit.w, height: fit.h, margin: "0 auto" } : undefined}>
            <div
              ref={inner}
              className="zed-tui-fit"
              style={
                fit
                  ? { transform: `scale(${fit.s})`, transformOrigin: "top left" }
                  : { margin: "0 auto" }
              }
            >
            <TerminalWindow title={cur.title}>
              {/* ── tab bar ───────────────────────────────────────────── */}
              <div style={{ display: "flex", background: "#232326", borderBottom: "1px solid #17171a" }}>
                {HARNESSES.map((x, i) => {
                  const on = i === h;
                  return (
                    <button
                      key={x.id}
                      onClick={() => select(i)}
                      aria-current={on}
                      title={`${x.tab} — ${x.cwd}`}
                      className="zed-tui-tab"
                      style={{
                        flex: "1 1 0",
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "7px 12px",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11.5,
                        textAlign: "left",
                        border: "none",
                        borderRight: i === HARNESSES.length - 1 ? "none" : "1px solid #17171a",
                        background: on ? x.bg : "transparent",
                        color: on ? TERM.body : "#6e6e6e",
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          flex: "0 0 auto",
                          background: on ? "#d4d4d4" : "#525252",
                        }}
                      />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {x.tab}
                        <span className="zed-tui-cwd"> — {x.cwd}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <WTermFrame harness={cur} frame={frame} narrow={narrow} />
            </TerminalWindow>

            <div style={{ textAlign: "center", marginTop: 22 }}>
              <div style={{ fontSize: 12.5, color: "var(--z-ink-5)" }}>
                One policy route, configured in <span style={{ color: "var(--z-ink)" }}>bitrouter.yaml</span> — the router can
                change the underlying model or reasoning level as the workflow changes.
              </div>
              <div style={{ fontSize: 11.5, color: "var(--z-ink-6)", marginTop: 8 }}>
                {cur.id} · {cur.workflow} · {cur.tierShape}
              </div>
              {narrow && (
                <div style={{ fontSize: 11.5, color: "var(--z-ink-6)", marginTop: 9 }}>
                  tap a tab to run that session
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
