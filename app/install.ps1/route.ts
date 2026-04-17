const INSTALLER_URL =
  "https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.ps1";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(INSTALLER_URL, { redirect: "follow" });
  if (!res.ok) {
    return new Response(`Failed to fetch installer: ${res.status}`, {
      status: 502,
    });
  }
  const body = await res.text();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
