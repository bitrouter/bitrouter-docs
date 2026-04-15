"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DiscordIcon, XIcon, GitHubIcon } from "@/components/icons";
import { ArrowUpRight, Menu, X } from "lucide-react";

// ── Social links (used in mobile menu footer) ───────────

const socialLinks = [
  { label: "Discord", href: "https://discord.gg/G3zVrZDa5C", icon: DiscordIcon },
  { label: "Twitter/X", href: "https://x.com/BitRouterAI", icon: XIcon },
  { label: "GitHub", href: "https://github.com/bitrouter", icon: GitHubIcon },
];

// ── Main export ──────────────────────────────────────────

export function CustomNav() {
  const pathname = usePathname();

  return (
    <header
      id="nd-nav"
      className="fixed inset-x-0 top-0 z-50 border-b border-foreground/[0.08] bg-background/80 backdrop-blur-lg"
      style={{ "--fd-nav-height": "48px" } as React.CSSProperties}
    >
      {/* Desktop */}
      <div className="hidden h-12 lg:flex">
        {/* Logo */}
        <Link
          href="/"
          className="flex w-[180px] shrink-0 items-center gap-2.5 border-r border-foreground/[0.06] px-5"
        >
          <img src="/logo.svg" alt="BitRouter" className="h-6 w-6 dark:invert" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">
            BitRouter<span className="text-foreground/30">.</span>
          </span>
        </Link>

        {/* Tab bar */}
        <nav className="flex flex-1 items-stretch">
          <TabCell label="Readme" href="/" exact />
          <TabCell label="Docs" href="/docs/overview" matchPrefix="/docs" />
          <TabCell label="Proxy" href="/proxy" />
          <TabCell label="Cloud" href="/cloud" />
          <TabCell label="Enterprise" href="/enterprise" />
          <TabCell label="Blog" href="/blog" />
          {/* Spacer */}
          <div className="flex-1 border-r border-foreground/[0.06]" />
        </nav>

        {/* Sign In */}
        <a
          href="https://app.bitrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap bg-foreground px-6 font-mono text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90"
        >
          Sign-In
          <ArrowUpRight className="size-3" />
        </a>
      </div>

      {/* Mobile */}
      <div className="flex h-12 items-center px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="BitRouter" className="h-6 w-6 dark:invert" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">
            BitRouter<span className="text-foreground/30">.</span>
          </span>
        </Link>
        <div className="flex-1" />
        <MobileMenu pathname={pathname} />
      </div>
    </header>
  );
}

// ── TabCell ──────────────────────────────────────────────

function TabCell({
  label,
  href,
  exact,
  matchPrefix,
}: {
  label: string;
  href: string;
  exact?: boolean;
  matchPrefix?: string;
}) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isActive = exact
    ? normalizedPath === "/" || normalizedPath === ""
    : matchPrefix
      ? normalizedPath.startsWith(matchPrefix)
      : normalizedPath.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center border-r border-foreground/[0.06] px-5 font-mono text-xs uppercase tracking-wider transition-colors",
        isActive
          ? "text-foreground"
          : "text-foreground/65 hover:bg-foreground/[0.03] hover:text-foreground dark:text-foreground/50 dark:hover:text-foreground",
      )}
    >
      {label}
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-foreground/50" />
      )}
    </Link>
  );
}

// ── ExternalTabCell ─────────────────────────────────────

function ExternalTabCell({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex items-center gap-1 border-r border-foreground/[0.06] px-5 font-mono text-xs uppercase tracking-wider text-foreground/65 transition-colors hover:bg-foreground/[0.03] hover:text-foreground dark:text-foreground/50 dark:hover:text-foreground"
    >
      {label}
      <ArrowUpRight className="size-3 opacity-40" />
    </a>
  );
}

// ── Mobile menu ──────────────────────────────────────────

function MobileMenu({ pathname }: { pathname: string }) {
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const [open, setOpen] = useState(false);

  const allLinks = [
    { label: "Readme", href: "/", active: normalizedPath === "/" || normalizedPath === "" },
    { label: "Docs", href: "/docs/overview", active: normalizedPath.startsWith("/docs") },
    { label: "Proxy", href: "/proxy", active: normalizedPath.startsWith("/proxy") },
    { label: "Cloud", href: "/cloud", active: normalizedPath.startsWith("/cloud") },
    { label: "Enterprise", href: "/enterprise", active: normalizedPath.startsWith("/enterprise") },
    { label: "Blog", href: "/blog", active: normalizedPath.startsWith("/blog") },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
        aria-label="Toggle menu"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-12 z-50 border-b border-foreground/[0.08] bg-background/95 backdrop-blur-lg">
          <nav className="flex flex-col p-3">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors",
                  link.active
                    ? "bg-foreground/[0.04] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

          </nav>

          {/* Social + Sign In */}
          <div className="flex items-center gap-1 border-t border-foreground/[0.06] px-4 py-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
            <div className="flex-1" />
            <a
              href="https://app.bitrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border border-foreground bg-foreground px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-background"
            >
              Sign In <ArrowUpRight className="size-2.5" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
