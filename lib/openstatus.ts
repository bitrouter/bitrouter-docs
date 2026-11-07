import "server-only";
import {
  ComponentDayStatus,
  ComponentEventType,
  createOpenStatusClient,
  OverallStatus,
  PageAccessType,
  StatusReportStatus,
  TimeRange,
} from "@openstatus/sdk-node";
import { unstable_cache } from "next/cache";

export const statusWindowDays = 30;
export const probeSummaryDays = 7;
const cacheSeconds = 60;
const staleAfterMs = 120_000;
const rpcOptions = { timeoutMs: 5_000 };

function getClient() {
  return createOpenStatusClient({ apiKey: process.env.OPENSTATUS_API_KEY });
}

const readSnapshot = unstable_cache(
  async (pageId: string, componentId: string) => {
    const { StatusPageService } = getClient().statusPage.v1;
    const [overview, summary] = await Promise.all([
      StatusPageService.getStatusPageOverview({ id: pageId }, rpcOptions),
      StatusPageService.getPageComponentDailySummary(
        {
          identifier: { case: "id", value: pageId },
          componentIds: [componentId],
          days: statusWindowDays,
        },
        rpcOptions,
      ),
    ]);

    const component = overview.components.find((item) => item.id === componentId);
    if (
      overview.statusPage?.id !== pageId ||
      overview.statusPage.accessType !== PageAccessType.PUBLIC ||
      !component?.monitorId
    ) {
      return null;
    }

    const history = summary.components.find((item) => item.componentId === componentId);
    const buckets = history?.buckets ?? [];
    const events = history?.events ?? [];
    let checks = BigInt(0);
    let availableChecks = BigInt(0);
    const days = buckets.map((bucket) => {
      checks += bucket.count;
      availableChecks += bucket.ok + bucket.degraded;
      const start = Date.parse(bucket.day);
      const end = start + 86_400_000;
      return {
        date: bucket.day,
        status: bucket.count ? bucket.status : ComponentDayStatus.EMPTY,
        total: Number(bucket.count),
        successful: Number(bucket.ok),
        degraded: Number(bucket.degraded),
        failed: Number(bucket.error),
        events: events
          .filter((event) => Date.parse(event.from) < end && (!event.to || Date.parse(event.to) > start))
          .map(({ id, name, type }) => ({ id, name, type })),
      };
    });

    // Both sources are scoped to the configured public page. The daily
    // summary can include resolved reports older than the overview's feed.
    const incidents = new Map(
      events
        .filter((event) => event.type === ComponentEventType.REPORT)
        .map((event) => [event.id, {
          id: event.id,
          title: event.name,
          updatedAt: event.to ?? event.from,
          active: !event.to,
        }] as const),
    );
    for (const report of overview.statusReports) {
      if (report.pageComponentIds.length && !report.pageComponentIds.includes(componentId)) continue;
      incidents.set(report.id, {
        id: report.id,
        title: report.title,
        updatedAt: report.updatedAt || report.createdAt,
        active: report.status !== StatusReportStatus.RESOLVED,
      });
    }

    return {
      componentId,
      monitorId: component.monitorId,
      status: overview.componentStatuses.find((item) => item.componentId === componentId)?.status
        ?? OverallStatus.UNKNOWN,
      uptime: checks ? (Number(availableChecks) / Number(checks)) * 100 : null,
      days,
      incidents: Array.from(incidents.values()).sort(
        (a, b) => Number(b.active) - Number(a.active) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      ),
      maintenances: overview.maintenances
        .filter((item) => item.pageId === pageId
          && (!item.pageComponentIds.length || item.pageComponentIds.includes(componentId)))
        .map(({ id, title, message, from, to }) => ({ id, title, message, from, to }))
        .sort((a, b) => Date.parse(a.from) - Date.parse(b.from)),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["public-openstatus-snapshot"],
  { revalidate: cacheSeconds },
);

export const getProbeDetails = unstable_cache(
  async (monitorId: string) => {
    const { MonitorService } = getClient().monitor.v1;
    const [summary, status] = await Promise.allSettled([
      MonitorService.getMonitorSummary(
        { id: monitorId, timeRange: TimeRange.TIME_RANGE_7D, regions: [] },
        rpcOptions,
      ),
      MonitorService.getMonitorStatus({ id: monitorId }, rpcOptions),
    ]);
    const metrics = summary.status === "fulfilled" ? summary.value : null;
    const regionalStatus = status.status === "fulfilled" ? status.value : null;
    const checks = metrics ? metrics.totalSuccessful + metrics.totalDegraded + metrics.totalFailed : BigInt(0);

    return {
      lastCheckAt: metrics && Number.isFinite(Date.parse(metrics.lastPingAt)) ? metrics.lastPingAt : null,
      latency: metrics && checks > BigInt(0) ? {
        p50: Number(metrics.p50),
        p75: Number(metrics.p75),
        p90: Number(metrics.p90),
        p95: Number(metrics.p95),
        p99: Number(metrics.p99),
      } : null,
      regions: regionalStatus?.regions.map(({ region, status }) => ({ region, status })) ?? [],
    };
  },
  ["public-openstatus-probe-details"],
  { revalidate: cacheSeconds },
);

export function isStatusPreview() {
  return process.env.NODE_ENV === "development" && process.env.OPENSTATUS_PREVIEW === "1";
}

export async function getStatusSnapshot() {
  const { OPENSTATUS_API_KEY, OPENSTATUS_PAGE_ID, OPENSTATUS_COMPONENT_ID } = process.env;
  if (!OPENSTATUS_API_KEY || !OPENSTATUS_PAGE_ID || !OPENSTATUS_COMPONENT_ID) return null;

  try {
    return await readSnapshot(OPENSTATUS_PAGE_ID, OPENSTATUS_COMPONENT_ID);
  } catch {
    console.warn("OpenStatus status snapshot could not be loaded");
    return null;
  }
}

export function isStatusStale(fetchedAt: string) {
  return Date.now() - Date.parse(fetchedAt) > staleAfterMs;
}

const readReport = unstable_cache(
  async (id: string) => {
    const { StatusReportService } = getClient().statusReport.v1;
    const { statusReport } = await StatusReportService.getStatusReport({ id }, rpcOptions);
    return statusReport ?? null;
  },
  ["public-openstatus-report"],
  { revalidate: cacheSeconds },
);

export async function getPublicIncident(id: string) {
  const snapshot = await getStatusSnapshot();
  if (!snapshot) return { kind: "unavailable" } as const;
  if (!snapshot.incidents.some((incident) => incident.id === id)) {
    return { kind: "missing" } as const;
  }
  if (isStatusStale(snapshot.fetchedAt)) return { kind: "unavailable" } as const;

  try {
    const statusReport = await readReport(id);
    return statusReport?.id === id
      ? { kind: "report", report: statusReport, componentId: snapshot.componentId } as const
      : { kind: "missing" } as const;
  } catch {
    console.warn("OpenStatus incident details could not be loaded");
    return { kind: "unavailable" } as const;
  }
}
