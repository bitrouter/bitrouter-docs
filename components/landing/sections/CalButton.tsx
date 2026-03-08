"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalButton({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "founder-meeting" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <button
      data-cal-namespace="founder-meeting"
      data-cal-link="kelsenliu/founder-meeting"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      className="underline underline-offset-4 hover:text-foreground transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
