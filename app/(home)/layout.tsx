import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteProviders } from "@/components/site-providers";
import { baseOptions } from "@/lib/layout.shared";

export default function HomeGroupLayout({
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
