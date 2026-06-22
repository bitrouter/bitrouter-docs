import type { Metadata } from "next";
import { PortkeyPage } from "@/components/landing/compare/portkey-page";

export const metadata: Metadata = {
  title: "BitRouter vs Portkey — Agent-Native Router vs Generic AI Gateway",
  description:
    "BitRouter is built for autonomous agents with MCP/ACP gateway, KYA identity, and x402 payments. Portkey is a generic AI gateway. Compare features and use cases.",
  alternates: { canonical: "https://bitrouter.ai/compare/bitrouter-vs-portkey" },
};

export default function Page() {
  return <PortkeyPage />;
}
