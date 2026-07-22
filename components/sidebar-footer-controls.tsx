"use client";

import { LanguageToggleButton } from "@/components/language-toggle";

/**
 * Docs sidebar footer controls. The site is dark-only (theme is forced to
 * `dark` in the providers), so the former light/dark toggle was inert and has
 * been removed — only the language toggle (EN / 中) remains.
 */
export function SidebarFooterControls() {
  return (
    <div data-sidebar-footer-controls className="flex w-full items-center gap-2">
      <LanguageToggleButton />
    </div>
  );
}
