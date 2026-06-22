import type { Metadata } from "next";
import { LiteLLMPage } from "@/components/landing/compare/litellm-page";

export const metadata: Metadata = {
  title: "BitRouter vs LiteLLM — One Binary vs an Embedded Python Proxy",
  description:
    "BitRouter is a zero-ops open-source LLM router that optimizes agent cost and performance. LiteLLM is an embedded Python library. Compare deployment, routing, and cost efficiency.",
  alternates: { canonical: "https://bitrouter.ai/compare/bitrouter-vs-litellm" },
};

export default function Page() {
  return <LiteLLMPage />;
}
