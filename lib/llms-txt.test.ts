import { describe, it, expect } from "vitest";
import { LLMS_TXT } from "./llms-txt";

describe("LLMS_TXT", () => {
  it("is the BitRouter index", () => {
    expect(LLMS_TXT.trim().startsWith("# BitRouter")).toBe(true);
    expect(LLMS_TXT.length).toBeGreaterThan(200);
  });
});
