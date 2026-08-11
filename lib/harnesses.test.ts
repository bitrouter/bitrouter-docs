import { describe, expect, it } from "vitest";

import {
  DEFAULT_HARNESS,
  getHarness,
  HARNESSES,
  isHarnessId,
  resetsHistory,
} from "./harnesses";

describe("registry", () => {
  it("has unique ids", () => {
    const ids = HARNESSES.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defaults to a harness that needs no sandbox and no flag", () => {
    const fallback = getHarness(DEFAULT_HARNESS);
    expect(fallback?.runtime).toBe("in-process");
    expect(fallback?.transport).toBe("stateless");
  });

  it("marks every sandbox-vm harness as session-backed", () => {
    // A bridge-backed runtime always owns its own history; a stateless one
    // would have no reason to pay for a VM.
    for (const harness of HARNESSES.filter((h) => h.runtime === "sandbox-vm")) {
      expect(harness.transport).toBe("session");
    }
  });
});

describe("isHarnessId", () => {
  it("accepts known ids", () => {
    expect(isHarnessId("pi")).toBe(true);
    expect(isHarnessId("ai-sdk")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of ["", "PI", "gpt", null, undefined, 7, {}]) {
      expect(isHarnessId(value)).toBe(false);
    }
  });
});

describe("resetsHistory", () => {
  it("resets whenever the harness changes", () => {
    expect(
      resetsHistory({
        fromHarness: "ai-sdk",
        toHarness: "pi",
        modelChanged: false,
      }),
    ).toBe(true);
  });

  it("resets when a session-backed harness changes model", () => {
    // Pi binds its model when the session is built, so the runtime would come
    // back with an empty history while the transcript still shows the old turns.
    expect(
      resetsHistory({ fromHarness: "pi", toHarness: "pi", modelChanged: true }),
    ).toBe(true);
  });

  it("keeps history when the stateless loop changes model", () => {
    // The whole transcript is replayed every turn, so nothing is lost.
    expect(
      resetsHistory({
        fromHarness: "ai-sdk",
        toHarness: "ai-sdk",
        modelChanged: true,
      }),
    ).toBe(false);
  });

  it("keeps history when nothing changed", () => {
    expect(
      resetsHistory({ fromHarness: "pi", toHarness: "pi", modelChanged: false }),
    ).toBe(false);
  });
});
