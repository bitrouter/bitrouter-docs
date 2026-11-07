"use client";

import { ArrowDownLeft, ArrowUp, Info, Maximize2, Paperclip, Square, X } from "lucide-react";
import type { TerminalHandle } from "@wterm/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { playgroundImageTypes } from "@/lib/playground-tools";
import type { PlaygroundReceipt } from "./cloud-transport";
import type { TerminalTurn } from "./playground-terminal";
import { profiles, routingStarter, starter, toolArgument, usePlaygroundController, type ModelStep, type PlaygroundTurn } from "./use-playground";
import "./playground.css";

const PlaygroundContext = createContext<ReturnType<typeof usePlaygroundController> | null>(null);
const PlaygroundTerminal = dynamic(() => import("./playground-terminal").then((module) => module.PlaygroundTerminal), { ssr: false });

function usePlayground() {
  const playground = useContext(PlaygroundContext);
  if (!playground) throw new Error("PlaygroundProvider is required.");
  return playground;
}

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const playground = usePlaygroundController();
  return <PlaygroundContext.Provider value={playground}>
    {children}
    <dialog ref={playground.dialog} className="br-playground-dialog" aria-labelledby="br-playground-sign-in">
      <button className="br-playground-icon br-playground-close" type="button" aria-label="Close sign-in prompt" onClick={() => playground.dialog.current?.close()}><X size={19} /></button>
      <h2 id="br-playground-sign-in">{playground.signedIn ? "Playground preview" : "Sign in to BitRouter Cloud"}</h2>
      {!playground.signedIn && <>
        <p>Open Cloud to sign in, then return to this tab. Your task stays in the input.</p>
        <div className="br-playground-actions">
          <a className="br-playground-button br-playground-primary" href={`${process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai"}/sign-in`} target="_blank" rel="noreferrer">Sign in to Cloud</a>
          <button className="br-playground-button" type="button" disabled={playground.checking} onClick={() => void playground.recheckSignIn()}>I’ve signed in</button>
        </div>
      </>}
      <div className="br-playground-local">
        {playground.liveAvailable && <>
          <p>Live preview uses the configured BitRouter Cloud credential and its inference budget.</p>
          <button className="br-playground-button br-playground-primary" type="button" onClick={() => playground.chooseMode("cloud")}>Run with BitRouter Cloud</button>
        </>}
        <p>Local development preview with scripted model responses.</p>
        <button className="br-playground-button" type="button" onClick={() => playground.chooseMode("fixture")}>Open local preview</button>
      </div>
      <p role="status">{playground.notice}</p>
    </dialog>
  </PlaygroundContext.Provider>;
}

function Reply({ text }: { text: string }) {
  const diff = /```diff[ \t]*\r?\n([\s\S]*?)```/i.exec(text);
  if (!diff) return <p className="br-playground-reply">{text}</p>;
  return <>
    {diff.index > 0 && <p className="br-playground-reply">{text.slice(0, diff.index).trim()}</p>}
    <details className="br-playground-diff">
      <summary>Proposed diff</summary>
      <pre>{diff[1].trimEnd().split("\n").map((line, index) => <span key={index} data-prefix={line[0]}>{line}{"\n"}</span>)}</pre>
    </details>
    {text.slice(diff.index + diff[0].length).trim() && <p className="br-playground-reply">{text.slice(diff.index + diff[0].length).trim()}</p>}
  </>;
}

function formatCharge(microUsd: number) {
  return `$${(microUsd / 1_000_000).toFixed(6)}`;
}

