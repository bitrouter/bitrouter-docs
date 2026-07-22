"use client";

import { usePathname } from "next/navigation";
import { SiteHeader, SiteHeaderBody, type HeaderSession } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { GitHubStarsBadge } from "@/components/landing/github-stars-badge";
import { AISearchBar } from "@/components/ai/search";

const config = {
  webBaseUrl: process.env.NEXT_PUBLIC_WEB_URL ?? "https://bitrouter.ai",
  consoleBaseUrl:
    process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai",
};

// ── web-specific slot content. Install pill removed (the hero install bar and
//    docs Installation page already cover CLI install). The search slot holds the
//    "Ask AI" bar (opens the AI chat panel) — replaces the old floating trigger;
//    every SiteHeader renders inside an <AISearch> provider. ───
const utilitySlot = <GitHubStarsBadge />;
const searchSlot = <AISearchBar />;

// ── shared prop plumbing ──────────────────────────────────────────────

function useWebHeaderProps() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const headerSession: HeaderSession | null = session?.user
    ? {
        user: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
      }
    : null;
  return {
    config,
    session: headerSession,
    pathname,
    onSignOut: () => {
      window.location.href = `${config.consoleBaseUrl}/sign-out?returnTo=${encodeURIComponent(window.location.href)}`;
    },
    searchSlot,
    utilitySlot,
  };
}

/** Full header — fumadocs `nav.component` for home / blog / marketing. */
export function WebHeader() {
  return <SiteHeader {...useWebHeaderProps()} />;
}

/** Headerless body — for the docs notebook grid header (DocsHeader). */
export function WebHeaderBody() {
  return <SiteHeaderBody {...useWebHeaderProps()} />;
}
