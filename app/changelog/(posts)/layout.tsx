import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { setRequestLocale } from "next-intl/server";

// Changelog entries render as standalone articles under the marketing
// HomeLayout (top nav only) — no docs sidebar. This avoids the flux
// DocsLayout/DocsPage sidebar-context coupling and matches a changelog's
// "focused post" UX.
export default function ChangelogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("en");

  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