function Receipt({ number, receipt }: { number: number; receipt?: PlaygroundReceipt }) {
  const cost = receipt?.chargeMicroUsd;
  const settled = receipt?.state === "computed" || receipt?.state === "not_charged";
  return <details className="br-playground-receipt">
    <summary>Model request {number} · {receipt?.provider ?? (settled ? "Settled" : receipt?.state === "pending" ? "Receipt pending" : receipt ? "Receipt unavailable" : "Local fixture")}</summary>
    {receipt && (settled || receipt.provider) ? <dl>
      <div><dt>Provider</dt><dd>{receipt.provider ?? "Unavailable"}</dd></div>
      <div><dt>Resolved model</dt><dd>{receipt.model ?? "Unavailable"}</dd></div>
      <div><dt>Tokens</dt><dd>{receipt.inputTokens == null || receipt.outputTokens == null ? "Unavailable" : `${receipt.inputTokens} in / ${receipt.outputTokens} out`}</dd></div>
      <div><dt>Demo inference cost</dt><dd>{cost == null ? "Unavailable" : formatCharge(cost)}</dd></div>
    </dl> : <p>{receipt?.state === "pending" ? "Waiting for Cloud settlement." : receipt ? "Cloud did not return a usable receipt." : "This request used the local model fixture."}</p>}
  </details>;
}

function RunEvidence({ turn }: { turn: PlaygroundTurn }) {
  if (turn.status !== "completed") return null;
  const receipts = turn.steps.map(({ receipt }) => receipt);
  const providers = Array.from(new Set(receipts.flatMap((receipt) => receipt?.provider ? [receipt.provider] : [])));
  const pending = receipts.some((receipt) => receipt?.state === "pending");
  const costs = receipts.flatMap((receipt) => receipt?.chargeMicroUsd == null ? [] : [receipt.chargeMicroUsd]);
  return <dl className="br-playground-run-evidence">
    <div><dt>Provider</dt><dd>{providers.length ? providers.join(", ") : pending ? "Pending" : "Unavailable"}</dd></div>
    <div><dt>Demo inference cost</dt><dd>{costs.length && costs.length === receipts.length
      ? formatCharge(costs.reduce((total, cost) => total + cost, 0)) : pending ? "Pending" : "Unavailable"}</dd></div>
  </dl>;
}

function ToolEntry({ tool }: { tool: ModelStep["tools"][number] }) {
  const label = toolArgument(tool.input);
  return <details className="br-playground-tool">
    <summary><span>{tool.name}{label && <> <code>{label}</code></>}</span><small>{tool.failed ? "Failed" : tool.done ? "Done" : "Running"}</small></summary>
    <pre>{tool.output ?? "Waiting for the tool result."}</pre>
  </details>;
}

function TurnLog({ turn }: { turn: PlaygroundTurn }) {
  return <article className="br-playground-turn">
    <p className="br-playground-prompt"><span aria-hidden="true">┃</span> {turn.prompt}</p>
    {turn.imageName && <p className="br-playground-muted">Image · {turn.imageName}</p>}
    {turn.steers.map(({ id, text }) => <p key={id} className="br-playground-muted">Steering · {text}</p>)}
    {turn.steps.map((step, index) => <div className="br-playground-step" key={step.id}>
      <Receipt number={index + 1} receipt={step.receipt} />
      {step.tools.map((tool) => <ToolEntry key={tool.id} tool={tool} />)}
      {step.text && <Reply text={step.text} />}
    </div>)}
    {turn.status === "running" && <p className="br-playground-muted" role="status">{turn.steps.length ? "Running…" : "Starting fx engine…"}</p>}
    {turn.status === "stopped" && <p className="br-playground-muted" role="status">Run stopped.</p>}
    {turn.message && <p className="br-playground-muted" role="status">{turn.message}</p>}
    {turn.trace.length > 0 && <details className="br-playground-trace">
      <summary>Execution trace</summary>
      <ol>{turn.trace.map(({ at, label }, index) => <li key={index}>
        <span>{((at - turn.trace[0].at) / 1000).toFixed(2)} s</span> {label}
      </li>)}</ol>
    </details>}
  </article>;
}

