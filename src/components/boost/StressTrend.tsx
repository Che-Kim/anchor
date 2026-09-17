"use client";

import { useMemo, useRef, useState } from "react";
import { getMoodMeta } from "@/lib/moodMusic";

export type TrendPoint = { date: Date; stressLevel: number; mood: string };

const W = 320;
const H = 96;
const PAD_L = 14;
const PAD_R = 8;
const PAD_T = 10;
const PAD_B = 14;

const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

/** Single series, so no legend — the caption above names it. */
export function StressTrend({ points }: { points: TrendPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const x = (i: number) =>
    points.length > 1
      ? PAD_L + (i / (points.length - 1)) * innerW
      : PAD_L + innerW / 2;
  const y = (v: number) => PAD_T + innerH - ((v - 1) / 4) * innerH;

  const line = useMemo(
    () => points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.stressLevel)}`).join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points],
  );

  function move(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestD = Infinity;
    points.forEach((_, i) => {
      const d = Math.abs(x(i) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHover(best);
  }

  if (points.length === 0) {
    return (
      <p className="label normal-case tracking-normal">
        No check-ins yet — the trend starts after your first.
      </p>
    );
  }

  const active = hover !== null ? points[hover] : null;
  const last = points[points.length - 1];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        onPointerMove={move}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Stress across recent check-ins"
      >
        {[1, 3, 5].map((t) => (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--rule)"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 4}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="metric"
              fill="var(--ink-3)"
              fontSize="8"
            >
              {t}
            </text>
          </g>
        ))}

        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.stressLevel)}
            r={i === points.length - 1 || i === hover ? 4 : 2.5}
            fill="var(--accent)"
            stroke="var(--paper)"
            strokeWidth={2}
          />
        ))}

        {/* flips below the point near the ceiling so it never clips the frame */}
        <text
          x={x(points.length - 1)}
          y={
            y(last.stressLevel) < PAD_T + 10
              ? y(last.stressLevel) + 13
              : y(last.stressLevel) - 8
          }
          textAnchor="end"
          className="metric"
          fill="var(--ink)"
          fontSize="9"
        >
          {last.stressLevel}
        </text>

        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD_T}
            y2={PAD_T + innerH}
            stroke="var(--ink)"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-0 border border-ink bg-paper px-2 py-1"
          style={{
            left: `${(x(hover!) / W) * 100}%`,
            transform:
              hover! > points.length - 3
                ? "translate(-100%, -4px)"
                : "translate(6px, -4px)",
          }}
        >
          <p className="metric text-[11px] whitespace-nowrap text-ink">
            {dateFmt.format(active.date)} · {active.stressLevel}/5
          </p>
          <p className="label normal-case">{getMoodMeta(active.mood).label}</p>
        </div>
      )}
    </div>
  );
}
