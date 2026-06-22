import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { MonoLanding } from "@/components/landing/mono/landing";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://bitrouter.ai",
  },
};

export default function Home() {
  setRequestLocale("en");

  return (
    <div className="br-mono">
      <MonoLanding />
    </div>
  );
}
