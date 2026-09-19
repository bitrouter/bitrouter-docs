"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DemoTerminal, TerminalWindow } from "./demo-terminal";
import styles from "./feature-visuals.module.css";

const ANSI = {
  clear: "\u001b[2J\u001b[H",
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
};

const ANSI_SEQUENCE = /\u001b\[[0-?]*[ -/]*[@-~]/g;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function terminalRows(lines: string[], columns: number) {
  const wrappedRows = lines.reduce((total, line) => {
    const width = line.replace(ANSI_SEQUENCE, "").length;
    return total + Math.max(1, Math.ceil(width / columns));
  }, 0);
  return Math.max(16, wrappedRows + 1);
}

function FeatureTerminal({
  title,
  label,
  transcript,
}: {
  title: string;
  label: string;
  transcript: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lines = transcript.split("\n");
  const [hasEntered, setHasEntered] = useState(false);
  const [visibleLines, setVisibleLines] = useState(1);
  const [run, setRun] = useState(0);
  const [columns, setColumns] = useState(42);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateColumns = (width: number) => {
      // `.zed-wterm` uses a 12.5px mono font and 16px inline padding. A
      // measured column count preserves that font size without overflowing.
      const next = Math.floor((width - 32) / 7.55);
      setColumns(Math.max(32, Math.min(76, next)));
    };
    updateColumns(root.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => updateColumns(entry.contentRect.width));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || hasEntered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasEntered(true);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [hasEntered]);

  useEffect(() => {
    if (!hasEntered) return;

    if (reducedMotion) {
      setVisibleLines(lines.length);
      return;
    }

    setVisibleLines(1);
    const timers = lines.slice(1).map((_, index) =>
      window.setTimeout(() => setVisibleLines(index + 2), 100 + index * 72),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [hasEntered, lines.length, reducedMotion, run]);

  const output = `${ANSI.clear}${lines.slice(0, visibleLines).join("\r\n")}`;
  const rows = terminalRows(lines, columns);

  return (
    <div className={styles.terminalMedia} ref={rootRef}>
      <TerminalWindow
        title={title}
        actions={
          <button
            className={styles.replay}
            type="button"
            onClick={() => {
              setHasEntered(true);
              setRun((value) => value + 1);
            }}
            aria-label={`Replay ${title} terminal`}
          >
            <RotateCcw aria-hidden="true" size={13} strokeWidth={1.75} />
            <span>Replay</span>
          </button>
        }
      >
        <DemoTerminal
          key={`${columns}-${rows}`}
          output={output}
          cols={columns}
          rows={rows}
          label={label}
        />
      </TerminalWindow>
    </div>
  );
}

const CORE_TRANSCRIPT = [
  `${ANSI.cyan}$${ANSI.reset} bro --version`,
  `${ANSI.bold}bro 1.0.0-alpha.31${ANSI.reset}`,
  "",
  `${ANSI.cyan}$${ANSI.reset} bro --help`,
  "BitRouter: an LLM API router. CLI + assembly library.",
  "",
  `${ANSI.bold}Usage:${ANSI.reset} bro [COMMAND]`,
  "",
  `${ANSI.bold}Commands:${ANSI.reset}`,
  `${ANSI.green}  serve${ANSI.reset}      Load a config and serve HTTP + control socket`,
  `${ANSI.green}  route${ANSI.reset}      Resolve a model through the routing table`,
  `${ANSI.green}  models${ANSI.reset}     List routable models for a config`,
  `${ANSI.green}  providers${ANSI.reset}  Provider management`,
  `${ANSI.dim}Selected commands shown from bro --help${ANSI.reset}`,
].join("\n");

const ROUTE_TRANSCRIPT = [
  `${ANSI.cyan}$${ANSI.reset} bro route anthropic/claude-opus-4.8`,
  "{",
  `  ${ANSI.cyan}"requested_model"${ANSI.reset}: "anthropic/claude-opus-4.8",`,
  `  ${ANSI.cyan}"effective_model"${ANSI.reset}: "anthropic/claude-opus-4.8",`,
  `  ${ANSI.cyan}"resolved_via"${ANSI.reset}: "live",`,
  `  ${ANSI.cyan}"provider_chain"${ANSI.reset}: [`,
  "    {",
  `      ${ANSI.cyan}"provider"${ANSI.reset}: "bitrouter",`,
  `      ${ANSI.cyan}"service_id"${ANSI.reset}: "anthropic/claude-opus-4.8",`,
  `      ${ANSI.cyan}"api_protocol"${ANSI.reset}: "chatcompletions"`,
  "    }",
  "  ]",
  "}",
  `${ANSI.dim}Read-only · no request sent upstream${ANSI.reset}`,
].join("\n");

const CUSTOM_TRANSCRIPT = [
  `${ANSI.yellow}# Illustration — endpoint order defines priority${ANSI.reset}`,
  `${ANSI.dim}# bitrouter.yaml${ANSI.reset}`,
  `${ANSI.cyan}models:${ANSI.reset}`,
  `  ${ANSI.cyan}coding:${ANSI.reset}`,
  `    ${ANSI.cyan}strategy:${ANSI.reset} priority`,
  `    ${ANSI.cyan}endpoints:${ANSI.reset}`,
  `      - ${ANSI.cyan}provider:${ANSI.reset} openai`,
  `        ${ANSI.cyan}service_id:${ANSI.reset} gpt-5`,
  `      - ${ANSI.cyan}provider:${ANSI.reset} anthropic`,
  `        ${ANSI.cyan}service_id:${ANSI.reset} claude-sonnet-4-6`,
  "",
  `${ANSI.bold}Resolved order${ANSI.reset}`,
  `${ANSI.green}1${ANSI.reset}  openai     gpt-5`,
  `${ANSI.green}2${ANSI.reset}  anthropic  claude-sonnet-4-6`,
  `${ANSI.dim}Retryable failures advance through this chain.${ANSI.reset}`,
].join("\n");

export function CoreVisual() {
  return (
    <FeatureTerminal
      title="BitRouter CLI"
      label="BitRouter version and selected CLI help output"
      transcript={CORE_TRANSCRIPT}
    />
  );
}

export function DecisionVisual() {
  return (
    <FeatureTerminal
      title="Route inspection"
      label="Read-only BitRouter route inspection output"
      transcript={ROUTE_TRANSCRIPT}
    />
  );
}

export function WorkflowVisual() {
  return (
    <FeatureTerminal
      title="Routing configuration"
      label="Illustrative priority routing configuration and resolved order"
      transcript={CUSTOM_TRANSCRIPT}
    />
  );
}
