import "server-only";

import { type Model } from "@/lib/models-types";
import { findAAModel, mapAABenchmarks } from "@/lib/models-matching";

const UPSTREAM_URL = "https://api.bitrouter.ai/v1/models";
const AA_API_URL = "https://artificialanalysis.ai/api/v2/data/llms/models";

interface ApiModelResponse {
  id: string;
  name?: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  input_modalities?: string[];
  output_modalities?: string[];
  pricing?: {
    input_tokens?: {
      no_cache?: number;
      cache_read?: number;
      cache_write?: number;
    };
    output_tokens?: { text?: number };
  };
  providers?: {
    total_online?: number;
  };
}

/**
 * Fetch AA benchmark data with caching
 */
async function fetchAABenchmarks() {
  const apiKey = process.env.AA_API_KEY;
  if (!apiKey) {
    console.warn("AA_API_KEY not configured, benchmarks will be unavailable");
    return [];
  }
  
  try {
    const res = await fetch(AA_API_URL, {
      headers: { "x-api-key": apiKey },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      console.error("Failed to fetch AA benchmarks:", res.status);
      return [];
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching AA benchmarks:", error);
    return [];
  }
}

/**
 * Fetch the model catalog from the production API.
 * The API now includes context tokens, modalities, and pricing data.
 * Also enriches with benchmark data from Artificial Analysis.
 */
export async function fetchModels(): Promise<Model[]> {
  try {
    // Fetch both BitRouter models and AA benchmarks in parallel
    const [brRes, aaBenchmarks] = await Promise.all([
      fetch(UPSTREAM_URL, { next: { revalidate: 300 } }),
      fetchAABenchmarks(),
    ]);
    
    if (!brRes.ok) return [];
    
    const data = (await brRes.json()) as { data?: ApiModelResponse[] };
    const models: Model[] = (data.data ?? []).map(m => {
      const baseModel: Model = {
        id: m.id,
        name: m.name ?? m.id,
        maxInputTokens: m.max_input_tokens ?? 0,
        maxOutputTokens: m.max_output_tokens ?? 0,
        modalities: m.input_modalities ?? ["text"],
        pricing: {
          input: m.pricing?.input_tokens?.no_cache ?? 0,
          output: m.pricing?.output_tokens?.text ?? 0,
          ...(m.pricing?.input_tokens?.cache_read !== undefined && { cacheRead: m.pricing.input_tokens.cache_read }),
          ...(m.pricing?.input_tokens?.cache_write !== undefined && { cacheWrite: m.pricing.input_tokens.cache_write }),
        },
      };
      
      // Try to find matching AA benchmark data
      if (aaBenchmarks.length > 0) {
        const aaModel = findAAModel(m.id, aaBenchmarks);
        if (aaModel) {
          baseModel.benchmarks = mapAABenchmarks(aaModel);
        }
      }
      
      return baseModel;
    });
    
    return models;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export async function fetchModelById(id: string): Promise<Model | null> {
  const list = await fetchModels();
  return list.find((m) => m.id === id) ?? null;
}
