import { describe, expect, it } from "vitest";

import type { ChatUIMessage } from "./chat-models";
import { DEFAULT_HARNESS } from "./harnesses";
import {
  createSession,
  deriveTitle,
  MAX_SESSIONS,
  parseStore,
  pruneEmptySessions,
  removeSession,
  serializeStore,
  sortSessions,
  upsertSession,
  type ChatSession,
} from "./chat-sessions";

function userMessage(text: string): ChatUIMessage {
  return { id: "u1", role: "user", parts: [{ type: "text", text }] };
}

function session(id: string, updatedAt: number): ChatSession {
  return {
    ...createSession({ id, model: "deepseek/deepseek-v4-flash", now: 0 }),
    updatedAt,
  };
}

describe("deriveTitle", () => {
  it("uses the first user message", () => {
    expect(deriveTitle([userMessage("How does fallback routing work?")])).toBe(
      "How does fallback routing work?",
    );
  });

  it("truncates long prompts", () => {
    const title = deriveTitle([userMessage("a".repeat(200))]);
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(49);
  });

  it("collapses whitespace", () => {
    expect(deriveTitle([userMessage("  hello\n\n  world  ")])).toBe(
      "hello world",
    );
  });

  it("falls back when there is no user text", () => {
    expect(deriveTitle([])).toBe("New chat");
    expect(deriveTitle([userMessage("   ")])).toBe("New chat");
    expect(
      deriveTitle([{ id: "a1", role: "assistant", parts: [] }]),
    ).toBe("New chat");
  });
});

describe("upsertSession", () => {
  it("adds a new session and keeps newest first", () => {
    const result = upsertSession([session("a", 1)], session("b", 2));
    expect(result.map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("replaces an existing session rather than duplicating it", () => {
    const existing = session("a", 1);
    const updated = { ...existing, title: "renamed", updatedAt: 5 };
    const result = upsertSession([existing, session("b", 2)], updated);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
    expect(result[0].title).toBe("renamed");
  });

  it("caps stored sessions", () => {
    const many = Array.from({ length: MAX_SESSIONS + 10 }, (_, i) =>
      session(`s${i}`, i),
    );
    expect(upsertSession(many, session("new", 9999))).toHaveLength(
      MAX_SESSIONS,
    );
  });
});

describe("removeSession", () => {
  it("drops only the named session", () => {
    const result = removeSession([session("a", 1), session("b", 2)], "a");
    expect(result.map((s) => s.id)).toEqual(["b"]);
  });
});

describe("pruneEmptySessions", () => {
  function withMessages(id: string): ChatSession {
    return { ...session(id, 1), messages: [userMessage("hi")] };
  }

  it("drops sessions that never received a message", () => {
    const result = pruneEmptySessions([
      withMessages("used"),
      session("empty", 2),
    ]);
    expect(result.map((s) => s.id)).toEqual(["used"]);
  });

  it("keeps the session being reused", () => {
    const result = pruneEmptySessions(
      [withMessages("used"), session("draft", 2), session("stale", 3)],
      "draft",
    );
    expect(result.map((s) => s.id).sort()).toEqual(["draft", "used"]);
  });
});

describe("sortSessions", () => {
  it("does not mutate its input", () => {
    const input = [session("a", 1), session("b", 2)];
    sortSessions(input);
    expect(input.map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("parseStore", () => {
  it("round-trips through serializeStore", () => {
    const sessions = [session("a", 2), session("b", 1)];
    expect(parseStore(serializeStore(sessions)).sessions.map((s) => s.id)).toEqual(
      ["a", "b"],
    );
  });

  it("degrades to empty rather than throwing on bad input", () => {
    // A corrupt or foreign localStorage value must not break the page.
    expect(parseStore(null).sessions).toEqual([]);
    expect(parseStore("not json").sessions).toEqual([]);
    expect(parseStore('{"sessions":"nope"}').sessions).toEqual([]);
    expect(parseStore("[]").sessions).toEqual([]);
  });

  it("filters out entries that are not sessions", () => {
    const raw = JSON.stringify({
      version: 1,
      sessions: [session("good", 1), { id: 42 }, null, { id: "x" }],
    });
    expect(parseStore(raw).sessions.map((s) => s.id)).toEqual(["good"]);
  });

  it("keeps sessions stored before the harness picker existed", () => {
    // Dropping a transcript over a field that did not exist when it was
    // written would be a worse trade than reopening it on the default.
    const { harness: _omitted, ...legacy } = session("legacy", 1);
    const raw = JSON.stringify({ version: 1, sessions: [legacy] });

    const [restored] = parseStore(raw).sessions;
    expect(restored.id).toBe("legacy");
    expect(restored.harness).toBe(DEFAULT_HARNESS);
  });

  it("repairs a harness id that is no longer known", () => {
    const raw = JSON.stringify({
      version: 1,
      sessions: [{ ...session("stale", 1), harness: "retired-runtime" }],
    });
    expect(parseStore(raw).sessions[0].harness).toBe(DEFAULT_HARNESS);
  });
});
