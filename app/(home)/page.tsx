import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ZedLanding } from "@/components/landing/zed/landing";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://bitrouter.ai",
  },
};

export default function Home() {
  setRequestLocale("en");

  return <ZedLanding />;
}
