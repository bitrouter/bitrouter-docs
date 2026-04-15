import { setRequestLocale } from "next-intl/server";
import { CloudView } from "@/components/cloud/cloud-view";

export default async function CloudPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
      <CloudView />
    </div>
  );
}
