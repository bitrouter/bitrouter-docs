import { ZedEnterprisePage } from "@/components/landing/zed/enterprise-page";
import type { Metadata } from "next";

export default function Page() {
  return <ZedEnterprisePage />;
}

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Choose the BitRouter deployment path that fits your security, procurement, and operating requirements.",
  alternates: { canonical: "https://bitrouter.ai/enterprise" },
  openGraph: {
    title: "Enterprise | BitRouter",
    description:
      "Choose the BitRouter deployment path that fits your security, procurement, and operating requirements.",
    url: "https://bitrouter.ai/enterprise",
    type: "website",
  },
};
