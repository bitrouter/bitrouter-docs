import {
  ComponentDayStatus,
  MonitorStatus,
  OverallStatus,
  PageComponentImpact,
  Region,
  StatusReportStatus,
} from "@openstatus/sdk-node";

type StatusStyle = { label: string; color: string };

export const currentStatus: Partial<Record<OverallStatus, StatusStyle>> = {
  [OverallStatus.OPERATIONAL]: { label: "Operational", color: "bg-emerald-600" },
  [OverallStatus.DEGRADED]: { label: "Degraded performance", color: "bg-amber-500" },
  [OverallStatus.PARTIAL_OUTAGE]: { label: "Partial outage", color: "bg-amber-500" },
  [OverallStatus.MAJOR_OUTAGE]: { label: "Major outage", color: "bg-red-600" },
  [OverallStatus.MAINTENANCE]: { label: "Under maintenance", color: "bg-sky-600" },
};

export const unknownStatus = { label: "Status unknown", color: "bg-neutral-400" };

export const dayStatus: Partial<Record<ComponentDayStatus, StatusStyle>> = {
  [ComponentDayStatus.OPERATIONAL]: { label: "Operational", color: "bg-emerald-500" },
  [ComponentDayStatus.DEGRADED]: { label: "Degraded", color: "bg-amber-500" },
  [ComponentDayStatus.DOWN]: { label: "Outage", color: "bg-red-500" },
  [ComponentDayStatus.MAINTENANCE]: { label: "Maintenance", color: "bg-sky-500" },
};

export const noData = { label: "No data", color: "bg-neutral-200" };

export const reportStatus: Partial<Record<StatusReportStatus, string>> = {
  [StatusReportStatus.INVESTIGATING]: "Investigating",
  [StatusReportStatus.IDENTIFIED]: "Identified",
  [StatusReportStatus.MONITORING]: "Monitoring",
  [StatusReportStatus.RESOLVED]: "Resolved",
};

export const componentImpact: Partial<Record<PageComponentImpact, string>> = {
  [PageComponentImpact.OPERATIONAL]: "Operational",
  [PageComponentImpact.DEGRADED_PERFORMANCE]: "Degraded performance",
  [PageComponentImpact.PARTIAL_OUTAGE]: "Partial outage",
  [PageComponentImpact.MAJOR_OUTAGE]: "Major outage",
};

export const probeStatus: Partial<Record<MonitorStatus, StatusStyle>> = {
  [MonitorStatus.ACTIVE]: { label: "Active", color: "bg-emerald-600" },
  [MonitorStatus.DEGRADED]: { label: "Degraded", color: "bg-amber-500" },
  [MonitorStatus.ERROR]: { label: "Failing", color: "bg-red-600" },
};

const locationNames: Partial<Record<Region, string>> = {
  [Region.FLY_AMS]: "Amsterdam (AMS)",
  [Region.FLY_IAD]: "Ashburn (IAD)",
  [Region.FLY_SJC]: "San Jose (SJC)",
};

export function probeLocation(region: Region) {
  if (!Region[region] || region === Region.UNSPECIFIED) return "Unknown location";
  return locationNames[region] ?? Region[region].replace(/^(FLY|KOYEB|RAILWAY)_/, "").replaceAll("_", " ");
}

const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const fullDate = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export const formatDay = (date: string) => shortDate.format(new Date(date));
export const formatTime = (date: string) => `${fullDate.format(new Date(date))} UTC`;
