import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentDayStatus, ComponentEventType, OverallStatus, PageAccessType, StatusReportStatus } from "@openstatus/sdk-node";

const rpc = vi.hoisted(() => ({ overview: vi.fn(), daily: vi.fn(), summary: vi.fn(), regions: vi.fn(), report: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (read: unknown) => read }));
vi.mock("@openstatus/sdk-node", async (importOriginal) => ({
  ...await importOriginal<typeof import("@openstatus/sdk-node")>(),
  createOpenStatusClient: () => ({
    statusPage: { v1: { StatusPageService: { getStatusPageOverview: rpc.overview, getPageComponentDailySummary: rpc.daily } } },
    monitor: { v1: { MonitorService: { getMonitorSummary: rpc.summary, getMonitorStatus: rpc.regions } } },
    statusReport: { v1: { StatusReportService: { getStatusReport: rpc.report } } },
  }),
}));

import { getProbeDetails, getPublicIncident, getStatusSnapshot, isStatusStale } from "./openstatus";

function publicOverview() {
  return {
    statusPage: { id: "public-page", accessType: PageAccessType.PUBLIC },
    components: [{ id: "inference", monitorId: "inference-monitor" }],
    componentStatuses: [{ componentId: "inference", status: OverallStatus.OPERATIONAL }],
    statusReports: [
      { id: "public-incident", title: "Inference incident", pageComponentIds: ["inference"], status: StatusReportStatus.RESOLVED, createdAt: "2026-11-01T00:00:00Z", updatedAt: "2026-11-01T02:00:00Z" },
      { id: "other-component-incident", title: "Other component", pageComponentIds: ["other"], status: StatusReportStatus.INVESTIGATING, createdAt: "2026-11-01T00:00:00Z", updatedAt: "2026-11-01T01:00:00Z" },
    ],
    maintenances: [
      { id: "visible-maintenance", title: "Maintenance", pageId: "public-page", pageComponentIds: ["inference"], from: "2026-11-12T00:00:00Z", to: "2026-11-12T01:00:00Z" },
      { id: "private-maintenance", title: "Private", pageId: "private-page", pageComponentIds: [], from: "2026-11-12T00:00:00Z", to: "2026-11-12T01:00:00Z" },
    ],
  };
}

describe("public OpenStatus data boundary", () => {
  beforeEach(() => {
    vi.stubEnv("OPENSTATUS_API_KEY", "test-only-key");
    vi.stubEnv("OPENSTATUS_PAGE_ID", "public-page");
    vi.stubEnv("OPENSTATUS_COMPONENT_ID", "inference");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const call of Object.values(rpc)) call.mockReset();
    rpc.overview.mockResolvedValue(publicOverview());
    rpc.daily.mockResolvedValue({ components: [{ componentId: "inference", buckets: [
      { day: "2026-11-01", status: ComponentDayStatus.DEGRADED, count: BigInt(10), ok: BigInt(8), degraded: BigInt(1), error: BigInt(1) },
      { day: "2026-11-02", status: ComponentDayStatus.OPERATIONAL, count: BigInt(0), ok: BigInt(0), degraded: BigInt(0), error: BigInt(0) },
    ], events: [{ id: "public-incident", name: "Inference incident", type: ComponentEventType.REPORT, from: "2026-11-01T00:00:00Z", to: "2026-11-01T02:00:00Z" }] }] });
    rpc.summary.mockResolvedValue({ lastPingAt: "2026-11-01T02:00:00Z", totalSuccessful: BigInt(8), totalDegraded: BigInt(1), totalFailed: BigInt(1), p50: BigInt(100), p75: BigInt(150), p90: BigInt(200), p95: BigInt(250), p99: BigInt(500) });
    rpc.regions.mockResolvedValue({ regions: [{ region: 1, status: 1 }] });
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("does not contact OpenStatus when configuration is incomplete", async () => {
    vi.stubEnv("OPENSTATUS_COMPONENT_ID", "");
    expect(await getStatusSnapshot()).toBeNull();
    expect(rpc.overview).not.toHaveBeenCalled();
  });

  it.each(["private", "wrong-page", "static-component"])("rejects %s data", async (mode) => {
    const overview = publicOverview();
    if (mode === "private") overview.statusPage.accessType = PageAccessType.PASSWORD_PROTECTED;
    if (mode === "wrong-page") overview.statusPage.id = "another-page";
    if (mode === "static-component") overview.components[0].monitorId = "";
    rpc.overview.mockResolvedValue(overview);
    expect(await getStatusSnapshot()).toBeNull();
  });

  it("scopes data to the configured component and keeps empty days unknown", async () => {
    const snapshot = await getStatusSnapshot();
    expect(snapshot).toMatchObject({ status: OverallStatus.OPERATIONAL, uptime: 90 });
    expect(snapshot!.days[0].events.map((event) => event.id)).toEqual(["public-incident"]);
    expect(snapshot!.days[1].status).toBe(ComponentDayStatus.EMPTY);
    expect(snapshot!.incidents.map((incident) => incident.id)).toEqual(["public-incident"]);
    expect(snapshot!.maintenances.map((item) => item.id)).toEqual(["visible-maintenance"]);
  });

  it("returns unavailable instead of inventing healthy data after a source failure", async () => {
    rpc.daily.mockRejectedValue(new Error("unavailable"));
    expect(await getStatusSnapshot()).toBeNull();
    expect(await getPublicIncident("public-incident")).toEqual({ kind: "unavailable" });
  });

  it("never fetches an incident absent from the configured public snapshot", async () => {
    expect(await getPublicIncident("other-component-incident")).toEqual({ kind: "missing" });
    expect(rpc.report).not.toHaveBeenCalled();
    rpc.report.mockResolvedValue({ statusReport: { id: "public-incident", updates: [] } });
    expect(await getPublicIncident("public-incident")).toMatchObject({ kind: "report", componentId: "inference" });
  });

  it("keeps resolved public history readable and rejects mismatched report responses", async () => {
    rpc.report.mockResolvedValue({ statusReport: { id: "another-report" } });
    expect(await getPublicIncident("public-incident")).toEqual({ kind: "missing" });
  });

  it("preserves region data when the summary call fails", async () => {
    rpc.summary.mockRejectedValue(new Error("summary unavailable"));
    expect(await getProbeDetails("inference-monitor")).toEqual({ lastCheckAt: null, latency: null, regions: [{ region: 1, status: 1 }] });
  });

  it("preserves latency when regional checks fail", async () => {
    rpc.regions.mockRejectedValue(new Error("regions unavailable"));
    expect(await getProbeDetails("inference-monitor")).toMatchObject({ lastCheckAt: "2026-11-01T02:00:00Z", latency: { p50: 100, p99: 500 }, regions: [] });
  });

  it("does not render fabricated latency when no probes were recorded", async () => {
    rpc.summary.mockResolvedValue({ lastPingAt: "", totalSuccessful: BigInt(0), totalDegraded: BigInt(0), totalFailed: BigInt(0) });
    expect(await getProbeDetails("inference-monitor")).toMatchObject({ lastCheckAt: null, latency: null });
  });

  it("marks old data stale", () => {
    expect(isStatusStale(new Date(Date.now() - 121_000).toISOString())).toBe(true);
    expect(isStatusStale(new Date().toISOString())).toBe(false);
  });
});
