"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DIFFICULTY_META, type RankedTask } from "@/lib/planEngine";

export function PriorityList({
  tasks,
  onReorder,
  onRemove,
}: {
  tasks: RankedTask[];
  onReorder: (tasks: RankedTask[]) => void;
  onRemove: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = tasks.findIndex((t) => t.id === active.id);
    const to = tasks.findIndex((t) => t.id === over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(tasks, from, to));
  }

  return (
    <div>
      <div className="label grid grid-cols-12 gap-3 border-b border-rule pb-2">
        <span className="col-span-1">#</span>
        <span className="col-span-6">Task</span>
        <span className="col-span-2">Load</span>
        <span className="col-span-3 text-right">Due</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {tasks.map((task, i) => (
              <Row
                key={task.id}
                task={task}
                rank={i + 1}
                onRemove={() => onRemove(task.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function Row({
  task,
  rank,
  onRemove,
}: {
  task: RankedTask;
  rank: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });
  const meta = DIFFICULTY_META[task.difficulty];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative border-b border-rule bg-paper transition-colors ${
        isDragging ? "z-10 bg-paper-2" : "hover:bg-paper-2"
      }`}
    >
      {/* accent edge marks the row you're touching */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[2px] transition-colors ${
          isDragging ? "bg-accent" : "bg-transparent group-hover:bg-accent"
        }`}
      />

      <div className="grid grid-cols-12 items-center gap-3 py-3 pl-2">
        <div className="col-span-1 flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${task.title}`}
            className="cursor-grab touch-none text-rule-strong transition-colors hover:text-ink active:cursor-grabbing"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
              {[3, 8, 13].map((y) =>
                [2, 8].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" />),
              )}
            </svg>
          </button>
          <span className="metric text-[13px] text-ink-3">
            {String(rank).padStart(2, "0")}
          </span>
        </div>

        <div className="col-span-6 min-w-0">
          <p className="truncate text-[15px] font-medium text-ink">{task.title}</p>
          <p className="mt-0.5 truncate text-[13px] text-ink-3">{task.reason}</p>
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-[1px]"
            style={{ background: meta.token }}
          />
          <span className="metric text-[13px] text-ink-2">
            {task.minutes < 60 ? `${task.minutes}m` : `${task.minutes / 60}h`}
          </span>
        </div>

        <div className="col-span-3 flex items-center justify-end gap-2">
          <span className="metric text-[13px] text-ink-2">
            {task.deadline ? formatDeadline(task.deadline) : "—"}
          </span>
          <button
            onClick={onRemove}
            aria-label={`Remove ${task.title}`}
            className="text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 hover:text-signal focus-visible:opacity-100"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

function formatDeadline(iso: string) {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  const time = date
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .replace(" ", "");
  return sameDay
    ? time
    : `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${time}`;
}
