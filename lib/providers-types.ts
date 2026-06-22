export interface ProviderModelPricing {
  inputNoCache: number;
  inputCacheRead: number | null;
  inputCacheWrite: number | null;
  outputText: number;
}

export interface ProviderModel {
  /** Canonical bitrouter ID, e.g. "kimi-k2.6". */
  id: string;
  /** Upstream provider's model slug, e.g. "moonshotai/Kimi-K2.6". */
  providerModelId: string;
  pricing: ProviderModelPricing;
}

export interface ProviderRateLimit {
  scope: string;
  requestsPerMinute: number | null;
  tokensPerMinute: number | null;
}

export interface Provider {
  /** Slug used in the registry filename and on /providers/[slug]. */
  slug: string;
  /** Display name from the YAML's `name:` field. */
  name: string;
  /** Map of model-id glob → wire protocol (openai / anthropic / google). */
  apiProtocol: Record<string, string>;
  rateLimits: ProviderRateLimit[];
  models: ProviderModel[];
  /** "active" / "deprecated" / etc. — provider self-declared. */
  status: string;
  /** Higher weight = preferred when multiple providers can serve a model. */
  weight: number;
  /** ISO date the YAML lists, if present. */
  submittedAt: string | null;
  /** URL to the YAML source on GitHub. */
  registryUrl: string;
}
