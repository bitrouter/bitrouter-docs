"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DiscordIcon, XIcon, GitHubIcon } from "@/components/icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, ArrowUpRight } from "lucide-react";

// ── Nav structure ────────────────────────────────────────

const productLinks = [
  {
    label: "Proxy",
    href: "https://github.com/bitrouter/bitrouter",
    description: "Open-source LLM routing proxy",
    external: true,
  },
  {
    label: "Cloud",
    href: "/cloud",
    description: "Hosted platform for LLMs, tools & agents",
  },
];

const resourceLinks = [
  { label: "Blog", href: "/blog", description: "News & engineering deep dives" },
  { label: "Changelog", href: "https://github.com/bitrouter/bitrouter/releases", description: "Release history", external: true },
  { label: "Community", href: "https://discord.gg/G3zVrZDa5C", description: "Join our Discord", external: true },
];

const socialLinks = [
  { label: "Discord", href: "https://discord.gg/G3zVrZDa5C", icon: DiscordIcon },
  { label: "Twitter/X", href: "https://x.com/BitRouterAI", icon: XIcon },
  { label: "GitHub", href: "https://github.com/bitrouter", icon: GitHubIcon },
];

// ── Main export ──────────────────────────────────────────

export function CustomNav() {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isHome = normalizedPath === "/" || normalizedPath === "";
  const isDocs = normalizedPath.startsWith("/docs");

  return (
    <header
      id="nd-nav"
      className="sticky top-0 z-40 h-14 border-b border-border/40 bg-background/80 backdrop-blur-lg"
      style={{ "--fd-nav-height": "56px" } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex h-14 items-center",
          // Docs: full-width with small padding to align with sidebar
          isDocs ? "px-4" :
          // Home: full-width with generous padding
          isHome ? "px-6 lg:px-10" :
          // Other pages: centered with max-width
          "mx-auto max-w-[1400px] px-4 sm:px-6",
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="BitRouter" className="h-7 w-7 dark:invert" />
          <span className="text-sm font-semibold uppercase tracking-wider">BitRouter</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-8 hidden items-center gap-0.5 lg:flex">
          <NavTab label="README" href="/" exact />
          <NavTab label="Docs" href="/docs/overview" matchPrefix="/docs" />
          <DropdownMenu label="Products" items={productLinks} matchPrefixes={["/cloud"]} />
          <NavTab label="Enterprise" href="/enterprise" />
          <ResourcesDropdown />
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Sign In button */}
          <a
            href="https://app.bitrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 border border-foreground bg-foreground px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 lg:inline-flex"
          >
            Sign In
            <ArrowUpRight className="size-3" />
          </a>

          {/* Mobile menu */}
          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

// ── NavTab ───────────────────────────────────────────────

function NavTab({
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
        "relative px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
        isActive
          ? "font-medium text-foreground"
          : "text-foreground/50 hover:text-foreground/80",
      )}
    >
      {label}
      {isActive && (
        <span className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 bg-foreground" />
      )}
    </Link>
  );
}

// ── Dropdown menu (Products) ─────────────────────────────

function DropdownMenu({
  label,
  items,
  matchPrefixes = [],
}: {
  label: string;
  items: { label: string; href: string; description: string; external?: boolean }[];
  matchPrefixes?: string[];
}) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isActive = matchPrefixes.some((p) => normalizedPath.startsWith(p));

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "relative inline-flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
          isActive
            ? "font-medium text-foreground"
            : "text-foreground/50 hover:text-foreground/80",
        )}
      >
        {label}
        <ChevronDown className="size-3" />
        {isActive && (
          <span className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 bg-foreground" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-56 border border-border bg-popover p-1 shadow-lg rounded-none"
      >
        {items.map((item) => {
          const Comp = item.external ? "a" : Link;
          const props = item.external
            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: item.href };
          return (
            <Comp
              key={item.label}
              {...(props as any)}
              className="flex flex-col gap-0.5 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {item.label}
                {item.external && <ArrowUpRight className="size-3 opacity-40" />}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {item.description}
              </span>
            </Comp>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ── Resources dropdown (includes social links) ───────────

function ResourcesDropdown() {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";
  const isActive = normalizedPath.startsWith("/blog");

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "relative inline-flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
          isActive
            ? "font-medium text-foreground"
            : "text-foreground/50 hover:text-foreground/80",
        )}
      >
        Resources
        <ChevronDown className="size-3" />
        {isActive && (
          <span className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 bg-foreground" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-56 border border-border bg-popover p-1 shadow-lg rounded-none"
      >
        {resourceLinks.map((item) => {
          const Comp = item.external ? "a" : Link;
          const props = item.external
            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: item.href };
          return (
            <Comp
              key={item.label}
              {...(props as any)}
              className="flex flex-col gap-0.5 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {item.label}
                {item.external && <ArrowUpRight className="size-3 opacity-40" />}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {item.description}
              </span>
            </Comp>
          );
        })}

        {/* Social links */}
        <div className="mt-1 flex items-center gap-1 border-t border-border/50 px-2 pt-2 pb-1">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label={label}
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Mobile menu ──────────────────────────────────────────

function MobileMenu({ pathname }: { pathname: string }) {
  const normalizedPath = pathname.replace(/^\/(en|zh)/, "") || "/";

  const allLinks = [
    { label: "README", href: "/", active: normalizedPath === "/" || normalizedPath === "" },
    { label: "Docs", href: "/docs/overview", active: normalizedPath.startsWith("/docs") },
    { label: "Cloud", href: "/cloud", active: normalizedPath.startsWith("/cloud") },
    { label: "Enterprise", href: "/enterprise", active: normalizedPath.startsWith("/enterprise") },
  ];

  return (
    <details className="group relative lg:hidden" role="navigation">
      <summary className="inline-flex cursor-pointer items-center justify-center p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground list-none [&::-webkit-details-marker]:hidden">
        <svg className="size-5 group-open:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="4" y1="16" x2="20" y2="16" />
        </svg>
        <svg className="hidden size-5 group-open:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-lg">
        <nav className="flex flex-col gap-1">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-xs uppercase tracking-wider transition-colors",
                link.active
                  ? "text-foreground bg-muted/50 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-1 border-t border-border/30" />
          <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/50">Products</p>
          <a
            href="https://github.com/bitrouter/bitrouter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            Proxy <ArrowUpRight className="size-3 opacity-40" />
          </a>

          <div className="my-1 border-t border-border/30" />
          <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/50">Resources</p>
          {resourceLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                {link.label} <ArrowUpRight className="size-3 opacity-40" />
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-xs uppercase tracking-wider transition-colors",
                  normalizedPath.startsWith(link.href)
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Social + Sign In */}
        <div className="mt-2 flex items-center gap-1 border-t border-border/30 pt-2">
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
            className="inline-flex items-center gap-1 border border-foreground bg-foreground px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-background"
          >
            Sign In <ArrowUpRight className="size-2.5" />
          </a>
        </div>
      </div>
    </details>
  );
}
