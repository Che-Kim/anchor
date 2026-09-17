"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckInStrip, type CheckIn } from "@/components/boost/CheckInStrip";
import { GuidedSession } from "@/components/boost/GuidedSession";
import { Jellyfish } from "@/components/jellyfish/Jellyfish";
import { Masthead, SectionHead, Tag } from "@/components/ui/Chrome";
import { useJellyfish } from "@/store/useJellyfish";
import { usePlanStore } from "@/store/usePlanStore";
import { SLOT_MINUTES } from "@/lib/planEngine";
import {
  pickActivities,
  readContext,
  type Activity,
  type ActivityKind,
  type LoadLevel,
} from "@/lib/boostEngine";

const LOAD_TONE: Record<LoadLevel, "neutral" | "accent" | "signal"> = {
  light: "neutral",
  balanced: "accent",
  heavy: "signal",
};

export default function BoostPage() {
  const jellyName = useJellyfish((s) => s.name);
  const blocks = usePlanStore((s) => s.blocks);
  const tasks = usePlanStore((s) => s.tasks);
  const unscheduled = usePlanStore((s) => s.unscheduled);

  const [kind, setKind] = useState<ActivityKind>("indoor");
  const [active, setActive] = useState<Activity | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/checkins").then((r) => r.json()).catch(() => []),
      fetch("/api/diary").then((r) => r.json()).catch(() => []),
    ])
      .then(([checkins, entries]) => {
        if (Array.isArray(checkins)) setCheckIns(checkins);
        if (Array.isArray(entries)) {
          const weekAgo = Date.now() - 7 * 86_400_000;
          setEntriesThisWeek(
            entries.filter((e) => new Date(e.date).getTime() >= weekAgo).length,
          );
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const reading = useMemo(() => {
    const focusMinutes = blocks
      .filter((b) => b.kind === "task")
      .reduce((sum, b) => sum + (b.endSlot - b.startSlot) * SLOT_MINUTES, 0);
    return readContext({
      focusMinutes,
      hardCount: tasks.filter((t) => t.difficulty === "hard").length,
      unscheduledCount: unscheduled.length,
      recentStress: checkIns[0]?.stressLevel ?? null,
      entriesThisWeek,
    });
  }, [blocks, tasks, unscheduled, checkIns, entriesThisWeek]);

  const activities = useMemo(() => pickActivities(reading, kind), [reading, kind]);

  return (
    <>
      <Masthead crumb="Boost" />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 sm:px-8">
        {/* ── Readout ───────────────────────────── */}
        <section className="grid grid-cols-1 gap-8 border-b border-rule py-9 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="label">Reading</span>
              <Tag tone={LOAD_TONE[reading.load]}>{reading.load}</Tag>
            </div>
            <h1 className="display mt-3 text-[clamp(2rem,4vw,2.75rem)] text-ink">
              {reading.headline}
            </h1>

            <div className="mt-5 flex items-start gap-4">
              <Jellyfish
                size={54}
                mood={reading.load === "heavy" ? "thinking" : "idle"}
                className="shrink-0 text-ink"
              />
              <div>
                <span className="label text-ink">{jellyName}</span>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-ink-2">
                  {reading.narration}
                </p>
              </div>
            </div>
          </div>

          {/* signals as a definition table, not chips */}
          <div className="lg:col-span-5">
            <p className="label border-b border-rule pb-2">What I looked at</p>
            {reading.signals.length > 0 ? (
              <dl>
                {reading.signals.map((s) => (
                  <div
                    key={s}
                    className="flex items-baseline justify-between gap-4 border-b border-rule py-2"
                  >
                    <dt className="text-[13px] text-ink-2">{s}</dt>
                    <dd
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                  </div>
                ))}
              </dl>
            ) : (
              loaded && (
                <p className="py-3 text-[13px] text-ink-3">
                  Nothing to read yet:{" "}
                  <Link href="/plan" className="text-accent underline underline-offset-2">
                    plan a day
                  </Link>{" "}
                  or{" "}
                  <Link href="/record" className="text-accent underline underline-offset-2">
                    write an entry
                  </Link>
                  .
                </p>
              )
            )}
          </div>
        </section>

        <CheckInStrip
          checkIns={checkIns}
          onLogged={(entry) => setCheckIns((prev) => [entry, ...prev].slice(0, 14))}
        />

        {/* ── Activities ────────────────────────── */}
        <section className="py-9">
          <SectionHead
            title="What to do about it"
            aside={
              <div className="flex items-center gap-5">
                {(["indoor", "outdoor"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`label border-b-2 pb-1 transition-colors ${
                      kind === k
                        ? "border-ink text-ink"
                        : "border-transparent hover:text-ink"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            }
          />

          <ul>
            {activities.map((a, i) => (
              <li key={a.id} className="border-b border-rule">
                <button
                  onClick={() => setActive(a)}
                  className="group relative grid w-full grid-cols-12 items-baseline gap-4 py-5 text-left transition-colors hover:bg-paper-2"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[2px] bg-transparent transition-colors group-hover:bg-accent"
                  />
                  <span className="label col-span-2 pl-3 sm:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="col-span-10 sm:col-span-4">
                    <h3 className="display text-[21px] text-ink transition-colors group-hover:text-accent">
                      {a.title}
                    </h3>
                  </div>

                  <p className="col-span-12 max-w-md text-[14px] leading-relaxed text-ink-2 sm:col-span-4">
                    {a.blurb}
                  </p>

                  <div className="col-span-12 flex items-center gap-4 sm:col-span-3 sm:justify-end">
                    {i === 0 && <Tag tone="accent">{jellyName}&apos;s pick</Tag>}
                    <span className="label">{a.tag}</span>
                    <span className="metric w-10 text-right text-[13px] text-ink">
                      {a.minutes}m
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {active && (
        <GuidedSession activity={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}
