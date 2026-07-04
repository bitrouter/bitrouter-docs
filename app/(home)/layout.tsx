import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteProviders } from "@/components/site-providers";
import { baseOptions } from "@/lib/layout.shared";
import { SiteMonoFooter } from "@/components/landing/mono/site-mono-footer";

export default function HomeGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <HomeLayout {...baseOptions()}>
        {children}
        <SiteMonoFooter />
      </HomeLayout>
    </SiteProviders>
  );
}
