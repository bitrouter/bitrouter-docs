import { describe, it, expect } from "vitest";
import {
  parseVersion,
  compareVersionsAsc,
  compareVersionsDesc,
  releaseLineOf,
  significanceFor,
} from "./release-version.mjs";

describe("parseVersion", () => {
  it("parses a final release", () => {
    expect(parseVersion("v0.33.0")).toEqual({
      major: 0,
      minor: 33,
      patch: 0,
      pre: [],
    });
  });

  it("splits the prerelease chain, keeping numeric parts numeric", () => {
    expect(parseVersion("v1.0.0-alpha.18")).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      pre: ["alpha", 18],
    });
  });

  it("tolerates a missing v prefix and build metadata", () => {
    expect(parseVersion("1.2.3+build.5")?.patch).toBe(3);
  });

  it("returns null for a non-version", () => {
    expect(parseVersion("nightly")).toBeNull();
    expect(parseVersion(undefined)).toBeNull();
  });
});

describe("compareVersionsAsc", () => {
  const sorted = (versions) => [...versions].sort(compareVersionsAsc);

  it("orders numeric prerelease segments numerically, not lexically", () => {
    // The bug this exists to prevent: "alpha.9" > "alpha.18" as strings.
    expect(
      sorted(["v1.0.0-alpha.18", "v1.0.0-alpha.9", "v1.0.0-alpha.10"]),
    ).toEqual(["v1.0.0-alpha.9", "v1.0.0-alpha.10", "v1.0.0-alpha.18"]);
  });

  it("ranks a final release above its own prereleases", () => {
    expect(compareVersionsAsc("v1.0.0", "v1.0.0-alpha.27")).toBeGreaterThan(0);
  });

  it("compares major, then minor, then patch", () => {
    expect(sorted(["v0.4.0", "v0.33.0", "v0.31.2", "v1.0.0-alpha.2"])).toEqual([
      "v0.4.0",
      "v0.31.2",
      "v0.33.0",
      "v1.0.0-alpha.2",
    ]);
  });

  it("sorts unparseable versions below real ones, without throwing", () => {
    expect(sorted(["v0.1.0", "nightly"])).toEqual(["nightly", "v0.1.0"]);
    // Compared directly, not via sort(): Array#sort hoists literal undefined
    // elements to the end without consulting the comparator at all. The feed
    // sorts objects, so an absent `version` does reach us here.
    expect(compareVersionsAsc(undefined, "v0.1.0")).toBeLessThan(0);
    expect(compareVersionsAsc("v0.1.0", undefined)).toBeGreaterThan(0);
    expect(compareVersionsAsc(undefined, undefined)).toBe(0);
  });

  it("is the exact inverse of compareVersionsDesc", () => {
    expect(compareVersionsDesc("v1.0.0", "v0.9.0")).toBe(
      -compareVersionsAsc("v1.0.0", "v0.9.0"),
    );
  });
});

describe("releaseLineOf", () => {
  it("groups a prerelease train by target + identifier", () => {
    expect(releaseLineOf("v1.0.0-alpha.18")).toBe("v1.0.0-alpha");
    expect(releaseLineOf("v1.0.0-alpha.2")).toBe("v1.0.0-alpha");
  });

  it("keeps alpha and rc of the same target in separate lines", () => {
    expect(releaseLineOf("v1.0.0-rc.1")).not.toBe(releaseLineOf("v1.0.0-alpha.1"));
  });

  it("groups final releases by major", () => {
    expect(releaseLineOf("v0.31.2")).toBe("v0.x");
    expect(releaseLineOf("v0.33.0")).toBe("v0.x");
  });

  it("returns an empty line for an unparseable version", () => {
    expect(releaseLineOf("nightly")).toBe("");
  });
});

describe("significanceFor", () => {
  it("treats prerelease bumps and patches as routine", () => {
    expect(significanceFor("v1.0.0-alpha.18")).toBe("routine");
    expect(significanceFor("v0.31.2")).toBe("routine");
  });

  it("treats the opening of a prerelease phase as notable", () => {
    // "we're in beta now" is the story; the seventh beta bump is not.
    expect(significanceFor("v1.0.0-beta.1")).toBe("notable");
    expect(significanceFor("v1.0.0-rc.1")).toBe("notable");
    expect(significanceFor("v1.0.0-beta")).toBe("notable");
    expect(significanceFor("v1.0.0-beta.2")).toBe("routine");
  });

  it("treats a feature release as notable", () => {
    expect(significanceFor("v0.33.0")).toBe("notable");
  });

  it("treats a major line opening as a highlight", () => {
    expect(significanceFor("v1.0.0")).toBe("highlight");
    expect(significanceFor("v2.0.0")).toBe("highlight");
  });

  it("falls back to routine when there is no parseable version", () => {
    expect(significanceFor(undefined)).toBe("routine");
  });
});
