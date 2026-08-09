"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getToolName, isStaticToolUIPart } from "ai";
import { BotIcon, CpuIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextTrigger,
} from "@/components/ai-elements/context";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { ProviderIcon } from "@/components/models/provider-icon";
import {
  CHAT_MODELS,
  type ChatUIMessage,
  DEFAULT_CHAT_MODEL,
  getChatModel,
} from "@/lib/chat-models";
import { cn } from "@/lib/cn";
import {
  DEFAULT_HARNESS,
  getHarness,
  type HarnessId,
  type HarnessOption,
  resetsHistory,
} from "@/lib/harnesses";

import { SessionsSidebar } from "./sessions-sidebar";
import { useSessions } from "./use-sessions";

/** What each harness is, in the words of the empty conversation. */
const EMPTY_STATE: Record<HarnessId, string> = {
  "ai-sdk":
    "The AI SDK's own agent loop. It plans a short sequence of documentation searches, reads the pages it finds, and answers with citations — routed through BitRouter on the model you pick.",
  pi: "Pi drives its own agent loop with a scratch shell and filesystem, plus BitRouter's documentation tools. It remembers the conversation itself, so switching model starts a new chat.",
  "claude-code":
    "Claude Code as an agent runtime, run against Anthropic's own API rather than through the router.",
  codex:
    "Codex as an agent runtime, run against OpenAI's own API rather than through the router.",
  opencode:
    "OpenCode as an agent runtime, run against its own provider rather than through the router.",
  "bitrouter-claude-acp":
    "Claude Code, driven by BitRouter over ACP and routed to the model you pick. Same runtime as the entry above — the difference is whose endpoint it talks to.",
  "bitrouter-codex-acp":
    "Codex, driven by BitRouter over ACP and routed to the model you pick. Same runtime as the entry above — the difference is whose endpoint it talks to.",
  "bitrouter-gemini-cli":
    "Gemini CLI, driven by BitRouter over ACP and routed to the model you pick.",
  "bitrouter-pi-acp":
    "Pi, driven by BitRouter over ACP and routed to the model you pick. Unlike the in-process Pi entry, this one runs in a sandbox VM with a real shell.",
};

export type PlaygroundConfig = {
  /**
   * The harness axis, with per-deployment availability resolved on the server.
   * Unavailable entries still render, greyed out with their reason.
   */
  harnesses: HarnessOption[];
};

