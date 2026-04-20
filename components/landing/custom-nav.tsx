"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { SOCIAL_LINKS } from "./social-links";
import { RESOURCE_ITEMS, ResourcesTabCell } from "./resources-menu";

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
          <ResourcesTabCell />
          {/* Spacer */}
          <div className="flex-1 border-r border-foreground/[0.06]" />
        </nav>

        {/* Sign In (disabled) */}
        {/* <a
          href="https://app.bitrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap bg-foreground px-6 font-mono text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90"
        >
          Sign-In
          <ArrowUpRight className="size-3" />
        </a> */}
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
  const [resourcesOpen, setResourcesOpen] = useState(() =>
    RESOURCE_ITEMS.some((i) => normalizedPath.startsWith(i.href)),
  );

  const primaryLinks = [
    { label: "Readme", href: "/", active: normalizedPath === "/" || normalizedPath === "" },
    { label: "Docs", href: "/docs/overview", active: normalizedPath.startsWith("/docs") },
    { label: "Proxy", href: "/proxy", active: normalizedPath.startsWith("/proxy") },
    { label: "Cloud", href: "/cloud", active: normalizedPath.startsWith("/cloud") },
    { label: "Enterprise", href: "/enterprise", active: normalizedPath.startsWith("/enterprise") },
  ];

  const resourcesActive = RESOURCE_ITEMS.some((i) => normalizedPath.startsWith(i.href));

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
            {primaryLinks.map((link) => (
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

            {/* Resources disclosure */}
            <button
              type="button"
              onClick={() => setResourcesOpen((v) => !v)}
              className={cn(
                "mt-px flex items-center justify-between px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors",
                resourcesActive
                  ? "bg-foreground/[0.04] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
              )}
              aria-expanded={resourcesOpen}
            >
              Resources
              <ChevronDown
                className={cn(
                  "size-3 opacity-50 transition-transform",
                  resourcesOpen && "rotate-180",
                )}
              />
            </button>
            {resourcesOpen && (
              <div className="border-l border-foreground/[0.08] ml-3">
                {RESOURCE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = normalizedPath.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground/80 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5 opacity-70" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-1 border-t border-foreground/[0.06] px-4 py-3">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
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
          </div>
        </div>
      )}
    </>
  );
}
