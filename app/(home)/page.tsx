import type { Metadata } from "next";
import { Homepage } from "@/components/landing/homepage/homepage";
import { isPlaygroundPreviewEnabled } from "@/lib/playground-preview";

export const metadata: Metadata = {
  title: { absolute: "BitRouter — The Open Market for Elastic Inference" },
  description: "The right inference for your workload, on your terms.",
  alternates: { canonical: "https://bitrouter.ai" },
};

export default function Home() {
  return <>
    <link rel="ai-catalog" type="application/ai-catalog+json" href="/.well-known/ai-catalog.json" />
    <link rel="ard" type="application/ai-catalog+json" href="/.well-known/ard.json" />
    <link rel="alternate" type="text/markdown" href="/index.md" />
    <Homepage playgroundPreview={isPlaygroundPreviewEnabled()} />
  </>;
}
