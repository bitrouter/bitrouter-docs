import { setRequestLocale } from "next-intl/server";
import { renderLegalPage, legalMetadata } from "@/components/legal-doc";
import type { Metadata } from "next";

export default async function PrivacyPolicyPage() {
  setRequestLocale("en");
  return renderLegalPage("privacy");
}

export function generateMetadata(): Metadata {
  return legalMetadata("privacy");
}