export function ChatPlayground({ harnesses }: PlaygroundConfig) {
  const store = useSessions(DEFAULT_CHAT_MODEL);
  const { active, sessions, activeId, ready, setActiveId, startSession } = store;

  const [model, setModel] = useState(DEFAULT_CHAT_MODEL);
  const [harness, setHarness] = useState<HarnessId>(DEFAULT_HARNESS);

  // Live values for the transport, which is constructed once.
  const modelRef = useRef(model);
  modelRef.current = model;

  const harnessRef = useRef(harness);
  harnessRef.current = harness;

  // Session-backed harnesses key their server-side history off this id. The
  // stateless loop ignores it.
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const { messages, sendMessage, status, stop, error, setMessages, regenerate } =
    useChat<ChatUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/chat/playground",
        body: () => ({
          model: modelRef.current,
          harness: harnessRef.current,
          sessionId: activeIdRef.current,
        }),
      }),
    });

  const isBusy = status === "streaming" || status === "submitted";

  // Swapping sessions swaps the transcript and both of its axes together.
  const loadedId = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || activeId === loadedId.current) return;
    loadedId.current = activeId;
    setMessages(active?.messages ?? []);
    if (active) {
      setModel(active.model);
      setHarness(active.harness);
    }
  }, [active, activeId, ready, setMessages]);

  // Persist the transcript once a turn settles, not on every token.
  const { saveMessages } = store;
  useEffect(() => {
    if (!activeId || isBusy || messages.length === 0) return;
    saveMessages(messages, { model, harness });
  }, [activeId, harness, isBusy, messages, model, saveMessages]);

  const activeModel = getChatModel(model);
  const activeHarness = harnesses.find((h) => h.id === harness);

  const usage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const meta = messages[i].metadata;
      if (meta?.usage) return meta.usage;
    }
    return undefined;
  }, [messages]);

  const usedTokens = (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);

  /**
   * Apply a change to either axis, starting a fresh chat when the current
   * runtime could not honour it.
   *
   * A session-backed harness owns the conversation and binds its model when the
   * session is built, so changing either axis gives it an empty history — while
   * the transcript on screen still shows the earlier turns. Rather than leave
   * the user talking to an agent that remembers none of it, the switch opens a
   * new chat. The stateless loop replays the transcript every turn, so it can
   * change model mid-conversation freely.
   */
  const applyAxes = useCallback(
    (next: { model?: string; harness?: HarnessId }) => {
      const nextModel = next.model ?? model;
      const nextHarness = next.harness ?? harness;

      setModel(nextModel);
      setHarness(nextHarness);

      const wouldReset = resetsHistory({
        fromHarness: harness,
        toHarness: nextHarness,
        modelChanged: nextModel !== model,
      });

      if (wouldReset && messages.length > 0) {
        setMessages([]);
        const session = startSession(nextModel, nextHarness);
        loadedId.current = session.id;
        activeIdRef.current = session.id;
      }
    },
    [harness, messages.length, model, setMessages, startSession],
  );

  const onSend = useCallback(
    (text: string) => {
      if (!activeId) {
        const session = startSession(model, harness);
        // Claim the new session as already-loaded. Without this, the
        // session-load effect sees activeId change and calls setMessages with
        // the (empty) stored transcript, wiping the message we are about to
        // send — the user's turn would vanish and the session would keep its
        // placeholder title.
        loadedId.current = session.id;
        // The transport reads this synchronously on the send below, before
        // React has re-rendered with the new activeId.
        activeIdRef.current = session.id;
      }
      void sendMessage({ text });
    },
    [activeId, harness, model, sendMessage, startSession],
  );

  return (
    <div className="br-chat flex min-h-0 flex-1">
      <SessionsSidebar
        activeId={activeId}
        className="hidden md:flex"
        onDelete={store.deleteSession}
        onNew={() => {
          setMessages([]);
          startSession(model, harness);
        }}
        onSelect={setActiveId}
        sessions={sessions}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="mx-auto w-full max-w-3xl">
            {messages.length === 0 && !error && (
              <ConversationEmptyState
                description={EMPTY_STATE[harness]}
                icon={<BotIcon className="size-5" />}
                title={`${activeHarness?.label ?? "Agent"} · ${activeModel?.label ?? "any model"}`}
              />
            )}

            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    const key = `${message.id}-${i}`;

                    if (part.type === "text") {
                      return (
                        <MessageResponse key={key}>{part.text}</MessageResponse>
                      );
                    }

                    // Static only: agent tools are declared server-side, so a
                    // dynamic-tool part would mean something unexpected.
                    if (isStaticToolUIPart(part)) {
                      return (
                        <Tool key={key}>
                          <ToolHeader
                            state={part.state}
                            title={getToolName(part)}
                            type={part.type}
                          />
                          <ToolContent>
                            <ToolInput input={part.input} />
                            <ToolOutput
                              errorText={part.errorText}
                              output={part.output}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }

                    return null;
                  })}
                </MessageContent>
                {message.role === "assistant" && message.metadata?.model && (
                  <MessageFooter
                    harnessId={message.metadata.harness}
                    modelId={message.metadata.model}
                  />
                )}
              </Message>
            ))}

            {isBusy && messages.at(-1)?.role === "user" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader size={14} />
                <span className="font-mono text-[12px]">Planning…</span>
              </div>
            )}

            {error && (
              <div className="rounded-[10px] border border-border bg-secondary p-3">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-destructive">
                  Request failed
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {error.message}
                </p>
                <button
                  className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => regenerate()}
                  type="button"
                >
                  <RefreshCwIcon className="size-3.5" />
                  Retry
                </button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border px-4 py-3 sm:px-6">
          <PromptInput
            className="mx-auto w-full max-w-3xl"
            onSubmit={(message) => {
              const text = message.text.trim();
              if (!text || isBusy) return;
              onSend(text);
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea placeholder="Ask the agent to research something…" />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputSelect
                  onValueChange={(value) =>
                    applyAxes({ harness: value as HarnessId })
                  }
                  value={harness}
                >
                  <PromptInputSelectTrigger className="gap-1.5 font-mono text-[12px]">
                    <CpuIcon className="size-3.5 text-primary" />
                    {activeHarness?.label ?? harness}
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent
                    align="start"
                    position="popper"
                    side="top"
                    sideOffset={6}
                  >
                    {harnesses.map((h) => (
                      // Unavailable harnesses stay listed rather than hidden:
                      // the picker is the clearest statement of what the
                      // product is, and the reason tells an operator exactly
                      // what is missing.
                      <PromptInputSelectItem
                        disabled={!h.available}
                        key={h.id}
                        value={h.id}
                      >
                        <span className="flex w-full items-center gap-2">
                          <span className="min-w-24 font-mono text-[13px]">
                            {h.label}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {h.available ? h.blurb : h.reason}
                          </span>
                        </span>
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>

                <PromptInputSelect
                  onValueChange={(value) => applyAxes({ model: value })}
                  value={model}
                >
                  {/* The trigger renders the label directly rather than via
                      PromptInputSelectValue: Radix clones the selected item's
                      children into the trigger, which would drag the price
                      column in with it. */}
                  <PromptInputSelectTrigger className="gap-1.5 font-mono text-[12px]">
                    {activeModel && (
                      <>
                        <ProviderIcon provider={activeModel.provider} size={13} />
                        {activeModel.label}
                      </>
                    )}
                  </PromptInputSelectTrigger>
                  {/* `position="popper"` anchors the list to the trigger.
                      shadcn's SelectContent defaults to "item-aligned", which
                      tries to place the selected row over the trigger — with
                      the composer near the bottom of the viewport that shoves
                      the whole list up over the site header. */}
                  <PromptInputSelectContent
                    align="start"
                    position="popper"
                    side="top"
                    sideOffset={6}
                  >
                    {CHAT_MODELS.map((m) => (
                      <PromptInputSelectItem key={m.id} value={m.id}>
                        {/* Radix shrink-wraps each item box, so `ml-auto`
                            alone leaves the price column ragged. Pinning the
                            label width starts every price at the same x. */}
                        <span className="flex items-center gap-2">
                          <ProviderIcon provider={m.provider} size={13} />
                          <span className="min-w-36 font-mono text-[13px]">
                            {m.label}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                            ${m.inputUsdPerM}/${m.outputUsdPerM} per M
                          </span>
                        </span>
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>

                {usage && activeModel && (
                  <Context
                    maxTokens={activeModel.contextWindow}
                    modelId={activeModel.id}
                    usage={usage}
                    usedTokens={usedTokens}
                  >
                    <ContextTrigger />
                    <ContextContent>
                      <ContextContentHeader />
                      <ContextContentBody>
                        <div className="space-y-2">
                          <ContextInputUsage />
                          <ContextOutputUsage />
                          <ContextCacheUsage />
                        </div>
                      </ContextContentBody>
                    </ContextContent>
                  </Context>
                )}
              </PromptInputTools>
              <PromptInputSubmit
                onClick={isBusy ? () => stop() : undefined}
                status={status}
                type={isBusy ? "button" : "submit"}
              />
            </PromptInputFooter>
          </PromptInput>

          <p className="mx-auto mt-2 w-full max-w-3xl text-center font-mono text-[11px] text-muted-foreground/70">
            Responses are generated by third-party models routed through
            BitRouter. Verify anything important.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Both axes, attributed per turn — the transcript can span several of each. */
function MessageFooter({
  modelId,
  harnessId,
}: {
  modelId: string;
  harnessId?: HarnessId;
}) {
  const model = getChatModel(modelId);
  if (!model) return null;

  const harness = harnessId ? getHarness(harnessId) : undefined;

  return (
    <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
      <ProviderIcon provider={model.provider} size={11} />
      {model.label}
      {harness && (
        <>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          {harness.label}
        </>
      )}
    </p>
  );
}

/** Full-viewport shell: the conversation scrolls, the composer stays pinned. */
export function ChatShell({
  className,
  ...config
}: { className?: string } & PlaygroundConfig) {
  return (
    <div className={cn("br-chat-shell flex flex-col", className)}>
      <ChatPlayground {...config} />
    </div>
  );
}
