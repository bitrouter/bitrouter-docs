import { useCallback, useEffect, useRef, useState } from "react";
import type { FxEngineTurn, FxHookEvent, FxTurnEvent } from "libfx/browser";
import { maxPlaygroundImageBytes, playgroundImageTypes } from "@/lib/playground-tools";
import type { EngineSnapshot, PlaygroundEngine } from "./engine";
import { loadPlaygroundSession, removePlaygroundSession, savePlaygroundSession } from "./session-storage";
import { pollCloudReceipt, type PlaygroundMode, type PlaygroundProfile, type PlaygroundReceipt } from "./cloud-transport";

export const starter = "Find why the session refresh test fails and fix it in the sample workspace.";
export const routingStarter = "Find the BitRouter docs on provider fallback and look up z-ai/glm-5.3-flash.";
export const profiles = { latency: "Latency priority", cost: "Cost priority" };

type ToolCall = { id: string; name: string; input?: unknown; output?: string; failed?: boolean; done?: boolean };
export type ModelStep = { id: string; text: string; tools: ToolCall[]; receipt?: PlaygroundReceipt };

export function toolArgument(input: ToolCall["input"]) {
  return typeof input === "object" && input !== null
    ? Object.values(input).filter((value): value is string => typeof value === "string").join(", ") : "";
}

export type PlaygroundTurn = {
  id: string;
  createdAt: number;
  prompt: string;
  steps: ModelStep[];
  imageName?: string;
  steers: { id: string; text: string }[];
  trace: { at: number; label: string }[];
  status: "running" | "completed" | "stopped" | "error";
  elapsed?: number;
  message?: string;
};

type Task = { prompt: string; image?: File };
type Fork = { latencyId: string; task: Task; snapshot: EngineSnapshot };
type Comparison = { latencyId: string; costId: string };
type EngineSlot = { runtime: PlaygroundEngine; mode: PlaygroundMode };
type SavedSession = {
  mode: PlaygroundMode;
  profile: PlaygroundProfile;
  runs: Record<PlaygroundProfile, PlaygroundTurn[]>;
  snapshots: Partial<Record<PlaygroundProfile, EngineSnapshot>>;
  fork: Fork | null;
  comparison: Comparison | null;
  draft: string;
  image: File | null;
};

type Execution = {
  id: string;
  profile: PlaygroundProfile;
  mode: PlaygroundMode;
  controller: AbortController;
  turn?: FxEngineTurn;
  queued?: string;
  steered?: boolean;
  stepId?: string;
  receipt?: { stepId: string; handle: string };
};

const emptyRuns: Record<PlaygroundProfile, PlaygroundTurn[]> = { latency: [], cost: [] };
const stopMessages = {
  max_output_tokens: "The model reached its output limit.",
  max_model_turns: "The engine reached its model request limit.",
  refused: "The model declined the task.",
};

