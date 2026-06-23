import { setRequestLocale } from "next-intl/server";
import { renderLegalPage, legalMetadata } from "@/components/legal-doc";
import type { Metadata } from "next";

export default async function TermsOfServicePage() {
  setRequestLocale("en");
  return renderLegalPage("terms");
}

export function generateMetadata(): Metadata {
  return legalMetadata("terms");
}
