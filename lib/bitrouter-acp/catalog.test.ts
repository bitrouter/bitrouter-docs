import { describe, expect, it } from "vitest";

import {
  BITROUTER_ACP_AGENTS,
  getBitrouterAcpAgent,
  isBitrouterAcpHarness,
} from "./catalog";
import { getHarness, HARNESSES } from "../harnesses";

describe("BitRouter ACP catalog", () => {
  it("has an entry in the harness registry for every agent", () => {
    // The two lists are maintained separately — the registry drives the picker,
    // this one drives the spawn. A drift here is a harness that renders but
    // cannot start, or starts but never renders.
    for (const agent of BITROUTER_ACP_AGENTS) {
      expect(getHarness(agent.harnessId), agent.harnessId).toBeDefined();
    }
  });

  it("covers every bitrouter-prefixed registry entry", () => {
    const registryIds = HARNESSES.map((h) => h.id).filter((id) =>
      id.startsWith("bitrouter-"),
    );
    const catalogIds = BITROUTER_ACP_AGENTS.map((a) => a.harnessId);
    expect([...registryIds].sort()).toEqual([...catalogIds].sort());
  });

  it("declares every agent as a sandbox-backed session", () => {
    // The ACP bridge runs inside the sandbox and is dialled over an exposed
    // port, and the runtime owns its own history.
    for (const agent of BITROUTER_ACP_AGENTS) {
      const harness = getHarness(agent.harnessId);
      expect(harness?.runtime, agent.harnessId).toBe("sandbox-vm");
      expect(harness?.transport, agent.harnessId).toBe("session");
    }
  });

  it("uses distinct agent ids", () => {
    const ids = BITROUTER_ACP_AGENTS.map((a) => a.agentId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getBitrouterAcpAgent", () => {
  it("resolves a known harness to its BitRouter catalog id", () => {
    expect(getBitrouterAcpAgent("bitrouter-claude-acp")?.agentId).toBe(
      "claude-acp",
    );
  });

  it("returns undefined for harnesses that are not BitRouter-fronted", () => {
    // `claude-code` is the AI SDK's own adapter talking to Anthropic directly —
    // deliberately a different entry from `bitrouter-claude-acp`.
    for (const id of ["pi", "ai-sdk", "claude-code", "nope", ""]) {
      expect(getBitrouterAcpAgent(id), id).toBeUndefined();
      expect(isBitrouterAcpHarness(id), id).toBe(false);
    }
  });
});
