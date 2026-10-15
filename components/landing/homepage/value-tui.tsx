"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DemoTerminal, TerminalWindow } from "../zed/demo-terminal";

type Tone = "text" | "muted" | "strong";
type Line = { text: string; tone?: Tone };
type Beat = { lines: Line[]; state: string };
type Scenario = { title: string; focus: string; prompt: string; beats: Beat[] };

// Illustrative policy decisions, not recorded runs or measured savings.
// All scenarios use the same agent and terminal so the value is the variable.
const scenarios = {
  spending: {
    title: "Spend where it matters",
    focus: "Cost control: light for routine work, deep for diagnosis.",
    prompt: "Fix the failing session refresh test.",
    beats: [
      { state: "Exploration / light inference", lines: [
        { text: "  read     auth/session.ts" },
        { text: "  route    LIGHT  / routine exploration", tone: "muted" },
      ] },
      { state: "Diagnosis / deeper reasoning", lines: [
        { text: "  inspect  expired-token edge case" },
        { text: "  route    DEEP   / reason through the failure", tone: "strong" },
      ] },
      { state: "Implementation / light inference", lines: [
        { text: "  patch    add the missing refresh guard" },
        { text: "  route    LIGHT  / focused edit", tone: "muted" },
      ] },
      { state: "Verification / light inference", lines: [
        { text: "  check    session refresh test passes" },
        { text: "  route    LIGHT  / focused verification", tone: "muted" },
      ] },
      { state: "Complete / selective reasoning", lines: [
        { text: "  DONE     3 light steps. 1 deep diagnosis.", tone: "strong" },
        { text: "           Heavy inference only where it mattered.", tone: "muted" },
      ] },
    ],
  },
  waiting: {
    title: "Keep the next step moving",
    focus: "Fast path: search -> edit -> verify.",
    prompt: "Rename the timeout setting and check its uses.",
    beats: [
      { state: "Bounded task / light reasoning", lines: [
        { text: "  scope    one setting, a small set of references" },
        { text: "  route    LIGHT  / a bounded change", tone: "muted" },
      ] },
      { state: "Search / straight to the relevant files", lines: [
        { text: "  search   request_timeout in src/ and tests/" },
        { text: "  found    config.ts, client.ts, client.test.ts", tone: "muted" },
      ] },
      { state: "Edit / no extended planning step", lines: [
        { text: "  edit     rename to request_timeout_ms" },
        { text: "  route    LIGHT  / no extended planning needed", tone: "muted" },
      ] },
      { state: "Verify / hand back the result", lines: [
        { text: "  check    references updated; tests pass" },
        { text: "  ready    review the diff", tone: "strong" },
      ] },
      { state: "Complete / ready for review", lines: [
        { text: "  DONE     Routine change ready for review.", tone: "strong" },
        { text: "           Search -> edit -> verify. No planning detour.", tone: "muted" },
      ] },
    ],
  },
  managing: {
    title: "One request. Routing handled.",
    focus: "Hands-off routing: one task, policy chooses the models.",
    prompt: "Fix session refresh, then verify the change.",
    beats: [
      { state: "One prompt / policy already configured", lines: [
        { text: "  policy   bitrouter/auto is already configured" },
        { text: "  input    one task; no manual route selection", tone: "muted" },
      ] },
      { state: "Explore / route selected automatically", lines: [
        { text: "  explore  read the session and refresh handlers" },
        { text: "  auto     LIGHT  / chosen by routing policy", tone: "muted" },
      ] },
      { state: "Diagnose / routing policy steps up", lines: [
        { text: "  diagnose trace the expired-token edge case" },
        { text: "  auto     DEEP   / chosen by routing policy", tone: "strong" },
      ] },
      { state: "Fix and verify / routing policy steps down", lines: [
        { text: "  verify   apply the guard and check the test" },
        { text: "  auto     LIGHT  / chosen by routing policy", tone: "muted" },
      ] },
      { state: "Complete / decisions remain inspectable", lines: [
        { text: "  DONE     Manual route changes in this demo: 0", tone: "strong" },
        { text: "           Every routing decision stays visible.", tone: "muted" },
      ] },
    ],
  },
} satisfies Record<string, Scenario>;

export type ValueScenario = keyof typeof scenarios;
const palette: Record<Tone, string> = {
  text: "\x1b[38;2;64;64;64m",
  muted: "\x1b[38;2;115;115;115m",
  strong: "\x1b[1m\x1b[38;2;23;23;23m",
};

function wrap(text: string, columns: number): string[] {
  const lines: string[] = [];
  let rest = text;
  while (rest.length > columns) {
    const space = rest.lastIndexOf(" ", columns);
    const split = space > columns / 2 ? space : columns;
    lines.push(rest.slice(0, split));
    rest = `    ${rest.slice(split).trimStart()}`;
  }
  return [...lines, rest];
}

