import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/sections/Hero";
import { Features } from "@/components/landing/sections/Features";
import { Benchmarks } from "@/components/landing/sections/Benchmarks";
import { Setup } from "@/components/landing/sections/Setup";
import { Footer } from "@/components/landing/sections/Footer";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Hero />
        <Features />
        <Benchmarks />
        <Setup />
      </div>
      <Footer />
    </main>
  );
}
