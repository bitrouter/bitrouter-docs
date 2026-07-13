"use client";

/* Mono/dev landing — port of the "BitRouter Landing v2" Claude Design handoff.
   Sections: hero (multiplexer TUI + quickstart) / no-lock-in / use-cases /
   benchmark / act-observe-evaluate-learn loop / faq / cta. Wrapped in .br-mono,
   whose tokens alias the shared --bp-* palette (globals.css) so the terminal
   skin themes light/dark. */

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import "./mono.css";
import { Benchmark } from "./benchmark";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";

/* Returns true once the component has mounted on a viewport ≤ bp px wide.
   Starts false (SSR + first paint) to avoid hydration mismatch. */
function useMobile(bp = 900) {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    setMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return mobile;
}

/* ---------------- INSTALL TABS ---------------- */
const INSTALL: Record<string, string> = {
  curl: "curl -fsSL https://bitrouter.ai/install.sh | sh",
  npm: "npm install -g bitrouter",
  brew: "brew install bitrouter/tap/bitrouter",
  skills: "npx skills add bitrouter/bitrouter",
};

function InstallBar() {
  const [tab, setTab] = React.useState("curl");
  const [copied, setCopied] = React.useState(false);
  const cmd = INSTALL[tab];
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
    posthog.capture("install_command_copied", { method: tab });
  };
  return (
    <div className="install">
      <div className="install-tabs">
        {Object.keys(INSTALL).map((k) => (
          <button
            key={k}
            className={"install-tab" + (k === tab ? " on" : "")}
            onClick={() => setTab(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="install-cmd">
        <span className="install-prompt">$</span>
        <code>{cmd}</code>
        <button className="install-copy" onClick={copy}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- HERO (multiplexer TUI + quickstart) ----------------
   The hero is a live control surface. The quickstart tabs (CLI/MCP/skills/
   agent) pick which agent is "focused" in the multiplexer rail; the `agent`
   tab opens a chat pane where objective suggestions retune the whole hero —
   headline, sub, and the model split BitRouter would pick — via `mDim`. */
type Dim = "cost" | "accuracy" | "latency" | "all";
type QsTab = "cli" | "mcp" | "skills" | "agent";

const HERO_HEAD: Record<Dim, string> = {
  cost: "Stop tokenmaxxing your agentic loops.",
  accuracy: "Never trade the hard calls for cheap tokens.",
  latency: "Answers before your users blink.",
  all: "Cost, quality, and speed — tuned every run.",
};
const HERO_SUB: Record<Dim, string> = {
  cost: "Context-aware LLM router that optimize your agentic workflows with every run",
  accuracy: "Escalate the calls that need reasoning to frontier — automatically, per call.",
  latency: "Bias every hop toward the fastest model that still holds quality.",
  all: "One context-aware loop balances the three, and gets better with every run.",
};

type SplitRow = { name: string; prov: string; share: number };
const HERO_LINE: Record<Dim, SplitRow[]> = {
  cost: [
    { name: "qwen/qwen-3.7", prov: "open", share: 78 },
    { name: "minimax/m3", prov: "open", share: 15 },
    { name: "claude-opus-4.8", prov: "frontier", share: 7 },
  ],
  accuracy: [
    { name: "claude-opus-4.8", prov: "frontier", share: 46 },
    { name: "openai/gpt-5", prov: "frontier", share: 34 },
    { name: "deepseek-v4-pro", prov: "open", share: 20 },
  ],
  latency: [
    { name: "gemini-3.5-flash", prov: "fast", share: 60 },
    { name: "qwen-3.7-turbo", prov: "fast", share: 30 },
    { name: "claude-opus-4.8", prov: "frontier", share: 10 },
  ],
  all: [
    { name: "qwen/qwen-3.7", prov: "open", share: 62 },
    { name: "deepseek-v4-pro", prov: "open", share: 26 },
    { name: "claude-opus-4.8", prov: "frontier", share: 12 },
  ],
};

// Single reference workflow the hero profiles. `out[dim]` = [cost, p50, quality];
// `fb` is the all-frontier baseline the savings are computed against.
const WF = {
  label: "Coding agent",
  calls: "~2,400 calls / run",
  fb: 2.1,
  out: {
    cost: [0.43, "88ms", "96%"],
    accuracy: [1.55, "180ms", "99%"],
    latency: [0.72, "61ms", "95%"],
    all: [0.61, "92ms", "98%"],
  } as Record<Dim, [number, string, string]>,
};

type Agent = { name: string; loop: string; model: string; cost: string; id: string };
const AGENTS: Agent[] = [
  { name: "bitrouter", loop: "optimizer", model: "router", cost: "", id: "00c3f1a2" },
  { name: "claude-code", loop: "acp", model: "claude-opus-4.8", cost: "$0.43", id: "001859e1" },
  { name: "codex", loop: "mcp", model: "openai/gpt-5", cost: "$0.28", id: "7f20aa3c" },
  { name: "opencode", loop: "openai", model: "qwen/qwen-3.7", cost: "$0.02", id: "b1d0e4a9" },
  { name: "pi-agent", loop: "skills", model: "deepseek-v4-pro", cost: "$0.06", id: "3ac8125f" },
  { name: "hermes-agent", loop: "mcp", model: "minimax/m3", cost: "$0.01", id: "e6721bd4" },
  { name: "openclaw", loop: "anthropic", model: "claude-fable-5", cost: "$0.11", id: "c9f34a70" },
];

const QS: Record<QsTab, { cmd: string; sub: string; agent: string }> = {
  cli: {
    cmd: "curl -fsSL https://bitrouter.ai/install.sh | sh",
    sub: "then  bitrouter run claude-code",
    agent: "claude-code",
  },
  mcp: {
    cmd: "npx bitrouter mcp install --client claude",
    sub: "registers bitrouter as an MCP server",
    agent: "codex",
  },
  skills: {
    cmd: "npx skills add bitrouter/bitrouter",
    sub: "drop-in skill for any agent",
    agent: "pi-agent",
  },
  agent: { cmd: "", sub: "", agent: "bitrouter" },
};

const SUGS: { dim: Dim; label: string }[] = [
  { dim: "cost", label: "make it cheaper" },
  { dim: "accuracy", label: "max quality" },
  { dim: "latency", label: "fastest" },
  { dim: "all", label: "balance all" },
];

const fmtCost = (n: number) =>
  n >= 1 ? "$" + n.toFixed(2) : n >= 0.01 ? "$" + n.toFixed(3) : "$" + n.toFixed(4);
const mkBar = (share: number) => {
  const b = Math.max(1, Math.round(share / 10));
  return "█".repeat(b) + "░".repeat(Math.max(0, 10 - b));
};

function Hero() {
  const mobile = useMobile();
  const [mDim, setMDim] = React.useState<Dim>("cost");
  const [qsTab, setQsTab] = React.useState<QsTab>("agent");
  const [streamN, setStreamN] = React.useState(0);
  const [runId, setRunId] = React.useState(0);
  const [qsCopied, setQsCopied] = React.useState(false);

  // Stream the chat pane 0→4 (bitrouter "thinking" → profile → split →
  // projected → apply). Restarts when a new objective is picked or the agent
  // tab is re-opened. On mobile it renders complete, no animation.
  React.useEffect(() => {
    if (mobile) {
      setStreamN(4);
      return;
    }
    setStreamN(0);
    const t = setInterval(() => {
      setStreamN((n) => {
        if (n >= 4) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 430);
    return () => clearInterval(t);
  }, [runId, mobile]);

  const restart = () => setRunId((r) => r + 1);
  const pickDim = (d: Dim) => {
    setMDim(d);
    restart();
  };
  const pickQs = (k: QsTab) => {
    setQsTab(k);
    if (k === "agent") restart();
  };
  const copyQs = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(QS[qsTab].cmd);
    setQsCopied(true);
    setTimeout(() => setQsCopied(false), 1400);
  };

  const dim = mDim;
  const out = WF.out[dim];
  const savePct = Math.max(0, Math.round((1 - out[0] / WF.fb) * 100));
  const models = HERO_LINE[dim].map((m) => ({ ...m, bar: mkBar(m.share) }));
  const wf = WF.label;
  const userMsg = {
    cost: `optimize my ${wf.toLowerCase()} run — cut cost, keep quality`,
    accuracy: `maximize quality on ${wf.toLowerCase()}, cost is secondary`,
    latency: `make ${wf.toLowerCase()} respond as fast as possible`,
    all: `balance cost, quality and speed for ${wf.toLowerCase()}`,
  }[dim];
  const activeAgent = QS[qsTab].agent;
  const railM = AGENTS.map((a) => ({ ...a, on: a.name === activeAgent }));
  const am = railM.find((a) => a.on) || railM[0];
  const paneIsChat = qsTab === "agent";
  const routeBy = dim === "all" ? "balanced" : dim;

  const profile = `profiled ${wf} · ${WF.calls} · optimize: ${dim}`;
  const projected = `${fmtCost(out[0])}/run · p50 ${out[1]} · q ${out[2]} · −${savePct}% vs all-frontier`;
  const feedTitle4 = `${am.name} · ${am.loop} · routing by ${routeBy}`;
  const callsBare = WF.calls.replace(/^~/, "");
  const s1 = streamN >= 1;
  const s2 = streamN >= 2;
  const s3 = streamN >= 3;
  const s4 = streamN >= 4;
  const thinking = streamN < 1;

  const Split = ({ rows }: { rows: (SplitRow & { bar: string })[] }) => (
    <>
      {rows.map((m) => (
        <div className="tui-mrow" key={m.name}>
          <span className="tui-mname">{m.name}</span>
          <span className="tui-mprov">{m.prov}</span>
          <span className="tui-mshare">{m.share}%</span>
          <span className="tui-mbar">{m.bar}</span>
        </div>
      ))}
    </>
  );

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hc">
          <div className="hc-copy">
            <span className="chip">
              <span style={{ color: "var(--accent)" }}>◆</span> context-aware
              router · optimizes every run
            </span>
            <h1 className="h-display hc-title" style={{ marginTop: 22 }}>
              {HERO_HEAD[dim]}
            </h1>
            <p className="hc-sub">{HERO_SUB[dim]}</p>
            <div className="hc-block">
              <div className="ctl-lbl">Quickstart</div>
              <div className="qs">
                <div className="qs-tabs">
                  {(["cli", "mcp", "skills", "agent"] as QsTab[]).map((k) => (
                    <button
                      key={k}
                      className={"qs-tab" + (qsTab === k ? " on" : "")}
                      onClick={() => pickQs(k)}
                    >
                      {k === "cli" ? "CLI" : k === "mcp" ? "MCP" : k}
                    </button>
                  ))}
                </div>
                {!paneIsChat ? (
                  <>
                    <div className="qs-cmd">
                      <span className="qs-prompt">$</span>
                      <code>{QS[qsTab].cmd}</code>
                      <button className="qs-copy" onClick={copyQs}>
                        {qsCopied ? "✓ copied" : "copy"}
                      </button>
                    </div>
                    <div className="qs-sub">↳ {QS[qsTab].sub}</div>
                  </>
                ) : (
                  <>
                    <div className="qs-cmd">
                      <span className="qs-prompt acc">❯</span>
                      <code>{userMsg}</code>
                      <span className="qs-cap" />
                    </div>
                    <div className="qs-examples">
                      {SUGS.map((s) => (
                        <button
                          key={s.dim}
                          className={"sug" + (mDim === s.dim ? " on" : "")}
                          onClick={() => pickDim(s.dim)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="hc-actions">
              <a
                href={SIGN_IN_URL}
                className="btn btn-primary"
                onClick={() =>
                  posthog.capture("get_api_key_clicked", { location: "hero" })
                }
              >
                Get API key →
              </a>
              <Link href="/docs" className="btn btn-ghost">
                Documentation
              </Link>
            </div>
          </div>

          <div className="hc-vis">
            <div className="mux">
              <div className="mux-top">
                <span className="dot" />
                <span className="tt">bitrouter · multiplexer</span>
                <span className="rt">7 agents · 5 loops</span>
              </div>
              <div className="mux-main">
                <div className="tx-rail">
                  <div className="tx-rail-h">agents · 7</div>
                  {railM.map((ag) => (
                    <div className={"tx-ag" + (ag.on ? " on" : "")} key={ag.name}>
                      <div className="tx-ag-top">
                        <span className="mk">▸</span>
                        <span className="nm">{ag.name}</span>
                        <span className="st">●</span>
                      </div>
                      <div className="tx-ag-meta">
                        {ag.loop} · {ag.model} {ag.cost}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mux-pane">
                  {paneIsChat ? (
                    <div>
                      <div className="tx-ptitle">
                        [bitrouter] <span className="id">optimize · {am.id}</span>
                      </div>
                      <div className="pane-body">
                        <div className="chat-u">
                          <span className="who">you ❯</span>
                          <span className="msg">{userMsg}</span>
                        </div>
                        {thinking && (
                          <div className="think">bitrouter thinking…</div>
                        )}
                        <div className="chat-b">
                          <span className="who">bitrouter</span>
                          {s1 && (
                            <div className="br-line">
                              <span className="t-acc">▸</span> {profile}
                            </div>
                          )}
                          {s2 && (
                            <div>
                              <div className="split-h">model split ↴</div>
                              <Split rows={models} />
                            </div>
                          )}
                          {s3 && (
                            <div>
                              <span className="t-ok">✓ projected</span>{" "}
                              {projected}
                            </div>
                          )}
                          {s4 && (
                            <div className="apply">
                              apply to {wf}?{" "}
                              <span className="t-acc">[enter] apply</span>{" "}
                              <span className="t-faint">
                                · [tab] tweak objective
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="tx-ptitle">
                        [{am.name}]{" "}
                        <span className="id">
                          {am.loop} · {am.id}
                        </span>
                      </div>
                      <div className="pane-body">
                        <div className="tui-line">
                          <span className="t-acc">❯</span>{" "}
                          <span className="t-dim">{feedTitle4}</span>
                        </div>
                        <div className="tui-line">
                          <span className="t-faint">
                            {"  "}quality_floor 0.92 · loop_guard on
                          </span>
                        </div>
                        <div className="tui-line">&nbsp;</div>
                        <Split rows={models} />
                        <div className="tui-line">
                          <span className="tui-div">
                            ──────────────────────────────────
                          </span>
                        </div>
                        <div className="tui-line">
                          <span className="t-ok">✓</span>{" "}
                          <span className="t-fg">{callsBare}</span>{" "}
                          <span className="t-dim">·</span>{" "}
                          <span className="t-ok">{fmtCost(out[0])} /run</span>{" "}
                          <span className="t-dim">
                            · p50 {out[1]} · q {out[2]}
                          </span>
                        </div>
                        <div className="tui-line">
                          <span className="t-faint">
                            {"  "}vs {fmtCost(WF.fb)} all-frontier ·
                          </span>{" "}
                          <span className="t-ok">saved −{savePct}%</span>
                        </div>
                        <div className="tui-line">
                          <span className="t-acc">❯</span>{" "}
                          <span className="feed-caret" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mux-status">
                <span className="mode">NORMAL</span> ^a manage · ^b broadcast ·
                : cmd · PgUp/PgDn scroll · ^c quit
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- NO LOCK-IN ---------------- */
const LOCKIN: { k: string; v: string }[] = [
  { k: "no model lock-in", v: "swap any model, open or frontier, per call" },
  { k: "no harness lock-in", v: "Claude Code, Cursor, Codex — or your own" },
  { k: "no gateway lock-in", v: "open-sourced, cloud opt-in" },
];

function NoLockIn() {
  return (
    <section className="lockin">
      <div className="wrap lockin-grid">
        {LOCKIN.map((i) => (
          <div className="lockin-item" key={i.k}>
            <span className="lockin-k">
              <span className="lockin-dot">●</span> {i.k}
            </span>
            <span className="lockin-v">{i.v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- USE CASES ----------------
   One switch, four objectives. Each tab reframes the same run around a target
   (cost / accuracy / latency / balance): the painpoint it fixes, the win, and
   the model split BitRouter routed to hit it. "Balance" swaps the before/after
   bar for the policy knobs the user owns. */
type Case = {
  hue: string;
  objTag: string;
  scenario: string;
  today: string;
  did: string;
  win: string;
  winK: string;
  barTitle?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeW?: number;
  afterW?: number;
  models: { name: string; role: string; share: number }[];
};

const CASES: Record<Dim, Case> = {
  cost: {
    hue: "var(--term-ok)",
    objTag: "optimize · cost",
    scenario: "A 200-file refactor — ~2,400 model calls in one run.",
    today:
      "Billed at frontier prices the run costs $2.10, and ~90% of those calls were trivial reads and edits.",
    did: "Routed the routine 2,200 calls to open models and kept the ~200 hard edits on Opus — same diffs, tests green.",
    win: "−80%",
    winK: "cost / run",
    barTitle: "cost for this run",
    beforeLabel: "all-frontier · $2.10",
    afterLabel: "BitRouter · $0.43",
    beforeW: 100,
    afterW: 20,
    models: [
      { name: "qwen/qwen-3.7", role: "reads · edits", share: 78 },
      { name: "minimax/m3", role: "format", share: 15 },
      { name: "claude-opus-4.8", role: "hard edits", share: 7 },
    ],
  },
  accuracy: {
    hue: "var(--accent)",
    objTag: "optimize · accuracy",
    scenario: "A research agent — reads filings, reasons, answers.",
    today:
      "Cheap-everywhere and the reasoning steps quietly get it wrong; a bad answer ships straight into a decision.",
    did: "Reads and extraction stay open; the judgment calls escalate to frontier, held to a 0.92 quality floor.",
    win: "99%",
    winK: "answers rated correct",
    barTitle: "answer-correct rate",
    beforeLabel: "all-open · 88%",
    afterLabel: "BitRouter · 99%",
    beforeW: 89,
    afterW: 100,
    models: [
      { name: "qwen/qwen-3.7", role: "read · extract", share: 68 },
      { name: "claude-opus-4.8", role: "reasoning", share: 24 },
      { name: "deepseek-v4-pro", role: "verify", share: 8 },
    ],
  },
  latency: {
    hue: "var(--term-info)",
    objTag: "optimize · latency",
    scenario: "Live chat with tool calls — ~40 calls a session.",
    today:
      "A slow hop makes the user wait; a 720ms median answer kills the back-and-forth of a real conversation.",
    did: "Every hop biased to the fastest model that clears the quality floor; frontier only when a case is genuinely hard.",
    win: "61ms",
    winK: "p50 answer latency",
    barTitle: "p50 latency",
    beforeLabel: "all-frontier · 720ms",
    afterLabel: "BitRouter · 61ms",
    beforeW: 100,
    afterW: 9,
    models: [
      { name: "gemini-3.5-flash", role: "replies", share: 65 },
      { name: "qwen-3.7-turbo", role: "tools", share: 28 },
      { name: "claude-opus-4.8", role: "escalations", share: 7 },
    ],
  },
  all: {
    hue: "var(--term-warn)",
    objTag: "optimize · your rules",
    scenario: "One router in front of a dozen agents and 40 repos.",
    today:
      "Every team wants a different trade-off; a static router that decides once picks a fight with half of them.",
    did: "Each path gets its own objective, quality floor, and spend cap — one versioned policy, override any call.",
    win: "Yours",
    winK: "objective · floor · caps · overrides",
    models: [
      { name: "qwen/qwen-3.7", role: "default", share: 60 },
      { name: "deepseek-v4-pro", role: "medium", share: 28 },
      { name: "claude-opus-4.8", role: "pinned paths", share: 12 },
    ],
  },
};

function Cases() {
  const [dim, setDim] = React.useState<Dim>("cost");
  const c = CASES[dim];
  const isBalance = dim === "all";
  return (
    <section className="sec cases">
      <div className="wrap">
        <div className="sec-head" style={{ maxWidth: 720 }}>
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> where it pays off
          </div>
          <h2 className="h-display sec-title">
            One switch. Four ways it pays off.
          </h2>
          <p className="sec-lead">
            Tell BitRouter what a workflow should optimize for — it tunes the
            routing to match. Here&rsquo;s the painpoint each target fixes.
          </p>
        </div>
        <div className="cases-tabs" style={{ ["--cx" as string]: c.hue }}>
          {(["cost", "accuracy", "latency", "all"] as Dim[]).map((k) => (
            <button
              key={k}
              className={"cases-tab" + (dim === k ? " on" : "")}
              onClick={() => setDim(k)}
            >
              {k === "cost"
                ? "Cost"
                : k === "accuracy"
                  ? "Accuracy"
                  : k === "latency"
                    ? "Latency"
                    : "Balance"}
            </button>
          ))}
        </div>
        <div className="uc-card" style={{ ["--cx" as string]: c.hue }}>
          <div className="uc-copy">
            <div className="uc-obj">
              <span className="dot" /> {c.objTag}
            </div>
            <h3 className="h-display uc-scenario">{c.scenario}</h3>
            <div className="uc-story">
              <div className="uc-sr bad">
                <span className="mk">✗</span>
                <span className="txt">
                  <b>Today.</b> {c.today}
                </span>
              </div>
              <div className="uc-sr good">
                <span className="mk">▸</span>
                <span className="txt">
                  <b>BitRouter.</b> {c.did}
                </span>
              </div>
            </div>
          </div>
          <div className="uc-panel">
            <div className="uc-win">{c.win}</div>
            <div className="uc-wink">{c.winK}</div>
            {!isBalance ? (
              <div>
                <div className="uc-batitle">{c.barTitle}</div>
                <div className="uc-ba uc-before">
                  <div className="uc-ba-lab">
                    <span className="l">{c.beforeLabel}</span>
                  </div>
                  <div className="uc-track">
                    <i style={{ width: `${c.beforeW}%` }} />
                  </div>
                </div>
                <div className="uc-ba uc-after">
                  <div className="uc-ba-lab">
                    <span className="n">{c.afterLabel}</span>
                  </div>
                  <div className="uc-track">
                    <i style={{ width: `${c.afterW}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="uc-batitle">
                  bitrouter.policy.yaml · your rules
                </div>
                <div className="uc-knobs">
                  <div className="uc-knob">
                    <span className="kk">objective</span>
                    <span className="lead" />
                    <span className="kv warn">balanced</span>
                  </div>
                  <div className="uc-knob">
                    <span className="kk">quality_floor</span>
                    <span className="lead" />
                    <span className="kv">0.92</span>
                  </div>
                  <div className="uc-knob">
                    <span className="kk">max_latency_p95</span>
                    <span className="lead" />
                    <span className="kv">1200ms</span>
                  </div>
                  <div className="uc-knob">
                    <span className="kk">spend / run</span>
                    <span className="lead" />
                    <span className="kv">$5.00</span>
                  </div>
                  <div className="uc-knob">
                    <span className="kk">override &quot;src/checkout/**&quot;</span>
                    <span className="lead" />
                    <span className="kv warn">opus-4.8</span>
                  </div>
                </div>
              </div>
            )}
            <div className="uc-split">
              <div className="uc-splith">how it routed this run</div>
              {c.models.map((m) => (
                <div className="uc-sp" key={m.name}>
                  <div className="uc-sp-top">
                    <span className="uc-sp-name">{m.name}</span>
                    <span className="uc-sp-share">
                      {m.role} · {m.share}%
                    </span>
                  </div>
                  <div className="uc-sptrack">
                    <i style={{ width: `${m.share}%`, background: c.hue }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- THE LOOP (act · observe · evaluate · learn) ----------------
   Four stacked step rows, each with copy + a TUI pane, tracing the closed loop
   BitRouter runs on every call: route → trace → score → fold back into the
   policy. Panes are static snapshots of one lap. */
function Loop() {
  return (
    <section className="sec loop">
      <div className="wrap">
        <div className="sec-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> how we optimize
          </div>
          <h2 className="h-display sec-title">Act. Observe. Evaluate. Update.</h2>
          <p className="sec-lead">
            Not a static router that decides once and rots. BitRouter runs a
            closed loop on every call — act, observe, evaluate, then update the
            routing policy — so it gets cheaper and sharper each lap, with no
            tuning by you.
          </p>
        </div>
        <div className="loop-steps">
          {/* 01 · ACT */}
          <div className="lstep on">
            <div className="lstep-copy">
              <div className="sl">
                <span className="n">01</span> Act
              </div>
              <h3>Route each call to the model that fits.</h3>
              <p>
                Routine calls go to open models; the hard ones escalate to
                frontier — the cheapest model that still clears the bar, decided
                per call.
              </p>
              <div className="lchips">
                <span className="c key">in the request path</span>
                <span className="c">intent-aware</span>
              </div>
            </div>
            <div className="lstep-pane">
              <div className="tbox">
                <div className="tboxh">
                  ┌ route · live<span className="rt">last 4 calls</span>
                </div>
                <table className="tgrid">
                  <thead>
                    <tr>
                      <th>request</th>
                      <th>cx</th>
                      <th>routed</th>
                      <th>cost</th>
                      <th>decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="i">fix auth.py test</td>
                      <td>0.18</td>
                      <td className="i">qwen/qwen-3.7</td>
                      <td>$0.002</td>
                      <td>
                        <span className="tag ok">open</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="i">summarize thread</td>
                      <td>0.12</td>
                      <td className="i">qwen/qwen-3.7</td>
                      <td>$0.002</td>
                      <td>
                        <span className="tag ok">open</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="i">design migration plan</td>
                      <td>0.62</td>
                      <td className="i">gpt-5.5</td>
                      <td>$0.021</td>
                      <td>
                        <span className="tag cy">frontier</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="i">rank retrieval hits</td>
                      <td>0.30</td>
                      <td className="i">deepseek-v4</td>
                      <td>$0.003</td>
                      <td>
                        <span className="tag ok">open</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  style={{
                    padding: "11px 14px",
                    borderTop: "1px solid var(--rule)",
                    fontSize: "12.5px",
                    color: "var(--mid)",
                  }}
                >
                  <span style={{ color: "var(--faint)" }}>rule</span>
                  &nbsp;&nbsp;complexity ≤{" "}
                  <span style={{ color: "var(--ink)" }}>0.55</span> → open
                  pool&nbsp;&nbsp;·&nbsp;&nbsp;else → frontier
                </div>
              </div>
            </div>
          </div>

          {/* 02 · OBSERVE */}
          <div className="lstep alt on">
            <div className="lstep-copy">
              <div className="sl">
                <span className="n">02</span> Observe
              </div>
              <h3>See every call, per run.</h3>
              <p>
                Cost, latency and outcome traced for each call and attributed to
                the run — in the request path, nothing to bolt on.
              </p>
              <div className="lchips">
                <span className="c key">no SDK</span>
                <span className="c">per-run traces</span>
              </div>
            </div>
            <div className="lstep-pane">
              <div className="tbox">
                <div className="tboxh">
                  ┌ trace · run #1428<span className="rt">newest first</span>
                </div>
                <div className="tstat">
                  <span>
                    calls <b>12</b>
                  </span>
                  <span>
                    total <b className="g">$0.026</b>
                  </span>
                  <span>
                    p50 <b>88ms</b>
                  </span>
                </div>
                <table
                  className="tgrid"
                  style={{ borderTop: "1px solid var(--rule)" }}
                >
                  <thead>
                    <tr>
                      <th>time</th>
                      <th>model</th>
                      <th>cost</th>
                      <th>lat</th>
                      <th>st</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>14:22:01</td>
                      <td className="i">qwen/qwen-3.7</td>
                      <td>$0.002</td>
                      <td>82ms</td>
                      <td>
                        <span className="tag ok">ok</span>
                      </td>
                    </tr>
                    <tr>
                      <td>14:22:00</td>
                      <td className="i">qwen/qwen-3.7</td>
                      <td>$0.002</td>
                      <td>91ms</td>
                      <td>
                        <span className="tag ok">ok</span>
                      </td>
                    </tr>
                    <tr>
                      <td>14:21:58</td>
                      <td className="i">deepseek-v4</td>
                      <td>$0.003</td>
                      <td>101ms</td>
                      <td>
                        <span className="tag ok">ok</span>
                      </td>
                    </tr>
                    <tr>
                      <td>14:21:55</td>
                      <td className="i">gpt-5.5</td>
                      <td>$0.021</td>
                      <td>140ms</td>
                      <td>
                        <span className="tag ok">ok</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 03 · EVALUATE */}
          <div className="lstep on">
            <div className="lstep-copy">
              <div className="sl">
                <span className="n">03</span> Evaluate
              </div>
              <h3>Score what the call actually needed.</h3>
              <p>
                Each call is scored by complexity against the policy threshold —
                so the next decision knows when an open model is enough and when
                to escalate.
              </p>
              <div className="lchips">
                <span className="c key">complexity scoring</span>
                <span className="c">quality floor</span>
              </div>
            </div>
            <div className="lstep-pane">
              <div className="tbox">
                <div className="tboxh">
                  ┌ eval · floor 0.85<span className="rt">threshold 0.55</span>
                </div>
                <table className="tgrid">
                  <thead>
                    <tr>
                      <th>request</th>
                      <th>cx</th>
                      <th>bar</th>
                      <th>q</th>
                      <th>verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="i">fix auth.py test</td>
                      <td>0.18</td>
                      <td>
                        <span
                          className="tbar-cells"
                          style={{ color: "var(--ok)" }}
                        >
                          ▓▓░░░░░░░░
                        </span>
                      </td>
                      <td>0.91</td>
                      <td>
                        <span className="tag ok">open holds it</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="i">rank retrieval hits</td>
                      <td>0.30</td>
                      <td>
                        <span
                          className="tbar-cells"
                          style={{ color: "var(--ok)" }}
                        >
                          ▓▓▓░░░░░░░
                        </span>
                      </td>
                      <td>0.88</td>
                      <td>
                        <span className="tag ok">open holds it</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="i">design migration plan</td>
                      <td>0.62</td>
                      <td>
                        <span
                          className="tbar-cells"
                          style={{ color: "var(--cy)" }}
                        >
                          ▓▓▓▓▓▓░░░░
                        </span>
                      </td>
                      <td>0.94</td>
                      <td>
                        <span className="tag cy">escalate</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 04 · LEARN */}
          <div className="lstep alt on">
            <div className="lstep-copy">
              <div className="sl">
                <span className="n">04</span> LEARN
              </div>
              <h3>Tune the policy from what it learned.</h3>
              <p>
                Every lap folds the traces back into the routing policy — the
                threshold and model mix shift, and the cost per run keeps
                dropping.
              </p>
              <div className="lchips">
                <span className="c key">self-tuning</span>
                <span className="c">cheaper each lap</span>
              </div>
            </div>
            <div className="lstep-pane">
              <div className="tbox">
                <div className="tboxh">
                  ┌ policy.yaml · committed v.7
                  <span className="rt">diff · this lap</span>
                </div>
                <div
                  className="tstat"
                  style={{ borderBottom: "1px solid var(--rule)" }}
                >
                  <span>
                    cost/run <b className="g">$0.41</b>{" "}
                    <span
                      style={{
                        color: "var(--faint)",
                        textDecoration: "line-through",
                      }}
                    >
                      $0.43
                    </span>
                  </span>
                  <span>
                    threshold <b>0.54</b>
                  </span>
                  <span>
                    open <b>78%</b>
                  </span>
                </div>
                <div className="tyaml">
                  <span className="k">route</span>:{"\n  "}
                  <span className="k">optimize</span>: cost{"\n"}
                  <span className="del">-   threshold: 0.55</span>
                  {"\n"}
                  <span className="add">+   threshold: 0.54</span>
                  {"\n"}
                  <span className="del">-   cost_per_run: $0.43</span>
                  {"\n"}
                  <span className="add">+   cost_per_run: $0.41</span>
                  {"\n"}
                  <span className="cm">
                    {"  "}# ↻ feeds the next routing decision
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="loop-lap">
          <span className="dot" />
          self-tuning — every lap folds traces back into the policy, cheaper
          each run
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS = [
  {
    q: "What is an AI model router?",
    a: "An AI model router is a unified API layer that sits between your AI agent and the upstream LLM providers. Instead of hardcoding a single provider into your application, you point every model call at the router and it intelligently selects the best available model based on cost, latency, capability, and provider health. BitRouter goes further than a simple proxy: it handles failover, per-run observability, prompt-injection guardrails, and task-complexity-based model matching — all without any changes to your agent code.",
  },
  {
    q: "How is BitRouter different from OpenRouter?",
    a: "OpenRouter is a closed-source hosted gateway — no self-host option, no agent-native primitives, no permissionless registry. BitRouter is Apache 2.0: fork the binary and run it anywhere, or use the hosted edge if you don't want to operate it. The provider registry is fully open — anyone can publish a provider via pull request with no review queue or approval process. The result is no lock-in at any layer — swap models, switch agent harnesses, or self-host the router itself — plus router-level guardrails, per-run cost attribution, MCP/ACP/Skills gateway support, and intent-aware routing that OpenRouter does not offer.",
  },
  {
    q: "How is BitRouter different from LiteLLM?",
    a: "LiteLLM is an open-source Python library you embed inside your application code. BitRouter is a standalone binary that runs as a sidecar or hosted edge — you drop it in front of any runtime (Claude Code, Cursor, Codex, your own agent) without modifying each service. It comes with auth, billing, observability, guardrails, and an MCP/ACP/Skills gateway built in. You configure policy once at the router rather than repeating safety and routing logic in every service that calls an LLM.",
  },
  {
    q: "Which AI models does BitRouter support?",
    a: "BitRouter's cost advantage comes from open models: the open provider registry carries Qwen 3.7, DeepSeek V4 Pro, Kimi K2.6, GLM 5.1, MiniMax M3, StepFun 3.7, and Mimo V2.5 Pro, and routes the routine majority of an agent's calls to them at a fraction of frontier prices — any provider hosting a model can publish a listing and receive traffic immediately. Frontier models stay one alias away for the calls that need them: Claude Fable 5 / Claude Opus 4.8 (Anthropic), GPT-5 and o3 (OpenAI), Gemini 3.1 Pro and 3.5 Flash (Google), Grok 4.3 (xAI). The model list updates automatically as providers publish new entries; no binary upgrade or alias change is needed on your end.",
  },
  {
    q: "How do I self-host BitRouter?",
    a: "Pull the Apache 2.0 binary from github.com/bitrouter/bitrouter — it is a single binary with no daemon, no GUI, and no infrastructure dependencies beyond a network connection. It drops into any container, CI step, or bare VM. Self-hosted BitRouter gives you the same routing engine, guardrails, MCP/ACP/Skills gateway, and observability as the hosted edge, without the platform fee. Your traffic never leaves your infrastructure.",
  },
  {
    q: "Does BitRouter work with Claude Code and other coding agents?",
    a: "Yes — BitRouter works with any agent harness that supports a configurable base URL or API key. Claude Code, GitHub Copilot, Codex, Opencode, Pi Agent, Hermes, and Openclaw all connect with a two-variable override (ANTHROPIC_BASE_URL or OPENAI_BASE_URL) and zero code changes — routing, failover, cost tracking, and guardrails apply automatically from that point forward. The same pattern works for any harness not yet in the list. Step-by-step setup for each integration is in the cookbook at /docs/integrations.",
  },
];

// FAQPage structured data so the landing Q&A is eligible for rich results and
// can be cited verbatim by LLM answer engines. Built from the same FAQS array
// that renders the visible accordion, so the two never drift.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function Faq() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="sec faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <div className="wrap faq-grid">
        <div className="faq-aside">
          <h2 className="h-display sec-title">Questions before you ship.</h2>
          <p className="sec-lead">
            Common questions about pricing, routing, and data handling. If yours
            isn&rsquo;t here,{" "}
            <Link className="ulink" href="/docs">
              check the docs
            </Link>{" "}
            or talk to us — we usually reply within a day.
          </p>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={"faq-item" + (i === open ? " open" : "")} key={f.q}>
              <button
                className="faq-q"
                onClick={() => setOpen(i === open ? -1 : i)}
              >
                <span className="faq-q-mark">{i === open ? "−" : "+"}</span>
                <span>{f.q}</span>
              </button>
              <div className="faq-a-wrap">
                <div className="faq-a">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ROUTING AS CODE (policy figure, lives in the final CTA) ----
   A code *figure* — not a terminal — styled after a docs/editor screenshot:
   line-number gutter, a "Fig." legend on the border, a copy button, and a
   fade → SEE MORE. Tokens are [text, className?]. */
type RcTok = [string] | [string, string];
type RcLine = RcTok[];
const POLICY: RcLine[] = [
  [["# bitrouter.policy.yaml — context-aware routing, versioned in your repo", "rc-com"]],
  [["version", "rc-key"], [":", "rc-punc"], [" "], ["1", "rc-num"]],
  [["preset", "rc-key"], [":", "rc-punc"], [" code/balanced          "], ["# inherit defaults, override below", "rc-com"]],
  [[" "]],
  [["# what the loop tunes for on every run", "rc-com"]],
  [["optimize", "rc-key"], [":", "rc-punc"]],
  [["  "], ["objective", "rc-key"], [":", "rc-punc"], [" cost            "], ["# cost | accuracy | latency | balanced", "rc-com"]],
  [["  "], ["quality_floor", "rc-key"], [":", "rc-punc"], [" "], ["0.92", "rc-num"], ["       "], ["# never drop below this eval score", "rc-com"]],
  [["  "], ["max_latency_p95", "rc-key"], [":", "rc-punc"], [" "], ["1200ms", "rc-num"]],
  [[" "]],
  [["# model catalogue — aliases → upstream, priced", "rc-com"]],
  [["models", "rc-key"], [":", "rc-punc"]],
  [["  - ", "rc-punc"], ["id", "rc-key"], [":", "rc-punc"], [" "], ["qwen/qwen-3.7", "rc-open"]],
  [["    "], ["tier", "rc-key"], [":", "rc-punc"], [" "], ["open", "rc-open"]],
  [["    "], ["price_per_mtok", "rc-key"], [":", "rc-punc"], [" { "], ["in", "rc-key"], [":", "rc-punc"], [" "], ["0.14", "rc-num"], [", "], ["out", "rc-key"], [":", "rc-punc"], [" "], ["0.28", "rc-num"], [" }"]],
  [["  - ", "rc-punc"], ["id", "rc-key"], [":", "rc-punc"], [" "], ["deepseek/deepseek-v4-pro", "rc-open"]],
  [["    "], ["tier", "rc-key"], [":", "rc-punc"], [" "], ["open", "rc-open"]],
  [["    "], ["price_per_mtok", "rc-key"], [":", "rc-punc"], [" { "], ["in", "rc-key"], [":", "rc-punc"], [" "], ["0.27", "rc-num"], [", "], ["out", "rc-key"], [":", "rc-punc"], [" "], ["1.10", "rc-num"], [" }"]],
  [["  - ", "rc-punc"], ["id", "rc-key"], [":", "rc-punc"], [" "], ["anthropic/claude-opus-4.8", "rc-front"]],
  [["    "], ["tier", "rc-key"], [":", "rc-punc"], [" "], ["frontier", "rc-front"]],
  [["    "], ["price_per_mtok", "rc-key"], [":", "rc-punc"], [" { "], ["in", "rc-key"], [":", "rc-punc"], [" "], ["15.0", "rc-num"], [", "], ["out", "rc-key"], [":", "rc-punc"], [" "], ["75.0", "rc-num"], [" }"]],
  [[" "]],
  [["# routing rules — first match wins; re-scored per call", "rc-com"]],
  [["routes", "rc-key"], [":", "rc-punc"]],
  [["  - ", "rc-punc"], ["match", "rc-key"], [":", "rc-punc"], [" { "], ["intent", "rc-key"], [":", "rc-punc"], [" [lookup, format, classify] }"]],
  [["    "], ["use", "rc-key"], [":", "rc-punc"], [" "], ["qwen/qwen-3.7", "rc-open"]],
  [["  - ", "rc-punc"], ["match", "rc-key"], [":", "rc-punc"], [" { "], ["complexity", "rc-key"], [":", "rc-punc"], [" "], ['">=0.6"', "rc-str"], [" }"]],
  [["    "], ["use", "rc-key"], [":", "rc-punc"], [" "], ["deepseek/deepseek-v4-pro", "rc-open"]],
  [["  - ", "rc-punc"], ["match", "rc-key"], [":", "rc-punc"], [" { "], ["complexity", "rc-key"], [":", "rc-punc"], [" "], ['">=0.85"', "rc-str"], [", "], ["tokens_in", "rc-key"], [":", "rc-punc"], [" "], ['">8k"', "rc-str"], [" }"]],
  [["    "], ["use", "rc-key"], [":", "rc-punc"], [" "], ["anthropic/claude-opus-4.8", "rc-front"]],
  [[" "]],
  [["fallbacks", "rc-key"], [":", "rc-punc"], ["                    "], ["# transparent, mid-run", "rc-com"]],
  [["  - ", "rc-punc"], ["on", "rc-key"], [":", "rc-punc"], [" ["], ["429", "rc-num"], [", "], ["5xx", "rc-num"], [", timeout]"]],
  [["    "], ["chain", "rc-key"], [":", "rc-punc"], [" [anthropic, deepseek, google]"]],
  [[" "]],
  [["guardrails", "rc-key"], [":", "rc-punc"]],
  [["  "], ["prompt_injection", "rc-key"], [":", "rc-punc"], [" block"]],
  [["  "], ["pii", "rc-key"], [":", "rc-punc"], [" redact                "], ["# email · card · ssn", "rc-com"]],
  [["  "], ["spend_per_run", "rc-key"], [":", "rc-punc"], [" "], ["$5.00", "rc-num"]],
  [["  "], ["loop_guard", "rc-key"], [":", "rc-punc"], [" "], ["true", "rc-open"]],
  [[" "]],
  [["overrides", "rc-key"], [":", "rc-punc"]],
  [["  "], ['"src/checkout/**"', "rc-str"], [":", "rc-punc"], [" "], ["anthropic/claude-opus-4.8", "rc-front"], ["   "], ["# you keep the wheel", "rc-com"]],
  [[" "]],
  [["telemetry", "rc-key"], [":", "rc-punc"]],
  [["  "], ["attribution", "rc-key"], [":", "rc-punc"], [" per_run          "], ["# cost + latency per call chain", "rc-com"]],
  [["  "], ["retention", "rc-key"], [":", "rc-punc"], [" none              "], ["# zero content capture by default", "rc-com"]],
];

const POLICY_RAW = POLICY.map((l) => l.map((t) => t[0]).join("")).join("\n");

function PolicyFigure() {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(POLICY_RAW);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
    posthog.capture("policy_yaml_copied", { location: "final_cta" });
  };
  return (
    <div className="rcode-figure">
      <span className="rcode-legend">Fig. — bitrouter.policy.yaml</span>
      <button className="rcode-copy" onClick={copy} aria-label="Copy policy file">
        {copied ? (
          <span className="rcode-copied">✓</span>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
      </button>
      <div className="rcode-scroll">
        <pre className="rcode-pre">
          {POLICY.map((line, i) => (
            <div className="rcl" key={i}>
              <span className="rcln">{i + 1}</span>
              <span className="rctoks">
                {line.length === 0
                  ? " "
                  : line.map((t, j) =>
                      t[1] ? (
                        <span className={t[1]} key={j}>
                          {t[0]}
                        </span>
                      ) : (
                        <span key={j}>{t[0]}</span>
                      ),
                    )}
              </span>
            </div>
          ))}
        </pre>
      </div>
      <div className="rcode-foot">
        <div className="rcode-fade" />
        <Link href="/docs" className="rcode-more">
          SEE MORE
        </Link>
      </div>
    </div>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCta() {
  return (
    <section className="sec cta">
      <div className="wrap cta-wrap dotgrid">
        <div className="cta-head">
          <div
            className="eyebrow sec-eyebrow"
            style={{ ["--sec-accent" as string]: "var(--accent)" }}
          >
            <span className="idx">//</span> routing as code
          </div>
          <h2 className="h-display cta-title">
            Start routing in under a minute.
          </h2>
          <p className="sec-lead">
            One API key, every model — and your cost policy is a file you own.
            Smart defaults out of the box; version it, override any call, never a
            black box.
          </p>
          <div className="cta-actions">
            <a
              href={SIGN_IN_URL}
              className="btn btn-primary"
              onClick={() =>
                posthog.capture("get_api_key_clicked", { location: "final_cta" })
              }
            >
              Get API key →
            </a>
          </div>
          <div className="cta-install">
            <InstallBar />
            <div className="cta-meta">
              <span>
                <span style={{ color: "var(--term-ok)" }}>●</span> 0% markup on
                every model
              </span>
              <span className="fnt">·</span>
              <span>Outcome pricing — pay only on savings</span>
              <span className="fnt">·</span>
              <span>Apache-2.0</span>
            </div>
          </div>
        </div>
        <div className="cta-fig">
          <PolicyFigure />
        </div>
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */
export function MonoLanding() {
  return (
    <>
      <Hero />
      <NoLockIn />
      <Cases />
      {/* Benchmark proof: the measured cost/score win on Terminal-Bench 2.1. */}
      <Benchmark />
      {/* The loop — act · observe · evaluate · learn — flowing into the FAQ. */}
      <Loop />
      <Faq />
      <FinalCta />
    </>
  );
}
