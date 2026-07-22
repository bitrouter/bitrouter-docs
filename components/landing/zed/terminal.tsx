"use client";

/* Terminal — animated TUI primitive on the Zed design system (ported from the
   mono terminal). Plays a "program" on a loop, gated until in view. Line ops:
     ['type', text, {cls, prefix, cps, after}]  ['print', node, holdMs]
     ['spin', label, ms, resultNode]  ['wait', ms]  ['loop', ms]
   `animate=false` renders the resolved static frame. */

import * as React from "react";

const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

type Instruction = unknown[];
type ProgramFn = () => Instruction[];

interface Line {
  id: number;
  node?: React.ReactNode;
  text?: string;
  cls?: string;
  pfx?: string | null;
}

function useInView() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    let id: ReturnType<typeof setInterval>;
    const check = () => {
      if (!ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const margin = vh * 0.12;
      if (r.top < vh - margin && r.bottom > margin) {
        setSeen(true);
        clearInterval(id);
        return true;
      }
      return false;
    };
    if (check()) return;
    id = setInterval(check, 220);
    return () => clearInterval(id);
  }, []);
  return [ref, seen] as const;
}

function Spin({ on = true }: { on?: boolean }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setI((x) => (x + 1) % SPIN.length), 80);
    return () => clearInterval(id);
  }, [on]);
  return <span style={{ color: "var(--z-ink-5)" }}>{SPIN[on ? i : 0]}</span>;
}

// ── line colour helpers (used inside program nodes) ──
export const Ok = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-green)" }}>{children}</span>;
export const Err = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-red)" }}>{children}</span>;
export const Warn = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-amber)" }}>{children}</span>;
export const Dim = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-ink-5)" }}>{children}</span>;
export const Faint = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-ink-7)" }}>{children}</span>;
export const Acc = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-blue)" }}>{children}</span>;
export const Bold = ({ children }: { children: React.ReactNode }) => <span style={{ color: "var(--z-ink)", fontWeight: 600 }}>{children}</span>;

function staticFrame(prog: Instruction[]): Line[] {
  const out: Line[] = [];
  let key = 0;
  for (const ins of prog) {
    const [op, a, , c] = ins;
    if (op === "type") {
      const opts = (ins[2] ?? {}) as { cls?: string; prefix?: string };
      out.push({ id: key++, text: a as string, cls: opts.cls, pfx: opts.prefix });
    } else if (op === "print") {
      out.push({ id: key++, node: a as React.ReactNode });
    } else if (op === "spin") {
      if (c) out.push({ id: key++, node: c as React.ReactNode });
      else out.push({ id: key++, node: <span><Dim>{SPIN[0]}</Dim> {a as React.ReactNode}</span> });
    }
  }
  return out;
}

function useTerminalEngine(buildProg: ProgramFn, { animate, enabled }: { animate: boolean; enabled: boolean }) {
  const [lines, setLines] = React.useState<Line[]>([]);
  const [typing, setTyping] = React.useState<{ text: string; cls: string; pfx: string | null } | null>(null);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const alive = React.useRef(false);

  React.useEffect(() => {
    if (animate) return;
    setLines(staticFrame(buildProg()));
    setTyping(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  React.useEffect(() => {
    if (!animate || !enabled) return;
    alive.current = true;
    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        timers.current.push(t);
      });

    let committed: Line[] = [];
    let kid = 0;
    const commit = () => setLines(committed.slice());

    const run = async () => {
      while (alive.current) {
        committed = [];
        kid = 0;
        setTyping(null);
        commit();
        await wait(260);
        const prog = buildProg();
        for (const ins of prog) {
          if (!alive.current) return;
          const [op, a, b, c] = ins;
          if (op === "wait") {
            await wait(a as number);
          } else if (op === "print") {
            committed.push({ id: kid++, node: a as React.ReactNode });
            commit();
            await wait((b as number) || 90);
          } else if (op === "type") {
            const opts = (b ?? {}) as { cls?: string; prefix?: string; cps?: number; after?: number };
            const cls = opts.cls || "";
            const pfx = opts.prefix || null;
            const cps = opts.cps || 42;
            const text = a as string;
            const step = Math.max(12, Math.round(1000 / cps));
            for (let i = 1; i <= text.length; i++) {
              if (!alive.current) return;
              setTyping({ text: text.slice(0, i), cls, pfx });
              await wait(step);
            }
            committed.push({ id: kid++, text, cls, pfx });
            setTyping(null);
            commit();
            await wait(opts.after != null ? opts.after : 120);
          } else if (op === "spin") {
            const spinId = kid++;
            committed.push({ id: spinId, node: <span><Spin /> <Dim>{a as React.ReactNode}</Dim></span> });
            commit();
            await wait((b as number) || 1100);
            if (!alive.current) return;
            if (c) committed = committed.map((l) => (l.id === spinId ? { id: spinId, node: c as React.ReactNode } : l));
            else committed = committed.filter((l) => l.id !== spinId);
            commit();
            await wait(120);
          } else if (op === "loop") {
            await wait((a as number) || 1600);
          }
        }
        if (!alive.current) return;
        await wait(1700);
      }
    };
    run();
    return () => {
      alive.current = false;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, enabled]);

  return { lines, typing };
}

export interface TerminalProps {
  title?: string;
  sub?: string;
  chrome?: "dots" | "minimal" | "bare";
  program: ProgramFn;
  animate?: boolean;
  accentPrompt?: boolean;
  className?: string;
}

export function Terminal({ title, sub, chrome = "dots", program, animate = true, accentPrompt = true, className = "" }: TerminalProps) {
  const [ref, seen] = useInView();
  const { lines, typing } = useTerminalEngine(program, { animate, enabled: seen });

  const staticFallback = React.useMemo(() => staticFrame(program()), [program]);
  const showFallback = animate && !typing && lines.length === 0;
  const visibleLines = showFallback ? staticFallback : lines;
  const promptColor = accentPrompt ? "var(--z-blue)" : "var(--z-ink-2)";

  const renderLine = (l: Line) => {
    if (l.node) return l.node;
    const pfx = l.pfx ? <span style={{ color: promptColor, marginRight: 8 }}>{l.pfx}</span> : null;
    return <span className={l.cls}>{pfx}{l.text}</span>;
  };

  return (
    <div ref={ref} className={"zterm " + className}>
      {chrome !== "bare" && (
        <div className="zterm-bar">
          {chrome === "dots" && (
            <div className="zterm-dots" aria-hidden="true"><i /><i /><i /></div>
          )}
          <span style={{ color: "var(--z-ink-2)" }}>{title}</span>
          {sub && <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>{sub}</span>}
        </div>
      )}
      <div className="zterm-body">
        {visibleLines.map((l) => (
          <div className="zterm-line" key={l.id}>{renderLine(l)}</div>
        ))}
        {typing && (
          <div className="zterm-line">
            {typing.pfx ? <span style={{ color: promptColor, marginRight: 8 }}>{typing.pfx}</span> : null}
            <span className={typing.cls}>{typing.text}</span>
            <span className="caret" />
          </div>
        )}
        {!typing && animate && !showFallback && (
          <div className="zterm-line">
            <span style={{ color: promptColor, marginRight: 8 }}>❯</span>
            <span className="caret" />
          </div>
        )}
      </div>
    </div>
  );
}
