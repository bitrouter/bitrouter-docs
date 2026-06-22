"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

/**
 * Inline founder-call booking widget — the same Cal.com event as
 * {@link CalButton} (`kelsenliu/founder-call`), embedded inline instead of as a
 * popup trigger. Registered as an MDX component so docs pages can drop it in
 * with `<CalInline />`.
 */
export function CalInline() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "founder-call" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <Cal
      namespace="founder-call"
      calLink="kelsenliu/founder-call"
      style={{ width: "100%", height: "600px", overflow: "scroll" }}
      config={{ layout: "month_view" }}
    />
  );
}
