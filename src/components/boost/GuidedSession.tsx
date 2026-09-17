"use client";

import { useEffect, useState } from "react";
import { Jellyfish } from "@/components/jellyfish/Jellyfish";
import { Button } from "@/components/ui/Button";
import { useJellyfish } from "@/store/useJellyfish";
import { mapsSearchUrl, youtubeSearchUrl, type Activity } from "@/lib/boostEngine";

type VideoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; videoId: string; title: string }
  | { status: "unavailable" };

export function GuidedSession({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  const jellyName = useJellyfish((s) => s.name);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [video, setVideo] = useState<VideoState>({ status: "idle" });
  const total = activity.minutes * 60;

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, [running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function loadVideo() {
    setVideo({ status: "loading" });
    try {
      const res = await fetch(
        `/api/boost/video?q=${encodeURIComponent(activity.query)}`,
      );
      const data = await res.json();
      if (data.videoId) {
        setVideo({ status: "ready", videoId: data.videoId, title: data.title });
      } else {
        setVideo({ status: "unavailable" });
      }
    } catch {
      setVideo({ status: "unavailable" });
    }
  }

  const done = elapsed >= total;
  const phase = activity.breathing ? breathPhase(elapsed, activity.breathing) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/25 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={activity.title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise w-full max-w-lg border border-ink bg-paper"
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-6 py-4">
          <div>
            <p className="label">
              {activity.tag} · {activity.minutes} min
            </p>
            <h2 className="display mt-1 text-[26px] text-ink">{activity.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-3 transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        <div className="px-6 py-7">
          {phase ? (
            <BreathingRing phase={phase} done={done} />
          ) : (
            <PlainTimer elapsed={elapsed} total={total} done={done} />
          )}
        </div>

        <div className="flex items-start gap-3 border-y border-rule bg-paper-2 px-6 py-4">
          <Jellyfish
            size={44}
            mood={done ? "happy" : "idle"}
            className="shrink-0 text-ink"
          />
          <div className="min-w-0">
            <span className="label text-ink">{jellyName}</span>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
              {done
                ? "That's it. You're a bit different than you were five minutes ago. That's the whole point."
                : phase
                  ? phaseCoaching(phase.label)
                  : activity.kind === "outdoor"
                    ? "Leave the phone in your pocket. I'll keep the clock out here."
                    : "Follow at whatever pace your body wants. Stop early if it hurts."}
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-2 px-6 py-4">
          <Button variant="secondary" size="sm" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </Button>

          {activity.kind === "indoor"
            ? video.status !== "ready" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadVideo}
                  disabled={video.status === "loading"}
                >
                  {video.status === "loading" ? "Finding…" : "Play a guided video"}
                </Button>
              )
            : (
                <a
                  href={mapsSearchUrl(activity.query)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-rule-strong px-3 text-[13px] font-medium text-ink transition-colors hover:border-ink hover:bg-paper-2"
                >
                  Find somewhere nearby →
                </a>
              )}

          {done && (
            <Button variant="primary" size="sm" onClick={onClose} className="ml-auto">
              Done
            </Button>
          )}
        </footer>

        {video.status === "ready" && (
          <div className="border-t border-rule">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          </div>
        )}

        {video.status === "unavailable" && (
          <p className="border-t border-rule px-6 py-3 text-[13px] text-ink-3">
            No embed available. Set{" "}
            <code className="metric text-ink">YOUTUBE_API_KEY</code>, or{" "}
            <a
              href={youtubeSearchUrl(activity.query)}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              open on YouTube
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}

function BreathingRing({
  phase,
  done,
}: {
  phase: { label: string; progress: number };
  done: boolean;
}) {
  const scale =
    phase.label === "Breathe in"
      ? 0.62 + phase.progress * 0.38
      : phase.label === "Breathe out"
        ? 1 - phase.progress * 0.38
        : 1;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border border-rule transition-transform duration-1000 ease-linear"
          style={{ transform: `scale(${done ? 1 : scale})` }}
        />
        <div
          className="absolute inset-6 rounded-full border-2 border-accent transition-transform duration-1000 ease-linear"
          style={{ transform: `scale(${done ? 1 : scale})` }}
        />
        <p className="label relative text-ink">{done ? "Finished" : phase.label}</p>
      </div>
    </div>
  );
}

function PlainTimer({
  elapsed,
  total,
  done,
}: {
  elapsed: number;
  total: number;
  done: boolean;
}) {
  const pct = Math.min(100, (elapsed / total) * 100);

  return (
    <div>
      <p className="metric text-center text-[44px] leading-none text-ink">
        {done ? "00:00" : formatClock(Math.max(0, total - elapsed))}
      </p>
      <div className="mt-5 h-px w-full bg-rule">
        <div
          className="h-px bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function breathPhase(
  elapsed: number,
  pattern: { inhale: number; hold: number; exhale: number },
) {
  const cycle = pattern.inhale + pattern.hold + pattern.exhale;
  const t = elapsed % cycle;
  if (t < pattern.inhale) return { label: "Breathe in", progress: t / pattern.inhale };
  if (t < pattern.inhale + pattern.hold)
    return { label: "Hold", progress: (t - pattern.inhale) / pattern.hold };
  return {
    label: "Breathe out",
    progress: (t - pattern.inhale - pattern.hold) / pattern.exhale,
  };
}

function phaseCoaching(label: string) {
  if (label === "Breathe in") return "In through the nose, let your belly go first.";
  if (label === "Hold") return "Hold it. Loose, not clenched.";
  return "Out slowly, longer than the way in. That's the part that settles you.";
}

function formatClock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
