import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { MonoLanding } from "@/components/landing/mono/landing";
import { getChangelogItems } from "@/lib/source";
import { sortByDateDesc } from "@/lib/changelog";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://bitrouter.ai",
  },
};

export default function Home() {
  setRequestLocale("en");

  // Latest few changelog entries for the landing "shipping log" strip — same
  // source as /changelog, sorted newest-first.
  const changelog = sortByDateDesc(getChangelogItems("en"))
    .slice(0, 4)
    .map((it) => ({
      url: it.url,
      title: it.title,
      version: it.version,
      date: it.date,
      breaking: it.breaking,
    }));

  return (
    <div className="br-mono">
      <MonoLanding changelog={changelog} />
    </div>
  );
}
