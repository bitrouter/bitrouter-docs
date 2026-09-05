"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { getCalApi } from "@calcom/embed-react";

const NAMESPACE = "founder-call";

/**
 * Boots the Cal.com embed once per page. Effect-only, renders nothing — kept
 * separate from the button so a page with several CTAs configures the embed a
 * single time, and so the marketing pages themselves stay server components.
 */
export function CalBoot() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: NAMESPACE });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);
  return null;
}

/** Opens the founder-call embed. `location` tags the posthog event. */
export function FounderCallButton({
  className,
  location,
  children,
}: {
  className: string;
  location: string;
  children: React.ReactNode;
}) {
  return (
    <button
      data-cal-namespace={NAMESPACE}
      data-cal-link="kelsenliu/founder-call"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      className={className}
      onClick={() => posthog.capture("founder_call_booked", { location })}
    >
      {children}
    </button>
  );
}
