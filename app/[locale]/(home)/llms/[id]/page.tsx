import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/landing/sections/Footer";
import { LlmDetailView } from "@/components/llms/llm-detail-view";

export default async function LlmDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6">
        <LlmDetailView />
      </section>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
