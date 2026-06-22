import type { Model } from "@/lib/models-data";

const OPEN_SOURCE_PROVIDERS = new Set([
  "deepseek", "meta", "mistral", "qwen", "zhipu", "moonshot", "moonshotai",
  "minimax", "stepfun", "zai", "z-ai", "xiaomi",
]);

export function isOpenSourceModel(model: Model): boolean {
  return OPEN_SOURCE_PROVIDERS.has(providerFromId(model.id));
}

export function providerFromId(id: string): string {
  const lower = id.toLowerCase();

  if (lower.startsWith('claude-')) return 'anthropic';
  if (lower.startsWith('gpt-') || lower.startsWith('o1-') || lower.startsWith('chatgpt-')) return 'openai';
  if (lower.startsWith('deepseek-')) return 'deepseek';
  if (lower.startsWith('gemini-') || lower.startsWith('gemma-')) return 'google';
  if (lower.startsWith('llama-')) return 'meta';
  if (lower.startsWith('mistral-') || lower.startsWith('mixtral-')) return 'mistral';
  if (lower.startsWith('qwen')) return 'qwen';
  if (lower.startsWith('yi-')) return 'zai';
  if (lower.startsWith('grok-')) return 'xai';
  if (lower.startsWith('moonshot-')) return 'moonshot';
  if (lower.startsWith('minimax-')) return 'minimax';
  if (lower.startsWith('stepfun-')) return 'stepfun';
  if (lower.startsWith('baichuan-')) return 'baidu';
  if (lower.startsWith('doubao-')) return 'bytedance';
  if (lower.startsWith('glm-')) return 'zhipu';
  if (lower.startsWith('kimi-')) return 'moonshot';

  const slash = id.indexOf("/");
  if (slash > 0) {
    return id.slice(0, slash).toLowerCase();
  }

  return 'other';
}

export function modelDisplayName(model: Model): string {
  const slash = model.id.indexOf("/");
  return slash >= 0 ? model.id.slice(slash + 1) : model.name;
}

export interface Bucket {
  key: string;
  label: string;
  test: (value: number) => boolean;
}

export const CONTEXT_BUCKETS: Bucket[] = [
  { key: "s", label: "≤ 32K", test: (n) => n > 0 && n <= 32_000 },
  { key: "m", label: "32K – 128K", test: (n) => n > 32_000 && n <= 128_000 },
  { key: "l", label: "128K – 200K", test: (n) => n > 128_000 && n <= 200_000 },
  { key: "xl", label: "200K +", test: (n) => n > 200_000 },
];

export const PRICE_BUCKETS: Bucket[] = [
  { key: "free", label: "Free / < $1", test: (p) => p < 1 },
  { key: "low", label: "$1 – $5", test: (p) => p >= 1 && p < 5 },
  { key: "mid", label: "$5 – $15", test: (p) => p >= 5 && p < 15 },
  { key: "high", label: "$15 +", test: (p) => p >= 15 },
];

function matchesBucketSet(buckets: Bucket[], selected: Set<string>, value: number): boolean {
  if (selected.size === 0) return true;
  return buckets.some((b) => selected.has(b.key) && b.test(value));
}

export interface ModelFilters {
  providers: Set<string>;
  imageInput: Set<string>;
  contextBuckets: Set<string>;
  priceBuckets: Set<string>;
  cacheSupport: Set<string>;
}

export function modelMatchesFilters(model: Model, filters: ModelFilters): boolean {
  if (filters.providers.size > 0) {
    const provider = providerFromId(model.id);
    if (!filters.providers.has(provider)) return false;
  }
  if (filters.imageInput.size > 0) {
    if (!model.modalities.includes("image")) return false;
  }
  if (!matchesBucketSet(CONTEXT_BUCKETS, filters.contextBuckets, model.maxInputTokens)) {
    return false;
  }
  if (!matchesBucketSet(PRICE_BUCKETS, filters.priceBuckets, model.pricing.input)) {
    return false;
  }
  if (filters.cacheSupport.size > 0) {
    if (model.pricing.cacheRead === undefined) return false;
  }
  return true;
}
