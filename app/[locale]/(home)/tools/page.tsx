import { setRequestLocale } from "next-intl/server";
import { ToolsView } from "@/components/tools/tools-view";

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <ToolsView />
    </div>
  );
}
