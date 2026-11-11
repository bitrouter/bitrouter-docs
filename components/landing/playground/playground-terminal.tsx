"use client";

import { Terminal, type TerminalHandle, type WTerm } from "@wterm/react";
import "@wterm/react/css";
import { useLayoutEffect, useRef, type RefObject } from "react";
import stringWidth from "string-width";
import type { PlaygroundTurn } from "./use-playground";

const escape = "\x1b";
const clearRow = "\r\x1b[2K";
const clearTerminal = "\x1b[2J\x1b[3J\x1b[H";
const pasteStart = "\x1b[200~";
const pasteEnd = "\x1b[201~";
const bold = "\x1b[1m";
const muted = "\x1b[90m";
const resetStyle = "\x1b[0m";
const newline = "\r\n";
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

type Draft = { text: string; cursor: number };
type History = { position: number; draft: Draft };
type Paint = { terminal: WTerm; output: string; prompt: string; cols: number; rows: number };

function plainText(text: string) {
  // Model and user text may contain control characters. Only the UI emits terminal commands.
  return text.replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "").replaceAll("\t", "    ");
}

function terminalText(text: string) {
  return plainText(text).replaceAll("\n", newline);
}

const toolLabels: Record<string, string> = {
  read_file: "Reading a file", search_files: "Searching files", shell: "Working in the workspace",
  docs_search_docs: "Searching documentation", docs_get_doc: "Reading documentation", docs_lookup_model: "Looking up a model",
};

function transcript(turns: PlaygroundTurn[]) {
  let output = `${muted}Browser workspace · Type a task and press Enter.${resetStyle}${newline}${newline}`;
  for (const turn of turns) {
    output += `${bold}┃ ${terminalText(turn.prompt)}${resetStyle}${newline}${newline}`;
    if (turn.imageName) output += `${muted}Image · ${terminalText(turn.imageName)}${resetStyle}${newline}`;
    for (const [index, step] of turn.steps.entries()) {
      for (const tool of step.tools) {
        const label = toolLabels[tool.name] ?? "Using a tool";
        output += `${muted}  ↳ ${label}${tool.failed ? " · Failed" : tool.done ? " · Done" : "…"}${resetStyle}${newline}`;
      }
      if (step.text) {
        output += terminalText(step.text);
        if (index < turn.steps.length - 1 || turn.status !== "running") output += newline + newline;
      }
    }
    if (turn.status === "running") continue;
    if (turn.status === "stopped") output += `${muted}Run stopped.${resetStyle}${newline}`;
    if (turn.message) output += terminalText(turn.message) + newline;
    output += newline;
  }
  return output;
}

function draftRow(draft: Draft, cols: number) {
  const cells = Array.from(segmenter.segment(draft.text), ({ segment, index }) => {
    const text = segment === "\n" ? "↵" : segment;
    return { text, index, width: stringWidth(text) };
  });
  const cursor = cells.findIndex(({ index }) => index >= draft.cursor);
  const caret = cursor === -1 ? cells.length : cursor;
  // Keep the editing cursor on one row so resizing and paste cannot push it into scrollback.
  const available = Math.max(1, cols - 5);
  let start = caret;
  let leftWidth = 0;
  while (start > 0 && leftWidth + cells[start - 1].width <= available) {
    leftWidth += cells[--start].width;
  }
  let end = caret;
  let width = leftWidth;
  while (end < cells.length && width + cells[end].width <= available) {
    width += cells[end++].width;
  }
  const left = start > 0 ? "‹" : "";
  const right = end < cells.length ? "›" : "";
  const text = cells.slice(start, end).map((cell) => cell.text).join("");
  const column = 3 + left.length + leftWidth;
  return `\x1b[?25h${bold}┃ ${resetStyle}${left}${text}${right}\x1b[${column}G`;
}

