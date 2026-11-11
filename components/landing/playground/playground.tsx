"use client";

import { ArrowDownLeft, ArrowUp, Info, Maximize2, Paperclip, Square, X } from "lucide-react";
import type { TerminalHandle } from "@wterm/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { playgroundImageTypes } from "@/lib/playground-tools";
import { starter, usePlaygroundController } from "./use-playground";
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
      <h2 id="br-playground-sign-in">Sign in to BitRouter Cloud</h2>
      <p>Sign in to run the agent, then return to this tab. Your task stays here.</p>
      <div className="br-playground-actions">
        <a className="br-playground-button br-playground-primary" href={`${process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai"}/sign-in`} target="_blank" rel="noreferrer">Sign in to Cloud</a>
        <button className="br-playground-button" type="button" disabled={playground.checking} onClick={() => void playground.recheckSignIn()}>I’ve signed in</button>
      </div>
      <p role="status">{playground.feedback}</p>
    </dialog>
  </PlaygroundContext.Provider>;
}

export function Playground({ expanded = false }: { expanded?: boolean }) {
  const { attachImage, cancel, checking, draft, feedback, image, reset, returningHome, running, turns, setDraft, submit } = usePlayground();
  const router = useRouter();
  const panel = useRef<HTMLElement>(null);
  const [terminalReady, setTerminalReady] = useState(false);
  const terminal = useRef<TerminalHandle>(null);
  const upload = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) window.scrollTo({ top: 0, behavior: "instant" });
    else if (returningHome.current) {
      returningHome.current = false;
      window.history.replaceState(window.history.state, "", "/#values");
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [expanded, returningHome]);

  return <section ref={panel} id="values" className={`br-playground ${expanded ? "br-playground-expanded" : "ws-wrap"}`} aria-label="BitRouter Agent Playground">
    <div className="br-playground-window">
      <header className="br-playground-header">
        <div className="br-playground-dots" aria-hidden="true"><i /><i /><i /></div>
        <h2>fx · BitRouter</h2>
        <div className="br-playground-controls">
          <Link className="br-playground-icon" href={expanded ? "/#values" : "/try"} scroll={false}
            onNavigate={(event) => {
              if (!expanded) return;
              // Navigate without a fragment: cached route canonical URLs can already contain it.
              event.preventDefault();
              returningHome.current = true;
              router.push("/", { scroll: false });
            }} aria-label={expanded ? "Back to homepage" : "Expand playground"}>
            {expanded ? <ArrowDownLeft size={19} /> : <Maximize2 size={18} />}
          </Link>
          <details className="br-playground-info">
            <summary className="br-playground-icon" aria-label="About this playground"><Info size={18} /></summary>
            <div>
              <p>The workspace runs in your browser. Prompts and relevant tool output are sent to BitRouter for inference. Sign in to Cloud to run a task.</p>
              <p>Enter runs a task. Shift+Enter adds a line. Use ↑↓ for history and Ctrl+C to stop. This workspace cannot access files on your computer.</p>
              <button className="br-playground-button" type="button" onClick={(event) => {
                reset();
                event.currentTarget.closest("details")?.removeAttribute("open");
                terminal.current?.focus();
              }}>Reset workspace</button>
            </div>
          </details>
        </div>
      </header>
      <div className="br-playground-body">
        <p className="br-playground-intro">Ask a question or work on a task in your browser workspace. Sign in to Cloud to run.</p>
        <PlaygroundTerminal terminalRef={terminal} turns={turns} draft={draft} running={running} checking={checking}
          onDraft={setDraft} onSubmit={(task) => void submit(task)} onCancel={cancel} onImage={attachImage} onReady={() => setTerminalReady(true)} />
        {image && <div className="br-playground-attachment">
          <span>Image · {image.name}</span>
          <button className="br-playground-icon" type="button" aria-label="Remove image" disabled={running || checking} onClick={() => attachImage(null)}><X size={14} /></button>
        </div>}
        <div className="br-playground-footer">
          <p className="br-playground-status" role="status">{running ? "Working…" : checking ? "Connecting…" : ""}</p>
          <div className="br-playground-controls">
            <input ref={upload} type="file" hidden accept={playgroundImageTypes.join(",")} onChange={(event) => {
              attachImage(event.currentTarget.files?.item(0) ?? null);
              event.currentTarget.value = "";
            }} />
            <button className="br-playground-icon" type="button" aria-label="Attach image" disabled={running || checking} onClick={() => upload.current?.click()}><Paperclip size={16} /></button>
            {!turns.length && <button className="br-playground-text-button" type="button" disabled={!terminalReady || checking} onClick={() => {
              setDraft(starter);
              terminal.current?.focus();
            }}>Try a task</button>}
            {running
              ? <button className="br-playground-icon" type="button" aria-label="Stop run" onClick={cancel}><Square size={15} /></button>
              : <button className="br-playground-icon" type="button" aria-label="Run task" disabled={!terminalReady || checking || (!draft.trim() && !image)} onClick={() => {
                terminal.current?.focus();
                void submit();
              }}><ArrowUp size={18} /></button>}
          </div>
        </div>
      </div>
    </div>
    {feedback && <p className="br-playground-feedback" role="status">{feedback}</p>}
  </section>;
}
