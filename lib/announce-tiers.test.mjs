import { describe, it, expect } from "vitest";
import { channelsFor } from "./announce-tiers.mjs";
import { resolveSignificance } from "./changelog-entry.mjs";

describe("channelsFor", () => {
  it("keeps routine releases to Discord", () => {
    expect(channelsFor("routine")).toEqual(["discord"]);
  });

  it("escalates notable to X, and only a highlight to email", () => {
    expect(channelsFor("notable")).toEqual(["discord", "x"]);
    expect(channelsFor("highlight")).toEqual(["discord", "x", "email"]);
  });

  it("falls back to the quietest tier for an unknown value", () => {
    expect(channelsFor(undefined)).toEqual(["discord"]);
    expect(channelsFor("shout-from-the-rooftops")).toEqual(["discord"]);
  });
});

describe("channels follow the entry's resolved significance", () => {
  it("keeps an alpha bump off X and email", () => {
    const fm = { version: "v1.0.0-alpha.27" };
    expect(channelsFor(resolveSignificance(fm))).toEqual(["discord"]);
  });

  it("puts a beta opening on X", () => {
    const fm = { version: "v1.0.0-beta.1" };
    expect(channelsFor(resolveSignificance(fm))).toEqual(["discord", "x"]);
  });

  it("emails only for a major release", () => {
    const fm = { version: "v1.0.0" };
    expect(channelsFor(resolveSignificance(fm))).toEqual(["discord", "x", "email"]);
  });

  it("honours a hand-promoted alpha — the reason the field exists", () => {
    const fm = { version: "v1.0.0-alpha.12", significance: "notable" };
    expect(channelsFor(resolveSignificance(fm))).toEqual(["discord", "x"]);
  });
});
