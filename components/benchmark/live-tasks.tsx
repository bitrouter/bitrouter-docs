"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

type TaskStatus = "running" | "completed" | "failed";

interface Subtask {
  label: string;
  model: string;
  durationMs: number;
  tokens: number;
  status: TaskStatus;
}

interface LiveTask {
  id: string;
  runtime: string;
  model: string;
  isBitrouter: boolean;
  taskName: string;
  status: TaskStatus;
  startedAt: number; // timestamp
  durationMs: number;
  calls: number;
  tokens: number;
  cost: number;
  performance: number | null; // null if running or failed
  subtasks: Subtask[];
}

// ── Mock task templates ──────────────────────────────────

const TASK_NAMES = [
  "refactor auth middleware",
  "add CSV export endpoint",
  "fix pagination off-by-one",
  "migrate DB schema v12",
  "implement rate limiter",
  "add WebSocket reconnect",
  "fix CORS preflight bug",
  "extract shared utils",
  "add retry logic to fetcher",
  "update OpenAPI spec",
  "fix memory leak in cache",
  "add e2e login tests",
  "refactor error handling",
  "implement search index",
  "fix timezone conversion",
];

const CONFIGS = [
  { runtime: "openclaw", model: "bitrouter/auto", isBitrouter: true },
  { runtime: "openclaw", model: "sonnet 4", isBitrouter: false },
  { runtime: "claude-code", model: "opus 4", isBitrouter: false },
  { runtime: "cursor", model: "gpt-4o", isBitrouter: false },
  { runtime: "opencode", model: "sonnet 4", isBitrouter: false },
  { runtime: "aider", model: "deepseek-r1", isBitrouter: false },
];

const SUBTASK_LABELS = [
  "planning",
  "code generation",
  "tool call: grep",
  "tool call: read",
  "code generation",
  "tool call: edit",
  "verification",
  "test execution",
  "code review",
  "final commit",
];

const SUBTASK_MODELS = [
  "opus 4",
  "sonnet 4",
  "haiku 4",
  "gpt-4o",
  "deepseek-r1",
];

function randomSubtasks(count: number, parentModel: string): Subtask[] {
  return Array.from({ length: count }, (_, i) => {
    const isBitrouter = parentModel === "bitrouter/auto";
    const model = isBitrouter
      ? SUBTASK_MODELS[Math.floor(Math.random() * 3)] // opus/sonnet/haiku
      : parentModel;
    return {
      label: SUBTASK_LABELS[i % SUBTASK_LABELS.length],
      model,
      durationMs: 2000 + Math.floor(Math.random() * 15000),
      tokens: 200 + Math.floor(Math.random() * 3000),
      status: "completed" as TaskStatus,
    };
  });
}

function generateTask(id: number, forceStatus?: TaskStatus): LiveTask {
  const config = CONFIGS[Math.floor(Math.random() * CONFIGS.length)];
  const taskName = TASK_NAMES[Math.floor(Math.random() * TASK_NAMES.length)];
  const status = forceStatus ?? "completed";
  const calls = status === "running"
    ? 2 + Math.floor(Math.random() * 8)
    : 4 + Math.floor(Math.random() * 20);
  const tokens = calls * (400 + Math.floor(Math.random() * 1200));
  const durationMs = status === "running"
    ? 10000 + Math.floor(Math.random() * 120000)
    : 30000 + Math.floor(Math.random() * 300000);

  const costPerToken = config.isBitrouter ? 0.000004 : config.model === "opus 4" ? 0.000015 : 0.000006;
  const cost = +(tokens * costPerToken).toFixed(2);

  const subtasks = randomSubtasks(calls, config.model);
  if (status === "running" && subtasks.length > 0) {
    subtasks[subtasks.length - 1].status = "running";
  }

  return {
    id: `task-${id}`,
    runtime: config.runtime,
    model: config.model,
    isBitrouter: config.isBitrouter,
    taskName,
    status,
    startedAt: Date.now() - durationMs,
    durationMs,
    calls,
    tokens,
    cost,
    performance: status === "completed" ? 70 + Math.floor(Math.random() * 28) : null,
    subtasks,
  };
}

function generateInitialTasks(): LiveTask[] {
  const tasks: LiveTask[] = [];
  // 2 running tasks
  tasks.push(generateTask(1, "running"));
  tasks.push(generateTask(2, "running"));
  // 10 completed / 1 failed
  for (let i = 3; i <= 13; i++) {
    tasks.push(generateTask(i, i === 7 ? "failed" : "completed"));
  }
  return tasks;
}

