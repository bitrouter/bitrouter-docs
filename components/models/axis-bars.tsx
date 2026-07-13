/* AxisBars — the six capability axes as horizontal 0–100 bars, beside the
   radar on the model page. Mock axes get a `~` estimated marker. */

import * as React from "react";
import { AXES, AXIS_META, type AxisSet, type SourceSet } from "@/lib/model-capability";

export function AxisBars({
  values,
  sources,
}: {
  values: AxisSet;
  sources?: SourceSet;
}) {
  return (
    <div className="axbars">
      {AXES.map((ax) => (
        <div className="axbar" key={ax}>
          <span className="axbar-k">
            {AXIS_META[ax].label}
            {sources && sources[ax] === "mock" && (
              <i className="axbar-est" title="estimated">
                ~
              </i>
            )}
          </span>
          <span className="axbar-track">
            <i style={{ width: `${values[ax]}%` }} />
          </span>
          <span className="axbar-v">{values[ax]}</span>
        </div>
      ))}
    </div>
  );
}