function scriptHeader(script: Scenario): Line[] {
  return [
    { text: "$ bro code claude", tone: "muted" },
    { text: "" },
    { text: "  BitRouter / Claude Code  |  bitrouter/auto", tone: "strong" },
    { text: `  ${script.focus}`, tone: "muted" },
    { text: "" },
    { text: `> ${script.prompt}`, tone: "strong" },
    { text: "" },
  ];
}

function sharedRows(columns: number): number {
  return Math.max(25, ...Object.values(scenarios).map(script => {
    const lines = [...scriptHeader(script), ...script.beats.flatMap(item => [...item.lines, { text: "" }])];
    return lines.reduce((sum, line) => sum + wrap(line.text, columns).length, 0) + 1;
  }));
}

type ValueTuiProps = {
  scenario: ValueScenario;
  run: number;
  columns: number;
  playing: boolean;
  canAdvance: boolean;
  reducedMotion: boolean;
  onAdvance: (run: number) => void;
  onProgress: (progress: number) => void;
};

export function ValueTui({ scenario, run, columns, playing, canAdvance, reducedMotion, onAdvance, onProgress }: ValueTuiProps) {
  const script = scenarios[scenario];
  const [playback, setPlayback] = useState({ run, beat: 0, characters: 0 });
  const clock = useRef({ run, elapsed: 0 });
  const rows = useMemo(() => sharedRows(columns), [columns]);
  const timeline = useMemo(() => {
    let duration = 0;
    const beats = script.beats.map(item => {
      const length = item.lines.reduce((sum, line) => sum + line.text.length, 0);
      const start = duration;
      duration += Math.ceil(length / 8) * 28 + 850;
      return { start, end: duration, length };
    });
    return { beats, playbackDuration: duration, cycleDuration: duration + 2000 };
  }, [script]);

  // Reset the script without remounting WTerm: automatic switches must not
  // steal focus, reload WASM, or briefly collapse the terminal.
  let progress = playback;
  if (playback.run !== run) {
    progress = { run, beat: 0, characters: 0 };
    setPlayback(progress);
  }
  const beat = reducedMotion ? script.beats.length : progress.beat;
  const complete = beat >= script.beats.length;

  useEffect(() => {
    if (clock.current.run !== run) clock.current = { run, elapsed: 0 };
    if (reducedMotion) { onProgress(1); return; }
    onProgress(clock.current.elapsed / timeline.cycleDuration);
    if (!playing) return;

    // One clock drives typing, dwell time, the final 2-second hold, and the
    // tab fill. The background advances at a constant rate throughout them.
    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const limit = canAdvance ? timeline.cycleDuration : Math.max(clock.current.elapsed, timeline.playbackDuration);
      const elapsed = Math.min(clock.current.elapsed + now - previous, limit);
      clock.current.elapsed = elapsed;
      previous = now;
      const activeBeat = timeline.beats.findIndex(item => elapsed < item.end);
      const nextBeat = activeBeat === -1 ? script.beats.length : activeBeat;
      const item = timeline.beats[activeBeat];
      const characters = item ? Math.min(Math.floor((elapsed - item.start) / 28) * 8, item.length) : 0;
      setPlayback(current => current.run !== run || (current.beat === nextBeat && current.characters === characters)
        ? current : { run, beat: nextBeat, characters });
      onProgress(elapsed / timeline.cycleDuration);
      if (elapsed >= timeline.cycleDuration && canAdvance) { onAdvance(run); return; }
      if (!canAdvance && elapsed >= limit) return;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, playing, canAdvance, reducedMotion, timeline, script, onProgress, onAdvance]);

  const shown: Line[] = [...scriptHeader(script), ...script.beats.slice(0, beat).flatMap(item => [...item.lines, { text: "" }])];
  let remaining = progress.characters;
  if (!complete) for (const line of script.beats[beat].lines) {
    if (remaining <= 0) break;
    shown.push({ ...line, text: line.text.slice(0, remaining) });
    remaining -= line.text.length;
  }
  const frameLines = shown.flatMap(line => wrap(line.text, columns).map(text => `${palette[line.tone ?? "text"]}${text}\x1b[0m`));
  const output = `\x1b[?2026h\x1b[0m\x1b[2J\x1b[H\x1b[?25l${frameLines.join("\r\n")}\x1b[?2026l`;

  return <div className="ws-value-terminal" data-scenario={scenario} data-beat={beat} data-complete={complete} data-run={run} data-playing={playing && !reducedMotion}>
    <TerminalWindow theme="light" title={`bro — ${script.title}`}>
      <div className="ws-terminal-output" style={{ height: rows * 16 + 24, animationName: run % 2 ? "ws-terminal-fade-a" : "ws-terminal-fade-b" }}>
        <DemoTerminal output={output} cols={columns} rows={rows} label={`${script.title} — terminal demo`} background="#ffffff" className="ws-light-terminal" style={{ height: rows * 16 + 24, "--term-fg": "#404040", "--term-cursor": "#171717" } as CSSProperties} />
      </div>
      <div className="ws-terminal-status">{script.beats[Math.min(beat, script.beats.length - 1)].state}</div>
    </TerminalWindow>
  </div>;
}
