import { setRequestLocale } from "next-intl/server";
import { EnterprisePage } from "@/components/enterprise/enterprise-page";
import type { Metadata } from "next";

export default function Page() {
  setRequestLocale("en");
  return <EnterprisePage />;
}

export function generateMetadata(): Metadata {
  const description =
    "Run your agentic loop through BitRouter: we guarantee it stays under budget and bill 20% of what we save you, only on runs that meet your quality floor.";
  const ogTitle = "BitRouter Enterprise — we only get paid when we cut your bill";
  return {
    title: "Outcome-based pricing",
    description,
    alternates: { canonical: "https://bitrouter.ai/enterprise" },
    openGraph: {
      title: ogTitle,
      description,
      url: "https://bitrouter.ai/enterprise",
      type: "website",
    },
    twitter: { title: ogTitle, description },
  };
}
