import type { Metadata } from "next";
import "@/components/landing/zed/zed.css";
import "@/components/chat/chat.css";
import { ChatShell } from "@/components/chat/playground";
import { getHarnessAvailability } from "@/lib/harnesses.server";
import { credentialMode } from "@/lib/playground-credential";

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
  return (
    <ChatShell
      harnesses={getHarnessAvailability()}
      // Whether this deployment bills a signed-in visitor. Only the mode
      // crosses to the client — who the visitor *is* is read there from the
      // shared console session, and settled for real by the route handler.
      requiresAuth={credentialMode() === "session"}
    />
  );
}
