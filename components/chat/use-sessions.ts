"use client";

import { useCallback, useEffect, useState } from "react";

import type { ChatUIMessage } from "@/lib/chat-models";
import type { HarnessId } from "@/lib/harnesses";
import {
  type ChatSession,
  createSession,
  deriveTitle,
  parseStore,
  pruneEmptySessions,
  removeSession,
  serializeStore,
  STORAGE_KEY,
  upsertSession,
} from "@/lib/chat-sessions";

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `s-${Date.now()}`;
}

/**
 * Session list backed by `localStorage`.
 *
 * Hydration: sessions load in an effect rather than during render, so the
 * server-rendered markup and the first client render agree. `ready` lets the
 * UI avoid flashing an empty sidebar before the read completes.
 */
export function useSessions(defaultModel: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = parseStore(localStorage.getItem(STORAGE_KEY)).sessions;
    setSessions(stored);
    setActiveId(stored[0]?.id ?? null);
    setReady(true);
  }, []);

  const persist = useCallback(
    (next: ChatSession[]) => {
      setSessions(next);
      try {
        localStorage.setItem(STORAGE_KEY, serializeStore(next));
      } catch {
        // Quota exceeded or storage disabled — keep the in-memory list working
        // rather than breaking the chat.
      }
    },
    [],
  );

  const active = sessions.find((s) => s.id === activeId) ?? null;

  const startSession = useCallback(
    (model: string, harness: HarnessId) => {
      // Reuse an untouched session rather than stacking up empty rows when
      // "New chat" is clicked repeatedly.
      const existingEmpty = sessions.find((s) => s.messages.length === 0);
      if (existingEmpty) {
        const reused = {
          ...existingEmpty,
          model,
          harness,
          updatedAt: Date.now(),
        };
        setActiveId(reused.id);
        persist(upsertSession(pruneEmptySessions(sessions, reused.id), reused));
        return reused;
      }

      const session = createSession({
        id: newId(),
        model,
        harness,
        now: Date.now(),
      });
      setActiveId(session.id);
      persist(upsertSession(pruneEmptySessions(sessions), session));
      return session;
    },
    [persist, sessions],
  );

  /** Writes the live transcript back into the active session. */
  const saveMessages = useCallback(
    (messages: ChatUIMessage[], patch?: Partial<ChatSession>) => {
      setSessions((current) => {
        const target = current.find((s) => s.id === activeId);
        if (!target) return current;

        const updated: ChatSession = {
          ...target,
          ...patch,
          messages,
          title:
            target.title === "New chat" ? deriveTitle(messages) : target.title,
          updatedAt: Date.now(),
        };

        const next = upsertSession(current, updated);
        try {
          localStorage.setItem(STORAGE_KEY, serializeStore(next));
        } catch {
          // See persist().
        }
        return next;
      });
    },
    [activeId],
  );

  const deleteSession = useCallback(
    (id: string) => {
      const next = removeSession(sessions, id);
      persist(next);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
    },
    [activeId, persist, sessions],
  );

  const renameSession = useCallback(
    (id: string, title: string) => {
      const target = sessions.find((s) => s.id === id);
      if (!target) return;
      persist(upsertSession(sessions, { ...target, title }));
    },
    [persist, sessions],
  );

  const clearAll = useCallback(() => {
    persist([]);
    setActiveId(null);
  }, [persist]);

  return {
    sessions,
    active,
    activeId,
    ready,
    defaultModel,
    setActiveId,
    startSession,
    saveMessages,
    deleteSession,
    renameSession,
    clearAll,
  };
}
