"use client";

import { usePathname } from "next/navigation";
import { SiteHeader, SiteHeaderBody, type HeaderSession } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { GitHubStarsBadge } from "@/components/landing/github-stars-badge";

const config = {
  webBaseUrl: process.env.NEXT_PUBLIC_WEB_URL ?? "https://bitrouter.ai",
  consoleBaseUrl:
    process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai",
};

// ── web-specific slot content. Install pill removed (the nav "Download" item
//    and the hero install bar already cover CLI install). No header search slot:
//    docs search lives in the sidebar banner; ⌘K opens the native dialog anywhere. ───
const utilitySlot = <GitHubStarsBadge />;
const searchSlot = undefined;

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
