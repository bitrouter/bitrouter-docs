import { ZedEnterprisePage } from "@/components/landing/zed/enterprise-page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export default function Page() {
  return <ZedEnterprisePage />;
}

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Match inference resources to your agents’ work. Discuss model routing, private deployment, and your team’s requirements with BitRouter.",
  alternates: { canonical: "https://bitrouter.ai/enterprise" },
  openGraph: {
    title: "Enterprise | BitRouter",
    description:
      "Match inference resources to your agents’ work. Discuss model routing, private deployment, and your team’s requirements with BitRouter.",
    url: "https://bitrouter.ai/enterprise",
    type: "website",
  },
};
