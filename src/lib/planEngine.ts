export const DAY_COUNT = 7;
export const START_HOUR = 8;
export const END_HOUR = 22;
export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

export type Difficulty = "easy" | "medium" | "hard";

export type PlanTask = {
  id: string;
  title: string;
  minutes: number;
  difficulty: Difficulty;
  deadline: string | null;
};

export type RankedTask = PlanTask & {
  score: number;
  reason: string;
};

export type ScheduledBlock = {
  id: string;
  kind: "task" | "break";
  title: string;
  difficulty: Difficulty | null;
  day: number;
  startSlot: number;
  endSlot: number;
};

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; token: string; weight: number }
> = {
  easy: { label: "Light", token: "var(--diff-1)", weight: 0.5 },
  medium: { label: "Medium", token: "var(--diff-2)", weight: 1 },
  hard: { label: "Heavy", token: "var(--diff-3)", weight: 1.8 },
};

export function slotKey(day: number, slot: number) {
  return `${day}-${slot}`;
}

export function slotToDate(day: number, slot: number, from: Date) {
  const date = new Date(from);
  date.setDate(date.getDate() + day);
  date.setHours(START_HOUR, 0, 0, 0);
  date.setMinutes(date.getMinutes() + slot * SLOT_MINUTES);
  return date;
}

