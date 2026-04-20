import { setRequestLocale } from "next-intl/server";
import { ToolDetailView } from "@/components/tools/tool-detail-view";

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6">
        <ToolDetailView />
      </section>
    </div>
  );
}
