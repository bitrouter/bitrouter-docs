import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("Footer");

  const footerLinkItems = [
    { label: t("terms"), href: "/docs/overview/terms-of-service" },
    { label: t("privacy"), href: "/docs/overview/privacy-policy" },
    { label: t("brandKit"), href: "https://github.com/AIMOverse/brand-kit" },
    { label: t("contact"), href: "mailto:contact@bitrouter.ai" },
    { label: t("github"), href: "https://github.com/aimo-network" },
    { label: t("x"), href: "https://x.com/AiMoNetwork" },
    { label: t("discord"), href: "https://discord.gg/aimo" },
  ];

  return (
    <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:px-6 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center">
            {footerLinkItems.map((link, i) => (
              <span key={link.label} className="flex items-center">
                {link.href.startsWith("/") ? (
                  <Link
                    href={link.href}
                    className="px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                )}
                {i < footerLinkItems.length - 1 && <span className="h-4 w-px bg-border" />}
              </span>
            ))}
          </div>
          <div className="shrink-0 text-xs text-muted-foreground">{t("copyright")}</div>
        </div>
    </footer>
  );
}
