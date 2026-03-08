"use client";

import { useI18n } from "fumadocs-ui/contexts/i18n";
import { cn } from "@/lib/cn";
import { buttonVariants } from "fumadocs-ui/components/ui/button";

export function LanguageToggleButton({
  className,
}: {
  className?: string;
}) {
  const context = useI18n();
  if (!context.locales) throw new Error("Missing `<I18nProvider />`");

  const nextLocale =
    context.locale === "en"
      ? context.locales.find((l) => l.locale === "zh")
      : context.locales.find((l) => l.locale === "en");

  return (
    <button
      type="button"
      aria-label={context.text.chooseLanguage}
      className={cn(
        buttonVariants({ color: "ghost", size: "icon" }),
        "text-xs font-medium",
        className,
      )}
      onClick={() => {
        if (nextLocale) context.onChange?.(nextLocale.locale);
      }}
    >
      {context.locale === "en" ? "简" : "ENG"}
    </button>
  );
}
