"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import posthog from "posthog-js";

export function CalButton({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "founder-call" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <button
      data-cal-namespace="founder-call"
      data-cal-link="kelsenliu/founder-call"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      className="underline underline-offset-4 decoration-rule hover:decoration-amber hover:text-amber transition-colors cursor-pointer"
      onClick={() => posthog.capture("founder_call_booked")}
    >
      {children}
    </button>
  );
}
