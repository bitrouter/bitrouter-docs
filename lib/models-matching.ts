/**
 * Model matching configuration for BitRouter -> Artificial Analysis mapping
 */

interface AAModel {
  slug: string;
  name: string;
  evaluations: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_math_index?: number;
    mmlu_pro?: number;
    gpqa?: number;
  };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
}

/**
 * Direct mappings for models that don't follow standard patterns
 */
const DIRECT_MAPPINGS: Record<string, string> = {
  // Claude models
  "claude-haiku-4-5": "claude-4-5-haiku",  // Fixed: BitRouter uses different order
  "claude-opus-4-6": "claude-opus-4-6",
  "claude-opus-4-7": "claude-opus-4-7",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  
  // DeepSeek models
  "deepseek-v3.2": "deepseek-v3-2-reasoning",
  "deepseek-v4-flash": "deepseek-v4-flash-non-reasoning",
  "deepseek-v4-pro": "deepseek-v4-pro-high",
  
  // Gemini models
  "gemini-3.1-flash-lite-preview": "gemini-3-1-flash-lite-preview",
  "gemini-3.1-pro-preview": "gemini-3-1-pro-preview",
  
  // Gemma models
  "gemma4-31b": "gemma-4-31b",
  
  // GLM models
  "glm-5": "glm-5-1",
  "glm-5.1": "glm-5-1",
  
  // GPT models
  "gpt-5.4": "gpt-5-4-medium",
  "gpt-5.4-mini": "gpt-5-4-mini",
  "gpt-5.5": "gpt-5-5-medium",
  "gpt-oss-120b": "gpt-oss-120b",
  
  // Grok models
  "grok-4-fast": "grok-4-fast-reasoning",
  "grok-4.1-fast": "grok-4-1-fast-reasoning",
  "grok-4.20": "grok-4-20-non-reasoning",
  
  // Kimi models
  "kimi-k2.5": "kimi-k2-5-non-reasoning",
  "kimi-k2.6": "kimi-k2-6",
  
  // MiMo models
  "mimo-v2-flash": "mimo-v2-flash",
  "mimo-v2.5": "mimo-v2-5-0424",
  "mimo-v2.5-pro": "mimo-v2-5-pro",
  
  // MiniMax models
  "minimax-m2.5": "minimax-m2-5",
  
  // Qwen models
  "qwen3.5-397b-a17b": "qwen3-5-397b-a17b-non-reasoning",
  "qwen3.5-plus": "qwen3-5-omni-plus",  // Fixed: AA uses "omni" in the name
  "qwen3.6-27b": "qwen3-6-27b",
  "qwen3.6-35b-a3b": "qwen3-6-35b-a3b-non-reasoning",
  "qwen3.6-plus": "qwen3-6-plus",
};

/**
 * Find matching AA model for a BitRouter model ID
 */
export function findAAModel(bitrouterId: string, aaModels: AAModel[]): AAModel | null {
  // First check direct mappings
  const directMapping = DIRECT_MAPPINGS[bitrouterId];
  if (directMapping) {
    const model = aaModels.find(m => m.slug === directMapping);
    if (model) return model;
  }
  
  // Try exact slug match
  const exactMatch = aaModels.find(m => m.slug === bitrouterId);
  if (exactMatch) return exactMatch;
  
  // Try various transformations
  const variations = [
    bitrouterId.replace('-', ''),  // Remove hyphens
    bitrouterId.replace('.', '-'),  // Dots to hyphens
    bitrouterId.replace('-', '.'),  // Hyphens to dots
  ];
  
  for (const variant of variations) {
    const match = aaModels.find(m => 
      m.slug === variant || 
      m.slug.replace('-', '') === variant
    );
    if (match) return match;
  }
  
  // For GPT models, try with quality suffixes
  if (bitrouterId.startsWith('gpt-')) {
    const base = bitrouterId.replace('.', '-');
    for (const suffix of ['-high', '-medium', '-low', '-xhigh']) {
      const match = aaModels.find(m => m.slug === base + suffix);
      if (match) return match;
    }
  }
  
  return null;
}

/**
 * Map AA benchmark data to our Model benchmark structure
 */
export function mapAABenchmarks(aaModel: AAModel) {
  const evals = aaModel.evaluations || {};
  
  return {
    intelligenceIndex: evals.artificial_analysis_intelligence_index,
    codingIndex: evals.artificial_analysis_coding_index,
    mathIndex: evals.artificial_analysis_math_index,
    mmluPro: evals.mmlu_pro,
    gpqa: evals.gpqa,
    outputTokensPerSecond: aaModel.median_output_tokens_per_second,
    timeToFirstToken: aaModel.median_time_to_first_token_seconds,
  };
}