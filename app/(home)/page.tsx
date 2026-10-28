import type { Metadata } from "next";
import { Homepage } from "@/components/landing/homepage/homepage";

export const metadata: Metadata = {
  title: { absolute: "BitRouter — The Open Market for Elastic Inference" },
  description: "The right inference for your workload, on your terms.",
  alternates: { canonical: "https://bitrouter.ai" },
};

export default function Home() {
  return <Homepage />;
}
