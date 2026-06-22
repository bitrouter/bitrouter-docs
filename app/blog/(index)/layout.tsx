import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

// The blog index keeps the top-nav HomeLayout (its own 40/60 split design);
// individual posts use the flux DocsLayout in the sibling (posts) group.
// Both stay localized — they live under the [locale] segment.
export default function BlogIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
