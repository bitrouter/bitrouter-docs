"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { DiscordIcon, XIcon, GitHubIcon } from "@/components/icons";

const navLinks = [
  { label: "Terms", href: "/docs/overview/terms-of-service" },
  { label: "Privacy", href: "/docs/overview/privacy-policy" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "https://discord.gg/G3zVrZDa5C" },
  { label: "Changelog", href: "https://github.com/bitrouter/bitrouter/releases" },
];

const socialIcons = [
  { label: "Twitter/X", href: "https://x.com/BitRouterAI", Icon: XIcon },
  { label: "GitHub", href: "https://github.com/bitrouter", Icon: GitHubIcon },
  { label: "Discord", href: "https://discord.gg/G3zVrZDa5C", Icon: DiscordIcon },
];

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Right: social + theme + copyright */}
        <div className="flex items-center gap-3">
          {socialIcons.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label={label}
            >
              <Icon className="size-3.5" />
            </a>
          ))}

          <span className="h-3 w-px bg-border" />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {/* Sun */}
            <svg
              className="size-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            {/* Moon */}
            <svg
              className="absolute size-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>

          <span className="h-3 w-px bg-border" />

          <span className="text-[10px] text-muted-foreground/50">
            &copy; 2026 BitRouter
          </span>
        </div>
      </div>
    </footer>
  );
}
