"use client";

import { useEffect, useState } from "react";
import { Jellyfish, type JellyMood } from "./Jellyfish";
import { useJellyfish } from "@/store/useJellyfish";

export type CompanionTip = {
  id: string;
  mood: JellyMood;
  text: string;
  action?: { label: string; href: string };
};

/** Docked note, not a floating glass card. Sits on a rule, inside the column. */
export function JellyfishCompanion({ tips }: { tips: CompanionTip[] }) {
  const name = useJellyfish((s) => s.name);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tips.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % tips.length), 9000);
    return () => clearInterval(timer);
  }, [tips.length]);

  if (tips.length === 0) return null;
  const activeIndex = index % tips.length;
  const tip = tips[activeIndex];

  return (
    <aside className="mt-8 border-t-2 border-ink pt-4">
      <div className="flex items-start gap-4">
        <Jellyfish size={52} mood={tip.mood} className="shrink-0 text-ink" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="label text-ink">{name}</span>
            {tips.length > 1 && (
              <div className="flex items-center gap-1">
                {tips.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Note ${i + 1} of ${tips.length}`}
                    className={`h-[3px] w-5 transition-colors ${
                      i === activeIndex
                        ? "bg-ink"
                        : "bg-rule hover:bg-rule-strong"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <p key={tip.id} className="rise mt-2 text-[15px] leading-relaxed text-ink-2">
            {tip.text}
          </p>

          {tip.action && (
            <a
              href={tip.action.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent"
            >
              <span className="border-b border-accent/40 pb-px transition-colors group-hover:border-accent">
                {tip.action.label}
              </span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
