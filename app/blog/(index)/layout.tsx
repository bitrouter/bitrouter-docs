import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

// The blog index keeps the top-nav HomeLayout (its own 40/60 split design);
// individual posts also render under HomeLayout in the sibling (posts) group
// as standalone articles (the flux DocsLayout throws "Missing SidebarContext").
export default function BlogIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