export function formatSlotTime(slot: number) {
  const totalMinutes = START_HOUR * 60 + slot * SLOT_MINUTES;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/**
 * Stand-in for the Claude call that will rank tasks: blends deadline urgency,
 * difficulty (heavy work earns an earlier slot while focus is fresh) and size.
 * The returned `reason` is what the UI shows as the AI's rationale.
 */
export function rankTasks(tasks: PlanTask[], now: Date = new Date()): RankedTask[] {
  const scored = tasks.map((task) => {
    const hoursUntilDue = task.deadline
      ? (new Date(task.deadline).getTime() - now.getTime()) / 3_600_000
      : null;

    const urgency =
      hoursUntilDue === null ? 1.2 : 14 / Math.max(hoursUntilDue, 1);
    const difficulty = DIFFICULTY_META[task.difficulty].weight;
    const sizePenalty = task.minutes / 300;
    const score = Number((urgency * 1.6 + difficulty - sizePenalty).toFixed(3));

    return { task, score, hoursUntilDue };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((entry, i) => ({
    ...entry.task,
    score: entry.score,
    reason: buildReason(entry.task, entry.hoursUntilDue, i, scored.length),
  }));
}

/**
 * Reasons are chosen by rank as well as by the task itself — several tasks
 * sharing one deadline should still each say something distinct.
 */
function buildReason(
  task: PlanTask,
  hoursUntilDue: number | null,
  rank: number,
  total: number,
) {
  if (rank === 0) {
    if (hoursUntilDue !== null && hoursUntilDue <= 12) {
      return "Due within the day, sets the pace";
    }
    if (task.difficulty === "hard") {
      return "Heaviest lift, takes your freshest hours";
    }
    if (hoursUntilDue !== null) {
      return "Tightest deadline of the batch";
    }
    return "Biggest lever, so it goes first";
  }

  if (task.difficulty === "hard") {
    return "Heavy lift, placed while your focus holds";
  }
  if (task.minutes <= 45) {
    return "Quick win to break up the heavier work";
  }
  if (hoursUntilDue === null) {
    return "No deadline, slots into leftover space";
  }
  if (rank === total - 1) {
    return "Lightest pull, so it rides at the back";
  }
  return "Steady work with room to breathe";
}

export function buildSchedule(
  tasks: PlanTask[],
  availability: Set<string>,
  now: Date = new Date(),
): { blocks: ScheduledBlock[]; unscheduled: PlanTask[] } {
  const used = new Set<string>();
  const blocks: ScheduledBlock[] = [];
  const unscheduled: PlanTask[] = [];

  const isFree = (day: number, slot: number) => {
    const key = slotKey(day, slot);
    if (!availability.has(key) || used.has(key)) return false;
    return slotToDate(day, slot, now).getTime() >= now.getTime();
  };

  for (const task of tasks) {
    const needed = Math.max(1, Math.ceil(task.minutes / SLOT_MINUTES));
    const placement = findRun(needed, isFree, task.deadline, now);

    if (!placement) {
      unscheduled.push(task);
      continue;
    }

    for (let i = 0; i < needed; i += 1) {
      used.add(slotKey(placement.day, placement.startSlot + i));
    }

    blocks.push({
      id: task.id,
      kind: "task",
      title: task.title,
      difficulty: task.difficulty,
      day: placement.day,
      startSlot: placement.startSlot,
      endSlot: placement.startSlot + needed,
    });

    const breakSlot = placement.startSlot + needed;
    if (task.difficulty === "hard" && isFree(placement.day, breakSlot)) {
      used.add(slotKey(placement.day, breakSlot));
      blocks.push({
        id: `${task.id}-break`,
        kind: "break",
        title: "Breather",
        difficulty: null,
        day: placement.day,
        startSlot: breakSlot,
        endSlot: breakSlot + 1,
      });
    }
  }

  return { blocks, unscheduled };
}

function findRun(
  needed: number,
  isFree: (day: number, slot: number) => boolean,
  deadline: string | null,
  now: Date,
) {
  const deadlineTime = deadline ? new Date(deadline).getTime() : null;

  for (let day = 0; day < DAY_COUNT; day += 1) {
    for (let slot = 0; slot <= SLOTS_PER_DAY - needed; slot += 1) {
      let fits = true;
      for (let i = 0; i < needed; i += 1) {
        if (!isFree(day, slot + i)) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      if (deadlineTime !== null) {
        const endsAt = slotToDate(day, slot + needed, now).getTime();
        if (endsAt > deadlineTime) continue;
      }
      return { day, startSlot: slot };
    }
  }
  return null;
}

export function buildCompanionTips(
  blocks: ScheduledBlock[],
  unscheduled: PlanTask[],
  tasks: PlanTask[],
) {
  const tips: {
    id: string;
    mood: "idle" | "happy" | "thinking" | "sleepy";
    text: string;
    action?: { label: string; href: string };
  }[] = [];

  const taskBlocks = blocks.filter((b) => b.kind === "task");
  const focusMinutes = taskBlocks.reduce(
    (sum, b) => sum + (b.endSlot - b.startSlot) * SLOT_MINUTES,
    0,
  );
  const hardCount = tasks.filter((t) => t.difficulty === "hard").length;
  const breaks = blocks.filter((b) => b.kind === "break").length;

  if (taskBlocks.length > 0) {
    tips.push({
      id: "overview",
      mood: "happy",
      text: `All set. ${taskBlocks.length} task${taskBlocks.length === 1 ? "" : "s"} across ${(focusMinutes / 60).toFixed(1)} focus hours. I kept the heavy ones early while your attention is sharpest.`,
    });
  }

  if (breaks > 0) {
    tips.push({
      id: "breaks",
      mood: "idle",
      text: `I tucked ${breaks} breather${breaks === 1 ? "" : "s"} in after your hard task${hardCount === 1 ? "" : "s"}. Stand up, look out a window. It's part of the plan, not a detour.`,
    });
  }

  if (hardCount > 0) {
    tips.push({
      id: "music",
      mood: "thinking",
      text: "For the deep-work blocks, lyric-free music holds attention better than anything with words in it. Want something to put on?",
      action: {
        label: "Open focus music",
        href: "https://open.spotify.com/search/deep%20focus%20instrumental",
      },
    });
  }

  if (unscheduled.length > 0) {
    tips.push({
      id: "overflow",
      mood: "thinking",
      text: `${unscheduled.length} task${unscheduled.length === 1 ? " didn't" : "s didn't"} fit inside the hours you marked. Open up a few more blocks on the left and I'll reshuffle.`,
    });
  }

  if (focusMinutes > 6 * 60) {
    tips.push({
      id: "load",
      mood: "sleepy",
      text: "That's a heavy day. If it starts slipping, drop the lowest task rather than shortening your breaks. Tired hours aren't cheaper.",
    });
  }

  return tips;
}
