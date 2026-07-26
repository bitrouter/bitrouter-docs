import { describe, it, expect } from "vitest";
import {
  formatDeltas,
  headlineDelta,
  formatRequirement,
  formatMetric,
} from "./recipes-format";
import type { Recipe } from "./recipes-types";

const recipe = (over: Partial<Recipe>): Recipe => ({
  slug: "x",
  title: "x",
  description: "",
  workflow: "coding",
  harness: [],
  objectives: ["cost"],
  updatedAt: "2026-07-25",
  providers: [],
  models: [],
  env: [],
  config: "server: {}",
  body: "",
  sourceUrl: "https://example.com",
  ...over,
});

describe("formatDeltas", () => {
  it("reads a cost drop as good and an accuracy drop as bad", () => {
    const out = formatDeltas({ costPerTaskPct: -32.8, accuracyPoints: -1.1 });
    expect(out).toEqual([
      { metric: "cost/task", value: "−32.8%", tone: "good" },
      { metric: "accuracy", value: "−1.1 pts", tone: "bad" },
    ]);
  });

  it("omits metrics that were not measured", () => {
    expect(formatDeltas({ timePerTaskPct: 4.25 })).toEqual([
      { metric: "time/task", value: "+4.3%", tone: "bad" },
    ]);
  });
});

describe("headlineDelta", () => {
  const delta = { costPerTaskPct: -32.8, accuracyPoints: -1.1 };
  const withEvaluation = (objectives: string[]) =>
    recipe({
      objectives,
      evaluation: {
        name: "terminal-bench-2.1",
        harness: "codex",
        measuredBy: "bitrouter",
        asOf: "2026-07-14",
        runs: 1,
        baseline: {},
        recipe: {},
        delta,
      },
    });

  it("leads with the objective the recipe claims to optimize", () => {
    expect(headlineDelta(withEvaluation(["cost"]))?.metric).toBe("cost/task");
    expect(headlineDelta(withEvaluation(["accuracy"]))?.metric).toBe("accuracy");
  });

  it("falls back to the first measured metric when the objective was not measured", () => {
    expect(headlineDelta(withEvaluation(["latency"]))?.metric).toBe("cost/task");
  });

  it("is null without an evaluation", () => {
    expect(headlineDelta(recipe({}))).toBeNull();
  });
});

describe("formatRequirement", () => {
  it("renders both sign-in flavours as one user-facing word", () => {
    expect(formatRequirement("local_oauth")).toBe("sign-in");
    expect(formatRequirement("local_pkce")).toBe("sign-in");
    expect(formatRequirement("api_key")).toBe("API key");
  });
});

describe("formatMetric", () => {
  it("renders each metric in its own unit, and a gap as an em dash", () => {
    expect(formatMetric("accuracy", 77.27)).toBe("77.3%");
    expect(formatMetric("costPerTask", 3.758)).toBe("$3.76");
    expect(formatMetric("timePerTask", 4.25)).toBe("4.3 min");
    expect(formatMetric("costPerTask", undefined)).toBe("—");
  });
});
