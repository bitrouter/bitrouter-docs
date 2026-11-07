import type { Model } from "@/lib/models-types";

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
