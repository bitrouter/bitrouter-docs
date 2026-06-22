"use client";

import { useEffect, useState } from "react";
import { type Model } from "@/lib/models-types";

export type { Model } from "@/lib/models-types";

let cache: Model[] | null = null;
let inflight: Promise<Model[]> | null = null;

/**
 * Seed the client-side module cache with server-rendered data so
 * `useModels()` returns immediately on first render and never has to
 * round-trip to /api/bitrouter/models on initial paint.
 */
export function primeModelsCache(list: Model[]) {
  if (!cache && list.length > 0) cache = list;
}

function loadModels(): Promise<Model[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  // Client-side fetch would go to our own API route if we had one
  // For now, just return the cached data or empty array
  inflight = Promise.resolve(cache ?? []);
  return inflight;
}

export function useModels() {
  const [models, setModels] = useState<Model[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) {
      // Cache may have been primed after first render (e.g. by a sibling).
      if (models !== cache) setModels(cache);
      if (isLoading) setIsLoading(false);
      return;
    }

    let cancelled = false;
    loadModels()
      .then((list) => {
        if (cancelled) return;
        setModels(list);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { models, isLoading, error };
}
