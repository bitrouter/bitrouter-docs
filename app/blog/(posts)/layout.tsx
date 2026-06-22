import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { setRequestLocale } from "next-intl/server";

// Blog posts render as standalone articles under the marketing HomeLayout
// (top nav only) — no docs sidebar. This avoids the flux DocsLayout/DocsPage
// sidebar-context coupling (which throws "Missing SidebarContext" at runtime)
// and matches a blog post's "focused article" UX. Mirrors the changelog group.
export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("en");

  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
