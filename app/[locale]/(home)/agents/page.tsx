import { setRequestLocale } from "next-intl/server";
import { AgentsView } from "@/components/agents/agents-view";

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <AgentsView />
    </div>
  );
}
