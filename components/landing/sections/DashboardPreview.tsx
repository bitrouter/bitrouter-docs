import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { ModelUsageChart, CostSparkline } from "./DashboardCharts";

const networkStats = {
  requests: "1.2M",
  agents: "3,400+",
  saved: "$2.4M",
};

const modelUsage = [
  { name: "Sonnet", value: 55 },
  { name: "Haiku", value: 20 },
  { name: "Opus", value: 15 },
  { name: "GPT-4o", value: 10 },
];

const recentRoutes = [
  { time: "2s ago", from: "gpt-4", to: "sonnet", reason: "cost", saved: "$0.04" },
  { time: "5s ago", from: "opus", to: "haiku", reason: "low complexity", saved: "$0.02" },
  { time: "12s ago", from: "gpt-4", to: "opus", reason: "escalation", saved: "—" },
  { time: "18s ago", from: "sonnet", to: "haiku", reason: "tool output", saved: "$0.01" },
  { time: "31s ago", from: "gpt-4", to: "sonnet", reason: "code gen", saved: "$0.03" },
];

const costTrend = [
  { day: "Mon", cost: 120 },
  { day: "Tue", cost: 95 },
  { day: "Wed", cost: 110 },
  { day: "Thu", cost: 78 },
  { day: "Fri", cost: 65 },
  { day: "Sat", cost: 52 },
  { day: "Sun", cost: 48 },
];

export async function DashboardPreview() {
  const t = await getTranslations("Dashboard");

  return (
    <div>
      <RuledSectionLabel label={t("sectionLabel")} />
      <Card className="mt-6 mx-auto max-w-4xl gap-0 overflow-hidden rounded-lg border-border py-0">
        <CardContent className="p-0">
          {/* Network stats */}
          <div className="border-b border-border px-2 py-1.5 sm:px-3 sm:py-2">
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              <MetricBox label={t("networkRequests")} value={networkStats.requests} />
              <MetricBox label={t("networkAgents")} value={networkStats.agents} />
              <MetricBox label={t("networkSaved")} value={networkStats.saved} />
            </div>
          </div>

          {/* Main content: chart + routes */}
          <div className="flex flex-col md:flex-row">
            {/* Left: charts */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-border p-3 sm:p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                {t("modelUsageTitle")}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-[140px] shrink-0">
                  <ModelUsageChart data={modelUsage} />
                </div>
                <div className="flex flex-col gap-1.5">
                  {modelUsage.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block h-2 w-2"
                        style={{
                          backgroundColor: i % 2 === 0 ? "var(--foreground)" : "var(--muted-foreground)",
                          opacity: 1 - i * 0.15,
                        }}
                      />
                      <span className="font-mono text-muted-foreground">{m.name}</span>
                      <span className="font-mono text-foreground">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  {t("costTrendTitle")}
                </p>
                <CostSparkline data={costTrend} />
              </div>
            </div>

            {/* Right: recent routes */}
            <div className="md:w-[45%] p-3 sm:p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                {t("recentRoutesTitle")}
              </p>
              <div className="flex flex-col gap-0">
                {recentRoutes.map((route, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 border-b border-border/30 py-1.5 last:border-0 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground/60 font-mono shrink-0 w-12">
                        {route.time}
                      </span>
                      <span className="font-mono text-muted-foreground truncate">
                        {route.from} → {route.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {route.reason}
                      </Badge>
                      <span className="font-mono text-foreground w-10 text-right">{route.saved}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border px-2 py-1.5 sm:px-3 sm:py-2.5">
      <div className="text-base font-bold tabular-nums sm:text-lg">{value}</div>
      <div className="text-[10px] text-muted-foreground sm:text-[11px]">{label}</div>
    </div>
  );
}
