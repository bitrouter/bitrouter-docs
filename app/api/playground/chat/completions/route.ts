import { cloudAccount, isPlaygroundSameOrigin, playgroundError, playgroundPrincipal } from "../../../../../lib/playground-auth";
import { hasPlaygroundImages, playgroundCloudConfig, playgroundCloudRequest, playgroundProfile, streamPlaygroundCloud } from "../../../../../lib/playground-cloud";
import { isPlaygroundPreviewEnabled } from "../../../../../lib/playground-preview";

const maxBodyBytes = 2 * 1024 * 1024;
const maxTextBytes = 64 * 1024;
// Count paid admissions across tabs in this development-only route.
const maxPreviewCalls = 24;
let admitted = 0;

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
  if (!isPlaygroundPreviewEnabled()) return new Response(null, { status: 404 });
  if (!isPlaygroundSameOrigin(request)) {
    return playgroundError("Open the same-origin playground to run a task.", 403);
  }

  let account: string | null;
  try {
    account = await cloudAccount(request);
  } catch {
    return playgroundError("Could not check your Cloud session.", 503);
  }
  const owner = playgroundPrincipal(request, account);
  if (!owner) return playgroundError("Sign in to BitRouter Cloud to run a task.", 401);
  const config = playgroundCloudConfig();
  if (!config) return playgroundError("Live BitRouter preview has no inference credential configured.", 503);

  const profile = playgroundProfile.safeParse(request.headers.get("x-playground-profile"));
  if (!profile.success) return playgroundError("Select a supported routing preference.", 400);

  let payload: unknown;
  try {
    payload = await readBody(request);
  } catch (error) {
    if (error instanceof RangeError) return playgroundError("The preview prompt is too large. Reset the playground to continue.", 413);
    return playgroundError("Expected a JSON playground request.", 400);
  }
  const input = playgroundCloudRequest.safeParse(payload);
  if (!input.success) return playgroundError("This preview accepts text, supported image attachments, and allowlisted tool messages.", 400);
  const textPayload = JSON.stringify(input.data, (key, value) => key === "url" ? undefined : value);
  if (new TextEncoder().encode(textPayload).byteLength > maxTextBytes) {
    return playgroundError("The preview conversation is too large. Reset the playground to continue.", 413);
  }
  if (hasPlaygroundImages(input.data) && !config.visionModel) {
    return playgroundError("This preview needs a configured vision model to run a task with images.", 422);
  }
  if (admitted >= maxPreviewCalls) return playgroundError("The local preview request limit has been reached.", 429);
  admitted++;

  try {
    return await streamPlaygroundCloud(config, input.data, profile.data, owner, AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]));
  } catch {
    return playgroundError("BitRouter Cloud inference could not start.", 502);
  }
}
