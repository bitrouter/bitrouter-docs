import { describe, it, expect } from "vitest";
import { LLMS_TXT } from "./llms-txt";

describe("LLMS_TXT", () => {
  it("is the BitRouter index", () => {
    expect(LLMS_TXT.trim().startsWith("# BitRouter")).toBe(true);
    expect(LLMS_TXT.length).toBeGreaterThan(200);
  });

  // An agent asked "what's new" or "is X supported yet" can only answer from
  // the changelog, and it only finds the changelog if this index names it.
  it("routes to the changelog and its Markdown surface", () => {
    expect(LLMS_TXT).toContain("## Changelog");
    expect(LLMS_TXT).toContain("https://bitrouter.ai/changelog.md");
    expect(LLMS_TXT).toContain("https://bitrouter.ai/changelog)");
  });
});
