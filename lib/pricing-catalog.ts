import type { ModelRow } from "./models-catalog";

export type PriceModel = {
  id: string;
  name: string;
  provider: string;
  input: number | null;
  output: number | null;
  cacheRead: number | null;
  cacheWrite: number | null;
  context: number | null;
  modalities: string[];
  openWeights: boolean | null;
};

const PROVIDERS: Record<string, string> = {
  openai: "OpenAI", anthropic: "Anthropic", google: "Google", qwen: "Qwen",
  deepseek: "DeepSeek", minimax: "MiniMax", moonshotai: "Moonshot", "z-ai": "Z.ai",
  xiaomi: "Xiaomi", stepfun: "Stepfun", "x-ai": "xAI", meta: "Meta", mistralai: "Mistral",
};

function rate(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

/** Keep the entire registry, including models whose prices are not listed. */
export function toPriceModels(models: ModelRow[]): PriceModel[] {
  return models.map(model => {
    const prefix = model.id.split("/")[0];
    return {
      id: model.id,
      name: model.name === model.id ? model.id.split("/").slice(1).join("/") || model.id : model.name.replace(/^[^:]+:\s*/, ""),
      provider: PROVIDERS[prefix] ?? prefix,
      input: rate(model.inputUsdPerM), output: rate(model.outputUsdPerM),
      cacheRead: rate(model.cacheReadUsdPerM), cacheWrite: rate(model.cacheWriteUsdPerM),
      context: model.maxInputTokens, modalities: model.inputModalities, openWeights: model.openWeights,
    };
  });
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 6 });

export function formatCatalogPrice(value: number | null): string {
  return value === null ? "—" : currency.format(value);
}

export function sortPriceModels(models: PriceModel[], sort: "name" | "input" | "output"): PriceModel[] {
  return [...models].sort((a, b) => {
    if (sort !== "name") {
      const left = a[sort];
      const right = b[sort];
      if (left === null && right !== null) return 1;
      if (right === null && left !== null) return -1;
      if (left !== null && right !== null && left !== right) return left - right;
    }
    return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  });
}
