"use client";

import { BotIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { ChatSession } from "@/lib/chat-sessions";
import { cn } from "@/lib/cn";

export function SessionsSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  className,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex w-60 shrink-0 flex-col border-r border-border",
        className,
      )}
    >
      <div className="border-b border-border p-2">
        <button
          className="flex w-full items-center gap-2 rounded-[7px] border border-border bg-secondary px-2.5 py-2 font-mono text-[12px] text-foreground transition-colors hover:border-ring/40"
          onClick={onNew}
          type="button"
        >
          <PlusIcon className="size-3.5" />
          New chat
        </button>
      </div>

      <div className="fd-scroll-container min-h-0 flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="px-1 py-3 font-mono text-[11px] text-muted-foreground">
            No saved chats yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sessions.map((session) => (
              <li key={session.id}>
                <div
                  className={cn(
                    "group flex items-center gap-1.5 rounded-[7px] px-2 py-1.5 transition-colors",
                    session.id === activeId
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60",
                  )}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() => onSelect(session.id)}
                    type="button"
                  >
                    <BotIcon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate font-mono text-[12px]">
                      {session.title}
                    </span>
                  </button>

                  <button
                    aria-label={`Delete ${session.title}`}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => onDelete(session.id)}
                    type="button"
                  >
                    <Trash2Icon className="size-3.5 hover:text-destructive" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="border-t border-border px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground/70">
        Chats are stored in this browser only.
      </p>
    </aside>
  );
}
