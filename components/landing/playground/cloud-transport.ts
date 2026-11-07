export type PlaygroundMode = "fixture" | "cloud";
export type PlaygroundProfile = "latency" | "cost";

export type PlaygroundReceipt = {
  state: string;
  model?: string | null;
  provider?: string | null;
  chargeMicroUsd?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
};

export async function pollCloudReceipt(handle: string, session: string, signal: AbortSignal): Promise<PlaygroundReceipt> {
  try {
    for (const delay of [0, 300, 700, 1500, 3000, 5000]) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      signal.throwIfAborted();
      const response = await fetch(`/api/playground?receipt=${encodeURIComponent(handle)}`, {
        headers: { "X-Playground-Session": session }, cache: "no-store", signal,
      });
      if (!response.ok) break;
      const receipt: PlaygroundReceipt = await response.json();
      if (receipt.state !== "pending") return receipt;
    }
  } catch {
    // Receipt availability does not affect the inference stream.
  }
  return { state: "unavailable" };
}
