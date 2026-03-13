import { getTranslations } from "next-intl/server";
import { AlertTriangle, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModelTier = "opus" | "sonnet" | "haiku";

interface TimelineCall {
  call: number;
  taskType: string;
  model: string;
  modelTier: ModelTier;
  reason: string;
  cost: string | null;
  isEscalation?: boolean;
  isFailure?: boolean;
}

const timelineCalls: TimelineCall[] = [
  {
    call: 1,
    taskType: "Planning",
    model: "Opus",
    modelTier: "opus",
    reason: "architecture decision",
    cost: "$0.018",
  },
  {
    call: 2,
    taskType: "Code Gen",
    model: "Sonnet",
    modelTier: "sonnet",
    reason: "simple implementation, low complexity",
    cost: "$0.003",
  },
  {
    call: 3,
    taskType: "Tool Result",
    model: "Haiku",
    modelTier: "haiku",
    reason: "processing grep output",
    cost: "$0.001",
  },
  {
    call: 4,
    taskType: "Code Gen",
    model: "Sonnet",
    modelTier: "sonnet",
    reason: "2 consecutive tool failures",
    cost: null,
    isFailure: true,
  },
  {
    call: 5,
    taskType: "Code Gen",
    model: "Opus",
    modelTier: "opus",
    reason: "ESCALATED — context handoff",
    cost: "$0.022",
    isEscalation: true,
  },
  {
    call: 6,
    taskType: "Planning",
    model: "Opus",
    modelTier: "opus",
    reason: "security-sensitive deploy step",
    cost: "$0.019",
  },
];

const networkStats = {
  requests: "1.2M",
  agents: "3,400+",
  saved: "$2.4M",
};

const sessionMetrics = {
  total: "$0.074",
  saved: "60%",
  health: "94%",
};

const tierColors: Record<ModelTier, string> = {
  opus: "text-foreground",
  sonnet: "text-muted-foreground",
  haiku: "text-muted-foreground",
};

const tierBg: Record<ModelTier, string> = {
  opus: "bg-foreground",
  sonnet: "bg-muted-foreground",
  haiku: "bg-muted-foreground/50",
};

export async function RoutingTimeline() {
  const t = await getTranslations("Timeline");

  return (
    <Card className="mx-auto max-w-4xl gap-0 overflow-hidden rounded-lg border-border py-0">
      <CardContent className="p-0">
        {/* Network stats */}
        <div className="border-b border-border px-2 py-1.5 sm:px-3 sm:py-2">
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            <MetricBox label={t("networkRequests")} value={networkStats.requests} />
            <MetricBox label={t("networkAgents")} value={networkStats.agents} />
            <MetricBox label={t("networkSaved")} value={networkStats.saved} />
          </div>
        </div>

        {/* Timeline table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-1.5 font-medium sm:px-3 sm:py-2">{t("colNumber")}</th>
                <th className="px-2 py-1.5 font-medium sm:px-3 sm:py-2">{t("colTaskType")}</th>
                <th className="px-2 py-1.5 font-medium sm:px-3 sm:py-2">{t("colModel")}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">{t("colReason")}</th>
                <th className="px-2 py-1.5 text-right font-medium sm:px-3 sm:py-2">{t("colCost")}</th>
              </tr>
            </thead>
            <tbody>
              {timelineCalls.map((call) => (
                <tr
                  key={call.call}
                  className={cn(
                    "border-b border-border/30 transition-colors hover:bg-muted/20",
                    call.isEscalation && "border-l-2 border-l-foreground bg-muted/10",
                    call.isFailure && "border-l-2 border-l-muted-foreground bg-muted/10",
                  )}
                >
                  <td className="px-2 py-1.5 text-muted-foreground sm:px-3 sm:py-2">{call.call}</td>
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                    <Badge variant="outline" className="text-[10px] font-normal sm:text-xs">
                      {call.taskType}
                    </Badge>
                  </td>
                  <td className={cn("px-2 py-1.5 font-medium sm:px-3 sm:py-2", tierColors[call.modelTier])}>
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <span
                        className={cn("inline-block h-1.5 rounded-full", tierBg[call.modelTier])}
                        style={{
                          width:
                            call.modelTier === "opus"
                              ? "28px"
                              : call.modelTier === "sonnet"
                                ? "20px"
                                : "12px",
                        }}
                      />
                      {call.model}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                    <span className="flex items-center gap-1.5">
                      {call.isFailure && (
                        <AlertTriangle className="size-3 shrink-0 text-muted-foreground" />
                      )}
                      {call.isEscalation && (
                        <ArrowUp className="size-3 shrink-0 text-muted-foreground" />
                      )}
                      {call.reason}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums sm:px-3 sm:py-2">
                    {call.cost ?? <span className="text-muted-foreground">&mdash;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Session metrics */}
        <div className="border-t border-border px-2 py-1.5 sm:px-3 sm:py-2">
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            <MetricBox label={t("totalCost")} value={sessionMetrics.total} />
            <MetricBox label={t("saved")} value={sessionMetrics.saved} />
            <MetricBox label={t("healthScore")} value={sessionMetrics.health} />
          </div>
        </div>
      </CardContent>
    </Card>
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
