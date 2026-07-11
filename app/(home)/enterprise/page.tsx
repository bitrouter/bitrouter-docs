import { setRequestLocale } from "next-intl/server";
import { EnterprisePage } from "@/components/enterprise/enterprise-page";
import type { Metadata } from "next";

export default function Page() {
  setRequestLocale("en");
  return <EnterprisePage />;
}

export function generateMetadata(): Metadata {
  const description =
    "FinOps for AI: govern token spend across every team with real-time budgets, showback and chargeback, and an optimizing router — with our fee tied to what we save you.";
  const ogTitle = "BitRouter Enterprise — govern token spend across the org";
  return {
    title: "Token cost governance",
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
