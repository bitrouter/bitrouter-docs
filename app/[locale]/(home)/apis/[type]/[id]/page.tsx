import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/landing/sections/Footer";
import { ApiDetailView } from "@/components/apis/api-detail-view";

export default async function ApiDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string; id: string }>;
}) {
  const { locale, type, id } = await params;
  setRequestLocale(locale);

  if (type !== "models" && type !== "tools") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <section className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6">
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold mb-2">Invalid Type</h1>
            <p className="text-muted-foreground">
              The API type must be &quot;models&quot; or &quot;tools&quot;.
            </p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6">
        <ApiDetailView />
      </section>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
