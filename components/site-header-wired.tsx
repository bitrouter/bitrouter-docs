"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader, SiteHeaderBody } from "@/components/header";
import { AISearchBar } from "@/components/ai/search";

export function WebHeader() {
  const pathname = usePathname();
  return <SiteHeader key={pathname} pathname={pathname} />;
}

/** Keep notebook search and the mobile documentation drawer reachable. */
export function WebHeaderBody({ leadingSlot }: { leadingSlot?: ReactNode }) {
  const pathname = usePathname();
  return <SiteHeaderBody key={pathname} pathname={pathname} leadingSlot={leadingSlot} searchSlot={<AISearchBar />} />;
}
