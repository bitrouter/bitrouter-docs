const TOKENS_PER_PRICING_UNIT = 1_000_000;

export function formatPricePerMillionTokens(pricePerMillionTokens: number): string {
  if (!pricePerMillionTokens) return "—";
  return `$${pricePerMillionTokens.toFixed(2)} / 1M tokens`;
}

export function formatCompactPricePerMillionTokens(pricePerMillionTokens: number): string {
  if (!pricePerMillionTokens) return "—";
  return `$${pricePerMillionTokens.toFixed(2)}`;
}

export function estimateTokenCost(tokens: number, pricePerMillionTokens: number): number {
  return (tokens / TOKENS_PER_PRICING_UNIT) * pricePerMillionTokens;
}

export function formatUsdCost(cost: number): string {
  if (cost > 0 && cost < 0.01) return "<$0.01";
  return `$${cost.toFixed(4)}`;
}