export function usePlaygroundController() {
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState<string | null>(null);
  const [pendingSteer, setPendingSteer] = useState<string | null>(null);
  const [steerReady, setSteerReady] = useState(false);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [runs, setRuns] = useState(emptyRuns);
  const [profile, setProfile] = useState<PlaygroundProfile>("latency");
  const [mode, setMode] = useState<PlaygroundMode | null>(null);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const engines = useRef<Partial<Record<PlaygroundProfile, EngineSlot>>>({});
  const restored = useRef<Partial<Record<PlaygroundProfile, EngineSnapshot>>>({});
  const fork = useRef<Fork | null>(null);
  const storage = useRef(false);
  const vision = useRef(false);
  const active = useRef<Execution | null>(null);
  const sessionCheck = useRef<AbortController | null>(null);
  const receipts = useRef<AbortController | null>(null);
  const session = useRef<string | null>(null);

  const dispose = useCallback(() => {
    active.current?.controller.abort();
    active.current = null;
    sessionCheck.current?.abort();
    sessionCheck.current = null;
    receipts.current?.abort();
    receipts.current = null;
    session.current = null;
    const previous = engines.current;
    engines.current = {};
    restored.current = {};
    fork.current = null;
    for (const entry of Object.values(previous)) void entry.runtime.close().catch(() => undefined);
  }, []);
  useEffect(() => dispose, [dispose]);

  function updateTurn(run: Execution, update: (turn: PlaygroundTurn) => PlaygroundTurn) {
    setRuns((current) => ({
      ...current,
      [run.profile]: current[run.profile].map((turn) => turn.id === run.id ? update(turn) : turn),
    }));
  }

  function updateStep(run: Execution, stepId: string, update: (step: ModelStep) => ModelStep) {
    updateTurn(run, (turn) => ({ ...turn, steps: turn.steps.map((step) => step.id === stepId ? update(step) : step) }));
  }

  function settleReceipt(run: Execution, browserSession: string) {
    const pending = run.receipt;
    run.receipt = undefined;
    if (!pending) return;
    const { signal } = receipts.current ??= new AbortController();
    void pollCloudReceipt(pending.handle, browserSession, signal).then((receipt) => {
      if (!signal.aborted) updateStep(run, pending.stepId, (step) => ({ ...step, receipt }));
    });
  }

  function modelRequest(browserSession: string) {
    const run = active.current;
    if (!run || run.controller.signal.aborted) return () => {};
    settleReceipt(run, browserSession);
    const id = crypto.randomUUID();
    run.stepId = id;
    updateTurn(run, (turn) => ({
      ...turn,
      steps: [...turn.steps, { id, text: "", tools: [], receipt: run.mode === "cloud" ? { state: "pending" } : undefined }],
    }));
    return (handle: string | null) => {
      if (active.current !== run) return;
      if (handle) run.receipt = { stepId: id, handle };
      else updateStep(run, id, (step) => ({ ...step, receipt: { state: "unavailable" } }));
    };
  }

  function recordEvent(run: Execution, event: FxTurnEvent) {
    if (active.current !== run) return;
    if (event.type === "user_message" && event.id) {
      const id = event.id;
      run.steered = true;
      updateTurn(run, (turn) => ({ ...turn, steers: [...turn.steers, { id, text: event.text }] }));
      setPendingSteer((pending) => pending === id ? null : pending);
    }
    const stepId = run.stepId;
    if (!stepId) return;
    if (event.type === "text_delta") {
      updateStep(run, stepId, (step) => ({ ...step, text: step.text + event.delta }));
    } else if (event.type === "tool_start") {
      updateStep(run, stepId, (step) => ({ ...step, tools: [...step.tools, { id: event.id, name: event.name, input: event.input }] }));
    } else if (event.type === "tool_end") {
      updateTurn(run, (turn) => ({ ...turn, steps: turn.steps.map((step) => ({
        ...step,
        tools: step.tools.map((tool) => tool.id === event.id && !tool.done
          ? { ...tool, output: event.content, failed: event.isError, done: true } : tool),
      })) }));
    }
  }

  function recordTrace(profile: PlaygroundProfile, event: FxHookEvent) {
    const run = active.current;
    if (!run || run.profile !== profile) return;
    let label: string;
    switch (event.type) {
      case "model.start": label = `Model request ${event.data.modelCallId} started`; break;
      case "model.output_start": label = `Model request ${event.data.modelCallId} first output`; break;
      case "model.end": label = `Model request ${event.data.modelCallId} ended`; break;
      case "tool.start": label = `Tool ${event.data.call.name} started`; break;
      case "tool.end": label = `Tool ${event.data.call.name} · ${event.data.status}`; break;
      case "mcp.start": label = `MCP ${event.data.server ?? "server"} · ${event.data.tool}`; break;
      case "mcp.end": label = `MCP result · ${event.data.status}`; break;
      default: return;
    }
    updateTurn(run, (turn) => ({ ...turn, trace: [...turn.trace, { at: event.timestamp, label }].slice(-120) }));
  }

  async function startTurn(task: Task, nextProfile: PlaygroundProfile, nextMode: PlaygroundMode, options?: {
    branch?: Fork; followUp?: boolean;
  }) {
    if (!task.prompt || active.current || storage.current) return;
    const run: Execution = { id: crypto.randomUUID(), profile: nextProfile, mode: nextMode, controller: new AbortController() };
    active.current = run;
    const browserSession = session.current ??= crypto.randomUUID();
    const { signal } = run.controller;
    setProfile(nextProfile);
    setMode(nextMode);
    setRunning(true);
    setFeedback("");
    setNotice("");
    if (options?.branch) setComparison({ latencyId: options.branch.latencyId, costId: run.id });
    setRuns((current) => ({ ...current, [nextProfile]: [...current[nextProfile], {
      id: run.id, createdAt: performance.timeOrigin + performance.now(), prompt: task.prompt,
      imageName: task.image?.name, steps: [], steers: [], trace: [], status: "running",
    }] }));

    try {
      let slot = engines.current[nextProfile];
      if (options?.branch || !slot || slot.mode !== nextMode) {
        delete engines.current[nextProfile];
        await slot?.runtime.close();
        const { openPlaygroundEngine } = await import("./engine");
        signal.throwIfAborted();
        const runtime = await openPlaygroundEngine({
          mode: nextMode, profile: nextProfile, session: browserSession,
          snapshot: options?.branch?.snapshot ?? restored.current[nextProfile],
          onRequest: () => modelRequest(browserSession),
          onTrace: (event) => recordTrace(nextProfile, event),
        });
        if (signal.aborted) {
          await runtime.close();
          signal.throwIfAborted();
        }
        slot = { runtime, mode: nextMode };
        engines.current[nextProfile] = slot;
        delete restored.current[nextProfile];
      }
      const baseline = nextProfile === "latency" ? await slot.runtime.snapshot() : undefined;
      signal.throwIfAborted();
      const started = performance.now();
      const { value } = slot.runtime;
      const turn = options?.followUp
        ? await value.followUp(task.prompt)
        : value.prompt(task.image ? [{ type: "text", text: task.prompt }, { type: "image", data: task.image }] : task.prompt, { signal });
      run.turn = turn;
      if (active.current === run) setSteerReady(true);
      const cancel = () => turn.cancel();
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) cancel();
      void turn.result.catch(() => undefined);
      try {
        for await (const event of turn) recordEvent(run, event);
        const { stopReason } = await turn.result;
        if (active.current !== run) return;
        const elapsed = performance.now() - started;
        const stopped = signal.aborted || stopReason === "cancelled";
        const message = stopReason === "end_turn" || stopReason === "cancelled" ? undefined : stopMessages[stopReason];
        if (!stopped && !message && baseline && !run.steered) fork.current = { latencyId: run.id, task, snapshot: baseline };
        updateTurn(run, (item) => ({
          ...item, status: stopped ? "stopped" : message ? "error" : "completed", message: stopped ? undefined : message,
          elapsed: stopped || message ? undefined : elapsed,
        }));
      } finally {
        signal.removeEventListener("abort", cancel);
      }
    } catch (error) {
      if (active.current !== run) return;
      updateTurn(run, (item) => ({
        ...item,
        status: signal.aborted ? "stopped" : "error",
        message: signal.aborted ? undefined : error instanceof Error ? error.message : "Could not run this task.",
      }));
    } finally {
      if (active.current === run) {
        settleReceipt(run, browserSession);
        active.current = null;
        setRunning(false);
        setQueued(null);
        setPendingSteer(null);
        setSteerReady(false);
        if (run.queued && !signal.aborted && run.turn) {
          void startTurn({ prompt: run.queued }, nextProfile, nextMode, { followUp: true });
        }
      }
    }
  }

  async function checkSession(rechecking = false) {
    if (sessionCheck.current) return null;
    const controller = new AbortController();
    sessionCheck.current = controller;
    setChecking(true);
    setNotice("");
    try {
      const response = await fetch("/api/playground", { cache: "no-store", signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return null;
      const available = data.liveAvailable === true;
      vision.current = data.visionAvailable === true;
      setSignedIn(response.ok);
      setLiveAvailable(available);
      if (response.ok && !available) setNotice("Cloud sign-in verified. Live inference needs a configured preview key.");
      else if (!response.ok && response.status !== 401) setNotice("Could not check your Cloud session. Please try again.");
      else if (response.status === 401 && rechecking) setNotice("Your Cloud session is not available in this tab yet.");
      return response.ok && available;
    } catch {
      if (controller.signal.aborted) return null;
      setNotice("Could not check your Cloud session. Please try again.");
      return false;
    } finally {
      if (sessionCheck.current === controller) {
        sessionCheck.current = null;
        setChecking(false);
      }
    }
  }

  function submitDraft(nextMode: PlaygroundMode, text = draft) {
    const prompt = text.trim() || (image ? "Describe this image and help me investigate it." : "");
    if (!prompt || active.current || storage.current) return;
    if (image && nextMode === "cloud" && !vision.current) {
      const message = "Live image tasks need BITROUTER_PLAYGROUND_VISION_MODEL. Remove the image or use the local preview.";
      setNotice(message);
      setFeedback(message);
      return;
    }
    setDraft("");
    setImage(null);
    void startTurn({ prompt, image: image ?? undefined }, profile, nextMode);
  }

  async function submit(task = draft) {
    if ((!task.trim() && !image) || active.current || sessionCheck.current || storage.current) return;
    if (mode === "fixture" || (mode === "cloud" && (!image || vision.current))) return submitDraft(mode, task);
    setDraft(task);
    const ready = await checkSession();
    if (ready && (!image || vision.current)) submitDraft("cloud", task);
    else if (ready !== null) dialog.current?.showModal();
  }

  function chooseMode(nextMode: PlaygroundMode) {
    if (nextMode === "cloud" && image && !vision.current) return submitDraft(nextMode);
    dialog.current?.close();
    submitDraft(nextMode);
  }

  async function recheckSignIn() {
    if (await checkSession(true)) dialog.current?.close();
  }

  function attachImage(file: File | null) {
    if (file && (!playgroundImageTypes.some((type) => file.type === type) || file.size === 0 || file.size > maxPlaygroundImageBytes)) {
      setFeedback("Choose a PNG, JPEG, or WebP image up to 512 KiB.");
      return;
    }
    setImage(file);
    setFeedback("");
  }

  async function steer(text: string) {
    const run = active.current;
    if (!run?.turn || !text.trim() || pendingSteer) return false;
    const change = run.turn.steer(text.trim());
    setPendingSteer(change.id);
    try {
      await change;
      return true;
    } catch (error) {
      if (active.current === run) {
        setPendingSteer(null);
        setFeedback(error instanceof Error ? error.message : "Could not steer the turn.");
      }
      return false;
    }
  }

  async function withdraw() {
    const run = active.current;
    if (!run?.turn || !pendingSteer) return;
    try {
      const result = await run.turn.withdraw(pendingSteer);
      if (result === "already_placed") setFeedback("That instruction already reached the model.");
      setPendingSteer(null);
    } catch {
      setFeedback("Could not withdraw the instruction.");
    }
  }

  function queueFollowUp(text: string) {
    const run = active.current;
    if (!run || run.queued || !text.trim()) return;
    run.queued = text.trim();
    setQueued(run.queued);
  }

  async function manageSavedSession(action: "save" | "restore" | "delete") {
    if (active.current || sessionCheck.current || storage.current) return;
    storage.current = true;
    setBusy(true);
    setFeedback("");
    try {
      if (action === "delete") {
        await removePlaygroundSession();
        setFeedback("Saved session deleted.");
      } else if (action === "save" && mode) {
        const snapshots = { ...restored.current };
        for (const key of ["latency", "cost"] as const) {
          const slot = engines.current[key];
          if (slot) snapshots[key] = await slot.runtime.snapshot();
        }
        await savePlaygroundSession<SavedSession>({ mode, profile, runs, snapshots, fork: fork.current, comparison, draft, image });
        setFeedback("Session saved in this browser.");
      } else if (action === "restore") {
        const saved = await loadPlaygroundSession<SavedSession>();
        if (!saved) return setFeedback("No session has been saved in this browser.");
        dispose();
        restored.current = saved.snapshots;
        fork.current = saved.fork;
        setMode(saved.mode);
        setProfile(saved.profile);
        const settleRestored = (turns: PlaygroundTurn[]) => turns.map((turn) => ({ ...turn, steps: turn.steps.map((step) =>
          step.receipt?.state === "pending" ? { ...step, receipt: { state: "unavailable" } } : step,
        ) }));
        setRuns({ latency: settleRestored(saved.runs.latency), cost: settleRestored(saved.runs.cost) });
        setComparison(saved.comparison);
        setDraft(saved.draft);
        setImage(saved.image);
        setFeedback("Saved session restored.");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not access the saved session.");
    } finally {
      storage.current = false;
      setBusy(false);
    }
  }

  function reset() {
    if (storage.current) return;
    dispose();
    dialog.current?.close();
    setRuns(emptyRuns);
    setDraft("");
    setImage(null);
    setNotice("");
    setFeedback("");
    setQueued(null);
    setPendingSteer(null);
    setSteerReady(false);
    setComparison(null);
    setMode(null);
    setProfile("latency");
    setRunning(false);
    setChecking(false);
  }

  const latest = fork.current;
  const latency = runs.latency.find((turn) => turn.id === latest?.latencyId);
  const cost = comparison?.latencyId === latest?.latencyId ? runs.cost.find((turn) => turn.id === comparison?.costId) : undefined;
  const canCompare = Boolean(latest && !running && !busy && cost?.status !== "completed" && mode);

  return {
    busy, checking, chooseMode, dialog, draft, liveAvailable, mode, notice, profile, recheckSignIn,
    reset, running, runs, setDraft, signedIn, submit, canCompare, latency, cost, image, attachImage, feedback,
    steer, withdraw, pendingSteer, steerReady, queueFollowUp, queued, manageSavedSession,
    cancel: () => active.current?.controller.abort(),
    selectProfile(next: PlaygroundProfile) {
      if (!active.current && !sessionCheck.current && !storage.current) setProfile(next);
    },
    compare() { if (canCompare && latest && mode) void startTurn(latest.task, "cost", mode, { branch: latest }); },
  };
}
