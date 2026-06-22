import "server-only";

import yaml from "js-yaml";
import type {
  Provider,
  ProviderModel,
  ProviderRateLimit,
} from "@/lib/providers-types";

const REGISTRY_OWNER = "bitrouter";
const REGISTRY_REPO = "provider-registry";
const REGISTRY_BRANCH = "main";
const CONTENTS_API = `https://api.github.com/repos/${REGISTRY_OWNER}/${REGISTRY_REPO}/contents/providers?ref=${REGISTRY_BRANCH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}/providers`;
const HTML_BASE = `https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/blob/${REGISTRY_BRANCH}/providers`;

const REVALIDATE_SECONDS = 600;

type GhDirEntry = { name: string; type: "file" | "dir" };

/**
 * Each entry in `api_protocol` and `rate_limits` is a single-key map keyed by
 * a model-id glob (often `"*"`). Flatten the list of single-key maps into one
 * record so callers can iterate without re-implementing that shape.
 */
function flattenScopedList<T>(
  raw: unknown,
): Array<{ scope: string; value: T }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ scope: string; value: T }> = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    for (const [scope, value] of Object.entries(entry as Record<string, T>)) {
      out.push({ scope, value });
    }
  }
  return out;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function parseProvider(slug: string, source: string): Provider | null {
  let doc: unknown;
  try {
    doc = yaml.load(source);
  } catch {
    return null;
  }
  if (!doc || typeof doc !== "object") return null;

  const d = doc as Record<string, unknown>;
  const name = typeof d.name === "string" ? d.name : slug;

  const apiProtocol: Record<string, string> = {};
  for (const { scope, value } of flattenScopedList<string>(d.api_protocol)) {
    if (typeof value === "string") apiProtocol[scope] = value;
  }

  const rateLimits: ProviderRateLimit[] = flattenScopedList<
    Record<string, unknown>
  >(d.rate_limits).map(({ scope, value }) => ({
    scope,
    requestsPerMinute: num(value?.requests_per_minute),
    tokensPerMinute: num(value?.tokens_per_minute),
  }));

  const models: ProviderModel[] = [];
  if (Array.isArray(d.models)) {
    for (const m of d.models) {
      if (!m || typeof m !== "object") continue;
      const mm = m as Record<string, unknown>;
      const id = typeof mm.id === "string" ? mm.id : null;
      if (!id) continue;
      const pricing = (mm.pricing ?? {}) as Record<string, unknown>;
      const input = (pricing.input_tokens ?? {}) as Record<string, unknown>;
      const output = (pricing.output_tokens ?? {}) as Record<string, unknown>;
      models.push({
        id,
        providerModelId:
          typeof mm.provider_model_id === "string" ? mm.provider_model_id : id,
        pricing: {
          inputNoCache: num(input.no_cache) ?? 0,
          inputCacheRead: num(input.cache_read),
          inputCacheWrite: num(input.cache_write),
          outputText: num(output.text) ?? 0,
        },
      });
    }
  }

  return {
    slug,
    name,
    apiProtocol,
    rateLimits,
    models,
    status: typeof d.status === "string" ? d.status : "unknown",
    weight: typeof d.weight === "number" ? d.weight : 0,
    submittedAt:
      typeof d.submitted_at === "string"
        ? d.submitted_at
        : d.submitted_at instanceof Date
          ? d.submitted_at.toISOString().slice(0, 10)
          : null,
    registryUrl: `${HTML_BASE}/${slug}.yaml`,
  };
}

async function listProviderSlugs(): Promise<string[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(CONTENTS_API, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as GhDirEntry[];
  return data
    .filter((e) => e.type === "file" && e.name.endsWith(".yaml"))
    .map((e) => e.name.replace(/\.yaml$/, ""))
    .sort();
}

async function fetchProviderYaml(slug: string): Promise<string | null> {
  const res = await fetch(`${RAW_BASE}/${slug}.yaml`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;
  return await res.text();
}

export async function fetchProviders(): Promise<Provider[]> {
  const slugs = await listProviderSlugs();
  const results = await Promise.all(
    slugs.map(async (slug) => {
      const yamlText = await fetchProviderYaml(slug);
      return yamlText ? parseProvider(slug, yamlText) : null;
    }),
  );
  return results.filter((p): p is Provider => p !== null);
}

export async function fetchProviderBySlug(
  slug: string,
): Promise<Provider | null> {
  const yamlText = await fetchProviderYaml(slug);
  return yamlText ? parseProvider(slug, yamlText) : null;
}
