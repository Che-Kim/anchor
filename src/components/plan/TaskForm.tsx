"use client";

import { useState } from "react";
import {
  DEFAULT_WHEEL_VALUE,
  WheelDateTimePicker,
  wheelValueToDate,
  type WheelValue,
} from "./WheelDateTimePicker";
import { Button } from "@/components/ui/Button";
import { DIFFICULTY_META, type Difficulty, type PlanTask } from "@/lib/planEngine";

const DURATIONS = [15, 30, 45, 60, 90, 120];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export function TaskForm({ onAdd }: { onAdd: (task: PlanTask) => void }) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [hasDeadline, setHasDeadline] = useState(true);
  const [wheel, setWheel] = useState<WheelValue>(DEFAULT_WHEEL_VALUE);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      minutes,
      difficulty,
      deadline: hasDeadline ? wheelValueToDate(wheel).toISOString() : null,
    });
    setTitle("");
    setMinutes(60);
    setDifficulty("medium");
  }

  return (
    <form onSubmit={submit}>
      <Field label="Task">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="CS 246 assignment 3"
          className="h-10 w-full border-b border-rule-strong bg-transparent text-[15px] text-ink placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
        />
      </Field>

      <Field label="Duration">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={`metric border-b pb-0.5 text-[13px] transition-colors ${
                minutes === m
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              {m < 60 ? `${m}m` : `${m / 60}h`}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Load">
        <div className="flex gap-4">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex items-center gap-2 border-b pb-0.5 text-[13px] transition-colors ${
                difficulty === d
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-[1px]"
                style={{
                  background: DIFFICULTY_META[d].token,
                  opacity: difficulty === d ? 1 : 0.45,
                }}
              />
              {DIFFICULTY_META[d].label}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Deadline"
        action={
          <button
            type="button"
            onClick={() => setHasDeadline((v) => !v)}
            className="label border-b border-transparent pb-0.5 transition-colors hover:border-accent hover:text-accent"
          >
            {hasDeadline ? "None" : "Set"}
          </button>
        }
      >
        {hasDeadline ? (
          <WheelDateTimePicker value={wheel} onChange={setWheel} />
        ) : (
          <p className="text-[13px] text-ink-3">
            Flexible — fits wherever there&apos;s room.
          </p>
        )}
      </Field>

      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={!title.trim()}
        className="mt-5 w-full"
      >
        Add task
      </Button>
    </form>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-rule py-4 first:pt-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="label">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
