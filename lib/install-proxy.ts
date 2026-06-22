/**
 * Shared logic for the `/install.sh` and `/install.ps1` route handlers.
 *
 * Why this isn't just a `releases/latest/download/<asset>` redirect:
 *
 * GitHub's "latest" symlink does not skip releases that have no assets
 * attached. The bitrouter publishing pipeline failed on the v1 release
 * boundary — `v1.0.0-alpha.2` was tagged and marked "Latest" but the
 * cargo-dist asset upload step never ran, so the installer scripts
 * aren't there. Pointing the proxy at `/releases/latest/download/…`
 * resolves to a 404 in that state.
 *
 * This helper instead queries the GitHub releases API for recent
 * releases and picks the most recent one that actually has the named
 * asset attached. It survives:
 *
 *   - A broken "Latest" with no assets (the current alpha situation).
 *   - A prerelease accidentally promoted to "Latest".
 *   - A future asset rename — the caller passes the asset name in,
 *     so a docs/code change is localised to one constant.
 *
 * The route handlers wrap this in a long `s-maxage` so the GitHub API
 * is only hit on the edge cache miss, well within the 60 req/h
 * unauth rate limit.
 */

const REPO = "bitrouter/bitrouter";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=20`;

export interface InstallerProxyOptions {
  /** Asset filename on the GitHub release, e.g. `bitrouter-installer.sh`. */
  assetName: string;
  /** `Content-Type` to set on the proxied response. */
  contentType: string;
}

/**
 * Find the most recent release that has `assetName` attached, fetch
 * its body, and return it as an HTTP response. The body and headers
 * (Content-Type, Cache-Control) are set so curl/iwr can pipe directly
 * into a shell.
 */
export async function serveInstaller({
  assetName,
  contentType,
}: InstallerProxyOptions): Promise<Response> {
  const apiRes = await fetch(RELEASES_API, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      // The GitHub API rejects requests without a User-Agent with 403.
      "User-Agent": "bitrouter-docs/install-proxy",
    },
  });
  if (!apiRes.ok) {
    return new Response(
      `Failed to query GitHub releases API for ${REPO}: HTTP ${apiRes.status}`,
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const releases = (await apiRes.json()) as Array<{
    tag_name: string;
    assets: Array<{ name: string; browser_download_url: string }>;
  }>;

  for (const release of releases) {
    const asset = release.assets.find((a) => a.name === assetName);
    if (!asset) continue;
    const res = await fetch(asset.browser_download_url);
    if (!res.ok) {
      // The release advertises the asset but the CDN copy is broken —
      // keep walking, don't give up on the request.
      continue;
    }
    const body = await res.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  }

  return new Response(
    `Could not find ${assetName} in any of the ${releases.length} most recent releases of ${REPO}`,
    {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
