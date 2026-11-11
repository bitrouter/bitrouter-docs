import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublicIncident, isStatusPreview } from "@/lib/openstatus";
import { componentImpact, formatTime, reportStatus } from "../../presentation";

export const metadata: Metadata = { title: "Cloud incident" };

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const result = await getPublicIncident(id);
  if (result.kind === "missing") notFound();
  const report = result.kind === "report" ? result.report : undefined;
  const componentId = result.kind === "report" ? result.componentId : undefined;

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
      <Link href="/status" className="text-sm underline underline-offset-4">Back to system status</Link>
      {isStatusPreview() && (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Local preview using sample data.
        </p>
      )}
      <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">
        {report?.title ?? "Incident details unavailable"}
      </h1>
      {report && (
        <ol aria-label="Incident timeline" className="mt-7 divide-y divide-border border-y border-border">
          {report.updates.toSorted((a, b) => Date.parse(b.date) - Date.parse(a.date)).map((update) => {
            const impact = update.componentImpacts.find((item) => item.pageComponentId === componentId);
            const label = impact && componentImpact[impact.impact];
            return (
              <li key={update.id} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                  <h2 className="font-medium">
                    {reportStatus[update.status] ?? "Update"}
                  </h2>
                  <time dateTime={update.date} className="text-xs text-muted-foreground">
                    {formatTime(update.date)}
                  </time>
                </div>
                {label && <p className="mt-2 text-xs font-medium text-muted-foreground">Inference API impact · {label}</p>}
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{update.message}</p>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
