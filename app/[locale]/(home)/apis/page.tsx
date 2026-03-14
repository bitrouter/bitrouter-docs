import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/landing/sections/Footer";
import { ApisView } from "@/components/apis/apis-view";

export default async function ApisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:h-[calc(100vh-4rem)] md:overflow-hidden">
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6 md:min-h-0 md:pt-4 md:pb-2">
        <ApisView />
      </section>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
