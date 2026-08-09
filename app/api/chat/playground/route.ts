import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type ToolSet,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { bitrouter } from "@/lib/bitrouter-provider";
import {
  AGENT_INSTRUCTIONS,
  AGENT_MAX_STEPS,
  AGENT_STEP_MODEL,
  agentTools,
} from "@/lib/chat-agent";
import {
  type ChatUIMessage,
  DEFAULT_CHAT_MODEL,
  isAllowedChatModel,
} from "@/lib/chat-models";
import { DEFAULT_HARNESS, type HarnessId, isHarnessId } from "@/lib/harnesses";
import { isHarnessAvailable } from "@/lib/harnesses.server";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * The playground's only backend.
 *
 * Both axes are chosen per request: `model` picks what BitRouter routes to,
 * `harness` picks what drives the agent loop. The harnesses differ in how they
 * hold history, so the dispatch below is a real fork rather than a config
 * switch — the stateless loop is handed the whole transcript, while a
 * session-backed runtime is handed only the newest turn.
 */

// The ceiling for the slowest harness. A sandbox-backed turn can spend a long
// time in tool calls before it produces any text.
export const maxDuration = 300;

type Body = {
  messages: UIMessage[];
  model?: string;
  harness?: string;
  sessionId?: string;
};

export async function POST(req: Request) {
  const distinctId = req.headers.get("X-POSTHOG-DISTINCT-ID") ?? "anonymous";

  const { messages, model, harness, sessionId }: Body = await req.json();

  const harnessId: HarnessId = isHarnessId(harness) ? harness : DEFAULT_HARNESS;

  // A client asking for a harness this deployment cannot run is a bug or a
  // hand-rolled request, not something to silently downgrade — falling back to
  // another harness would answer as something the caller did not ask for.
  if (!isHarnessAvailable(harnessId)) {
    return Response.json(
      { error: `The ${harnessId} harness is not available here.` },
      { status: 400 },
    );
  }

  // Never forward a client-supplied model id straight to the router — this
  // endpoint spends the site's shared key.
  const modelId = isAllowedChatModel(model) ? model : DEFAULT_CHAT_MODEL;

  if (harnessId === "ai-sdk") {
    return streamAiSdkLoop({ messages, modelId, distinctId });
  }

  // Imported lazily: the packaged harnesses pull in a large dependency tree,
  // and the stateless path must not pay to evaluate it.
  const { streamHarnessTurn } = await import("@/lib/harness-stream");
  return streamHarnessTurn({
    messages,
    modelId,
    harnessId,
    sessionId,
    distinctId,
    abortSignal: req.signal,
  });
}

/**
 * The AI SDK's own loop: `streamText` with the docs tools, no server session.
 */
async function streamAiSdkLoop({
  messages,
  modelId,
  distinctId,
}: {
  messages: UIMessage[];
  modelId: string;
  distinctId: string;
}) {
  let steps = 0;

  const result = streamText({
    model: bitrouter(AGENT_STEP_MODEL),
    instructions: AGENT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    tools: agentTools,
    // The loop already ends on its own when the model answers without calling
    // a tool; this only bounds the runaway case.
    stopWhen: stepCountIs(AGENT_MAX_STEPS),
    // The routing demo, and the reason an agent is interesting on a router:
    // step 0 is a mechanical "which tool do I call for this question?", which
    // the cheap model handles fine. From step 1 the agent is reasoning over
    // real content and likely writing the answer, so it runs on the model the
    // user picked. On the final allowed step tools are withdrawn, forcing an
    // answer instead of another search.
    prepareStep: ({ stepNumber }) => {
      steps = stepNumber + 1;

      if (stepNumber >= AGENT_MAX_STEPS - 1) {
        return { model: bitrouter(modelId), activeTools: [] };
      }
      if (stepNumber === 0) return {};
      return { model: bitrouter(modelId) };
    },
    onEnd({ usage }) {
      getPostHogClient().capture({
        distinctId,
        event: "chat_playground_completion",
        properties: {
          model: modelId,
          harness: "ai-sdk",
          steps,
          input_tokens: usage?.inputTokens,
          output_tokens: usage?.outputTokens,
        },
      });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, ChatUIMessage>({
      stream: result.stream,
      tools: agentTools,
      messageMetadata: ({ part }) =>
        part.type === "finish"
          ? { model: modelId, harness: "ai-sdk", usage: part.totalUsage }
          : undefined,
    }),
  });
}
