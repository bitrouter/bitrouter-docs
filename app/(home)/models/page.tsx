import type { Metadata } from "next";
import { ZedModelsPage } from "@/components/landing/zed/models-page";

export default function Page() {
  return <ZedModelsPage />;
}

export const metadata: Metadata = {
  title: "Models — BitRouter",
  description:
    "One API for the most performant, reliable models for LLM agents — across OpenAI, Anthropic, Google, Mistral, and more.",
  alternates: { canonical: "https://bitrouter.ai/models" },
};
