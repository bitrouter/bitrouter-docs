"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

type Day = {
  date: string;
  label: string;
  status: string;
  color: string;
  total: number;
  successful: number;
  degraded: number;
  failed: number;
  events: { id: string; name: string; kind: string; href?: string }[];
};

const numberFormat = new Intl.NumberFormat("en");

export function UptimeHistory({ days }: { days: Day[] }) {
  const panelId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState(days.length - 1);
  const [hovered, setHovered] = useState<number>();
  const index = hovered ?? selected;
  const day = days[index];

  function selectDay(next: number, focus = false) {
    setHovered(undefined);
    setSelected(next);
    if (focus) buttons.current[next]?.focus();
  }

  return (
    <>
      <ol aria-label="Daily uptime, oldest first" className="flex h-8 gap-0.5 sm:gap-1" onPointerLeave={() => setHovered(undefined)}>
        {days.map((item, i) => (
          <li key={item.date} className="min-w-0 flex-1">
            <button
              type="button"
              ref={(node) => { buttons.current[i] = node; }}
              tabIndex={i === selected ? 0 : -1}
              aria-controls={panelId}
              aria-pressed={i === selected}
              aria-label={`${item.label} · ${item.status}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHovered(i);
              }}
              onClick={() => selectDay(i)}
              onKeyDown={(event) => {
                const targets: Record<string, number> = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: days.length - 1 };
                const next = targets[event.key];
                if (next === undefined) return;
                event.preventDefault();
                selectDay(Math.min(days.length - 1, Math.max(0, next)), true);
              }}
              className={`h-full w-full cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${item.color} ${i === index ? "ring-1 ring-foreground ring-offset-1" : ""}`}
            />
          </li>
        ))}
      </ol>
      <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
        <time dateTime={days[0].date}>{days[0].label}</time>
        <time dateTime={days[days.length - 1].date}>{days[days.length - 1].label}</time>
      </div>
      <div id={panelId} className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium"><time dateTime={day.date}>{day.label}</time> · {day.status}</p>
          <div className="flex gap-1">
            <button type="button" disabled={index === 0} onClick={() => selectDay(index - 1)} aria-label="Previous day" className="size-8 rounded border border-border hover:bg-background disabled:opacity-40">‹</button>
            <button type="button" disabled={index === days.length - 1} onClick={() => selectDay(index + 1)} aria-label="Next day" className="size-8 rounded border border-border hover:bg-background disabled:opacity-40">›</button>
          </div>
        </div>
        {day.total > 0 ? (
          <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <div><dt className="inline">Total </dt><dd className="inline font-mono text-foreground">{numberFormat.format(day.total)}</dd></div>
            <div><dt className="inline">Successful </dt><dd className="inline font-mono text-foreground">{numberFormat.format(day.successful)}</dd></div>
            <div><dt className="inline">Degraded </dt><dd className="inline font-mono text-foreground">{numberFormat.format(day.degraded)}</dd></div>
            <div><dt className="inline">Failed </dt><dd className="inline font-mono text-foreground">{numberFormat.format(day.failed)}</dd></div>
          </dl>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">No probe data recorded for this day.</p>
        )}
        {day.events.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs">
            {day.events.map((event) => (
              <li key={`${event.kind}-${event.id}`}>
                <span className="text-muted-foreground">{event.kind} · </span>
                {event.href ? <Link className="underline underline-offset-4" href={event.href}>{event.name}</Link> : event.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
