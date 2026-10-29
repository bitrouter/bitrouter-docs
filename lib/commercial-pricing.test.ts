import { describe, expect, it } from "vitest";
import { cloudPlatformFee } from "./commercial-pricing";

describe("Cloud early access platform pricing", () => {
  it("charges $1 for the published 80M input + 20M output example", () => {
    expect(cloudPlatformFee(80_000_000, 20_000_000)).toBe(1);
  });

  it("counts input and output at the same rate and charges zero for zero usage", () => {
    expect(cloudPlatformFee(1_000_000, 0)).toBe(0.01);
    expect(cloudPlatformFee(0, 1_000_000)).toBe(0.01);
    expect(cloudPlatformFee(0, 0)).toBe(0);
    expect(cloudPlatformFee(3_000, 1_000)).toBeCloseTo(0.00004, 10);
  });
});
