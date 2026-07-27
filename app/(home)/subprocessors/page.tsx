import { renderLegalPage, legalMetadata } from "@/components/legal-doc";
import {
  SubprocessorInfraTable,
  SubprocessorProviderTable,
} from "@/components/subprocessors-tables";
import type { Metadata } from "next";

export default async function SubprocessorsPage() {
  return renderLegalPage("subprocessors", {
    SubprocessorInfraTable,
    SubprocessorProviderTable,
  });
}

export function generateMetadata(): Metadata {
  return {
    ...legalMetadata("subprocessors"),
    alternates: { canonical: "https://bitrouter.ai/subprocessors" },
  };
}
