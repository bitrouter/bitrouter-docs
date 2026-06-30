import { describe, it, expect } from "vitest";
import { chooseSpecSource } from "./spec-source.mjs";

describe("chooseSpecSource", () => {
  it("prefers OPENAPI_SPEC_URL when set", () => {
    expect(chooseSpecSource({ OPENAPI_SPEC_URL: "https://api.bitrouter.ai/openapi.yaml" })).toEqual(
      { kind: "url", value: "https://api.bitrouter.ai/openapi.yaml" },
    );
  });
  it("falls back to the committed file", () => {
    expect(chooseSpecSource({})).toEqual({ kind: "file", value: "./openapi.yaml" });
  });
});