export function PlaygroundTerminal({ terminalRef, turns, draft, running, checking, onDraft, onSubmit, onCancel, onImage, onReady }: {
  terminalRef: RefObject<TerminalHandle | null>;
  turns: PlaygroundTurn[];
  draft: string;
  running: boolean;
  checking: boolean;
  onDraft: (text: string) => void;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  onImage: (image: File) => void;
  onReady: () => void;
}) {
  const edit = useRef<Draft>({ text: draft, cursor: draft.length });
  const history = useRef<History | null>(null);
  const paint = useRef<Paint | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const output = transcript(turns);

  function render(terminal: WTerm | null | undefined) {
    if (!terminal?.bridge) return;
    const previous = paint.current;
    const redraw = previous?.terminal !== terminal || previous.cols !== terminal.cols || previous.rows !== terminal.rows || !output.startsWith(previous.output);
    const prompt = running ? "\x1b[?25l" : draftRow(edit.current, terminal.cols);
    if (!redraw && previous.output === output && previous.prompt === prompt) return;
    const text = redraw ? clearTerminal + output : clearRow + output.slice(previous.output.length);
    // While streaming, the terminal cursor sits at the end of the reply, not on a prompt row.
    const prefix = !redraw && previous.prompt === "\x1b[?25l" ? output.slice(previous.output.length) : text;
    terminal.write(prefix + prompt);
    paint.current = { terminal, output, prompt, cols: terminal.cols, rows: terminal.rows };
  }

  useLayoutEffect(() => {
    if (edit.current.text !== draft) {
      edit.current = { text: draft, cursor: draft.length };
      history.current = null;
    }
    render(terminalRef.current?.instance);
  });

  function update(next: Draft, fromHistory = false) {
    if (!fromHistory) history.current = null;
    const previous = edit.current;
    edit.current = next;
    if (next.text !== previous.text) onDraft(next.text);
    render(terminalRef.current?.instance);
  }

  function recall(direction: -1 | 1) {
    if (!turns.length || (!history.current && direction === 1)) return;
    const browse = history.current ??= { position: turns.length, draft: edit.current };
    browse.position = Math.max(0, Math.min(turns.length, browse.position + direction));
    if (browse.position === turns.length) {
      update(browse.draft);
    } else {
      const text = turns[browse.position].prompt;
      update({ text, cursor: text.length }, true);
    }
  }

  function handleData(data: string) {
    if (data === "\x03") {
      if (running) onCancel();
      else if (!checking) update({ text: "", cursor: 0 });
      return;
    }
    if (running || checking) return;
    if (data === "\r") {
      history.current = null;
      onSubmit(edit.current.text);
      return;
    }
    if (data === "\x1b[A" || data === "\x1b[B") {
      recall(data === "\x1b[A" ? -1 : 1);
      return;
    }

    const { text, cursor } = edit.current;
    const graphemes = segmenter.segment(text);
    const left = cursor > 0 ? graphemes.containing(cursor - 1)?.index ?? 0 : 0;
    const right = graphemes.containing(cursor);
    const end = right ? right.index + right.segment.length : text.length;
    switch (data) {
      case "\x1b[D": return update({ text, cursor: left }, true);
      case "\x1b[C": return update({ text, cursor: end }, true);
      case "\x01":
      case "\x1b[H": return update({ text, cursor: 0 }, true);
      case "\x05":
      case "\x1b[F": return update({ text, cursor: text.length }, true);
      case "\x7f":
      case "\b": return update({ text: text.slice(0, left) + text.slice(cursor), cursor: left });
      case "\x1b[3~": return update({ text: text.slice(0, cursor) + text.slice(end), cursor });
      case "\x15": return update({ text: text.slice(cursor), cursor: 0 });
    }

    let typed = data;
    if (data === "\x1b[13;2u") typed = "\n";
    else if (data.startsWith(pasteStart) && data.endsWith(pasteEnd)) typed = data.slice(pasteStart.length, -pasteEnd.length);
    else if (data.startsWith(escape)) return;
    const limit = 2000 - text.length;
    const inserted = plainText(typed.replace(/\r\n?/g, "\n")).slice(0, limit).toWellFormed();
    if (inserted) update({ text: text.slice(0, cursor) + inserted + text.slice(cursor), cursor: cursor + inserted.length });
  }

  return <Terminal
    ref={terminalRef}
    className="br-playground-terminal"
    autoResize
    cursorBlink
    role="group"
    aria-label="Task activity"
    aria-multiline={undefined}
    aria-roledescription={undefined}
    onData={handleData}
    onResize={() => render(terminalRef.current?.instance)}
    onFocusCapture={(event) => {
      if (!paint.current && event.relatedTarget instanceof HTMLElement) previousFocus.current = event.relatedTarget;
    }}
    onKeyDownCapture={(event) => {
      if (event.key === "Tab") event.stopPropagation();
    }}
    onPasteCapture={(event) => {
      const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"));
      if (!image || running || checking) return;
      event.preventDefault();
      event.stopPropagation();
      onImage(image);
    }}
    onReady={(terminal) => {
      const input = terminal.element.querySelector("textarea");
      if (input) {
        input.removeAttribute("aria-hidden");
        input.setAttribute("aria-label", "Playground task");
        if (input === document.activeElement) {
          const target = previousFocus.current;
          if (target?.isConnected) target.focus({ preventScroll: true });
          else input.blur();
        }
      }
      terminal.write("\x1b[?2004h");
      render(terminal);
      onReady();
    }}
  />;
}
