import { serveInstaller } from "@/lib/install-proxy";

export async function GET() {
  return serveInstaller({
    assetName: "bitrouter-installer.ps1",
    contentType: "text/plain; charset=utf-8",
  });
}
