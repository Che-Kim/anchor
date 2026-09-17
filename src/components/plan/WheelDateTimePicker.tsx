"use client";

import { useEffect, useMemo, useRef } from "react";

const ITEM_H = 34;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

type WheelValue = { dayOffset: number; hour12: number; minute: number; pm: boolean };

export function WheelDateTimePicker({
  value,
  onChange,
}: {
  value: WheelValue;
  onChange: (next: WheelValue) => void;
}) {
  const days = useMemo(() => buildDays(14), []);
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => [0, 15, 30, 45], []);
  const meridiem = ["AM", "PM"];

  return (
    <div className="relative border-y border-rule">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-rule-strong bg-paper-2"
        style={{ height: ITEM_H }}
      />
      <div className="relative flex" style={{ height: ITEM_H * VISIBLE }}>
        <WheelColumn
          label="date"
          items={days.map((d) => d.label)}
          index={value.dayOffset}
          onSelect={(i) => onChange({ ...value, dayOffset: i })}
          className="flex-[1.6]"
        />
        <WheelColumn
          label="hour"
          items={hours.map(String)}
          index={hours.indexOf(value.hour12)}
          onSelect={(i) => onChange({ ...value, hour12: hours[i] })}
        />
        <WheelColumn
          label="minute"
          items={minutes.map((m) => String(m).padStart(2, "0"))}
          index={minutes.indexOf(value.minute)}
          onSelect={(i) => onChange({ ...value, minute: minutes[i] })}
        />
        <WheelColumn
          label="am/pm"
          items={meridiem}
          index={value.pm ? 1 : 0}
          onSelect={(i) => onChange({ ...value, pm: i === 1 })}
        />
      </div>
    </div>
  );
}

function WheelColumn({
  label,
  items,
  index,
  onSelect,
  className = "flex-1",
}: {
  label: string;
  items: string[];
  index: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmatic = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    programmatic.current = true;
    el.scrollTop = Math.max(0, index) * ITEM_H;
    const t = setTimeout(() => {
      programmatic.current = false;
    }, 60);
    return () => clearTimeout(t);
    // Mount-only: re-syncing on every index change would fight the user's scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    if (programmatic.current) return;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const next = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)),
      );
      if (next !== index) onSelect(next);
    }, 110);
  }

  function jumpTo(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
    onSelect(i);
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      aria-label={label}
      className={`no-scrollbar snap-y snap-mandatory overflow-y-auto ${className}`}
    >
      <div style={{ height: PAD }} />
      {items.map((item, i) => (
        <button
          key={item}
          type="button"
          role="option"
          aria-selected={i === index}
          onClick={() => jumpTo(i)}
          style={{ height: ITEM_H }}
          className={`metric flex w-full snap-center items-center justify-center text-[13px] transition-colors ${
            i === index ? "text-ink" : "text-ink-3/55"
          }`}
        >
          {item}
        </button>
      ))}
      <div style={{ height: PAD }} />
    </div>
  );
}

function buildDays(count: number) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatter.format(date);
    return { date, label };
  });
}

export function wheelValueToDate(value: WheelValue) {
  const date = new Date();
  date.setDate(date.getDate() + value.dayOffset);
  const hour24 =
    value.hour12 === 12
      ? value.pm
        ? 12
        : 0
      : value.pm
        ? value.hour12 + 12
        : value.hour12;
  date.setHours(hour24, value.minute, 0, 0);
  return date;
}

export const DEFAULT_WHEEL_VALUE: WheelValue = {
  dayOffset: 0,
  hour12: 5,
  minute: 0,
  pm: true,
};

export type { WheelValue };
