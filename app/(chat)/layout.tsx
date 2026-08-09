import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteProviders } from "@/components/site-providers";
import { baseOptions } from "@/lib/layout.shared";

/**
 * Same shell as the `(home)` group, deliberately without `SiteZedFooter`.
 *
 * `/chat` is a full-viewport app surface — the composer is pinned to the
 * bottom of the viewport, so a marketing footer underneath it would hang
 * below the fold and turn the page into a scrolling document.
 */
export default function ChatGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <HomeLayout {...baseOptions()}>{children}</HomeLayout>
    </SiteProviders>
  );
}
