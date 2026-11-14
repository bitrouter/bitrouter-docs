import { useCallback, useEffect, useRef, useState } from "react";
import type { FxEngineTurn, FxTurnEvent } from "libfx/browser";
import { maxPlaygroundImageBytes, playgroundImageTypes } from "@/lib/playground-tools";
import type { PlaygroundEngine } from "./engine";

export const starter = "Find why the session refresh fails and fix it in the workspace.";

type ToolCall = { id: string; name: string; done?: boolean; failed?: boolean };
export type ModelStep = { id: string; text: string; tools: ToolCall[] };
export type PlaygroundTurn = {
  id: string;
  prompt: string;
  steps: ModelStep[];
  imageName?: string;
  status: "running" | "completed" | "stopped" | "error";
  message?: string;
};
type Execution = { id: string; controller: AbortController; turn?: FxEngineTurn; stepId?: string; errorMessage?: string };
const stopMessages = {
  max_output_tokens: "The response reached its length limit. Ask a follow-up to continue.",
  max_model_turns: "The task reached its execution limit. Ask a follow-up to continue.",
  refused: "The model declined the task.",
};

export function usePlaygroundController() {
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");
  const [turns, setTurns] = useState<PlaygroundTurn[]>([]);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returningHome = useRef(false);
  const engine = useRef<PlaygroundEngine | null>(null);
  const engineEpoch = useRef(0);
  const vision = useRef(false);
  const account = useRef<string | null>(null);
  const active = useRef<Execution | null>(null);
  const sessionCheck = useRef<AbortController | null>(null);

  const closeEngine = useCallback(() => {
    engineEpoch.current++;
    active.current?.controller.abort();
    active.current = null;
    const previous = engine.current;
    engine.current = null;
    if (previous) void previous.close().catch(() => undefined);
  }, []);
  useEffect(() => () => {
    sessionCheck.current?.abort();
    closeEngine();
  }, [closeEngine]);

  function updateTurn(run: Execution, update: (turn: PlaygroundTurn) => PlaygroundTurn) {
    if (active.current === run) setTurns((current) => current.map((turn) => turn.id === run.id ? update(turn) : turn));
  }

  function modelRequest() {
    const run = active.current;
    if (!run || run.controller.signal.aborted) return;
    const id = crypto.randomUUID();
    run.stepId = id;
    run.errorMessage = undefined;
    updateTurn(run, (turn) => ({ ...turn, steps: [...turn.steps, { id, text: "", tools: [] }] }));
  }

  function recordEvent(run: Execution, event: FxTurnEvent) {
    const stepId = run.stepId;
    if (!stepId) return;
    if (event.type === "text_delta") {
      updateTurn(run, (turn) => ({ ...turn, steps: turn.steps.map((step) => step.id === stepId ? { ...step, text: step.text + event.delta } : step) }));
    } else if (event.type === "tool_start") {
      updateTurn(run, (turn) => ({ ...turn, steps: turn.steps.map((step) => step.id === stepId
        ? { ...step, tools: [...step.tools, { id: event.id, name: event.name }] } : step) }));
    } else if (event.type === "tool_end") {
      updateTurn(run, (turn) => ({ ...turn, steps: turn.steps.map((step) => ({ ...step,
        tools: step.tools.map((tool) => tool.id === event.id ? { ...tool, failed: event.isError, done: true } : tool),
      })) }));
    }
  }

  async function startTurn(prompt: string, attachment: File | null) {
    const run: Execution = { id: crypto.randomUUID(), controller: new AbortController() };
    active.current = run;
    const { signal } = run.controller;
    setRunning(true);
    setFeedback("");
    setTurns((current) => [...current, { id: run.id, prompt, imageName: attachment?.name, steps: [], status: "running" }]);
    try {
      let runtime = engine.current;
      if (!runtime) {
        const { openPlaygroundEngine } = await import("./engine");
        signal.throwIfAborted();
        const epoch = engineEpoch.current;
        runtime = await openPlaygroundEngine({
          onRequest: () => { if (engineEpoch.current === epoch) modelRequest(); },
          onError: (message) => {
            if (engineEpoch.current === epoch && active.current && !active.current.controller.signal.aborted) active.current.errorMessage = message;
          },
          onUnauthorized: () => {
            if (engineEpoch.current === epoch && active.current && !active.current.controller.signal.aborted) dialog.current?.showModal();
          },
        });
        if (signal.aborted) {
          await runtime.close();
          signal.throwIfAborted();
        }
        engine.current = runtime;
      }
      signal.throwIfAborted();
      const turn = runtime.value.prompt(attachment
        ? [{ type: "text", text: prompt }, { type: "image", data: attachment }] : prompt, { signal });
      run.turn = turn;
      const cancel = () => turn.cancel();
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) cancel();
      void turn.result.catch(() => undefined);
      try {
        for await (const event of turn) recordEvent(run, event);
        const { stopReason } = await turn.result;
        const stopped = signal.aborted || stopReason === "cancelled";
        const message = stopReason === "end_turn" || stopReason === "cancelled" ? undefined : stopMessages[stopReason];
        updateTurn(run, (item) => ({ ...item, status: stopped ? "stopped" : message ? "error" : "completed", message }));
      } finally {
        signal.removeEventListener("abort", cancel);
      }
    } catch (error) {
      updateTurn(run, (item) => ({ ...item, status: signal.aborted ? "stopped" : "error",
        message: signal.aborted ? undefined : run.errorMessage ?? (error instanceof Error && !/^Host\w+(Failed|Error)$/.test(error.message)
          ? error.message : "The agent connection was interrupted. Please try again."),
      }));
      if (active.current === run && !signal.aborted) {
        setDraft(prompt);
        setImage(attachment);
      }
    } finally {
      if (active.current === run) {
        active.current = null;
        setRunning(false);
      }
    }
  }

  async function checkSession() {
    if (sessionCheck.current) return false;
    const controller = new AbortController();
    sessionCheck.current = controller;
    setChecking(true);
    setFeedback("");
    try {
      const response = await fetch("/api/playground", { cache: "no-store", credentials: "same-origin", signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return false;
      if (!response.ok) throw new Error(data?.error?.message || "The agent is unavailable. Please try again.");
      if (account.current && account.current !== data.account) {
        closeEngine();
        setTurns([]);
      }
      account.current = typeof data.account === "string" ? data.account : null;
      vision.current = data.visionAvailable === true;
      if (!data.enabled) {
        setFeedback("The agent is temporarily unavailable. Please try again later.");
        return false;
      }
      if (!data.signedIn) {
        dialog.current?.showModal();
        return false;
      }
      dialog.current?.close();
      if (!data.available) {
        setFeedback("The agent is temporarily unavailable. Please try again later.");
        return false;
      }
      return true;
    } catch (error) {
      if (!controller.signal.aborted) setFeedback(error instanceof Error ? error.message : "Could not check your Cloud session. Please try again.");
      return false;
    } finally {
      if (sessionCheck.current === controller) {
        sessionCheck.current = null;
        setChecking(false);
      }
    }
  }

  async function submit(text = draft) {
    if ((!text.trim() && !image) || active.current || sessionCheck.current) return;
    const prompt = text.trim() || "Describe this image and help me investigate it.";
    const attachment = image;
    setDraft(text);
    if (!await checkSession()) return;
    if (attachment && !vision.current) {
      setFeedback("Image input is unavailable right now. Remove the image to continue.");
      return;
    }
    setDraft("");
    setImage(null);
    void startTurn(prompt, attachment);
  }

  function attachImage(file: File | null) {
    if (file && (!playgroundImageTypes.some((type) => file.type === type) || file.size === 0 || file.size > maxPlaygroundImageBytes)) {
      setFeedback("Choose a PNG, JPEG, or WebP image up to 512 KiB.");
      return;
    }
    setImage(file);
    setFeedback("");
  }

  function reset() {
    sessionCheck.current?.abort();
    sessionCheck.current = null;
    closeEngine();
    dialog.current?.close();
    setTurns([]);
    setDraft("");
    setImage(null);
    setFeedback("");
    setRunning(false);
    setChecking(false);
  }

  return { checking, dialog, draft, feedback, image, running, turns, returningHome, attachImage, reset, setDraft, submit,
    recheckSignIn: checkSession, cancel: () => active.current?.controller.abort(),
  };
}
