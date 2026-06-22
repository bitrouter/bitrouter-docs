"use client";

import { useI18n } from "fumadocs-ui/contexts/i18n";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { locale: "en", label: "EN" },
  { locale: "zh", label: "中" },
] as const;

/**
 * Explicit EN / 中 segmented switch for the docs sidebar footer. Shows both
 * languages with the active one highlighted (clearer than fumadocs' default
 * "switch to the other language" single-glyph button).
 */
export function LanguageToggleButton({ className }: { className?: string }) {
  const ctx = useI18n();
  if (!ctx.locales) return null;

  return (
    <div
      role="group"
      aria-label={ctx.text.chooseLanguage}
      className={cn("inline-flex items-center border", className)}
    >
      {OPTIONS.map((opt) => {
        const active = ctx.locale === opt.locale;
        return (
          <button
            key={opt.locale}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!active) ctx.onChange?.(opt.locale);
            }}
            className={cn(
              "px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              active
                ? "bg-fd-accent text-fd-accent-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
