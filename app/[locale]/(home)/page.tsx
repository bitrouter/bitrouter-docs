import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/sections/Hero";
import { Footer } from "@/components/landing/sections/Footer";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Hero />
      </div>
      <Footer />
    </main>
  );
}
