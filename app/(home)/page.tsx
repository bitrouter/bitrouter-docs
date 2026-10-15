import type { Metadata } from "next";
import { Homepage } from "@/components/landing/homepage/homepage";

export const metadata: Metadata = {
  title: { absolute: "BitRouter — Time is money. More done per token." },
  description: "Make every step of your agent’s work count. Open-source model routing, through an API or your terminal. Your agents. Your models. Your infrastructure.",
  alternates: { canonical: "https://bitrouter.ai" },
};

export default function Home() {
  return <Homepage />;
}