// ── Formatting helpers ───────────────────────────────────

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs.toString().padStart(2, "0")}s`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ── Component ────────────────────────────────────────────

export function LiveTasks() {
  const [tasks, setTasks] = useState<LiveTask[]>(() => generateInitialTasks());
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const taskCounter = useRef(14);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tick running task durations every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulate new tasks appearing
  useEffect(() => {
    const id = setInterval(() => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.status !== "running") return t;
          // 30% chance a running task completes each cycle
          if (Math.random() < 0.3) {
            return {
              ...t,
              status: Math.random() < 0.1 ? ("failed" as const) : ("completed" as const),
              durationMs: Date.now() - t.startedAt,
              performance: Math.random() < 0.1 ? null : 70 + Math.floor(Math.random() * 28),
              subtasks: t.subtasks.map((s) => ({ ...s, status: "completed" as const })),
            };
          }
          // Otherwise update duration
          return {
            ...t,
            durationMs: Date.now() - t.startedAt,
            calls: t.calls + (Math.random() < 0.4 ? 1 : 0),
            tokens: t.tokens + Math.floor(Math.random() * 500),
          };
        });

        // Maybe add a new task
        const runningCount = updated.filter((t) => t.status === "running").length;
        if (runningCount < 3 && Math.random() < 0.5) {
          taskCounter.current++;
          const newTask = generateTask(taskCounter.current, "running");
          updated.unshift(newTask);
        }

        // Keep only most recent 15
        return updated.slice(0, 15);
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const runningCount = tasks.filter((t) => t.status === "running").length;
  const completedToday = tasks.filter((t) => t.status === "completed").length;

  // Sort: running first, then by most recent
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === "running" && b.status !== "running") return -1;
    if (b.status === "running" && a.status !== "running") return 1;
    return b.startedAt - a.startedAt;
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium">Live Tasks</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {runningCount} running · {completedToday} completed
        </span>
      </div>

      {/* Task list */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="divide-y divide-border/40">
          {sorted.map((task) => {
            const isExpanded = expandedTask === task.id;
            const elapsed = task.status === "running"
              ? Date.now() - task.startedAt
              : task.durationMs;

            return (
              <div
                key={task.id}
                className={cn(
                  "px-3 py-2.5 transition-colors cursor-pointer hover:bg-muted/10",
                  task.isBitrouter && "bg-foreground/[0.03]",
                  isExpanded && "bg-muted/10",
                )}
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                {/* Status + runtime + duration */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <StatusIndicator status={task.status} />
                    <span className="text-[11px] text-muted-foreground truncate">
                      {task.runtime} + {task.model}
                    </span>
                    {task.isBitrouter && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 font-normal border-foreground/30 shrink-0"
                      >
                        auto
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                    {formatDuration(elapsed)}
                  </span>
                </div>

                {/* Task name */}
                <div className="mt-1 text-xs truncate">{task.taskName}</div>

                {/* Metrics row */}
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                  <span>{task.calls} calls</span>
                  <span>{formatTokens(task.tokens)} tok</span>
                  <span>${task.cost.toFixed(2)}</span>
                  {task.performance !== null && (
                    <span className="ml-auto">{task.performance}%</span>
                  )}
                </div>

                {/* Expanded subtasks */}
                {isExpanded && (
                  <div className="mt-2 border-t border-border/30 pt-2 space-y-1">
                    {task.subtasks.map((sub, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[10px] text-muted-foreground"
                      >
                        <StatusDot status={sub.status} />
                        <span className="w-24 truncate">{sub.label}</span>
                        <span className="text-muted-foreground/60">{sub.model}</span>
                        <span className="ml-auto tabular-nums">
                          {formatTokens(sub.tokens)} tok
                        </span>
                        <span className="tabular-nums w-10 text-right">
                          {formatDuration(sub.durationMs)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Status indicators ────────────────────────────────────

function StatusIndicator({ status }: { status: TaskStatus }) {
  if (status === "running") {
    return (
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/60 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/60" />
      </span>
    );
  }
  if (status === "completed") {
    return <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-foreground/40" />;
  }
  return <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />;
}

function StatusDot({ status }: { status: TaskStatus }) {
  if (status === "running") {
    return (
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/60 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
        status === "completed" ? "bg-foreground/30" : "bg-muted-foreground/30",
      )}
    />
  );
}
