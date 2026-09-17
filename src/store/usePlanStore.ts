import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSchedule,
  rankTasks,
  type PlanTask,
  type RankedTask,
  type ScheduledBlock,
} from "@/lib/planEngine";

export type PlanStage = "collecting" | "priority" | "scheduled";

type PlanState = {
  tasks: PlanTask[];
  // Slot keys as an array — a Set wouldn't survive JSON persistence.
  availability: string[];
  ranked: RankedTask[];
  blocks: ScheduledBlock[];
  unscheduled: PlanTask[];
  stage: PlanStage;
  confirmedAt: string | null;

  addTask: (task: PlanTask) => void;
  removeTask: (id: string) => void;
  setAvailability: (slots: string[]) => void;
  setRanked: (ranked: RankedTask[]) => void;
  setStage: (stage: PlanStage) => void;
  rank: () => void;
  confirm: () => void;
  reset: () => void;
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      tasks: [],
      availability: [],
      ranked: [],
      blocks: [],
      unscheduled: [],
      stage: "collecting",
      confirmedAt: null,

      addTask: (task) =>
        set((s) => ({ tasks: [...s.tasks, task], stage: "collecting" })),

      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          ranked: s.ranked.filter((t) => t.id !== id),
        })),

      setAvailability: (availability) => set({ availability }),
      setRanked: (ranked) => set({ ranked }),
      setStage: (stage) => set({ stage }),

      rank: () => set({ ranked: rankTasks(get().tasks), stage: "priority" }),

      confirm: () => {
        const { ranked, availability } = get();
        const result = buildSchedule(ranked, new Set(availability));
        set({
          blocks: result.blocks,
          unscheduled: result.unscheduled,
          stage: "scheduled",
          confirmedAt: new Date().toISOString(),
        });
      },

      reset: () =>
        set({
          tasks: [],
          availability: [],
          ranked: [],
          blocks: [],
          unscheduled: [],
          stage: "collecting",
          confirmedAt: null,
        }),
    }),
    { name: "anchor-plan", skipHydration: true },
  ),
);
