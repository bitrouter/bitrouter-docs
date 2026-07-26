import { renderLegalPage, legalMetadata } from "@/components/legal-doc";
import type { Metadata } from "next";

export default async function TermsOfServicePage() {
  return renderLegalPage("terms");
}

export function generateMetadata(): Metadata {
  return legalMetadata("terms");
}
