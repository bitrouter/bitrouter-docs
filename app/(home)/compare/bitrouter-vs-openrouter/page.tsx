import type { Metadata } from "next";
import { OpenRouterPage } from "@/components/landing/compare/openrouter-page";

export const metadata: Metadata = {
  title: "BitRouter vs OpenRouter — Self-Host Your LLM Router",
  description:
    "BitRouter is an Apache 2.0 binary you run anywhere. OpenRouter is a closed-source cloud gateway. Compare features, pricing, agent support, and latency.",
  alternates: { canonical: "https://bitrouter.ai/compare/bitrouter-vs-openrouter" },
};

export default function Page() {
  return <OpenRouterPage />;
}
