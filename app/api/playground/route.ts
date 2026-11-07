import { allowsLocalLive, cloudAccount, playgroundError, playgroundNoStore, playgroundPrincipal } from "../../../lib/playground-auth";
import { getPlaygroundReceipt, playgroundCloudConfig } from "../../../lib/playground-cloud";
import { isPlaygroundPreviewEnabled } from "../../../lib/playground-preview";

export async function GET(request: Request) {
  if (!isPlaygroundPreviewEnabled()) return new Response(null, { status: 404 });
  try {
    const account = await cloudAccount(request);
    const config = playgroundCloudConfig();
    const handle = new URL(request.url).searchParams.get("receipt");
    if (handle !== null) {
      const owner = playgroundPrincipal(request, account);
      if (!config || !owner) return new Response(null, { status: 404, headers: playgroundNoStore });
      return await getPlaygroundReceipt(config, handle, owner, AbortSignal.any([request.signal, AbortSignal.timeout(5000)]));
    }
    const liveAvailable = Boolean(config && (account || allowsLocalLive(request)));
    return Response.json({ signedIn: Boolean(account), liveAvailable, visionAvailable: liveAvailable && Boolean(config?.visionModel) }, {
      status: account ? 200 : 401,
      headers: playgroundNoStore,
    });
  } catch {
    return playgroundError("Could not check your Cloud session or receipt.", 503);
  }
}
