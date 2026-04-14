import { setRequestLocale } from "next-intl/server";
import { LlmsView } from "@/components/llms/llms-view";

export default async function LlmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <LlmsView />
    </div>
  );
}
