export interface Model {
  id: string;
  name: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  modalities: string[];
  /** USD per 1M tokens, from console API. */
  pricing: { input: number; output: number; cacheRead?: number; cacheWrite?: number };
  /** Benchmark scores from Artificial Analysis */
  benchmarks?: {
    /** Overall intelligence index (0-100) */
    intelligenceIndex?: number;
    /** Coding performance index (0-100) */
    codingIndex?: number;
    /** Mathematical reasoning index (0-100) */
    mathIndex?: number;
    /** Multi-domain knowledge score (0-1) */
    mmluPro?: number;
    /** Graduate-level Q&A (0-1) */
    gpqa?: number;
    /** Speed: Output tokens per second */
    outputTokensPerSecond?: number;
    /** Latency: Time to first token in seconds */
    timeToFirstToken?: number;
  };
}
