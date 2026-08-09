import "server-only";

import {
  createUIMessageStreamResponse,
  type ToolSet,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { createBitrouterAcpAgent } from "@/lib/bitrouter-acp/agents";
import type { ChatUIMessage } from "@/lib/chat-models";
import {
  acquireSession,
  HarnessSessionBusyError,
  releaseSession,
} from "@/lib/harness-sessions";
import { type HarnessId, isHarnessId } from "@/lib/harnesses";
import { createPiAgent } from "@/lib/pi-harness/agent";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Turn-serving for every session-backed harness.
 *
 * These runtimes own their conversation history, so unlike the stateless loop
 * this does not replay the transcript — it sends only the newest user turn and
 * lets the runtime remember the rest.
 */

function latestUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return "";
  return last.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n")
    .trim();
}

/** Which builder backs a harness id. */
function agentFactory(harnessId: HarnessId, modelId: string) {
  if (harnessId === "pi") return () => createPiAgent(modelId);
  return () => createBitrouterAcpAgent({ harnessId, modelId });
}

export async function streamHarnessTurn({
  messages,
  modelId,
  harnessId,
  sessionId,
  distinctId,
  abortSignal,
}: {
  messages: UIMessage[];
  modelId: string;
  harnessId: HarnessId;
  sessionId?: string;
  distinctId: string;
  /** The request's signal — a client that navigates away mid-turn would
   * otherwise leave the session checked out until the TTL sweep. */
  abortSignal?: AbortSignal;
}): Promise<Response> {
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return Response.json({ error: "sessionId is required" }, { status: 400 });
  }

  const prompt = latestUserText(messages ?? []);
  if (!prompt) {
    return Response.json({ error: "No user message" }, { status: 400 });
  }

  // Caught rather than annotated so the pool's generic survives: annotating
  // `entry` up front would collapse it to the pool's minimal agent shape.
  const entry = await acquireSession({
    sessionId,
    modelId,
    harnessId,
    createAgent: agentFactory(harnessId, modelId),
  }).catch((err: unknown) => {
    if (err instanceof HarnessSessionBusyError) return err;
    throw err;
  });

  if (entry instanceof HarnessSessionBusyError) {
    return Response.json({ error: entry.message }, { status: 409 });
  }

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    releaseSession(sessionId);
  };

  abortSignal?.addEventListener("abort", release);

  try {
    const result = await entry.agent.stream({ session: entry.session, prompt });

    const stream = toUIMessageStream<ToolSet, ChatUIMessage>({
      stream: result.stream,
      tools: entry.agent.tools,
      messageMetadata: ({ part }) => {
        if (part.type !== "finish") return undefined;

        getPostHogClient().capture({
          distinctId,
          event: "chat_playground_completion",
          properties: {
            model: modelId,
            harness: harnessId,
            input_tokens: part.totalUsage?.inputTokens,
            output_tokens: part.totalUsage?.outputTokens,
          },
        });

        return {
          model: modelId,
          harness: isHarnessId(harnessId) ? harnessId : undefined,
          usage: part.totalUsage,
        };
      },
    }).pipeThrough(
      // The session stays checked out until the stream is done, so a second
      // turn on the same chat gets a 409 instead of interleaving with this one.
      new TransformStream({ flush: release }),
    );

    return createUIMessageStreamResponse({ stream });
  } catch (err) {
    release();
    throw err;
  }
}
