import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteProviders } from "@/components/site-providers";
import { baseOptions } from "@/lib/layout.shared";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomeGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <HomeLayout {...baseOptions()}>
        {children}
        <LandingFooter />
      </HomeLayout>
    </SiteProviders>
  );
}
