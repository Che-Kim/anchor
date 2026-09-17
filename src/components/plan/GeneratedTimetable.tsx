"use client";

import {
  DAY_COUNT,
  DIFFICULTY_META,
  SLOTS_PER_DAY,
  SLOT_MINUTES,
  formatSlotTime,
  slotKey,
  type PlanTask,
  type ScheduledBlock,
} from "@/lib/planEngine";

const CELL_H = 14;

export function GeneratedTimetable({
  blocks,
  availability,
  unscheduled,
}: {
  blocks: ScheduledBlock[];
  availability: Set<string>;
  unscheduled: PlanTask[];
}) {
  const days = buildDayLabels();
  // Keep every day the user marked free, not just the ones that got filled —
  // a single scheduled day would otherwise stretch to the full column width
  // and hide where the remaining room is.
  const candidates = Array.from({ length: DAY_COUNT }, (_, d) => d).filter(
    (d) =>
      blocks.some((b) => b.day === d) ||
      Array.from({ length: SLOTS_PER_DAY }, (_, s) => s).some((s) =>
        availability.has(slotKey(d, s)),
      ),
  );
  const visible = candidates.length > 0 ? candidates : [0];
  const bounds = getBounds(blocks);

  return (
    <div>
      <div className="border-t border-l border-rule">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `42px repeat(${visible.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="border-r border-b border-rule" />
          {visible.map((d) => (
            <div
              key={d}
              className="border-r border-b border-rule py-2 text-center"
            >
              <p className="label text-ink">{days[d].weekday}</p>
              <p className="metric text-[10px] text-ink-3">{days[d].dayNum}</p>
            </div>
          ))}

          <div className="border-r border-rule">
            {range(bounds.start, bounds.end).map((slot) => (
              <div
                key={slot}
                style={{ height: CELL_H }}
                className={`metric pr-1 text-right text-[9px] leading-none text-ink-3 ${
                  (slot * SLOT_MINUTES) % 60 === 0 ? "border-t border-rule" : ""
                }`}
              >
                {(slot * SLOT_MINUTES) % 60 === 0
                  ? formatSlotTime(slot).replace(":00", "").replace(" ", "")
                  : ""}
              </div>
            ))}
          </div>

          {visible.map((day) => (
            <div key={day} className="relative border-r border-rule">
              {range(bounds.start, bounds.end).map((slot) => (
                <div
                  key={slot}
                  style={{ height: CELL_H }}
                  className={`${
                    (slot * SLOT_MINUTES) % 60 === 0 ? "border-t border-rule" : ""
                  } ${availability.has(slotKey(day, slot)) ? "bg-paper-2" : ""}`}
                />
              ))}

              {blocks
                .filter((b) => b.day === day)
                .map((block) => (
                  <Block
                    key={block.id}
                    block={block}
                    top={(block.startSlot - bounds.start) * CELL_H}
                    height={(block.endSlot - block.startSlot) * CELL_H}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="label">Load</span>
        {(["easy", "medium", "hard"] as const).map((d) => (
          <span key={d} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-[1px]"
              style={{ background: DIFFICULTY_META[d].token }}
            />
            <span className="label">{DIFFICULTY_META[d].label}</span>
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-[1px] border border-rule-strong bg-paper-3"
          />
          <span className="label">Break</span>
        </span>
      </div>

      {unscheduled.length > 0 && (
        <div className="mt-6 border-t-2 border-signal/40 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="label text-signal">Did not fit</span>
            <span className="metric text-[13px] text-signal">
              {unscheduled.length}
            </span>
          </div>
          <ul className="mt-2">
            {unscheduled.map((t) => (
              <li
                key={t.id}
                className="flex items-baseline justify-between gap-3 border-b border-rule py-1.5 text-[13px]"
              >
                <span className="truncate text-ink">{t.title}</span>
                <span className="metric shrink-0 text-ink-3">
                  needs {t.minutes < 60 ? `${t.minutes}m` : `${t.minutes / 60}h`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Block({
  block,
  top,
  height,
}: {
  block: ScheduledBlock;
  top: number;
  height: number;
}) {
  const isBreak = block.kind === "break";
  const background = isBreak
    ? "var(--paper-3)"
    : DIFFICULTY_META[block.difficulty ?? "medium"].token;
  const ink = isBreak || block.difficulty === "easy" ? "var(--ink)" : "var(--paper)";

  return (
    <div
      title={`${block.title} · ${formatSlotTime(block.startSlot)}–${formatSlotTime(block.endSlot)}`}
      style={{ top, height: Math.max(height, 12), background, color: ink }}
      className={`absolute inset-x-0 overflow-hidden px-1.5 ${
        height >= 18 ? "py-0.5" : ""
      } ${isBreak ? "border-y border-rule-strong" : ""}`}
    >
      {/* Below ~18px the label can't clear its own box, so the band and the
          tooltip carry it instead of spilling into the next block. */}
      {height >= 18 && (
        <p className="truncate text-[11px] leading-tight font-medium">
          {block.title}
        </p>
      )}
      {height >= 34 && (
        <p className="metric truncate text-[9px] leading-tight opacity-75">
          {formatSlotTime(block.startSlot).replace(" ", "")}
        </p>
      )}
    </div>
  );
}

function getBounds(blocks: ScheduledBlock[]) {
  if (blocks.length === 0) return { start: 0, end: SLOTS_PER_DAY };
  return {
    start: Math.max(0, Math.min(...blocks.map((b) => b.startSlot)) - 1),
    end: Math.min(SLOTS_PER_DAY, Math.max(...blocks.map((b) => b.endSlot)) + 1),
  };
}

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

function buildDayLabels() {
  return Array.from({ length: DAY_COUNT }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      weekday:
        i === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    };
  });
}
