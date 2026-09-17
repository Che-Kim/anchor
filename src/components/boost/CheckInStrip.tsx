"use client";

import { useState } from "react";
import { StressTrend, type TrendPoint } from "./StressTrend";
import { Button } from "@/components/ui/Button";
import { MOOD_OPTIONS, getMoodMeta, getMoodMusic } from "@/lib/moodMusic";

export type CheckIn = {
  id: string;
  mood: string;
  stressLevel: number;
  note: string | null;
  createdAt: string;
};

/**
 * Boost reads a stress signal, so it has to be able to ask for one — this is
 * the only writer of CheckIn data now that the standalone page is gone.
 */
export function CheckInStrip({
  checkIns,
  onLogged,
}: {
  checkIns: CheckIn[];
  onLogged: (entry: CheckIn) => void;
}) {
  const [mood, setMood] = useState<string | null>(null);
  const [stress, setStress] = useState(3);
  const [saving, setSaving] = useState(false);
  const [justLogged, setJustLogged] = useState<CheckIn | null>(null);
  // Explicit, because clearing justLogged alone would fall straight back to
  // today's existing entry and the form would never reopen.
  const [reopened, setReopened] = useState(false);

  const latest = checkIns[0];
  const loggedToday =
    latest &&
    new Date(latest.createdAt).toDateString() === new Date().toDateString();

  const points: TrendPoint[] = [...checkIns]
    .reverse()
    .map((c) => ({
      date: new Date(c.createdAt),
      stressLevel: c.stressLevel,
      mood: c.mood,
    }));

  async function submit() {
    if (!mood || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, stressLevel: stress }),
      });
      const entry = await res.json();
      if (entry?.id) {
        onLogged(entry);
        setJustLogged(entry);
        setReopened(false);
        setMood(null);
      }
    } finally {
      setSaving(false);
    }
  }

  const shown = reopened ? null : (justLogged ?? (loggedToday ? latest : null));
  const music = shown ? getMoodMusic(shown.mood) : null;

  return (
    <section className="grid grid-cols-1 gap-8 border-b border-rule py-7 lg:grid-cols-12">
      <div className="lg:col-span-7">
        {shown ? (
          <>
            <p className="label">Checked in</p>
            <p className="mt-2.5 text-[17px] text-ink">
              {getMoodMeta(shown.mood).label.toLowerCase()} · stress{" "}
              <span className="metric">{shown.stressLevel}/5</span>
            </p>
            {music && (
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-2">
                {music.blurb}{" "}
                <a
                  href={music.spotifySearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  Find it
                </a>
              </p>
            )}
            <button
              onClick={() => {
                setReopened(true);
                setJustLogged(null);
                setMood(null);
              }}
              className="label mt-3 border-b border-transparent pb-0.5 transition-colors hover:border-accent hover:text-accent"
            >
              Log another
            </button>
          </>
        ) : (
          <>
            <p className="label">How are you right now?</p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {MOOD_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setMood(o.value)}
                  className={`border-b pb-0.5 text-[14px] transition-colors ${
                    mood === o.value
                      ? "border-accent text-ink"
                      : "border-transparent text-ink-3 hover:text-ink"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-3">
                <span className="label">Stress</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setStress(n)}
                      aria-label={`Stress ${n} of 5`}
                      aria-pressed={stress === n}
                      className={`metric h-8 w-8 border-y border-r text-[13px] transition-colors first:border-l ${
                        stress === n
                          ? "border-ink bg-ink text-paper"
                          : "border-rule-strong text-ink-2 hover:bg-paper-2"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={submit}
                disabled={!mood || saving}
              >
                {saving ? "Logging…" : "Log it"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="lg:col-span-5">
        <p className="label border-b border-rule pb-2">
          Stress · last {points.length || "—"}
        </p>
        <div className="pt-3">
          <StressTrend points={points} />
        </div>
      </div>
    </section>
  );
}
