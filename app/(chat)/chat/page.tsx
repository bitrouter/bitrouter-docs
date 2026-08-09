import type { Metadata } from "next";
import "@/components/landing/zed/zed.css";
import "@/components/chat/chat.css";
import { ChatShell } from "@/components/chat/playground";
import { getHarnessAvailability } from "@/lib/harnesses.server";

export const metadata: Metadata = {
  title: "Agent playground — BitRouter",
  description:
    "Run any agent harness on any model — the AI SDK's own loop, Pi, Claude Code and more — through a single BitRouter endpoint.",
};

/**
 * Availability is deployment config, not build config. Without this the page
 * prerenders and bakes in whichever harnesses were switched on at build time,
 * so flipping `ENABLE_PI_HARNESS` on Railway would need a rebuild to show up.
 */
export const dynamic = "force-dynamic";

export default function ChatPage() {
  return <ChatShell harnesses={getHarnessAvailability()} />;
}
