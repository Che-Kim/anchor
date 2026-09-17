"use client";

import { useEffect, useRef } from "react";
import {
  DAY_COUNT,
  SLOTS_PER_DAY,
  SLOT_MINUTES,
  START_HOUR,
  slotKey,
} from "@/lib/planEngine";

const CELL_H = 12;

const PRESETS = [
  { label: "Morning", from: 8, to: 12 },
  { label: "Afternoon", from: 12, to: 17 },
  { label: "Evening", from: 17, to: 22 },
];

export function AvailabilityGrid({
  selected,
  onChange,
}: {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const mode = useRef<"add" | "remove" | null>(null);
  const days = buildDayLabels();

  useEffect(() => {
    const stop = () => {
      mode.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  function apply(key: string) {
    const next = new Set(selected);
    if (mode.current === "add") next.add(key);
    else next.delete(key);
    onChange(next);
  }

  function handlePointerDown(e: React.PointerEvent, key: string) {
    e.preventDefault();
    mode.current = selected.has(key) ? "remove" : "add";
    apply(key);
  }

  // Touch keeps pointer capture on the origin cell, so hit-test by position.
  function handlePointerMove(e: React.PointerEvent) {
    if (!mode.current) return;
    const key = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.getAttribute("data-slot");
    if (key) apply(key);
  }

  function applyPreset(from: number, to: number) {
    const next = new Set(selected);
    for (let day = 0; day < DAY_COUNT; day += 1) {
      for (let slot = 0; slot < SLOTS_PER_DAY; slot += 1) {
        const hour = START_HOUR + (slot * SLOT_MINUTES) / 60;
        if (hour >= from && hour < to) next.add(slotKey(day, slot));
      }
    }
    onChange(next);
  }

  const hours = (selected.size * SLOT_MINUTES) / 60;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3">
        <div className="flex items-center gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.from, p.to)}
              className="label border-b border-transparent pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              + {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className="label border-b border-transparent pb-0.5 transition-colors hover:border-signal hover:text-signal"
          >
            Clear
          </button>
        </div>
        <span className="metric ml-auto text-[13px] text-ink">
          {hours.toFixed(1)}h free
        </span>
      </div>

      <div
        onPointerMove={handlePointerMove}
        className="touch-none border-t border-l border-rule select-none"
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: `34px repeat(${DAY_COUNT}, 1fr)` }}
        >
          <div className="border-r border-b border-rule" />
          {days.map((d) => (
            <div
              key={d.key}
              className="border-r border-b border-rule py-1.5 text-center"
            >
              <p className="label text-[9px] text-ink">{d.weekday}</p>
              <p className="metric text-[10px] text-ink-3">{d.dayNum}</p>
            </div>
          ))}

          {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => {
            const onHour = (slot * SLOT_MINUTES) % 60 === 0;
            return (
              <SlotRow
                key={slot}
                slot={slot}
                onHour={onHour}
                selected={selected}
                onPointerDown={handlePointerDown}
              />
            );
          })}
        </div>
      </div>

      <p className="label mt-2 normal-case tracking-normal">
        Click and drag to paint free hours. Drag over filled cells to clear.
      </p>
    </div>
  );
}

function SlotRow({
  slot,
  onHour,
  selected,
  onPointerDown,
}: {
  slot: number;
  onHour: boolean;
  selected: Set<string>;
  onPointerDown: (e: React.PointerEvent, key: string) => void;
}) {
  const hour24 = START_HOUR + Math.floor((slot * SLOT_MINUTES) / 60);
  const label = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return (
    <>
      <div
        style={{ height: CELL_H }}
        className={`metric border-r border-rule pr-1 text-right text-[9px] leading-none text-ink-3 ${
          onHour ? "border-t" : ""
        }`}
      >
        {onHour ? label : ""}
      </div>
      {Array.from({ length: DAY_COUNT }, (_, day) => {
        const key = slotKey(day, slot);
        const active = selected.has(key);
        return (
          <div
            key={key}
            data-slot={key}
            onPointerDown={(e) => onPointerDown(e, key)}
            style={{ height: CELL_H }}
            className={`border-r border-rule transition-colors ${
              onHour ? "border-t" : ""
            } ${active ? "bg-accent/70" : "hover:bg-accent-wash"}`}
          />
        );
      })}
    </>
  );
}

function buildDayLabels() {
  return Array.from({ length: DAY_COUNT }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      key: i,
      weekday:
        i === 0
          ? "Today"
          : date.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: date.toLocaleDateString(undefined, { day: "numeric" }),
    };
  });
}
