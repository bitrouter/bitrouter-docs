import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggleIcon } from "@/components/landing/sections/ThemeToggleIcon";
import { SOCIAL_LINKS } from "@/components/landing/social-links";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: wordmark + links */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider"
          >
            <img
              src="/logo.svg"
              alt="BitRouter"
              className="h-4 w-4 dark:invert"
            />
            <span>
              BitRouter<span className="text-foreground/30">.</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <FooterLink href="/blog" label={t("links.blog")} />
            <FooterLink href="/changelog" label={t("links.changelog")} />
            <FooterLink href="/community" label={t("links.community")} />
            <FooterLink href="/careers" label={t("links.careers")} />
            <FooterLink href="/brand" label={t("links.brand")} />
            <FooterLink href="/legal" label={t("links.legal")} />
          </nav>
        </div>

        {/* Right: socials + theme + copyright */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <span className="h-3 w-px bg-border" />
          <ThemeToggleIcon label={t("themeToggle")} />
          <span className="h-3 w-px bg-border" />
          <span className="font-mono text-[10px] text-muted-foreground/70">
            © {year} BitRouter
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </Link>
  );
}
