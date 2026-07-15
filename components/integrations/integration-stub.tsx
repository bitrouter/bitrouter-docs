import Link from "next/link";
import type { Metadata } from "next";

/** Shared metadata for a per-agent integration route (`/claude-code`, …). */
export function integrationMetadata(
  name: string,
  slug: string,
  blurb: string,
): Metadata {
  const title = `${name} + BitRouter`;
  const url = `https://bitrouter.ai/${slug}`;
  return {
    title: `${name} integration`,
    description: blurb,
    alternates: { canonical: url },
    openGraph: { title, description: blurb, url, type: "website" },
    twitter: { title, description: blurb },
  };
}

/**
 * Placeholder page for a single agent/runtime integration (e.g. Claude Code,
 * Codex). Rendered by the top-level `/claude-code`, `/codex`, … routes until
 * their full setup guides land. Lives inside the `(home)` route group, so the
 * site header and mono footer wrap it automatically.
 */
export function IntegrationStub({
  name,
  blurb,
}: {
  name: string;
  blurb: string;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Integration
      </p>
      <h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
        {name}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {blurb}
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        A step-by-step setup guide is on the way. In the meantime, start from{" "}
        <Link href="/docs/get-started" className="underline underline-offset-4">
          the docs
        </Link>{" "}
        or{" "}
        <a
          href="mailto:contact@bitrouter.ai"
          className="underline underline-offset-4"
        >
          talk to the founders
        </a>
        .
      </p>
    </main>
  );
}
