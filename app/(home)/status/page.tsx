import { ComponentEventType } from "@openstatus/sdk-node";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  getPublicIncident,
  getStatusSnapshot,
  isStatusPreview,
  isStatusStale,
  statusWindowDays,
} from "@/lib/openstatus";
import { componentImpact, currentStatus, dayStatus, formatDay, formatTime, noData, unknownStatus } from "./presentation";
import { ProbeDetails } from "./probe-details";
import { UptimeHistory } from "./uptime-history";

export const metadata: Metadata = {
  title: "Cloud status",
  description: "Current status, uptime history, and incident updates for the BitRouter Cloud inference API.",
  alternates: { canonical: "https://bitrouter.ai/status" },
};

async function ActiveIncidentUpdate({ id }: { id: string }) {
  const result = await getPublicIncident(id);
  if (result.kind !== "report") return null;

  const updates = result.report.updates.toSorted((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const latest = updates[0];
  const impact = updates.flatMap((update) => update.componentImpacts)
    .find((item) => item.pageComponentId === result.componentId);
  const label = impact && componentImpact[impact.impact];
  if (!latest) return null;

  return (
    <>
      {label && <p className="mt-1 text-xs font-medium">Inference API impact · {label}</p>}
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{latest.message}</p>
    </>
  );
}

export default async function StatusPage() {
  await connection();
  const snapshot = await getStatusSnapshot();
  const stale = snapshot ? isStatusStale(snapshot.fetchedAt) : false;
  const status = snapshot && !stale
    ? currentStatus[snapshot.status] ?? unknownStatus
    : unknownStatus;
  const days = snapshot?.days ?? [];
  const incidents = snapshot?.incidents ?? [];
  const activeIncidents = incidents.filter((incident) => incident.active);
  const resolvedIncidents = incidents.filter((incident) => !incident.active);
  const now = Date.now();
  const maintenances = snapshot?.maintenances.filter((item) => Date.parse(item.to) > now) ?? [];

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      {isStatusPreview() && (
        <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Local preview using sample data.
        </p>
      )}

      <section aria-labelledby="inference-api" className="rounded-xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 id="inference-api" className="text-xl font-semibold tracking-tight">Inference API</h1>
            <p className="mt-1 text-sm text-muted-foreground">Production inference requests</p>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm font-medium">
            <span aria-hidden="true" className={`size-2 rounded-full ${status.color}`} />
            {status.label}
          </p>
        </div>

        {days.length > 0 && (
          <div className="mt-7">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium">{statusWindowDays}-day probe availability</p>
              <p className="font-mono text-sm tabular-nums">
                {snapshot?.uptime == null ? "No data" : `${snapshot.uptime.toFixed(2)}%`}
              </p>
            </div>
            <UptimeHistory days={days.map((day) => {
              const style = dayStatus[day.status] ?? noData;
              return {
                ...day,
                label: formatDay(day.date),
                status: style.label,
                color: style.color,
                events: day.events.map(({ id, name, type }) => ({
                  id,
                  name,
                  kind: type === ComponentEventType.REPORT
                    ? "Incident"
                    : type === ComponentEventType.MAINTENANCE ? "Maintenance" : "Probe incident",
                  href: type === ComponentEventType.REPORT ? `/status/incidents/${encodeURIComponent(id)}` : undefined,
                })),
              };
            })} />
          </div>
        )}

        {snapshot && !stale && (
          <Suspense fallback={<p className="mt-4 text-xs text-muted-foreground">Loading probe details…</p>}>
            <ProbeDetails monitorId={snapshot.monitorId} />
          </Suspense>
        )}

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          {snapshot ? (
            <>
              {stale ? "Status may be out of date. Last updated " : "Last updated "}
              <time dateTime={snapshot.fetchedAt}>{formatTime(snapshot.fetchedAt)}</time>.
            </>
          ) : "Status data is temporarily unavailable."}
        </p>
      </section>

      {activeIncidents.length > 0 && (
        <section aria-label="Ongoing incidents" className="mt-5 space-y-3">
          {activeIncidents.map((incident) => (
            <article key={incident.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
              <p className="text-xs font-semibold uppercase tracking-wide">Ongoing incident</p>
              <h2 className="mt-1 text-sm font-medium">
                <Link className="underline underline-offset-4" href={`/status/incidents/${encodeURIComponent(incident.id)}`}>
                  {incident.title}
                </Link>
              </h2>
              {!stale && (
                <Suspense fallback={null}>
                  <ActiveIncidentUpdate id={incident.id} />
                </Suspense>
              )}
              <time dateTime={incident.updatedAt} className="mt-2 block text-xs">{formatTime(incident.updatedAt)}</time>
            </article>
          ))}
        </section>
      )}

      {maintenances.length > 0 && (
        <section aria-label="Maintenance windows" className="mt-5 space-y-3">
          {maintenances.map((item) => (
            <article key={item.id} className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950">
              <p className="text-xs font-semibold uppercase tracking-wide">
                {Date.parse(item.from) <= now ? "Maintenance in progress" : "Scheduled maintenance"}
              </p>
              <h2 className="mt-1 text-sm font-medium">{item.title}</h2>
              <p className="mt-1 text-xs">
                <time dateTime={item.from}>{formatTime(item.from)}</time> to <time dateTime={item.to}>{formatTime(item.to)}</time>
              </p>
              {item.message && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{item.message}</p>}
            </article>
          ))}
        </section>
      )}

      <section aria-labelledby="incidents" className="mt-10">
        <h2 id="incidents" className="text-xl font-semibold tracking-tight">Incident history</h2>
        {resolvedIncidents.length > 0 ? (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {resolvedIncidents.map((incident) => (
              <li key={incident.id}>
                <Link
                  href={`/status/incidents/${encodeURIComponent(incident.id)}`}
                  className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-sm py-4 focus-visible:outline-2"
                >
                  <span>
                    <span className="block font-medium underline-offset-4 hover:underline">{incident.title}</span>
                    <time dateTime={incident.updatedAt} className="mt-1 block text-xs text-muted-foreground">
                      {formatTime(incident.updatedAt)}
                    </time>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Resolved</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {snapshot && !stale ? "No recent resolved incidents reported." : "Incident history is temporarily unavailable."}
          </p>
        )}
      </section>
    </main>
  );
}
