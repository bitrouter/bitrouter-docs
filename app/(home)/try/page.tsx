import type { Metadata } from "next";
import { Playground } from "@/components/landing/playground/playground";

export const metadata: Metadata = {
  title: "Agent Playground",
  robots: { index: false, follow: false },
};

export default function TryPage() {
  return <main id="main"><Playground expanded /></main>;
}
