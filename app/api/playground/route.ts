import { createHash } from "node:crypto";
import { allowsLocalLive, cloudAccount, playgroundError, playgroundNoStore } from "../../../lib/playground-auth";
import { playgroundCloudConfig } from "../../../lib/playground-cloud";
import { isPlaygroundEnabled } from "../../../lib/playground-config";
import { playgroundQuotaConfig } from "../../../lib/playground-quota";

export async function GET(request: Request) {
  if (new URL(request.url).searchParams.has("receipt")) return new Response(null, { status: 404, headers: playgroundNoStore });
  if (!isPlaygroundEnabled()) {
    return Response.json({ enabled: false, signedIn: false, available: false, visionAvailable: false, account: null }, { headers: playgroundNoStore });
  }
  try {
    const account = await cloudAccount(request) ?? (allowsLocalLive(request) ? "loopback-operator" : null);
    const config = playgroundCloudConfig();
    const available = Boolean(account && config && playgroundQuotaConfig());
    return Response.json({
      enabled: true, signedIn: Boolean(account), available,
      visionAvailable: available && Boolean(config?.visionModel),
      account: account ? createHash("sha256").update(account).digest("hex") : null,
    }, { headers: playgroundNoStore });
  } catch {
    return playgroundError("Could not check your Cloud session. Please try again.", 503);
  }
}
