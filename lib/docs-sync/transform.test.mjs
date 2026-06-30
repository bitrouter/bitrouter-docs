// lib/docs-sync/transform.test.mjs
import { describe, it, expect } from "vitest";
import { __ready } from "./transform.mjs";

describe("docs-sync transform module", () => {
  it("loads", () => {
    expect(__ready).toBe(true);
  });
});
