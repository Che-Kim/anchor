"use client";

import { useMemo } from "react";
import { AvailabilityGrid } from "@/components/plan/AvailabilityGrid";
import { GeneratedTimetable } from "@/components/plan/GeneratedTimetable";
import { PriorityList } from "@/components/plan/PriorityList";
import { TaskForm } from "@/components/plan/TaskForm";
import { Jellyfish } from "@/components/jellyfish/Jellyfish";
import { JellyfishCompanion } from "@/components/jellyfish/JellyfishCompanion";
import { Button } from "@/components/ui/Button";
import { Masthead, Metric, SectionHead } from "@/components/ui/Chrome";
import { useJellyfish } from "@/store/useJellyfish";
import { usePlanStore, type PlanStage } from "@/store/usePlanStore";
import { SLOT_MINUTES, buildCompanionTips } from "@/lib/planEngine";

const STAGES: { id: PlanStage; label: string }[] = [
  { id: "collecting", label: "Collect" },
  { id: "priority", label: "Order" },
  { id: "scheduled", label: "Schedule" },
];

export default function PlanPage() {
  const jellyName = useJellyfish((s) => s.name);

  const tasks = usePlanStore((s) => s.tasks);
  const availabilityList = usePlanStore((s) => s.availability);
  const ranked = usePlanStore((s) => s.ranked);
  const blocks = usePlanStore((s) => s.blocks);
  const unscheduled = usePlanStore((s) => s.unscheduled);
  const stage = usePlanStore((s) => s.stage);

  const addTask = usePlanStore((s) => s.addTask);
  const removeTask = usePlanStore((s) => s.removeTask);
  const setAvailabilityList = usePlanStore((s) => s.setAvailability);
  const setRanked = usePlanStore((s) => s.setRanked);
  const setStage = usePlanStore((s) => s.setStage);
  const rank = usePlanStore((s) => s.rank);
  const confirm = usePlanStore((s) => s.confirm);
  const reset = usePlanStore((s) => s.reset);

  const availability = useMemo(() => new Set(availabilityList), [availabilityList]);
  const canGenerate = tasks.length > 0 && availability.size > 0;

  const tips = useMemo(
    () =>
      stage === "scheduled"
        ? buildCompanionTips(blocks, unscheduled, tasks)
        : [],
    [stage, blocks, unscheduled, tasks],
  );

  const workMinutes = tasks.reduce((s, t) => s + t.minutes, 0);
  const freeHours = (availability.size * SLOT_MINUTES) / 60;

  return (
    <>
      <Masthead
        crumb="Plan"
        right={
          <div className="flex items-center gap-4">
            <ol className="hidden items-center gap-3 sm:flex">
              {STAGES.map((s, i) => {
                const current = STAGES.findIndex((x) => x.id === stage);
                const done = i <= current;
                return (
                  <li key={s.id} className="flex items-center gap-2">
                    <span
                      className={`label transition-colors ${
                        done ? "text-ink" : "text-ink-3/60"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")} {s.label}
                    </span>
                    {i < STAGES.length - 1 && (
                      <span className="h-px w-5 bg-rule" aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
            {tasks.length > 0 && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Clear
              </Button>
            )}
          </div>
        }
      />

      <main className="mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* ── Inputs ─────────────────────────────── */}
        <section className="border-rule px-5 py-7 lg:border-r sm:px-8">
          <SectionHead index="01" title="What's on your plate" />
          <div className="pt-4">
            <TaskForm onAdd={addTask} />
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 flex gap-8 border-t border-rule pt-4">
              <Metric value={tasks.length} caption="Tasks" />
              <Metric
                value={`${(workMinutes / 60).toFixed(1)}h`}
                caption="Of work"
              />
              <Metric value={`${freeHours.toFixed(1)}h`} caption="Free" />
            </div>
          )}

          <div className="mt-10">
            <SectionHead index="02" title="When you're free" />
            <div className="pt-4">
              <AvailabilityGrid
                selected={availability}
                onChange={(next) => setAvailabilityList([...next])}
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={rank}
            disabled={!canGenerate}
            className="mt-7 w-full"
          >
            {canGenerate
              ? `Hand it to ${jellyName}`
              : "Add a task and some free hours"}
          </Button>
        </section>

        {/* ── Output ─────────────────────────────── */}
        <section className="min-w-0 px-5 py-7 sm:px-8">
          {stage === "collecting" && <Empty jellyName={jellyName} />}

          {stage === "priority" && (
            <>
              <SectionHead
                index="03"
                title="Suggested order"
                aside={
                  <span className="label">Drag to overrule</span>
                }
              />
              <p className="pt-3 pb-5 text-[15px] text-ink-2">
                Ranked by deadline, weight and size.
              </p>
              <PriorityList
                tasks={ranked}
                onReorder={setRanked}
                onRemove={removeTask}
              />
              <div className="mt-6 flex items-center gap-3">
                <Button variant="primary" onClick={confirm}>
                  Confirm schedule
                </Button>
                <Button variant="ghost" onClick={() => setStage("collecting")}>
                  Back
                </Button>
              </div>
            </>
          )}

          {stage === "scheduled" && (
            <>
              <SectionHead
                index="04"
                title="Your day, mapped"
                aside={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStage("priority")}
                  >
                    Edit order
                  </Button>
                }
              />
              <div className="pt-5">
                <GeneratedTimetable
                  blocks={blocks}
                  availability={availability}
                  unscheduled={unscheduled}
                />
              </div>
              <JellyfishCompanion tips={tips} />
            </>
          )}
        </section>
      </main>
    </>
  );
}

function Empty({ jellyName }: { jellyName: string }) {
  return (
    <div className="flex h-full min-h-[24rem] flex-col items-center justify-center border border-dashed border-rule px-6 text-center">
      <Jellyfish size={92} mood="thinking" className="text-rule-strong" />
      <p className="mt-5 max-w-[22rem] text-[15px] leading-relaxed text-ink-3">
        Add what you owe and paint when you&apos;re free. {jellyName} works out
        the order.
      </p>
    </div>
  );
}
