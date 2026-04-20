import { setRequestLocale } from "next-intl/server";
import { AgentDetailView } from "@/components/agents/agent-detail-view";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6">
        <AgentDetailView />
      </section>
    </div>
  );
}
