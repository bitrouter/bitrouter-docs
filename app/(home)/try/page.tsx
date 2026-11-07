import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Playground } from "@/components/landing/playground/playground";
import { isPlaygroundPreviewEnabled } from "@/lib/playground-preview";

export const metadata: Metadata = {
  title: "Agent Playground",
  robots: { index: false, follow: false },
};

export default function TryPage() {
  if (!isPlaygroundPreviewEnabled()) notFound();
  return <main id="main"><Playground expanded /></main>;
}
