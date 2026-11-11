"use client";

import type { ReactNode } from "react";
import { Info, X } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

export function MarketInfo({ title, children }: { title: string; children: ReactNode }) {
  return <Popover.Root>
    <Popover.Trigger asChild><button type="button" className="market-metric-info" aria-label={`About ${title}`}><Info size={13} aria-hidden="true" /></button></Popover.Trigger>
    <Popover.Portal><Popover.Content className="market-metric-popover" side="bottom" align="start" sideOffset={10} collisionPadding={16} aria-label={`${title} definition`}>
      <div className="market-metric-popover-heading"><h3>{title}</h3><Popover.Close className="market-metric-close" aria-label="Close metric details"><X size={14} aria-hidden="true" /></Popover.Close></div>
      {children}
      <span className="market-metric-demo">Illustrative demo observations</span>
    </Popover.Content></Popover.Portal>
  </Popover.Root>;
}
