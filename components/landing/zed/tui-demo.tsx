"use client";

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import {
  HARNESSES,
  MASCOT,
  SHELL_PROMPT,
  TERM,
  TIER_COLOR,
  type Harness,
  type Seg,
  type Tier,
} from "./data";

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

function segStyle(s: Seg): React.CSSProperties {
  return { color: s.c, fontWeight: s.b ? 600 : 400, fontStyle: s.i ? "italic" : "normal" };
}

function Line({ segs }: { segs: Seg[] }) {
  return (
    <div className="zed-tui-line" style={{ whiteSpace: "pre" }}>
      {segs.length === 0 ? (
        " "
      ) : (
        segs.map((s, i) => (
          <span key={i} style={segStyle(s)}>
            {s.t}
          </span>
        ))
      )}
    </div>
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

function useTerminal() {
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
  const { h, cur, frame, narrow, select } = useTerminal();

  const inTui = frame.phase === "tui";
  const rows = cur.rows.slice(0, frame.reveal);
  const last = rows.length ? rows[rows.length - 1] : null;
  const streaming = inTui && frame.reveal > 0 && frame.reveal < cur.rows.length;

  let switches = 0;
  for (let i = 1; i < rows.length; i++) if (rows[i].tier !== rows[i - 1].tier) switches++;

  const activeTier: Tier | null = last ? last.tier : null;
  const spin = SPIN[Math.max(0, spinAt(cur, frame))];
  // Re-measure when the harness changes: `dsh` and `claude` are different widths.
  const { outer, inner, fit } = useFitToWidth([h, narrow]);

  // codex prints the serving model under its input; pi prints it bottom-right,
  // where it otherwise prints `unknown`.
  const after: Seg[][] = cur.after.map((l) => [...l]);
  const afterRight: Seg[][] = (cur.afterRight ?? []).map((l) => [...l]);
  if (cur.afterLive) {
    // `—` is the statusline's placeholder for "this harness has no effort knob";
    // inline in the harness's own output it would just read as a stray dash.
    const live = last ? [last.model, last.effort === "—" ? "" : last.effort].join(" ").trim() : "bitrouter/auto";
    after.push([{ t: `  ${live} · ${cur.cwd}`, c: TERM.dim }]);
    afterRight.push([]);
  }
  if (cur.afterLiveRight) {
    afterRight[1] = [{ t: last ? last.model : "unknown", c: TERM.dim }];
  }

  return (
    <section className="zed-section">
      {/* Vertical only — `.zed-wrap` owns the horizontal padding, and drops it
          to 20px under 900px. Hard-coding 34px here cost the terminal 28px of
          width on a phone, which is 28px it does not have. */}
      <div className="zed-wrap" style={{ paddingTop: 44, paddingBottom: 44 }}>
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
            <div
              style={{
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 34px 80px -34px rgba(0,0,0,0.85)",
              }}
            >
              {/* ── macOS titlebar ────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  height: 38,
                  padding: "0 13px",
                  background: "#333336",
                  borderBottom: "1px solid #262628",
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                {/* Finder proxy icon */}
                <span
                  style={{
                    display: "inline-block",
                    width: 13,
                    height: 11,
                    borderRadius: 2,
                    background: "#5aa9f8",
                    marginLeft: 14,
                    flex: "0 0 auto",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#d8d8d8",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {cur.title}
                </span>
              </div>

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
                          background: on ? "#28c840" : "#3a3a3a",
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

              {/* ── terminal body ─────────────────────────────────────── */}
              <div
                className="zed-tui-body"
                style={{
                  background: cur.bg,
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 16px 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12.5,
                  lineHeight: 1.62,
                  overflow: "hidden",
                }}
              >
                {/* Clips rather than colliding with the input widget below if a
                    harness ever outgrows the body. */}
                <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                  {/* shell prologue */}
                  {cur.boot.slice(0, frame.committed).map((t, i) => (
                    <div key={i} className="zed-tui-line" style={{ whiteSpace: "pre" }}>
                      <span style={{ color: TERM.bright, fontWeight: 600 }}>{SHELL_PROMPT}</span>
                      <span style={{ color: TERM.bright }}> {t}</span>
                    </div>
                  ))}
                  {!inTui && (
                    <div className="zed-tui-line" style={{ whiteSpace: "pre" }}>
                      <span style={{ color: TERM.bright, fontWeight: 600 }}>{SHELL_PROMPT}</span>
                      <span style={{ color: TERM.bright }}>
                        {" "}
                        {(cur.boot[frame.bootIdx] ?? "").slice(0, frame.typedLen)}
                      </span>
                      <span className="zed-tui-caret" style={{ background: "#d4d4d4" }} />
                    </div>
                  )}

                  {inTui && (
                    <div>
                      {/* harness header */}
                      <div
                        style={
                          cur.boxedHeader
                            ? {
                                display: "flex",
                                alignItems: "flex-start",
                                marginTop: 10,
                                padding: "10px 14px",
                                border: "1px solid #5a5a5a",
                                borderRadius: 6,
                                alignSelf: "flex-start",
                              }
                            : { display: "flex", alignItems: "flex-start", marginTop: 10 }
                        }
                      >
                        {cur.mascot && (
                          <div
                            aria-hidden
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(7, 6px)",
                              gridAutoRows: 6,
                              gap: 1,
                              flex: "0 0 auto",
                              marginRight: 14,
                              marginTop: 2,
                            }}
                          >
                            {MASCOT.join("")
                              .split("")
                              .map((c, i) => (
                                <span
                                  key={i}
                                  style={{ width: 6, height: 6, background: c === "1" ? TERM.claude : "transparent" }}
                                />
                              ))}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          {cur.header.map((l, i) => (
                            <Line key={i} segs={l} />
                          ))}
                        </div>
                      </div>

                      {cur.notes.map((l, i) => (
                        <div key={i} style={{ marginTop: 6 }}>
                          <Line segs={l} />
                        </div>
                      ))}

                      <div style={{ height: 10 }} />

                      {/* transcript */}
                      {rows.map((r, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", gap: 8, alignItems: "baseline", whiteSpace: "pre" }}>
                            <span
                              style={{
                                flex: "0 0 auto",
                                width: 10,
                                color: r.user
                                  ? cur.accent
                                  : r.think
                                    ? TERM.amber
                                    : r.ok
                                      ? TERM.ok
                                      : TERM.faint,
                              }}
                            >
                              {r.bullet}
                            </span>
                            {/* The user's own row starts hard left — no label column. */}
                            {cur.labelW > 0 && !r.user && (
                              <span className="zed-tui-label" style={{ flex: "0 0 auto", width: cur.labelW, color: TERM.dim }}>
                                {r.label ?? ""}
                              </span>
                            )}
                            <span
                              style={{
                                flex: "1 1 auto",
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: r.user ? TERM.bright : TERM.body,
                                fontStyle: r.think ? "italic" : "normal",
                              }}
                            >
                              {r.text}
                            </span>
                            <span style={{ flex: "0 0 auto", color: r.ok ? TERM.ok : TERM.faint }}>{r.meta ?? ""}</span>
                          </div>
                          {r.sub && (
                            <div style={{ whiteSpace: "pre", paddingLeft: 18, color: TERM.faint }}>{r.sub}</div>
                          )}
                        </div>
                      ))}

                      {streaming && (
                        <div style={{ display: "flex", gap: 8, alignItems: "baseline", whiteSpace: "pre" }}>
                          <span style={{ color: cur.accent, flex: "0 0 auto", width: 10 }}>{spin}</span>
                          <span style={{ color: TERM.faint, fontStyle: "italic" }}>{cur.working}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* the harness's own input widget, pinned to the bottom */}
                {inTui && (
                  <div>
                    {cur.input.rule && <div style={{ height: 1, background: "#4a4a4a", margin: "8px 0" }} />}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: cur.input.boxed ? "9px 12px" : "2px 0",
                        background: cur.input.boxed ? cur.input.boxBg : "transparent",
                        borderLeft: cur.input.bar ? `3px solid ${cur.input.bar}` : "none",
                        marginTop: cur.input.boxed ? 8 : 0,
                      }}
                    >
                      {cur.input.glyph && <span style={{ color: TERM.dim, flex: "0 0 auto" }}>{cur.input.glyph}</span>}
                      <span className="zed-tui-caret" style={{ background: "#8a8a8a", flex: "0 0 auto" }} />
                      <span
                        style={{
                          color: "#6e6e6e",
                          flex: "1 1 auto",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cur.input.hint}
                      </span>
                    </div>
                    {cur.input.ruleBelow && <div style={{ height: 1, background: "#4a4a4a", margin: "8px 0" }} />}
                    {after.map((l, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 4, fontSize: 12 }}
                      >
                        <span style={{ whiteSpace: "pre" }}>
                          {l.map((s, j) => (
                            <span key={j} style={segStyle(s)}>
                              {s.t}
                            </span>
                          ))}
                        </span>
                        <span style={{ whiteSpace: "pre" }}>
                          {(afterRight[i] ?? []).map((s, j) => (
                            <span key={j} style={segStyle(s)}>
                              {s.t}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── BitRouter statusline — the only non-native element ── */}
              <div
                className="zed-tui-status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 14px",
                  background: "var(--z-blue-chip-bg)",
                  borderTop: "1px solid var(--z-blue-chip-border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  color: "var(--z-ink-6)",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="zed-tui-id" style={{ color: "var(--z-blue)" }}>
                  bitrouter/auto
                </span>
                <span className="zed-tui-sep" style={{ color: "var(--z-blue-chip-border)" }}>
                  │
                </span>
                <span className="zed-tui-rungs" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {cur.ladder.map((r) => {
                    const on = r.name === activeTier;
                    return (
                      <span
                        key={r.name}
                        style={{
                          padding: "1px 6px",
                          borderRadius: 3,
                          letterSpacing: "0.04em",
                          color: on ? TIER_COLOR[r.name] : "var(--z-ink-7)",
                          background: on ? "rgba(255,255,255,.06)" : "transparent",
                          transition: "color .2s ease, background .2s ease",
                        }}
                      >
                        {r.name}
                      </span>
                    );
                  })}
                </span>
                <span className="zed-tui-sep" style={{ color: "var(--z-blue-chip-border)" }}>
                  │
                </span>
                <span className="zed-tui-model" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--z-ink-2)" }}>{last ? last.model : "waiting for the session"}</span>
                  <span style={{ color: "var(--z-ink-7)" }}>·</span>
                  <span>{last ? last.effort : "—"}</span>
                </span>
                <span className="zed-tui-switches" style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>
                  {switches ? `switched ${switches}× this session` : last ? "no switch yet" : ""}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 18 }}>
              <div style={{ fontSize: 12.5, color: "var(--z-ink-4)" }}>
                Five tiers, set once in <span style={{ color: "var(--z-ink-2)" }}>bitrouter.yaml</span> — every harness
                only ever sees the id <span style={{ color: "var(--z-blue)" }}>bitrouter/auto</span>.
              </div>
              <div style={{ fontSize: 11.5, color: "var(--z-ink-7)", marginTop: 7 }}>
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