function RunningControls() {
  const { pendingSteer, queueFollowUp, queued, steer, steerReady, withdraw } = usePlayground();
  const [text, setText] = useState("");
  return <div className="br-playground-running">
    <form onSubmit={(event) => {
      event.preventDefault();
      void steer(text).then((accepted) => { if (accepted) setText((current) => current === text ? "" : current); });
    }}>
      <input aria-label="Instructions for the running task" placeholder="Add an instruction…" maxLength={2000}
        value={text} onChange={(event) => setText(event.target.value)} />
      <button className="br-playground-button" type="submit" disabled={!steerReady || !text.trim() || !!pendingSteer}>Steer</button>
      <button className="br-playground-button" type="button" disabled={!text.trim() || !!queued} onClick={() => { queueFollowUp(text); setText(""); }}>Queue follow-up</button>
      {pendingSteer && <button className="br-playground-button" type="button" onClick={() => void withdraw()}>Withdraw</button>}
    </form>
    {queued && <p role="status">Next turn · {queued}</p>}
  </div>;
}

export function Playground({ expanded = false }: { expanded?: boolean }) {
  const { attachImage, busy, canCompare, cancel, checking, compare, cost, draft, feedback, image, latency, manageSavedSession,
    mode, profile, reset, running, runs, selectProfile, setDraft, submit } = usePlayground();
  const [terminalReady, setTerminalReady] = useState(false);
  const terminal = useRef<TerminalHandle>(null);
  const upload = useRef<HTMLInputElement>(null);
  const turns: TerminalTurn[] = [
    ...runs.latency.map((turn) => ({ profile: "latency" as const, turn })),
    ...runs.cost.map((turn) => ({ profile: "cost" as const, turn })),
  ].sort((first, second) => first.turn.createdAt - second.turn.createdAt);

  useEffect(() => {
    if (expanded) window.scrollTo({ top: 0, behavior: "instant" });
  }, [expanded]);

  return <section id="values" className={`br-playground ${expanded ? "br-playground-expanded" : "ws-wrap"}`} aria-label="BitRouter Agent Playground">
    <div className="br-playground-window">
      <header className="br-playground-header">
        <div className="br-playground-dots" aria-hidden="true"><i /><i /><i /></div>
        <h2>fx · BitRouter</h2>
        <div className="br-playground-controls">
          <Link className="br-playground-icon" href={expanded ? "/#values" : "/try"} aria-label={expanded ? "Back to homepage" : "Expand playground"}>
            {expanded ? <ArrowDownLeft size={19} /> : <Maximize2 size={18} />}
          </Link>
          <details className="br-playground-info">
            <summary className="br-playground-icon" aria-label="About this playground"><Info size={18} /></summary>
            <div>
              <p>The fx engine and workspace tools run in your browser. Live inference sends the prompt and relevant tool output to BitRouter.</p>
              <p>Enter runs a task. Shift+Enter adds a line. Use ↑↓ for history and Ctrl+C to stop.</p>
              <p>Skills · Sample workspace and BitRouter routing</p>
              <p>Save session stores the conversation, workspace files, and attachments in this browser.</p>
              <button className="br-playground-button" type="button" disabled={!terminalReady || running || checking || busy} onClick={(event) => {
                event.currentTarget.closest("details")?.removeAttribute("open");
                setDraft(routingStarter);
                terminal.current?.focus();
              }}>Try routing advisor</button>
              <button className="br-playground-button" type="button" disabled={!mode || running || checking || busy} onClick={() => void manageSavedSession("save")}>Save session</button>
              <button className="br-playground-button" type="button" disabled={running || checking || busy} onClick={() => void manageSavedSession("restore")}>Restore saved session</button>
              <button className="br-playground-button" type="button" disabled={running || checking || busy} onClick={() => void manageSavedSession("delete")}>Delete saved session</button>
              <button className="br-playground-button" type="button" onClick={(event) => {
                event.currentTarget.closest("details")?.removeAttribute("open");
                reset();
                terminal.current?.focus();
              }}>Reset playground</button>
            </div>
          </details>
        </div>
      </header>
      <div className="br-playground-body">
        <PlaygroundTerminal terminalRef={terminal} turns={turns} draft={draft} running={running} checking={checking || busy}
          onDraft={setDraft} onSubmit={(task) => void submit(task)} onCancel={cancel} onImage={attachImage} onReady={() => setTerminalReady(true)} />
        {running && <RunningControls />}
        {image && <div className="br-playground-attachment">
          <span>Image · {image.name}</span>
          <button className="br-playground-icon" type="button" aria-label="Remove image" disabled={busy || checking} onClick={() => attachImage(null)}><X size={14} /></button>
        </div>}
        <div className="br-playground-footer">
          <p className="br-playground-status" role="status">
            {profiles[profile]} · {running ? "Running…" : checking ? "Checking sign-in…" : mode === "cloud" ? "BitRouter Cloud" : mode === "fixture" ? "Local fixture" : "fx engine"}
          </p>
          <div className="br-playground-controls">
            <input ref={upload} type="file" hidden accept={playgroundImageTypes.join(",")} onChange={(event) => {
              attachImage(event.currentTarget.files?.item(0) ?? null);
              event.currentTarget.value = "";
            }} />
            <button className="br-playground-icon" type="button" aria-label="Attach image" disabled={running || checking || busy} onClick={() => upload.current?.click()}><Paperclip size={16} /></button>
            {!turns.length && <button className="br-playground-text-button" type="button" disabled={!terminalReady || checking || busy} onClick={() => {
              setDraft(starter);
              terminal.current?.focus();
            }}>Try a sample</button>}
            {running
              ? <button className="br-playground-icon" type="button" aria-label="Stop run" onClick={cancel}><Square size={15} /></button>
              : <button className="br-playground-icon" type="button" aria-label="Run task" disabled={busy || checking || (!draft.trim() && !image)} onClick={() => {
                terminal.current?.focus();
                void submit();
              }}><ArrowUp size={18} /></button>}
          </div>
        </div>
      </div>
    </div>
    {feedback && <p className="br-playground-feedback" role="status">{feedback}</p>}
    {turns.length > 0 && <details className="br-playground-inspector">
      <summary>Tool results, diffs, and receipts</summary>
      {turns.map(({ turn, profile: name }) => <details className="br-playground-run-details" key={turn.id}>
        <summary>{profiles[name]} · {turn.prompt}</summary>
        <TurnLog turn={turn} />
      </details>)}
    </details>}
    {latency && <div className="br-playground-results">
      <div className="br-playground-result-header"><h3>Routing comparison{mode === "fixture" ? " preview" : ""}</h3>
        {canCompare && <button className="br-playground-button" type="button" onClick={compare}>Run again with Cost priority</button>}
        {runs.cost.length > 0 && <button className="br-playground-button" type="button" disabled={running || checking || busy}
          onClick={() => selectProfile(profile === "latency" ? "cost" : "latency")}>
          Continue {profiles[profile === "latency" ? "cost" : "latency"]}
        </button>}
      </div>
      <p>{mode === "fixture" ? "Scripted model responses with real browser tools. The comparison forks the conversation and files before the latest unsteered Latency task." : "Same task, conversation history, and starting workspace. Agent run time excludes engine startup. Provider and cost come from Cloud receipts."}</p>
      <p>Task · {latency.prompt}</p>
      <div className="br-playground-result-grid">
        {([["latency", latency], ["cost", cost]] as const).map(([name, turn]) => <div key={name}>
          <strong>{profiles[name]}</strong>
          {turn ? <>
            <span>{turn.elapsed === undefined ? turn.status === "running" ? "Running…" : "Run incomplete" : `${(turn.elapsed / 1000).toFixed(2)} s`}</span>
            {mode === "cloud" && <RunEvidence turn={turn} />}
          </> : <span>Ready to compare</span>}
        </div>)}
      </div>
    </div>}
  </section>;
}
