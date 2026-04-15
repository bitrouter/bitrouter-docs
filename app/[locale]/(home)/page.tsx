import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/sections/Hero";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1">
        <Hero />
      </div>
    </div>
  );
}
