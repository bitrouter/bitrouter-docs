import { ZedEnterprisePage } from "@/components/landing/zed/enterprise-page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export default function Page() {
  return <ZedEnterprisePage />;
}

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Permissionless participation. Trustless inference. Every inference request on the BitRouter platform is verified against its declared model version, weights, and precision.",
  alternates: { canonical: "https://bitrouter.ai/enterprise" },
  openGraph: {
    title: "Enterprise | BitRouter",
    description:
      "Permissionless participation. Trustless inference. Every inference request on the BitRouter platform is verified against its declared model version, weights, and precision.",
    url: "https://bitrouter.ai/enterprise",
    type: "website",
  },
};
