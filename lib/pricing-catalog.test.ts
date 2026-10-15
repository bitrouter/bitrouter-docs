import { describe, expect, it } from "vitest";
import type { ModelRow } from "./models-catalog";
import { formatCatalogPrice, sortPriceModels, toPriceModels } from "./pricing-catalog";

const base: ModelRow = {
  id: "openai/example", name: "OpenAI: Example", providers: 1, maxInputTokens: 128000,
  inputUsdPerM: 1, outputUsdPerM: 3, inputModalities: ["text"], openWeights: null,
};

describe("pricing catalog", () => {
  it("keeps models without prices and preserves genuine zero rates", () => {
    const rows = toPriceModels([{ ...base, inputUsdPerM: null, outputUsdPerM: null },
      { ...base, id: "openai/free", inputUsdPerM: 0, cacheReadUsdPerM: 0, cacheWriteUsdPerM: 0 }]);
    expect(rows).toHaveLength(2);
    expect(rows[0].input).toBeNull();
    expect(rows[1]).toMatchObject({ input: 0, cacheRead: 0, cacheWrite: 0 });
    expect(formatCatalogPrice(rows[0].input)).toBe("—");
    expect(formatCatalogPrice(rows[1].input)).toBe("$0.00");
  });
  it("does not display invalid rates or round small prices to zero", () => {
    const [row] = toPriceModels([{ ...base, inputUsdPerM: NaN, outputUsdPerM: -1 }]);
    expect(row).toMatchObject({ input: null, output: null });
    expect(formatCatalogPrice(0.00015)).toBe("$0.00015");
  });
  it("sorts unknown prices after priced models without mutating the catalog", () => {
    const rows = toPriceModels([{ ...base, id: "openai/missing", inputUsdPerM: null },
      { ...base, id: "openai/paid" }, { ...base, id: "openai/free", inputUsdPerM: 0 }]);
    expect(sortPriceModels(rows, "input").map(row => row.id)).toEqual(["openai/free", "openai/paid", "openai/missing"]);
    expect(rows[0].id).toBe("openai/missing");
  });
});
