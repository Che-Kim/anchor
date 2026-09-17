import Link from "next/link";
import type { ReactNode } from "react";
import { JellyMark } from "@/components/jellyfish/Jellyfish";

/** Full-bleed masthead. Hairline under by default, nothing floating, no blur. */
export function Masthead({
  crumb,
  right,
  bordered = true,
}: {
  crumb?: string;
  right?: ReactNode;
  bordered?: boolean;
}) {
  return (
    <header
      className={`sticky top-0 z-30 bg-paper ${bordered ? "border-b border-rule" : ""}`}
    >
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink transition-colors hover:text-accent"
        >
          <JellyMark className="h-5 w-5" />
          <span className="display text-[19px] tracking-[-0.01em]">Anchor</span>
        </Link>

        {crumb && (
          <>
            <span className="text-rule-strong" aria-hidden="true">
              /
            </span>
            <span className="label text-ink-2">{crumb}</span>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
}

/** Section head: mono index + serif title on a hairline. */
export function SectionHead({
  index,
  title,
  aside,
  className = "",
}: {
  index?: string;
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline gap-3 border-b border-rule pb-2 ${className}`}
    >
      {index && <span className="label">{index}</span>}
      <h2 className="display text-[22px] text-ink">{title}</h2>
      {aside && <div className="ml-auto flex items-center gap-2">{aside}</div>}
    </div>
  );
}

/** Small state marker. Tone is meaning, never decoration. */
export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "signal";
}) {
  const tones = {
    neutral: "border-rule text-ink-3",
    accent: "border-accent/35 text-accent",
    signal: "border-signal/35 text-signal",
  };
  return (
    <span
      className={`label inline-flex shrink-0 items-center rounded-[2px] border px-1.5 py-0.5 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Metric({
  value,
  caption,
}: {
  value: ReactNode;
  caption: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="metric text-[19px] leading-none text-ink">{value}</span>
      <span className="label">{caption}</span>
    </div>
  );
}
