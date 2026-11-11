import { allowsLocalLive, cloudAccount, isPlaygroundSameOrigin, playgroundError } from "../../../../../lib/playground-auth";
import { hasPlaygroundImages, playgroundCloudConfig, playgroundCloudRequest, streamPlaygroundCloud } from "../../../../../lib/playground-cloud";
import { isPlaygroundEnabled } from "../../../../../lib/playground-config";
import { admitPlaygroundRequest, playgroundQuotaConfig, releaseAdmissionAfterStream } from "../../../../../lib/playground-quota";

const maxBodyBytes = 2 * 1024 * 1024;
const maxTextBytes = 64 * 1024;

async function readBody(request: Request) {
  if (!request.body) throw new SyntaxError("Missing request body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return JSON.parse(body + decoder.decode());
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new RangeError("Request body too large");
      }
      body += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  if (!isPlaygroundEnabled()) return playgroundError("The agent is temporarily unavailable. Please try again later.", 503);
  if (!isPlaygroundSameOrigin(request)) return playgroundError("Open this site's playground to run a task.", 403);

  let account: string | null;
  try {
    account = await cloudAccount(request) ?? (allowsLocalLive(request) ? "loopback-operator" : null);
  } catch {
    return playgroundError("Could not check your Cloud session. Please try again.", 503);
  }
  if (!account) return playgroundError("Sign in to BitRouter Cloud to run a task.", 401);
  const config = playgroundCloudConfig();
  const quota = playgroundQuotaConfig();
  if (!config || !quota) return playgroundError("The agent is temporarily unavailable. Please try again later.", 503);

  let payload: unknown;
  try {
    payload = await readBody(request);
  } catch (error) {
    if (error instanceof RangeError) return playgroundError("The conversation is too large. Reset the workspace to continue.", 413);
    return playgroundError("Expected a JSON agent request.", 400);
  }
  const input = playgroundCloudRequest.safeParse(payload);
  if (!input.success) return playgroundError("This task contains unsupported content or tool messages.", 400);
  const textPayload = JSON.stringify(input.data, (key, value) => key === "url" ? undefined : value);
  if (new TextEncoder().encode(textPayload).length > maxTextBytes) {
    return playgroundError("The conversation is too large. Reset the workspace to continue.", 413);
  }
  if (hasPlaygroundImages(input.data) && !config.visionModel) {
    return playgroundError("Image input is unavailable right now. Remove the image to continue.", 422);
  }

  let admission;
  try { admission = await admitPlaygroundRequest(quota, account, request.signal); }
  catch { return playgroundError("The agent could not start. Please try again later.", 503); }
  if (!admission.allowed) {
    return playgroundError(admission.reason === "account" ? "You’ve reached your playground allowance."
      : admission.reason === "busy" ? "The agent is busy. Please try again shortly."
      : "The agent has reached its current allowance. Please try again later.", 429);
  }
  try {
    const response = await streamPlaygroundCloud(config, input.data, AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]));
    return await releaseAdmissionAfterStream(response, admission.release);
  } catch {
    await admission.release();
    return playgroundError("BitRouter Cloud inference could not start. Please try again.", 502);
  }
}
