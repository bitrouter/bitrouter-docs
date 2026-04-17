const INSTALLER_URL =
  "https://github.com/bitrouter/bitrouter/releases/latest/download/bitrouter-installer.sh";

export async function GET() {
  const res = await fetch(INSTALLER_URL, { redirect: "follow" });
  if (!res.ok) {
    return new Response(`Failed to fetch installer: ${res.status}`, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const body = await res.text();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control":
        "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
