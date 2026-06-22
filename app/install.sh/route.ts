import { serveInstaller } from "@/lib/install-proxy";

export async function GET() {
  return serveInstaller({
    assetName: "bitrouter-installer.sh",
    contentType: "text/x-shellscript; charset=utf-8",
  });
}
