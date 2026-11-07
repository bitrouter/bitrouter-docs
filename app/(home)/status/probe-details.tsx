import { getProbeDetails, probeSummaryDays } from "@/lib/openstatus";
import { formatTime, probeLocation, probeStatus, unknownStatus } from "./presentation";

export async function ProbeDetails({ monitorId }: { monitorId: string }) {
  const { lastCheckAt, latency, regions } = await getProbeDetails(monitorId);

  return (
    <>
      <p className="mt-4 text-xs text-muted-foreground">
        {lastCheckAt ? <>Last probe <time dateTime={lastCheckAt}>{formatTime(lastCheckAt)}</time>.</> : "Last probe time unavailable."}
      </p>
      <section aria-labelledby="probe-details" className="mt-5 border-t border-border pt-4">
        <h2 id="probe-details" className="text-sm font-medium">Probe regions and response times</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <section aria-label="Probe locations">
            <h3 className="text-sm font-medium">Probe locations</h3>
            <p className="mt-1 text-xs text-muted-foreground">Where OpenStatus sent the checks from.</p>
            {regions.length > 0 ? (
              <dl className="mt-2 space-y-2 text-xs">
                {regions.map((item) => {
                  const status = probeStatus[item.status] ?? unknownStatus;
                  return (
                    <div key={item.region} className="flex flex-wrap items-center justify-between gap-2">
                      <dt>{probeLocation(item.region)}</dt>
                      <dd className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${status.color}`} />
                        {status.label}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : <p className="mt-2 text-xs text-muted-foreground">Regional probe status unavailable.</p>}
          </section>
          <section aria-label="Probe response time">
            <h3 className="text-sm font-medium">Probe response time</h3>
            <p className="mt-1 text-xs text-muted-foreground">Synthetic requests over the last {probeSummaryDays} days.</p>
            {latency ? (
              <dl className="mt-2 space-y-2 text-xs">
                {Object.entries(latency).map(([percentile, ms]) => (
                  <div key={percentile} className="flex justify-between gap-2">
                    <dt className="uppercase text-muted-foreground">{percentile}</dt>
                    <dd className="font-mono tabular-nums">{ms.toLocaleString("en")} ms</dd>
                  </div>
                ))}
              </dl>
            ) : <p className="mt-2 text-xs text-muted-foreground">Probe response times unavailable.</p>}
          </section>
        </div>
      </section>
    </>
  );
}
