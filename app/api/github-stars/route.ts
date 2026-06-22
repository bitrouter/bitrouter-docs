// Public, unauthenticated star count for the header badge. Cached at the edge
// for an hour so visitors never hit GitHub's 60/hr anon rate limit directly.
export const revalidate = 3600;

const GITHUB_API = "https://api.github.com/repos/bitrouter/bitrouter";

export async function GET() {
  try {
    const res = await fetch(GITHUB_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return Response.json({ stars: null });
    const data = (await res.json()) as { stargazers_count?: number };
    return Response.json({ stars: data.stargazers_count ?? null });
  } catch {
    return Response.json({ stars: null });
  }
}
